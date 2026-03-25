import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { Box3, Group, Mesh, PerspectiveCamera, Scene, Vector3 } from 'three';
import { useFlyToView } from './flyToView';
import BoundingBoxVisualizer from './components/BoundingBoxVisualizer';
import { centerDistancetAtom, centerPoinAtom } from '../../atoms/selectModel';
import { useSetAtom } from 'jotai';
import { useSetCameraBoundary } from './useSetCameraBoundary';

// 全局配置
interface OptimalCameraConfig {
  showBoundingBox?: boolean;
  elevationAngle?: number; // 仰角（弧度）
  paddingFactor?: number; // 边距系数
  horizontalAngle?: number; // 水平角度（弧度）
  referenceResolution?: { width: number; height: number }; // 参考分辨率
  minPaddingFactor?: number; // 最小边距系数
  maxPaddingFactor?: number; // 最大边距系数
}

// 默认参数
const DEFAULT_CONFIG: Required<OptimalCameraConfig> = {
  showBoundingBox: false,
  elevationAngle: Math.PI / 18, // 与地面的仰角18度
  paddingFactor: 1.4, // 基准边距系数（基于1920x1080）
  horizontalAngle: (Math.PI * 3) / 4, // 水平旋转角度：负X方向(PI)再向右旋转45度(-PI/4)，即3π/4
  referenceResolution: { width: 1920, height: 1080 }, // 参考分辨率
  minPaddingFactor: 1.3, // 最小边距系数
  maxPaddingFactor: 2.5, // 最大边距系数
};

/**
 * 根据模型列表计算最佳摄像机位置的自定义Hook
 */
