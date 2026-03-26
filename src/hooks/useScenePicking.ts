import { useRef, useCallback, useEffect, useState } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PickedMesh,
  CoordinateInfo,
  BoundingBoxInfo,
  RaycastOptions,
  AnchorPoint,
} from '../types/sceneConfig';
import { useAtom, useSetAtom } from 'jotai';
import {
  selectedModelAtom,
  screenPositionAtom,
} from '../atoms/selectModel';

export const useScenePicking = () => {
  const { camera, scene, raycaster } = useThree();
  const [pickedMesh, setPickedMesh] = useState<PickedMesh | null>(null);
  const [anchors, setAnchors] = useState<AnchorPoint[]>([]);
  const [, setSelectedModel] = useAtom(selectedModelAtom);
  const setScreenPosition = useSetAtom(screenPositionAtom);
  const pickFilterRef = useRef<((mesh: THREE.Object3D) => boolean) | null>(null);

  const sceneRef = useRef(scene);
  const cameraRef = useRef(camera);

  useEffect(() => {
    sceneRef.current = scene;
    cameraRef.current = camera;
  }, [scene, camera]);

  const convertToCoordinateInfo = useCallback((
    point: THREE.Vector3,
    object?: THREE.Object3D
  ): CoordinateInfo => {
    const world: [number, number, number] = [point.x, point.y, point.z];
    
    let local: [number, number, number] = world;
    if (object) {
      const localPoint = point.clone();
      object.worldToLocal(localPoint);
      local = [localPoint.x, localPoint.y, localPoint.z];
    }

    const normalized: [number, number, number] = [0, 0, 0];
    if (object) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      if (size.x > 0 && size.y > 0 && size.z > 0) {
        normalized[0] = ((point.x - center.x) / size.x) + 0.5;
        normalized[1] = ((point.y - center.y) / size.y) + 0.5;
        normalized[2] = ((point.z - center.z) / size.z) + 0.5;
      }
    }

    return { world, local, normalized };
  }, []);

  const getBoundingBoxInfo = useCallback((object: THREE.Object3D): BoundingBoxInfo => {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    return {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
      center: [center.x, center.y, center.z],
      size: [size.x, size.y, size.z],
    };
  }, []);

  const raycastFromScreen = useCallback((
    screenX: number,
    screenY: number,
    options?: RaycastOptions
  ): PickedMesh | null => {
    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);

    let meshes: THREE.Object3D[] = [];
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        if (!options?.filterMesh || options.filterMesh(child)) {
          meshes.push(child);
        }
      }
    });

    const intersects = raycaster.intersectObjects(meshes, options?.recursive ?? true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const mesh = intersection.object as THREE.Object3D;
      
      return {
        mesh,
        meshId: mesh.id,
        meshName: mesh.name,
        parentName: mesh.parent?.name,
        point: {
          point: convertToCoordinateInfo(intersection.point, mesh),
          normal: intersection.face?.normal 
            ? [intersection.face.normal.x, intersection.face.normal.y, intersection.face.normal.z]
            : undefined,
          uv: intersection.uv 
            ? [intersection.uv.x, intersection.uv.y]
            : undefined,
          faceIndex: intersection.faceIndex ?? undefined,
        },
        boundingBox: getBoundingBoxInfo(mesh),
        distance: intersection.distance,
      };
    }

    return null;
  }, [raycaster, convertToCoordinateInfo, getBoundingBoxInfo]);

  const raycastFromPoint = useCallback((
    origin: [number, number, number],
    direction: [number, number, number],
    options?: RaycastOptions
  ): PickedMesh | null => {
    const originVec = new THREE.Vector3(...origin);
    const directionVec = new THREE.Vector3(...direction).normalize();
    
    raycaster.set(originVec, directionVec);

    let meshes: THREE.Object3D[] = [];
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        if (!options?.filterMesh || options.filterMesh(child)) {
          meshes.push(child);
        }
      }
    });

    const intersects = raycaster.intersectObjects(meshes, options?.recursive ?? true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const mesh = intersection.object as THREE.Object3D;
      
      return {
        mesh,
        meshId: mesh.id,
        meshName: mesh.name,
        parentName: mesh.parent?.name,
        point: {
          point: convertToCoordinateInfo(intersection.point, mesh),
          normal: intersection.face?.normal 
            ? [intersection.face.normal.x, intersection.face.normal.y, intersection.face.normal.z]
            : undefined,
          uv: intersection.uv 
            ? [intersection.uv.x, intersection.uv.y]
            : undefined,
          faceIndex: intersection.faceIndex ?? undefined,
        },
        boundingBox: getBoundingBoxInfo(mesh),
        distance: intersection.distance,
      };
    }

    return null;
  }, [raycaster, convertToCoordinateInfo, getBoundingBoxInfo]);

  const getMeshInfo = useCallback((mesh: THREE.Object3D) => {
    const position = convertToCoordinateInfo(mesh.position, mesh);
    const boundingBox = getBoundingBoxInfo(mesh);
    return { position, boundingBox };
  }, [convertToCoordinateInfo, getBoundingBoxInfo]);

  const handleMeshClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    const mesh = event.object;
    const point = event.point;
    
    const pickedInfo: PickedMesh = {
      mesh,
      meshId: mesh.id,
      meshName: mesh.name,
      parentName: mesh.parent?.name,
      point: {
        point: convertToCoordinateInfo(point, mesh),
      },
      boundingBox: getBoundingBoxInfo(mesh),
      distance: camera.position.distanceTo(point),
    };

    setPickedMesh(pickedInfo);
    setSelectedModel(mesh);

    const screenPos = point.clone().project(cameraRef.current);
    setScreenPosition({
      x: (screenPos.x + 1) / 2 * window.innerWidth,
      y: (-screenPos.y + 1) / 2 * window.innerHeight,
    });
  }, [convertToCoordinateInfo, getBoundingBoxInfo, setSelectedModel, setScreenPosition, camera]);

  const clearSelection = useCallback(() => {
    setPickedMesh(null);
    setSelectedModel(null);
  }, [setSelectedModel]);

  const setPickFilter = useCallback((filter: ((mesh: THREE.Object3D) => boolean) | null) => {
    pickFilterRef.current = filter;
  }, []);

  const clearAnchors = useCallback((): void => {
    setAnchors([]);
  }, []);

  const addAnchor = useCallback((
    anchor: Omit<AnchorPoint, 'id' | 'createdAt'>
  ): AnchorPoint => {
    const newAnchor: AnchorPoint = {
      ...anchor,
      id: `anchor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setAnchors(prev => [...prev, newAnchor]);
    return newAnchor;
  }, []);

  const removeAnchor = useCallback((id: string): boolean => {
    setAnchors(prev => {
      const index = prev.findIndex(a => a.id === id);
      if (index > -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
    return true;
  }, []);

  const updateAnchor = useCallback((
    id: string,
    updates: Partial<AnchorPoint>
  ): AnchorPoint | null => {
    let updated: AnchorPoint | null = null;
    setAnchors(prev => prev.map(anchor => {
      if (anchor.id === id) {
        updated = { ...anchor, ...updates };
        return updated;
      }
      return anchor;
    }));
    return updated;
  }, []);

  const getAnchor = useCallback((id: string): AnchorPoint | undefined => {
    return anchors.find(a => a.id === id);
  }, [anchors]);

  const getAllAnchors = useCallback((): AnchorPoint[] => {
    return [...anchors];
  }, [anchors]);

  const findAnchorsByBinding = useCallback((bindingId: string): AnchorPoint[] => {
    return anchors.filter(a => a.bindingId === bindingId);
  }, [anchors]);

  const findAnchorsByTag = useCallback((tag: string): AnchorPoint[] => {
    return anchors.filter(a => a.tags?.includes(tag));
  }, [anchors]);

  const worldToLocal = useCallback((
    worldPoint: [number, number, number],
    object: THREE.Object3D
  ): [number, number, number] => {
    const point = new THREE.Vector3(...worldPoint);
    object.worldToLocal(point);
    return [point.x, point.y, point.z];
  }, []);

  const localToWorld = useCallback((
    localPoint: [number, number, number],
    object: THREE.Object3D
  ): [number, number, number] => {
    const point = new THREE.Vector3(...localPoint);
    object.localToWorld(point);
    return [point.x, point.y, point.z];
  }, []);

  const normalizePoint = useCallback((
    point: [number, number, number],
    bounds: THREE.Box3
  ): [number, number, number] => {
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    
    return [
      ((point[0] - center.x) / size.x) + 0.5,
      ((point[1] - center.y) / size.y) + 0.5,
      ((point[2] - center.z) / size.z) + 0.5,
    ];
  }, []);

  const denormalizePoint = useCallback((
    normalized: [number, number, number],
    bounds: THREE.Box3
  ): [number, number, number] => {
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    
    return [
      (normalized[0] - 0.5) * size.x + center.x,
      (normalized[1] - 0.5) * size.y + center.y,
      (normalized[2] - 0.5) * size.z + center.z,
    ];
  }, []);

  return {
    pickedMesh,
    setPickedMesh,
    anchorList: anchors,
    
    coordinate: {
      worldToLocal,
      localToWorld,
      normalizePoint,
      denormalizePoint,
      convertToCoordinateInfo,
    },
    
    picking: {
      raycastFromScreen,
      raycastFromPoint,
      getMeshInfo,
      getPickedMesh: () => pickedMesh,
      setPickedMesh,
      handleMeshClick,
      clearSelection,
      setPickFilter,
    },
    
    anchors: {
      add: addAnchor,
      remove: removeAnchor,
      update: updateAnchor,
      get: getAnchor,
      getAll: getAllAnchors,
      findByBinding: findAnchorsByBinding,
      findByTag: findAnchorsByTag,
      clear: clearAnchors,
    },
  };
};
