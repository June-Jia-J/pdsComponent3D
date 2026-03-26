import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import {
  Raycaster,
  Vector2,
  Vector3,
  Object3D,
  Box3,
  Intersection,
} from 'three';
import { PickResult, AnchorPoint, BoundingBoxInfo } from '../types';
import { PICK_CONFIG } from '../constants';
import globalData from '@/store/globalData';

/* eslint-disable no-unused-vars */
export interface UsePickingOptions {
  /** 是否启用拾取 */
  enabled?: boolean;
  /** 拾取回调 */
  onPick?: (result: PickResult) => void;
  /** 过滤器 - 只拾取指定类型的对象 */
  filter?: (object: Object3D) => boolean;
}

export interface UsePickingReturn {
  /** 执行射线拾取 */
  pick: (screenX: number, screenY: number) => PickResult | null;
  /** 获取对象的包围盒信息 */
  getBoundingBox: (objectNameOrId: string) => BoundingBoxInfo | null;
  /** 世界坐标转屏幕坐标 */
  worldToScreen: (
    worldPosition: Vector3 | [number, number, number]
  ) => { x: number; y: number } | null;
  /** 屏幕坐标转世界坐标（基于平面） */
  screenToWorld: (
    screenX: number,
    screenY: number,
    planeY?: number
  ) => Vector3 | null;
}
/* eslint-enable no-unused-vars */

/**
 * 射线拾取 Hook
 * 提供统一的射线拾取能力，支持世界/局部坐标转换
 */
