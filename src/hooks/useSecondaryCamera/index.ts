import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Box3, Vector3 } from 'three';
import { useAtom } from 'jotai';
import { selectedModelAtom } from '@/atoms/selectModel';

export const useSecondaryCamera = () => {
  const { scene, camera: mainCamera } = useThree();
  const secondaryCameraRef = useRef<PerspectiveCamera>(null);
  const [selectedModel] = useAtom(selectedModelAtom);

  // 创建副摄像头
  useEffect(() => {
    if (!secondaryCameraRef.current) {
      const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
      secondaryCameraRef.current = camera;
      scene.add(camera);
    }

    return () => {
      if (secondaryCameraRef.current) {
        scene.remove(secondaryCameraRef.current);
      }
    };
  }, [scene]);

  // 在每一帧更新副摄像头的位置和旋转
  useFrame(() => {
    if (!secondaryCameraRef.current || !mainCamera) return;

    const secondaryCamera = secondaryCameraRef.current;

    if (selectedModel) {
      // 计算选中模型的包围盒中心
      const box = new Box3().setFromObject(selectedModel);
      const center = box.getCenter(new Vector3());

      // 计算主摄像头相对于包围盒中心的方向
      const direction = new Vector3()
        .subVectors(mainCamera.position, center)
        .normalize();

      // 设置副摄像头位置（在主摄像头前方5米）
      const offset = direction.multiplyScalar(5);
      secondaryCamera.position.copy(mainCamera.position).add(offset);

      // 将两个摄像头都指向包围盒中心
      mainCamera.lookAt(center);
      secondaryCamera.lookAt(center);
    } else {
      // 如果没有选中模型，副摄像头跟随主摄像头
      secondaryCamera.position.copy(mainCamera.position);
      secondaryCamera.rotation.copy(mainCamera.rotation);
    }
  });

  return {
    secondaryCamera: secondaryCameraRef.current,
  };
};
