import { useMemo, useRef, useEffect } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { selectedModelAtom } from '@atoms/selectModel';
import {
  Group,
  PerspectiveCamera as PerspectiveCameraImpl,
  Vector3,
} from 'three';
import EnvirComponent from '../GLTFViewer/EnvirComponent';
import { HubModelProps } from '@/types';
import { useThree } from '@react-three/fiber';
import { useSecondaryCamera } from '@/hooks/useSecondaryCamera';

export const SceneModel: React.FC<HubModelProps> = ({
  ambientLightIntensity,
  enableShadows,
  directionalLightPosition,
  directionalLightIntensity,
}) => {
  const selectedModel = useAtomValue(selectedModelAtom);
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const groupRef = useRef<Group>(null);
  const { camera: mainCamera } = useThree();

  // 使用副摄像头hook
  useSecondaryCamera();

  const currentSelectedModel = useMemo(() => {
    if (selectedModel) {
      const newModel = selectedModel.clone();
      return newModel;
    }
    return null;
  }, [selectedModel]);

  // 更新模型位置
  useEffect(() => {
    if (!currentSelectedModel || !groupRef.current || !mainCamera) return;

    // 计算主摄像头的前方向量
    const direction = new Vector3(0, 0, -1).applyQuaternion(
      mainCamera.quaternion
    );

    // 计算目标位置（摄像头前方5米）
    const targetPosition = new Vector3()
      .copy(mainCamera.position)
      .add(direction.multiplyScalar(5));

    // 更新模型组的位置
    groupRef.current.position.copy(targetPosition);

    // 让模型始终面向摄像头
    groupRef.current.lookAt(mainCamera.position);
  }, [currentSelectedModel, mainCamera]);

  // 渲染内容
  const renderHudContent = useMemo(() => {
    if (!currentSelectedModel) return null;

    return (
      <group ref={groupRef}>
        <primitive object={currentSelectedModel} />
      </group>
    );
  }, [currentSelectedModel]);

  return (
    <>
      {currentSelectedModel && (
        <scene>
          <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 5]} />
          <EnvirComponent
            ambientLightIntensity={ambientLightIntensity}
            enableShadows={enableShadows}
            directionalLightPosition={directionalLightPosition}
            directionalLightIntensity={directionalLightIntensity}
          />
          {renderHudContent}
        </scene>
      )}
    </>
  );
};

export default SceneModel;