export function usePicking(options: UsePickingOptions = {}): UsePickingReturn {
  const { enabled = true, onPick, filter } = options;
  const { camera, scene, gl } = useThree();

  const raycasterRef = useRef(new Raycaster());
  const mouseRef = useRef(new Vector2());

  /**
   * 执行射线拾取
   */
  const pick = useCallback(
    (screenX: number, screenY: number): PickResult | null => {
      if (!enabled || !camera || !scene) {
        console.log('拾取不可用:', {
          enabled,
          hasCamera: !!camera,
          hasScene: !!scene,
        });
        return null;
      }

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      // 计算归一化设备坐标 (NDC)
      mouseRef.current.x = ((screenX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((screenY - rect.top) / rect.height) * 2 + 1;

      // 设置射线
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // 执行拾取
      const intersects = raycasterRef.current.intersectObjects(
        scene.children,
        PICK_CONFIG.recursive
      );

      console.log('拾取结果:', {
        screenX,
        screenY,
        intersectsCount: intersects.length,
        sceneChildren: scene.children.length,
      });

      if (intersects.length === 0) return null;

      // 按距离排序并过滤
      let validIntersects = intersects;
      if (filter) {
        validIntersects = intersects.filter(i => filter(i.object));
      }

      if (PICK_CONFIG.sortByDistance) {
        validIntersects.sort((a, b) => a.distance - b.distance);
      }

      const hit = validIntersects[0];
      if (!hit) return null;

      const result = createPickResult(hit, screenX, screenY);

      onPick?.(result);

      return result;
    },
    [camera, scene, gl, enabled, onPick, filter]
  );

  /**
   * 获取对象的包围盒信息
   */
  const getBoundingBox = useCallback(
    (objectNameOrId: string): BoundingBoxInfo | null => {
      let obj: Object3D | undefined;

      // 尝试从名称字典获取
      obj = globalData.app?.objectsNameDict?.[objectNameOrId];

      // 如果没找到，尝试作为ID获取
      if (!obj) {
        obj = globalData.app?.objectsIdDict?.[objectNameOrId];
      }

      if (!obj) return null;

      const box = new Box3().setFromObject(obj);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      return {
        center: [center.x, center.y, center.z],
        size: [size.x, size.y, size.z],
        min: [box.min.x, box.min.y, box.min.z],
        max: [box.max.x, box.max.y, box.max.z],
      };
    },
    []
  );

  /**
   * 世界坐标转屏幕坐标
   */
  const worldToScreen = useCallback(
    (
      worldPosition: Vector3 | [number, number, number]
    ): { x: number; y: number } | null => {
      if (!camera || !gl) return null;

      const position =
        worldPosition instanceof Vector3
          ? worldPosition
          : new Vector3(worldPosition[0], worldPosition[1], worldPosition[2]);

      const projected = position.clone().project(camera);

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      return {
        x: ((projected.x + 1) / 2) * rect.width + rect.left,
        y: ((-projected.y + 1) / 2) * rect.height + rect.top,
      };
    },
    [camera, gl]
  );

  /**
   * 屏幕坐标转世界坐标（基于水平面）
   */
  const screenToWorld = useCallback(
    (screenX: number, screenY: number, planeY = 0): Vector3 | null => {
      if (!camera || !gl) return null;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      mouseRef.current.x = ((screenX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((screenY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // 与水平面求交
      const target = new Vector3();
      const planeNormal = new Vector3(0, 1, 0);
      const planeConstant = -planeY;

      raycasterRef.current.ray.intersectPlane(
        { normal: planeNormal, constant: planeConstant } as any,
        target
      );

      return target;
    },
    [camera, gl]
  );

  return {
    pick,
    getBoundingBox,
    worldToScreen,
    screenToWorld,
  };
}

/**
 * 创建拾取结果对象
 */
function createPickResult(
  intersection: Intersection,
  _screenX: number,
  _screenY: number
): PickResult {
  const { object, point, face, distance, uv } = intersection;

  // 世界坐标
  const worldPosition = point.clone();

  // 局部坐标
  const localPosition = object.worldToLocal(worldPosition.clone());

  // 法向量
  const normal = face?.normal
    ? face.normal.clone().transformDirection(object.matrixWorld).normalize()
    : null;

  return {
    object,
    worldPosition,
    localPosition,
    normal,
    distance,
    uv: uv ? { u: uv.x, v: uv.y } : null,
    screenPosition: { x: _screenX, y: _screenY },
    faceIndex: face ? ((face as any).faceIndex ?? null) : null,
  };
}

/**
 * 锚点管理 Hook
 */
export function useAnchorManager() {
  const anchorsRef = useRef<Map<string, AnchorPoint>>(new Map());

  /**
   * 添加锚点
   */
  const addAnchor = useCallback(
    (anchor: Omit<AnchorPoint, 'id'>): AnchorPoint => {
      const id = generateId();
      const newAnchor: AnchorPoint = {
        ...anchor,
        id,
      };
      anchorsRef.current.set(id, newAnchor);
      return newAnchor;
    },
    []
  );

  /**
   * 更新锚点
   */
  const updateAnchor = useCallback(
    (id: string, updates: Partial<AnchorPoint>): boolean => {
      const anchor = anchorsRef.current.get(id);
      if (!anchor) return false;

      anchorsRef.current.set(id, { ...anchor, ...updates });
      return true;
    },
    []
  );

  /**
   * 删除锚点
   */
  const removeAnchor = useCallback((id: string): boolean => {
    return anchorsRef.current.delete(id);
  }, []);

  /**
   * 获取所有锚点
   */
  const getAnchors = useCallback((): AnchorPoint[] => {
    return Array.from(anchorsRef.current.values());
  }, []);

  /**
   * 根据ID获取锚点
   */
  const getAnchorById = useCallback((id: string): AnchorPoint | undefined => {
    return anchorsRef.current.get(id);
  }, []);

  /**
   * 根据业务ID获取锚点
   */
  const getAnchorsByBusinessId = useCallback(
    (businessId: string): AnchorPoint[] => {
      return Array.from(anchorsRef.current.values()).filter(
        a => a.businessId === businessId
      );
    },
    []
  );

  /**
   * 设置锚点列表（用于导入配置）
   */
  const setAnchors = useCallback((anchors: AnchorPoint[]): void => {
    anchorsRef.current.clear();
    anchors.forEach(anchor => {
      anchorsRef.current.set(anchor.id, anchor);
    });
  }, []);

  /**
   * 清空所有锚点
   */
  const clearAnchors = useCallback((): void => {
    anchorsRef.current.clear();
  }, []);

  return {
    addAnchor,
    updateAnchor,
    removeAnchor,
    getAnchors,
    getAnchorById,
    getAnchorsByBusinessId,
    setAnchors,
    clearAnchors,
  };
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