export function useOptimalCameraPosition(config: OptimalCameraConfig = {}) {
  const { camera, scene, controls, size } = useThree<{
    camera: PerspectiveCamera;
    scene: Scene;
    controls: CameraControls;
    size: { width: number; height: number };
  }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).controls = controls;

  // 合并配置
  const mergedConfig: Required<OptimalCameraConfig> = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [config]
  );

  const { moveCamera, isTransitioningRef } = useFlyToView({
    transitionDuration: 1000,
  });

  // 存储计算得到的包围盒以供可视化
  const [boundingBox, setBoundingBox] = useState<Box3 | null>(null);
  const boundingBoxRef = useRef<Box3 | null>(null);

  const setCenterDistance = useSetAtom(centerDistancetAtom);

  const setCenterPoint = useSetAtom(centerPoinAtom);

  useSetCameraBoundary();

  // 计算当前分辨率下的调整系数
  const getResolutionAdjustedPadding = useCallback(() => {
    const {
      referenceResolution,
      paddingFactor,
      minPaddingFactor,
      maxPaddingFactor,
    } = mergedConfig;

    // 计算参考分辨率的宽高比
    const referenceAspect =
      referenceResolution.width / referenceResolution.height;

    // 计算当前分辨率的宽高比
    const currentAspect = size.width / size.height;

    // 计算宽高比差异
    const aspectRatio = currentAspect / referenceAspect;

    // 计算分辨率的绝对大小比例（面积比）
    const sizeRatio =
      (size.width * size.height) /
      (referenceResolution.width * referenceResolution.height);

    // 基于屏幕大小和宽高比共同调整padding
    let adjustedFactor;

    if (aspectRatio > 1) {
      // 更宽的屏幕 - 增加padding
      adjustedFactor = paddingFactor * (1 + 0.3 * Math.log2(aspectRatio));
    } else {
      // 更窄的屏幕 - 增加padding更多
      adjustedFactor = paddingFactor * (1 + 0.4 * Math.log2(1 / aspectRatio));
    }

    // 基于屏幕大小的额外调整 - 小屏幕需要更多padding
    if (sizeRatio < 1) {
      // 小屏幕额外增加padding - 越小增加越多
      const smallScreenBoost = 0.5 * Math.max(0, 1 - Math.sqrt(sizeRatio));
      adjustedFactor += smallScreenBoost;
    }

    // 确保调整后的系数在配置的范围内
    return Math.max(
      minPaddingFactor,
      Math.min(maxPaddingFactor, adjustedFactor)
    );
  }, [mergedConfig, size.width, size.height]);

  // 计算相机位置并返回结果，但不执行相机移动
  const calculateCameraPosition = useCallback(() => {
    if (!scene) return null;

    // 创建一个包含所有目标模型的包围盒
    const boundingBox = new Box3();
    let hasValidModels = false;

    // 遍历场景查找目标模型
    scene.traverse(model => {
      if (
        model &&
        (model instanceof Mesh || model instanceof Group) &&
        (model.name.toUpperCase().startsWith('110KV-GIS') ||
          model.name.toUpperCase().startsWith('10KV-SWG') ||
          model.name.toUpperCase().startsWith('220KV-TR') ||
          model.name.toUpperCase().includes('CABLE'))
      ) {
        // 为每个模型计算包围盒
        const modelBox = new Box3().setFromObject(model);
        // 将模型包围盒合并到总包围盒中
        boundingBox.union(modelBox);
        hasValidModels = true;
      }
    });

    // 如果没有找到有效模型，则返回
    if (!hasValidModels) return null;

    // 计算包围盒的中心点和尺寸
    const center = new Vector3();
    boundingBox.getCenter(center);

    const boxSize = new Vector3();
    boundingBox.getSize(boxSize);

    // 计算包围盒的对角线长度（作为参考尺寸）
    const diagonalSize = Math.sqrt(
      boxSize.x * boxSize.x + boxSize.z * boxSize.z
    );

    // 获取基于当前分辨率调整的padding factor
    const adjustedPaddingFactor = getResolutionAdjustedPadding();

    // 计算视锥体所需的距离
    const aspectRatio = size.width / size.height;
    const verticalFov = camera.fov * (Math.PI / 180); // 转换为弧度
    const horizontalFov =
      2 * Math.atan(Math.tan(verticalFov / 2) * aspectRatio);

    // 计算水平面（XZ平面）上的距离
    const horizontalDistance =
      (diagonalSize * adjustedPaddingFactor) /
      (2 * Math.tan(horizontalFov / 2));

    // 计算垂直方向所需的距离
    const verticalDistance =
      (boxSize.y * adjustedPaddingFactor) / (2 * Math.tan(verticalFov / 2));

    // 取最大值确保模型完全在视野内
    const distance = Math.max(horizontalDistance, verticalDistance);

    // 计算仰角下的摄像机位置
    const horizontalOffset = distance * Math.cos(mergedConfig.elevationAngle);
    const verticalOffset = distance * Math.sin(mergedConfig.elevationAngle);

    // 使用水平角度计算XZ平面上的位置
    const cameraPosition = new Vector3(
      center.x + horizontalOffset * Math.cos(mergedConfig.horizontalAngle),
      center.y + verticalOffset,
      center.z + horizontalOffset * Math.sin(mergedConfig.horizontalAngle)
    );

    return {
      boundingBox,
      center,
      boxSize,
      cameraPosition,
      distance,
      adjustedPaddingFactor,
    };
  }, [
    camera.fov,
    scene,
    mergedConfig,
    getResolutionAdjustedPadding,
    size.width,
    size.height,
  ]);

  const initalCameraPostion = useCallback(
    (onTransitionEnd?: () => void, notPosition = false) => {
      if (!controls) return;

      const result = calculateCameraPosition();
      if (!result) return;

      const {
        boundingBox,
        center,
        boxSize,
        cameraPosition,
        distance,
        adjustedPaddingFactor,
      } = result;

      // 保存包围盒以供可视化
      boundingBoxRef.current = boundingBox.clone();
      if (mergedConfig.showBoundingBox) {
        setBoundingBox(boundingBox.clone());
      }

      if (notPosition) {
        setCenterDistance(distance);
        setCenterPoint(center);
        return;
      }
      if (!isTransitioningRef.current) {
        moveCamera({
          position: cameraPosition,
          target: center,
          duration: 1000,
          // useSourceControl: true,
          onTransitionEnd: () => {
            onTransitionEnd?.();
            setCenterDistance(distance);
            setCenterPoint(center);
          },
        });
      } else {
        // 平滑过渡到新位置
        controls
          .setLookAt(
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z,
            center.x,
            center.y,
            center.z,
            true // 启用平滑过渡
          )
          .then(() => {
            onTransitionEnd?.();
          });
      }

      // 日志输出关键信息
      console.log('包围盒中心点:', center);
      console.log('包围盒尺寸:', boxSize);
      console.log('原始padding factor:', mergedConfig.paddingFactor);
      console.log('调整后padding factor:', adjustedPaddingFactor);
      console.log('当前分辨率:', size.width, 'x', size.height);
      console.log(
        '参考分辨率:',
        mergedConfig.referenceResolution.width,
        'x',
        mergedConfig.referenceResolution.height
      );
      console.log('计算的所需距离:', distance);
      console.log(
        '水平偏移:',
        distance * Math.cos(mergedConfig.elevationAngle)
      );
      console.log(
        '垂直偏移:',
        distance * Math.sin(mergedConfig.elevationAngle)
      );
      console.log(
        '水平角度:',
        (mergedConfig.horizontalAngle * 180) / Math.PI,
        '度'
      );
      console.log('摄像机位置:', cameraPosition);
    },
    [
      controls,
      calculateCameraPosition,
      mergedConfig.showBoundingBox,
      mergedConfig.paddingFactor,
      mergedConfig.referenceResolution.width,
      mergedConfig.referenceResolution.height,
      mergedConfig.elevationAngle,
      mergedConfig.horizontalAngle,
      isTransitioningRef,
      size.width,
      size.height,
      moveCamera,
      setCenterDistance,
      setCenterPoint,
    ]
  );

  // 当showBoundingBox配置变化时更新包围盒显示
  useEffect(() => {
    if (mergedConfig.showBoundingBox && boundingBoxRef.current) {
      setBoundingBox(boundingBoxRef.current);
    } else {
      setBoundingBox(null);
    }
  }, [mergedConfig.showBoundingBox]);

  // 提供一个直接调整padding factor的方法，用于调试或UI控制
  const adjustPaddingFactor = useCallback(
    (newFactor: number) => {
      mergedConfig.paddingFactor = newFactor;
      initalCameraPostion();
      return newFactor;
    },
    [mergedConfig, initalCameraPostion]
  );

  return {
    initalCameraPostion,
    BoundingBoxVisualizer: () => <BoundingBoxVisualizer box={boundingBox} />,
    toggleBoundingBox: () => {
      const newValue = !mergedConfig.showBoundingBox;
      mergedConfig.showBoundingBox = newValue;
      if (newValue && boundingBoxRef.current) {
        setBoundingBox(boundingBoxRef.current);
      } else {
        setBoundingBox(null);
      }
      return newValue;
    },
    // 暴露调整padding factor的方法
    adjustPaddingFactor,
    // 暴露当前计算的padding factor值
    getCurrentPaddingFactor: () => getResolutionAdjustedPadding(),
  };
}
