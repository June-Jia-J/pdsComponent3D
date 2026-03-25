import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3, Raycaster, Object3D, Plane } from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';
import { CameraControls } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { didMountAtom } from '../../atoms/didMount';
import { centerDistancetAtom, centerPoinAtom } from '../../atoms/selectModel';
import { useFlyToView } from '../useCamera/flyToView';

/**
 * 自动聚焦相机到视野内最近的模型表面
 * @param distance 模型与相机位置的最大距离限制
 * @param targetModels 要检测的模型数组
 */
function useCameraFocus(
  distance: number,
  targetModels: (Object3D | null | undefined)[]
): void {
  const { camera } = useThree();
  // 获取CameraControls实例
  const controls = useThree(
    state => state.controls as unknown as CameraControls
  );

  const didMount = useAtomValue(didMountAtom);
  const centerDistance = useAtomValue(centerDistancetAtom);
  const centerPoint = useAtomValue(centerPoinAtom);

  // 缓存对象以提高性能
  const tempBox = useMemo(() => new Box3(), []);
  const tempCenter = useMemo(() => new Vector3(), []);
  const cameraPosition = useMemo(() => new Vector3(), []);
  const viewDirection = useMemo(() => new Vector3(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const ndcPoint = useMemo(() => new Vector3(), []);
  const tempCorners = useMemo(
    () =>
      Array(8)
        .fill(0)
        .map(() => new Vector3()),
    []
  );
  const tempPlane = useMemo(() => new Plane(), []);

  // 跟踪当前和上一个最近的模型
  const closestModelRef = useRef<Object3D | null>(null);
  const lastClosestModelRef = useRef<Object3D | null>(null);
  const targetPointRef = useRef<Vector3 | null>(null);

  // 跟踪用户交互状态
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const lastCameraPosRef = useRef<Vector3>(new Vector3());
  const lastCameraTargetRef = useRef<Vector3>(new Vector3());
  const userIdleTimerRef = useRef<number>(0);
  const USER_IDLE_THRESHOLD = 30; // 用户停止操作后等待的帧数

  const { moveCamera } = useFlyToView({
    transitionDuration: 1000,
  });

  // 动画状态
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // 添加控制器事件监听
  useEffect(() => {
    if (!controls) return;

    const handleStart = () => {
      setIsUserInteracting(true);
      userIdleTimerRef.current = 0;

      // 如果正在进行动画，取消它
      if (isAnimating) {
        setIsAnimating(false);
      }
    };

    const handleEnd = () => {
      // 不立即设为false，让帧检测处理，以捕获惯性动画
      userIdleTimerRef.current = 0;
    };

    controls.addEventListener('controlstart', handleStart);
    controls.addEventListener('controlend', handleEnd);

    return () => {
      controls.removeEventListener('controlstart', handleStart);
      controls.removeEventListener('controlend', handleEnd);
    };
  }, [controls, isAnimating]);

  // 检查点或包围盒是否在相机视野范围内
  const isInCameraView = (object: Object3D): boolean => {
    // 获取包围盒
    const box = tempBox.setFromObject(object);

    // 获取包围盒的8个角点
    const min = box.min;
    const max = box.max;

    tempCorners[0].set(min.x, min.y, min.z);
    tempCorners[1].set(min.x, min.y, max.z);
    tempCorners[2].set(min.x, max.y, min.z);
    tempCorners[3].set(min.x, max.y, max.z);
    tempCorners[4].set(max.x, min.y, min.z);
    tempCorners[5].set(max.x, min.y, max.z);
    tempCorners[6].set(max.x, max.y, min.z);
    tempCorners[7].set(max.x, max.y, max.z);

    // 如果任何一个角点在视野内，则认为物体在视野内
    for (let i = 0; i < 8; i++) {
      ndcPoint.copy(tempCorners[i]).project(camera);

      // 检查点是否在NDC空间内（-1到1）
      if (
        ndcPoint.x >= -1 &&
        ndcPoint.x <= 1 &&
        ndcPoint.y >= -1 &&
        ndcPoint.y <= 1 &&
        ndcPoint.z >= -1 &&
        ndcPoint.z <= 1
      ) {
        return true;
      }
    }

    // 检查包围盒中心
    box.getCenter(tempCenter);
    ndcPoint.copy(tempCenter).project(camera);

    return (
      ndcPoint.x >= -1 &&
      ndcPoint.x <= 1 &&
      ndcPoint.y >= -1 &&
      ndcPoint.y <= 1 &&
      ndcPoint.z >= -1 &&
      ndcPoint.z <= 1
    );
  };

  // 计算点到屏幕中心的距离（在NDC空间中）
  const distanceToScreenCenter = (point: Vector3): number => {
    ndcPoint.copy(point).project(camera);
    return Math.sqrt(ndcPoint.x * ndcPoint.x + ndcPoint.y * ndcPoint.y);
  };

  // 找到模型面向相机的中心点
  const findFacingCenterPoint = (
    model: Object3D,
    cameraPos: Vector3
  ): Vector3 => {
    // 获取模型的包围盒
    const box = tempBox.setFromObject(model);
    const boxCenter = new Vector3();
    box.getCenter(boxCenter);

    // 计算从相机到包围盒中心的方向
    const directionToCamera = new Vector3()
      .subVectors(cameraPos, boxCenter)
      .normalize();

    // 创建一个与该方向垂直的平面，平面过包围盒中心
    tempPlane.setFromNormalAndCoplanarPoint(
      directionToCamera.clone().negate(),
      boxCenter
    );

    // 根据包围盒尺寸计算射线的起点（从相机方向看向模型）
    const boxSize = box.getSize(new Vector3());
    const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const rayStartDistance = maxDimension * 2; // 足够远的距离

    // 设置射线的起点和方向
    const rayStart = new Vector3()
      .copy(boxCenter)
      .addScaledVector(directionToCamera, rayStartDistance);
    const rayDirection = new Vector3().copy(directionToCamera).negate();

    // 创建射线
    raycaster.set(rayStart, rayDirection);

    // 射线与模型相交
    const intersections = raycaster.intersectObject(model, true);

    if (intersections.length > 0) {
      // 返回最近的交点
      return intersections[0].point.clone();
    } else {
      // 如果没有交点，使用朝向相机的包围盒面的中心点
      // 找到最接近相机的包围盒面
      const halfSize = boxSize.clone().multiplyScalar(0.5);
      const faces = [
        // 前面 (+z)
        new Vector3(boxCenter.x, boxCenter.y, boxCenter.z + halfSize.z),
        // 后面 (-z)
        new Vector3(boxCenter.x, boxCenter.y, boxCenter.z - halfSize.z),
        // 右面 (+x)
        new Vector3(boxCenter.x + halfSize.x, boxCenter.y, boxCenter.z),
        // 左面 (-x)
        new Vector3(boxCenter.x - halfSize.x, boxCenter.y, boxCenter.z),
        // 上面 (+y)
        new Vector3(boxCenter.x, boxCenter.y + halfSize.y, boxCenter.z),
        // 下面 (-y)
        new Vector3(boxCenter.x, boxCenter.y - halfSize.y, boxCenter.z),
      ];

      // 找到最接近相机的面
      let closestFace = faces[0];
      let minDistance = cameraPos.distanceTo(faces[0]);

      for (let i = 1; i < faces.length; i++) {
        const dist = cameraPos.distanceTo(faces[i]);
        if (dist < minDistance) {
          minDistance = dist;
          closestFace = faces[i];
        }
      }

      return closestFace;
    }
  };

  // 主要处理函数
  useFrame(() => {
    if (
      !controls ||
      !targetModels ||
      targetModels.length === 0 ||
      !didMount ||
      !centerDistance ||
      !centerPoint
    )
      return;

    // 获取当前相机位置和目标
    const currentCameraPos = new Vector3();
    camera.getWorldPosition(currentCameraPos);
    const currentTarget = controls.getTarget(new Vector3());

    // 超出中心点距离，不执行聚焦
    const currentDistance = currentCameraPos.distanceTo(centerPoint);
    if (currentDistance >= centerDistance - 5) {
      // controls.setTarget(centerPoint.x, centerPoint.y, centerPoint.z, false);
      setIsAnimating(true);
      moveCamera({
        target: centerPoint,
        duration: 0,
        onTransitionEnd: () => {
          setIsAnimating(false);
        },
      });
      return;
    }

    // 检测相机是否在移动（包括惯性动画）
    const isCameraMoving =
      !currentCameraPos.equals(lastCameraPosRef.current) ||
      !currentTarget.equals(lastCameraTargetRef.current);

    // 更新上一帧的位置记录
    lastCameraPosRef.current.copy(currentCameraPos);
    lastCameraTargetRef.current.copy(currentTarget);

    // 如果相机在移动，重置空闲计时器
    if (isCameraMoving) {
      userIdleTimerRef.current = 0;
      if (!isUserInteracting) {
        setIsUserInteracting(true);
      }
    } else if (isUserInteracting) {
      // 如果相机停止移动，增加空闲计时器
      userIdleTimerRef.current++;

      // 如果空闲足够长时间，认为用户已停止交互
      if (userIdleTimerRef.current > USER_IDLE_THRESHOLD) {
        setIsUserInteracting(false);
      }
    }

    // 如果正在进行动画且用户没有交互，直接返回
    if (isAnimating && !isUserInteracting) return;

    // 获取相机位置
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(viewDirection);

    // 设置射线投射器从相机位置向前
    raycaster.set(cameraPosition, viewDirection);

    // 过滤掉无效模型
    const validModels = targetModels.filter(
      model => model !== null && model !== undefined
    ) as Object3D[];

    // 存储视野内的模型及其信息
    interface ModelInfo {
      model: Object3D;
      point: Vector3;
      distanceToCamera: number;
      distanceToCenter: number;
      fromRaycast: boolean;
    }

    const modelsInView: ModelInfo[] = [];

    // 第一步：射线检测，找到射线路径上的模型
    const raycastResults = raycaster.intersectObjects(validModels, true);

    // 处理射线检测结果
    const processedModels = new Set<Object3D>();

    for (const hit of raycastResults) {
      // 找到此交点所属的根模型（在targetModels中的模型）
      let rootModel: Object3D | null = null;
      let current = hit.object;

      while (current && !validModels.includes(current)) {
        current = current.parent!;
      }

      rootModel = current;

      // 如果找到了根模型且尚未处理过
      if (rootModel && !processedModels.has(rootModel)) {
        processedModels.add(rootModel);

        // 计算到相机的距离
        const distanceToCamera = cameraPosition.distanceTo(hit.point);

        // 只考虑在指定距离内的模型
        if (distanceToCamera <= distance) {
          modelsInView.push({
            model: rootModel,
            point: hit.point.clone(),
            distanceToCamera,
            distanceToCenter: 0, // 射线中心的点，距离中心为0
            fromRaycast: true,
          });
        }
      }
    }

    // 第二步：检查其他模型是否在视野范围内
    for (const model of validModels) {
      // 如果该模型已经通过射线检测添加，则跳过
      if (processedModels.has(model)) {
        continue;
      }

      // 检查模型是否在视野范围内
      if (isInCameraView(model)) {
        // 获取模型的包围盒中心
        tempBox.setFromObject(model);
        tempBox.getCenter(tempCenter);

        // 计算到相机的距离
        const distanceToCamera = cameraPosition.distanceTo(tempCenter);

        // 只考虑在指定距离内的模型
        if (distanceToCamera <= distance) {
          // 计算到屏幕中心的距离
          const distanceToCenter = distanceToScreenCenter(tempCenter);

          modelsInView.push({
            model,
            point: tempCenter.clone(),
            distanceToCamera,
            distanceToCenter,
            fromRaycast: false,
          });
        }
      }
    }

    // 如果没有找到视野内的模型，直接返回
    if (modelsInView.length === 0) {
      return;
    }

    // 按照优先级排序：
    // 1. 首先优先考虑射线检测到的模型
    // 2. 然后按照到屏幕中心的距离排序
    modelsInView.sort((a, b) => {
      // 如果一个是射线检测到的，另一个不是，优先考虑射线检测到的
      if (a.fromRaycast && !b.fromRaycast) return -1;
      if (!a.fromRaycast && b.fromRaycast) return 1;

      // 都是射线检测到的或都不是，按照到屏幕中心的距离排序
      return a.distanceToCenter - b.distanceToCenter;
    });

    // 获取最近的可见模型
    const closestInfo = modelsInView[0];
    const closestModel = closestInfo.model;

    // 根据不同情况选择目标点
    let targetPoint: Vector3;

    // 如果用户停止交互，我们需要找到模型面向相机的中心点
    if (!isUserInteracting && !isAnimating) {
      // 使用面向相机的中心点作为目标点
      targetPoint = findFacingCenterPoint(closestModel, cameraPosition);
    } else {
      // 用户正在交互或已经有射线检测点，使用原始点
      targetPoint = closestInfo.point;
    }

    // 更新最近的模型引用
    closestModelRef.current = closestModel;

    // 检查最近的模型是否改变
    const modelChanged = closestModel !== lastClosestModelRef.current;

    // 如果模型改变或用户停止交互
    if (
      (modelChanged || (!isUserInteracting && !isAnimating)) &&
      closestModel
    ) {
      // 更新上一个最近的模型
      lastClosestModelRef.current = closestModel;

      // 保存目标点
      targetPointRef.current = targetPoint;

      // 如果用户没有交互，开始动画
      // if (!isUserInteracting) {
      setIsAnimating(true);

      // 平滑移动相机到目标位置
      moveCamera({
        target: targetPoint,
        duration: 1000,
        onTransitionEnd: () => {
          setIsAnimating(false);
        },
      });
      // }
    }
  });
}

export default useCameraFocus;
