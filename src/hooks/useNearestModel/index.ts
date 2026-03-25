import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { isModelInFocus } from '@/utils';

export const useNearestModel = () => {
  const { scene, camera } = useThree();
  const [nearestModel, setNearestModel] = useState<THREE.Object3D | null>(null);
  const [nearestModelPosition, setNearestModelPosition] =
    useState<THREE.Vector3 | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // 更新场景中的可聚焦模型列表
  const updateMeshList = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse(object => {
      if (isModelInFocus(object)) {
        meshes.push(object as THREE.Mesh);
      }
    });
    meshesRef.current = meshes;
  }, [scene]);

  // 计算最近的模型
  const calculateNearestModel = useCallback(() => {
    // 确保有可用的模型列表
    updateMeshList();

    // 从相机位置发射射线
    const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );

    raycasterRef.current.set(camera.position, rayDirection);

    // 进行射线检测
    const intersects = raycasterRef.current.intersectObjects(
      meshesRef.current,
      true
    );

    // 过滤并找到最近的目标模型
    const targetIntersect = intersects.find(intersect =>
      // meshesRef.current.includes(intersect.object as THREE.Mesh)
      isModelInFocus(intersect.object as THREE.Mesh)
    );

    return targetIntersect ? targetIntersect : null;
  }, [camera.position, camera.quaternion, updateMeshList]);

  // 在每一帧更新最近的模型
  useFrame(() => {
    const targetIntersect = calculateNearestModel() || {
      object: null,
      point: null,
    };
    if (
      targetIntersect.point !== nearestModelPosition &&
      (targetIntersect.point === null ||
        nearestModelPosition === null ||
        targetIntersect.point.distanceTo(nearestModelPosition) > 0.1) &&
      targetIntersect.object !== nearestModel
    ) {
      setNearestModel(targetIntersect.object || null);
      setNearestModelPosition(targetIntersect.point || null);
    }
  });

  return {
    nearestModel,
    nearestModelPosition,
  };
};
