import { useAtomValue } from 'jotai';
import { useThree } from '@react-three/fiber';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Object3D, Vector3, Raycaster, Box3 } from 'three';
import { controlingAtom, controlToggleAtom } from '@/atoms/controlManagement';
import globalData from '@/store/globalData';
import { didMountAtom } from '@/atoms/didMount';

interface UseVisibleModelsInRangeReturn {
  visibleModels: Object3D[];
  isCalculating: boolean;
}

/**
 * 计算视野内未被遮挡且在指定距离内的模型
 * @param distance 指定距离（米）
 * @param modelList 模型列表
 * @returns 符合条件的模型列表和计算状态
 */
export const useVisibleModelsInRange = (
  distance: number,
  nameList: string[]
): UseVisibleModelsInRangeReturn => {
  const { camera, scene, controls } = useThree();
  const controlToggle = useAtomValue(controlToggleAtom);
  const controling = useAtomValue(controlingAtom);
  const [visibleModels, setVisibleModels] = useState<Object3D[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const initialAbleRef = useRef(false);

  const didMount = useAtomValue(didMountAtom);

  // 缓存对象以提高性能
  const raycasterRef = useRef(new Raycaster());
  const cameraPositionRef = useRef(new Vector3());
  const modelPositionsRef = useRef<Vector3[]>([]);
  const tempBox = useMemo(() => new Box3(), []);
  const tempCenter = useMemo(() => new Vector3(), []);
  const ndcPoint = useMemo(() => new Vector3(), []);
  const tempCorners = useMemo(
    () =>
      Array(8)
        .fill(0)
        .map(() => new Vector3()),
    []
  );

  const getModelList = useCallback(() => {
    return nameList.reduce<Object3D[]>((acc, name) => {
      const model = globalData.app?.objectsNameDict?.[name] as Object3D;
      if (model) {
        acc.push(model);
      }
      return acc;
    }, []);
  }, [nameList]);

  // 检查模型是否在视野内（改进版本，参考useCameraFocus的实现）
  const isModelInView = useCallback(
    (model: Object3D): boolean => {
      // 获取包围盒
      const box = tempBox.setFromObject(model);

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
    },
    [camera, tempBox, tempCenter, ndcPoint, tempCorners]
  );

  // 计算点到屏幕中心的距离（在NDC空间中）
  const distanceToScreenCenter = useCallback(
    (point: Vector3): number => {
      ndcPoint.copy(point).project(camera);
      return Math.sqrt(ndcPoint.x * ndcPoint.x + ndcPoint.y * ndcPoint.y);
    },
    [camera, ndcPoint]
  );

  // 检查模型是否被遮挡（改进版本，使用射线检测）
  const isModelOccluded = useCallback(
    (model: Object3D): boolean => {
      const modelWorldPosition = new Vector3();
      model.getWorldPosition(modelWorldPosition);

      // 从相机到模型的方向向量
      const direction = modelWorldPosition
        .clone()
        .sub(camera.position)
        .normalize();

      // 设置射线起点和方向
      raycasterRef.current.set(camera.position, direction);

      // 获取射线与场景中所有对象的交点
      const intersects = raycasterRef.current.intersectObjects(
        scene.children,
        true
      );

      if (intersects.length === 0) return false;

      // 获取第一个交点（最近的物体）
      const firstIntersect = intersects[0];

      // 如果第一个交点不是目标模型，说明被遮挡
      return (
        firstIntersect.object !== model &&
        !model.children.includes(firstIntersect.object) &&
        !model.parent?.children.includes(firstIntersect.object)
      );
    },
    [camera.position, scene.children]
  );

  // 主计算逻辑（改进版本，参考useCameraFocus的检测策略）
  const calculateVisibleModels = useCallback(() => {
    if (controling) {
      setVisibleModels([]);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);

    const validModels = getModelList();
    if (validModels.length === 0) {
      setVisibleModels([]);
      setIsCalculating(false);
      return;
    }

    // 存储视野内的模型及其信息
    interface ModelInfo {
      model: Object3D;
      distanceToCamera: number;
      distanceToCenter: number;
      fromRaycast: boolean;
    }

    const modelsInView: ModelInfo[] = [];
    const processedModels = new Set<Object3D>();

    // 第一步：射线检测，找到射线路径上的模型
    const viewDirection = new Vector3();
    camera.getWorldDirection(viewDirection);
    raycasterRef.current.set(camera.position, viewDirection);

    const raycastResults = raycasterRef.current.intersectObjects(
      validModels,
      true
    );

    // 处理射线检测结果
    for (const hit of raycastResults) {
      // 找到此交点所属的根模型（在validModels中的模型）
      let rootModel: Object3D | null = null;
      let current = hit.object;

      while (
        current &&
        !validModels.some(model => model.name === current.name)
      ) {
        current = current.parent!;
      }

      rootModel = current;

      // 如果找到了根模型且尚未处理过
      if (rootModel && !processedModels.has(rootModel)) {
        processedModels.add(rootModel);

        // 计算到相机的距离
        const distanceToCamera = camera.position.distanceTo(hit.point);

        // 只考虑在指定距离内的模型
        if (distanceToCamera <= distance) {
          modelsInView.push({
            model: rootModel,
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
      if (isModelInView(model)) {
        // 获取模型的包围盒中心
        tempBox.setFromObject(model);
        tempBox.getCenter(tempCenter);

        // 计算到相机的距离
        const distanceToCamera = camera.position.distanceTo(tempCenter);

        // 只考虑在指定距离内的模型
        if (distanceToCamera <= distance) {
          // 检查是否被遮挡
          if (!isModelOccluded(model)) {
            // 计算到屏幕中心的距离
            const distanceToCenter = distanceToScreenCenter(tempCenter);

            modelsInView.push({
              model,
              distanceToCamera,
              distanceToCenter,
              fromRaycast: false,
            });
          }
        }
      }
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

    setVisibleModels(modelsInView.map(item => item.model));
    setIsCalculating(false);

    initialAbleRef.current = true;
  }, [
    controling,
    getModelList,
    camera,
    distance,
    isModelInView,
    isModelOccluded,
    distanceToScreenCenter,
    tempBox,
    tempCenter,
  ]);

  // 使用useFrame进行实时更新
  useEffect(() => {
    if (controling || !initialAbleRef.current || !controls || !camera) return;

    // 更新相机位置引用
    cameraPositionRef.current.copy(camera.position);

    // 更新模型位置引用
    modelPositionsRef.current = getModelList().map(model => {
      const position = new Vector3();
      model.getWorldPosition(position);
      return position;
    });

    // 触发重新计算
    calculateVisibleModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlToggle]);

  useEffect(() => {
    if (
      controling ||
      initialAbleRef.current ||
      !controls ||
      !camera ||
      !didMount
    )
      return;

    // 更新相机位置引用
    cameraPositionRef.current.copy(camera.position);

    // 更新模型位置引用
    modelPositionsRef.current = getModelList().map(model => {
      const position = new Vector3();
      model.getWorldPosition(position);
      return position;
    });

    // 触发重新计算
    calculateVisibleModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didMount]);

  return {
    visibleModels,
    isCalculating,
  };
};

export default useVisibleModelsInRange;
