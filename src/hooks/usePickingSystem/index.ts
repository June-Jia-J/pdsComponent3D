import { useCallback, useRef, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PickingResult,
  PickingSystemAPI,
  PickingSystemOptions,
  AnchorPoint,
  Position3D,
  BoundingBoxInfo,
  generateId,
  positionToArray,
  boundingBoxToInfo,
  CoordinateSystem,
} from '@/types/sceneConfig';

const DEFAULT_COORDINATE_SYSTEM: CoordinateSystem = {
  type: 'world',
  origin: [0, 0, 0],
  scale: 1,
  unit: 'meter',
};

export function usePickingSystem(
  options: PickingSystemOptions = {}
): PickingSystemAPI {
  const {
    enabled = true,
    filter,
    includeInvisible = false,
    includePoints: _includePoints = true,
    threshold = 0.1,
  } = options;

  void _includePoints;

  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const anchorPointsRef = useRef<Map<string, AnchorPoint>>(new Map());
  const coordinateSystemRef = useRef<CoordinateSystem>(DEFAULT_COORDINATE_SYSTEM);

  raycaster.current.params.Points = { threshold };
  raycaster.current.params.Line = { threshold };

  const findIntersectedObject = useCallback(
    (
      intersects: THREE.Intersection[]
    ): THREE.Intersection | null => {
      for (const intersect of intersects) {
        const object = intersect.object;

        if (!includeInvisible && !object.visible) continue;

        if (filter && !filter(object)) continue;

        return intersect;
      }
      return null;
    },
    [filter, includeInvisible]
  );

  const createPickingResult = useCallback(
    (intersect: THREE.Intersection | null): PickingResult | null => {
      if (!intersect) return null;

      const object = intersect.object;
      const point = intersect.point;
      const worldPosition = new THREE.Vector3();
      object.getWorldPosition(worldPosition);

      const box = new THREE.Box3().setFromObject(object);
      const boundingBox = boundingBoxToInfo(box);

      const normal = intersect.face?.normal
        ? positionToArray(intersect.face.normal.clone().transformDirection(object.matrixWorld))
        : null;

      return {
        object,
        point: point ? positionToArray(point) : null,
        worldPosition: positionToArray(worldPosition),
        boundingBox,
        normal,
        distance: intersect.distance,
      };
    },
    []
  );

  const pick = useCallback(
    (screenX: number, screenY: number): PickingResult | null => {
      if (!enabled || !camera || !scene) return null;

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((screenX - rect.left) / rect.width) * 2 - 1,
        -((screenY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse, camera);

      const objects: THREE.Object3D[] = [];
      scene.traverse(child => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          objects.push(child);
        }
      });

      const intersects = raycaster.current.intersectObjects(objects, true);
      const validIntersect = findIntersectedObject(intersects);

      return createPickingResult(validIntersect);
    },
    [enabled, camera, scene, gl, findIntersectedObject, createPickingResult]
  );

  const pickByRay = useCallback(
    (origin: Position3D, direction: Position3D): PickingResult | null => {
      if (!enabled || !scene) return null;

      const originVec = new THREE.Vector3(origin[0], origin[1], origin[2]);
      const directionVec = new THREE.Vector3(
        direction[0],
        direction[1],
        direction[2]
      ).normalize();

      raycaster.current.set(originVec, directionVec);

      const objects: THREE.Object3D[] = [];
      scene.traverse(child => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          objects.push(child);
        }
      });

      const intersects = raycaster.current.intersectObjects(objects, true);
      const validIntersect = findIntersectedObject(intersects);

      return createPickingResult(validIntersect);
    },
    [enabled, scene, findIntersectedObject, createPickingResult]
  );

  const pickModelByName = useCallback(
    (name: string): PickingResult | null => {
      if (!enabled || !scene) return null;

      let targetObject: THREE.Object3D | null = null;
      scene.traverse(child => {
        if (child.name === name) {
          targetObject = child;
        }
      });

      if (!targetObject) return null;

      const foundObject = targetObject as THREE.Object3D;
      const worldPosition = new THREE.Vector3();
      foundObject.getWorldPosition(worldPosition);

      const box = new THREE.Box3().setFromObject(foundObject);
      const boundingBox = boundingBoxToInfo(box);

      return {
        object: foundObject,
        point: positionToArray(worldPosition),
        worldPosition: positionToArray(worldPosition),
        boundingBox,
        normal: null,
        distance: 0,
      };
    },
    [enabled, scene]
  );

  const getWorldPosition = useCallback(
    (object: THREE.Object3D): Position3D => {
      const pos = new THREE.Vector3();
      object.getWorldPosition(pos);
      return positionToArray(pos);
    },
    []
  );

  const getBoundingBox = useCallback(
    (object: THREE.Object3D): BoundingBoxInfo => {
      const box = new THREE.Box3().setFromObject(object);
      return boundingBoxToInfo(box);
    },
    []
  );

  const normalizePosition = useCallback(
    (worldPos: Position3D): Position3D => {
      const coord = coordinateSystemRef.current;
      const origin = coord.origin;
      const scale = coord.scale;

      return [
        (worldPos[0] - origin[0]) * scale,
        (worldPos[1] - origin[1]) * scale,
        (worldPos[2] - origin[2]) * scale,
      ];
    },
    []
  );

  const denormalizePosition = useCallback(
    (normalizedPos: Position3D): Position3D => {
      const coord = coordinateSystemRef.current;
      const origin = coord.origin;
      const scale = coord.scale;

      return [
        normalizedPos[0] / scale + origin[0],
        normalizedPos[1] / scale + origin[1],
        normalizedPos[2] / scale + origin[2],
      ];
    },
    []
  );

  const createAnchor = useCallback(
    (
      name: string,
      worldPosition: Position3D,
      anchorOptions: Partial<AnchorPoint> = {}
    ): AnchorPoint => {
      const now = Date.now();
      const anchor: AnchorPoint = {
        id: generateId(),
        name,
        worldPosition,
        createdAt: now,
        updatedAt: now,
        ...anchorOptions,
      };

      anchorPointsRef.current.set(anchor.id, anchor);
      return anchor;
    },
    []
  );

  const removeAnchor = useCallback((anchorId: string) => {
    anchorPointsRef.current.delete(anchorId);
  }, []);

  const getAnchor = useCallback(
    (anchorId: string): AnchorPoint | undefined => {
      return anchorPointsRef.current.get(anchorId);
    },
    []
  );

  const getAnchors = useCallback((): AnchorPoint[] => {
    return Array.from(anchorPointsRef.current.values());
  }, []);

  const bindAnchorToLabel = useCallback(
    (anchorId: string, labelId: string) => {
      const anchor = anchorPointsRef.current.get(anchorId);
      if (anchor) {
        anchorPointsRef.current.set(anchorId, {
          ...anchor,
          labelId,
          updatedAt: Date.now(),
        });
      }
    },
    []
  );

  const bindAnchorToBusinessId = useCallback(
    (anchorId: string, businessId: string) => {
      const anchor = anchorPointsRef.current.get(anchorId);
      if (anchor) {
        anchorPointsRef.current.set(anchorId, {
          ...anchor,
          businessId,
          updatedAt: Date.now(),
        });
      }
    },
    []
  );

  const exportAnchors = useCallback((): string => {
    return JSON.stringify(Array.from(anchorPointsRef.current.values()), null, 2);
  }, []);

  const importAnchors = useCallback((json: string) => {
    try {
      const anchors: AnchorPoint[] = JSON.parse(json);
      anchors.forEach(anchor => {
        anchorPointsRef.current.set(anchor.id, anchor);
      });
    } catch (e) {
      console.error('Failed to import anchors:', e);
    }
  }, []);

  return useMemo(() => ({
    pick,
    pickByRay,
    pickModelByName,
    getWorldPosition,
    getBoundingBox,
    normalizePosition,
    denormalizePosition,
    createAnchor,
    removeAnchor,
    getAnchor,
    getAnchors,
    bindAnchorToLabel,
    bindAnchorToBusinessId,
    exportAnchors,
    importAnchors,
  }), [
    pick,
    pickByRay,
    pickModelByName,
    getWorldPosition,
    getBoundingBox,
    normalizePosition,
    denormalizePosition,
    createAnchor,
    removeAnchor,
    getAnchor,
    getAnchors,
    bindAnchorToLabel,
    bindAnchorToBusinessId,
    exportAnchors,
    importAnchors,
  ]);
}
