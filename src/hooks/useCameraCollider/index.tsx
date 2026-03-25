import globalData from '@/store/globalData';
import { CameraControlsImpl } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Raycaster, Object3D, Sphere, Box3 } from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { didMountAtom } from '../../atoms/didMount';
import { useAtomValue } from 'jotai';

interface ModelCache {
  object: Object3D;
  boundingSphere: Sphere;
  lastUpdateTime: number;
}

const useCameraCollider = (
  options = {
    minDistance: 0.8, // 相机与模型表面的最小距离
    updateInterval: 100, // 更新包围球的时间间隔(ms)
    checkInterval: 1, // 碰撞检测的帧间隔，对于防止穿透，设为1以确保每帧检查
    damping: 0.5, // 相机位置调整的缓动系数
  }
) => {
  const { controls, camera } = useThree();
  const didMount = useAtomValue(didMountAtom);
  const modelCacheRef = useRef<Map<string, ModelCache>>(new Map());
  const frameCountRef = useRef(0);
  // const lastCamPosRef = useRef(new Vector3());
  const previousControlsTargetRef = useRef(new Vector3());
  const previousPositionRef = useRef(new Vector3());
  const isAdjustingRef = useRef(false);

  // 创建并复用各种向量实例
  const tempVec = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const raycaster = useMemo(() => new Raycaster(), []);

  // 清理缓存
  // useEffect(() => {
  //   return () => {
  //     modelCacheRef.current.clear();
  //   };
  // }, []);

  // 保存初始相机位置，用于初始化
  useEffect(() => {
    if (camera) {
      previousPositionRef.current.copy(camera.position);
    }
    if (controls) {
      const cameraControls = controls as CameraControlsImpl;
      const currentTarget = cameraControls.getTarget(new Vector3());
      previousControlsTargetRef.current.copy(currentTarget);
    }
  }, [camera, controls]);

  const getBoundingSphere = (object: Object3D) => {
    const now = Date.now();
    const objId = object.uuid;

    if (modelCacheRef.current.has(objId)) {
      const cache = modelCacheRef.current.get(objId)!;
      if (
        cache.object === object &&
        now - cache.lastUpdateTime < options.updateInterval
      ) {
        return cache.boundingSphere;
      }
    }

    const boundingBox = new Box3().setFromObject(object);
    if (boundingBox.isEmpty()) return null;

    const sphere = new Sphere();
    boundingBox.getCenter(sphere.center);
    sphere.radius = boundingBox.getSize(tempVec).length() / 2;

    modelCacheRef.current.set(objId, {
      object,
      boundingSphere: sphere,
      lastUpdateTime: now,
    });

    return sphere;
  };

  // 检查相机是否会与任何模型碰撞
  const checkCollision = (position: Vector3, modelList: Object3D[]) => {
    for (const model of modelList) {
      if (!model) continue;

      const boundingSphere = getBoundingSphere(model);
      if (!boundingSphere) continue;

      const modelCenter = boundingSphere.center;

      // 计算相机到模型中心的方向
      direction.subVectors(position, modelCenter).normalize();

      // 计算相机到模型表面的距离
      const distanceToModel =
        position.distanceTo(modelCenter) - boundingSphere.radius;

      // 如果距离小于最小安全距离，则检测碰撞
      if (distanceToModel < options.minDistance) {
        // 从模型中心向相机方向发射射线
        raycaster.set(modelCenter, direction);
        const intersects = raycaster.intersectObject(model, true);

        if (intersects.length > 0) {
          // 如果有交点，则认为相机与模型表面之间有碰撞
          return {
            collided: true,
            modelCenter,
            direction,
            boundingSphere,
            distanceToModel,
          };
        }
      }
    }

    return { collided: false };
  };

  // 主要的相机碰撞检测和处理逻辑
  useFrame(() => {
    if (!didMount) return;
    frameCountRef.current++;

    if (frameCountRef.current % options.checkInterval !== 0) {
      return;
    }

    if (frameCountRef.current >= 1000) {
      frameCountRef.current = 0;
    }

    const cameraControls = controls as CameraControlsImpl;
    if (!cameraControls || !camera) return;

    // 获取当前相机位置和目标
    const currentPosition = camera.position;
    const currentTarget = cameraControls.getTarget(new Vector3());

    // 检查相机是否已移动
    const hasPositionChanged = !currentPosition.equals(
      previousPositionRef.current
    );
    const hasTargetChanged = !currentTarget.equals(
      previousControlsTargetRef.current
    );

    // 如果相机没有移动，且不在调整中，则跳过后续处理
    if (!hasPositionChanged && !hasTargetChanged && !isAdjustingRef.current) {
      return;
    }

    // 获取模型列表
    const modelList: Object3D[] = [];
    if (globalData.app?.modelObjectList?.length) {
      modelList.push(
        ...globalData.app.modelObjectList.filter((model: Object3D) => model)
      );
    }

    if (modelList.length === 0) return;

    // 检查当前位置是否会发生碰撞
    const collisionResult = checkCollision(currentPosition, modelList);

    if (collisionResult.collided) {
      isAdjustingRef.current = true;

      // 计算安全位置
      const { modelCenter, direction, boundingSphere } = collisionResult;
      const safeDistance = boundingSphere!.radius + options.minDistance;

      // 计算安全位置
      const safePosition = modelCenter!
        .clone()
        .add(direction!.clone().multiplyScalar(safeDistance));

      // 计算从当前位置到安全位置的方向和距离
      const moveDirection = safePosition.clone().sub(currentPosition);
      const moveDistance = moveDirection.length();

      // 如果需要移动的距离足够小，则认为已经调整到位
      if (moveDistance < 0.01) {
        isAdjustingRef.current = false;
      } else {
        // 应用缓动效果，平滑移动相机
        moveDirection
          .normalize()
          .multiplyScalar(moveDistance * options.damping);
        const newPosition = currentPosition.clone().add(moveDirection);

        // 使用setLookAt来更新相机位置和目标
        cameraControls.setLookAt(
          newPosition.x,
          newPosition.y,
          newPosition.z,
          currentTarget.x,
          currentTarget.y,
          currentTarget.z,
          true // 使用动画过渡
        );

        // 强制更新控制器
        cameraControls.update(0);
      }
    } else {
      isAdjustingRef.current = false;
    }

    // 保存当前位置和目标，用于下一帧的比较
    previousPositionRef.current.copy(currentPosition);
    previousControlsTargetRef.current.copy(currentTarget);
  });
};

export default useCameraCollider;
