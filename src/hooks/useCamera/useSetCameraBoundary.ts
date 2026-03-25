import { useFrame, useThree } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { CameraControls } from '@react-three/drei';
import { centerDistancetAtom, centerPoinAtom } from '../../atoms/selectModel';
import * as THREE from 'three';
import { PerspectiveCamera } from 'three';

/**
 * 根据centerDistancetAtom和centerPoinAtom设置相机边界
 * 允许相机在centerDistance大5米，Y轴不能小于1的范围内活动
 */
export function useSetCameraBoundary() {
  const { controls, camera } = useThree<{
    controls: CameraControls;
    camera: PerspectiveCamera;
  }>();

  // 获取中心距离和中心点
  const centerDistance = useAtomValue(centerDistancetAtom);
  const centerPoint = useAtomValue(centerPoinAtom);

  useFrame(() => {
    if (centerDistance && centerPoint) {
      // 计算相机到原点的距离
      const cameraPosition = camera.position;
      const distanceToOrigin = cameraPosition.distanceTo(
        new THREE.Vector3(0, 0, 0)
      );

      // 设置最大允许距离（centerDistance + 5）
      const maxAllowedDistance = centerDistance + 5;

      // 如果相机距离原点超过了最大允许距离
      if (distanceToOrigin > maxAllowedDistance) {
        // 计算从原点到相机的方向向量
        const directionToCamera = cameraPosition.clone().normalize();

        // 将相机位置限制在最大允许距离内
        const clampedPosition = directionToCamera.multiplyScalar(
          maxAllowedDistance - 0.1
        );

        // 更新相机位置
        controls.setPosition(
          clampedPosition.x,
          clampedPosition.y,
          clampedPosition.z
        );

        // 通知控制器更新
        controls.update(0);
      }

      // 限制Y轴最小值（不能小于1）
      if (cameraPosition.y < 1) {
        controls.setPosition(cameraPosition.x, 1, cameraPosition.z);
        controls.update(0);
      }
    }
  });
}
