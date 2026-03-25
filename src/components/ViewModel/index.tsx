import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clone, Html, PerspectiveCamera } from '@react-three/drei';
import { useAtom, useAtomValue } from 'jotai';
import {
  screenPositionAtom,
  selectedAreaModelAtom,
  selectedModelAtom,
} from '@atoms/selectModel';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import {
  Group,
  PerspectiveCamera as PerspectiveCameraImpl,
  Vector3,
  Box3,
  Object3D,
  MeshStandardMaterial,
  Mesh,
} from 'three';
import EnvirComponent from '../GLTFViewer/EnvirComponent';
import { ViewModelProps } from '@/types';
import Roulette from '../HubModel/Roulette';

export const ViewModel: React.FC<ViewModelProps> = ({
  ambientLightIntensity,
  enableShadows,
  directionalLightPosition,
  directionalLightIntensity,
  hdrUrl,
  onClick,
  enableGlow = true,
  glowColor = 0x0088ff,
  glowIntensity = 1,
  enableRoulette = true,
  secondaryCameraDistance = 12,
}) => {
  const selectedModel = useAtomValue(selectedModelAtom);
  const selectedAreaModel = useAtomValue(selectedAreaModelAtom);
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const groupRef = useRef<Group>(null);
  const { camera, scene, size: screenSize } = useThree();
  const [currentSelectedArea, setCurrentSelectedArea] =
    useState<Object3D | null>(null);
  const [currentSelectedModel, setCurrentSelectedModel] =
    useState<Object3D | null>(null);
  const [modelCenter, setModelCenter] = useState<number[]>([0, 0, 0]);
  const [screenPosition, setScreenPosition] = useAtom(screenPositionAtom);
  const modelCenterRef = useRef<Vector3>(new Vector3());
  const initialDistance = useRef<number | null>(null);
  const glowingModelRef = useRef<Object3D | null>(null);
  const defaultDistance = secondaryCameraDistance; // 使用配置的距离

  // 创建发光效果模型
  const createGlowingModel = (model: Object3D) => {
    // 克隆模型
    const glowingModel = model.clone();
    glowingModel.scale.copy(model.scale);

    // 设置发光材质
    glowingModel.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        // 创建新的发光材质
        const glowMaterial = new MeshStandardMaterial({
          emissive: glowColor,
          emissiveIntensity: glowIntensity,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        });

        // 保存原始材质的颜色
        if (child.material instanceof MeshStandardMaterial) {
          glowMaterial.color = child.material.color.clone();
        }

        // 应用发光材质
        child.material = glowMaterial;
      }
    });

    return glowingModel;
  };

  useEffect(() => {
    if (!selectedAreaModel) {
      setCurrentSelectedArea(null);
      setCurrentSelectedModel(null);
      initialDistance.current = null;
      return;
    }

    if (!selectedModel) {
      // 移除发光模型
      if (glowingModelRef.current) {
        glowingModelRef.current.removeFromParent();
        glowingModelRef.current = null;
      }
      setCurrentSelectedModel(null);
      return;
    }

    if (
      !currentSelectedModel ||
      currentSelectedModel.name !== selectedModel.name
    ) {
      console.log('currentSelectedModel', selectedModel);
      const newSelectedModel = selectedModel.clone();
      newSelectedModel.scale.set(1, 1, 1);

      // 移除之前的发光模型（如果存在）
      if (glowingModelRef.current) {
        glowingModelRef.current.removeFromParent();
        glowingModelRef.current = null;
      }

      // 创建新的发光模型（如果启用发光效果）
      if (enableGlow) {
        const glowingModel = createGlowingModel(selectedModel);
        glowingModel.position.copy(selectedModel.position);
        glowingModel.rotation.copy(selectedModel.rotation);
        glowingModel.scale.copy(selectedModel.scale);
        glowingModelRef.current = glowingModel;
      }

      setCurrentSelectedModel(newSelectedModel);
    }

    if (
      !currentSelectedArea ||
      currentSelectedArea.name !== selectedAreaModel.name
    ) {
      const newSelectedArea = selectedAreaModel.clone();
      newSelectedArea.scale.set(1, 1, 1);
      setCurrentSelectedArea(newSelectedArea);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, selectedAreaModel]);

  // 同步相机和模型状态
  useFrame(() => {
    if (!cameraRef.current || !groupRef.current || !currentSelectedArea) return;

    const areaBox = new Box3().setFromObject(currentSelectedArea);
    const areaCenter = areaBox.getCenter(cameraRef.current.position);
    modelCenterRef.current = areaCenter;

    if (currentSelectedModel) {
      currentSelectedArea.traverse(child => {
        if (child.name === currentSelectedModel.name) {
          // 计算模型的包围盒和中心点
          const box = new Box3().setFromObject(child);
          const center = box.getCenter(new Vector3());
          const size = box.getSize(new Vector3());
          const newCenter = [
            center.x,
            center.y,
            center.z + size.z / 2 + 0.1, // 加0.1米的偏移，防止贴得太近
          ];

          // 计算模型表面的位置
          if (
            modelCenter[0] !== newCenter[0] ||
            modelCenter[1] !== newCenter[1] ||
            modelCenter[2] !== newCenter[2]
          ) {
            setModelCenter(newCenter);
          }

          // 创建一个 Vector3 来存储模型中心点
          const worldPosition = new Vector3(...newCenter);

          // 将世界坐标转换为标准化设备坐标 (NDC)
          const vector = worldPosition.project(cameraRef.current!);

          // 将 NDC 坐标转换为屏幕像素坐标
          const x = ((vector.x + 1) * screenSize.width) / 2;
          const y = ((-vector.y + 1) * screenSize.height) / 2;

          if (screenPosition.x !== x || screenPosition.y !== y) {
            setScreenPosition({ x, y });
          }
        }
      });
    }

    // 保持相机的当前朝向，计算相机前方的方向向量
    const cameraDirection = new Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(camera.quaternion);

    // 计算主相机到模型中心的实际距离
    const currentDistance = camera.position.distanceTo(areaCenter);

    // 如果是首次加载，记录初始距离
    if (initialDistance.current === null) {
      initialDistance.current = currentDistance;
    }

    // 计算缩放比例
    const scale = Math.min(currentDistance / initialDistance.current, 1);

    // 根据缩放比例计算副相机的实际距离
    const scaledDistance = defaultDistance * scale;

    // 计算从模型中心沿相机方向反向延伸距离的位置，并添加向下偏移
    const newPosition = areaCenter
      .clone()
      .sub(cameraDirection.multiplyScalar(scaledDistance))
      .add(new Vector3(0, -2.5, 0));

    // 更新副相机位置和朝向
    cameraRef.current.position.copy(newPosition);
    cameraRef.current.quaternion.copy(camera.quaternion);

    // 确保模型的朝向与主场景中的模型一致
    if (groupRef.current) {
      groupRef.current.quaternion.copy(scene.quaternion);
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<globalThis.MouseEvent>) => {
      e.stopPropagation();
      onClick?.(e, true);
    },
    [onClick]
  );

  // 渲染 View 内容
  const renderViewContent = useMemo(() => {
    if (!currentSelectedArea) return null;

    console.log('currentSelectedModel', currentSelectedModel);

    return (
      <group ref={groupRef}>
        <Clone
          deep
          onClick={handleClick}
          object={currentSelectedArea}
          castShadow={false}
          receiveShadow={false}
        />
        {currentSelectedModel && enableRoulette && (
          <Html
            scale={0.5}
            zIndexRange={[50, 0]}
            rotation={[0, 0, 0]}
            prepend
            position={modelCenter as [number, number, number]}
            transform
            occlude
            center
          >
            <Roulette />
          </Html>
        )}
      </group>
    );
  }, [
    currentSelectedArea,
    currentSelectedModel,
    handleClick,
    modelCenter,
    enableRoulette,
  ]);

  return (
    <>
      {currentSelectedArea && (
        <>
          <PerspectiveCamera ref={cameraRef} makeDefault />
          <EnvirComponent
            ambientLightIntensity={ambientLightIntensity}
            enableShadows={enableShadows}
            directionalLightPosition={directionalLightPosition}
            directionalLightIntensity={directionalLightIntensity}
            hdrUrl={hdrUrl}
          />
          {renderViewContent}

          {/* 发光模型效果 */}
          {glowingModelRef.current && (
            <primitive object={glowingModelRef.current} />
          )}
        </>
      )}
    </>
  );
};

export default ViewModel;
