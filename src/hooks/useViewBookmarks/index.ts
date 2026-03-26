import { useCallback, useRef, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import {
  ViewBookmark,
  ViewBookmarksAPI,
  ViewBookmarkTransitionOptions,
  Position3D,
  generateId,
} from '@/types/sceneConfig';

const DEFAULT_TRANSITION_DURATION = 1000;

export function useViewBookmarks(): ViewBookmarksAPI {
  const { camera, controls } = useThree<{
    camera: THREE.PerspectiveCamera;
    controls: CameraControls;
  }>();

  const bookmarksRef = useRef<Map<string, ViewBookmark>>(new Map());
  const activeBookmarkIdRef = useRef<string | undefined>(undefined);
  const isTransitioningRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const createBookmark = useCallback(
    (name: string, options: Partial<ViewBookmark> = {}): ViewBookmark => {
      const now = Date.now();
      const bookmark: ViewBookmark = {
        id: generateId(),
        name,
        position: options.position || [0, 0, 5],
        target: options.target || [0, 0, 0],
        createdAt: now,
        updatedAt: now,
        ...options,
      };

      bookmarksRef.current.set(bookmark.id, bookmark);
      return bookmark;
    },
    []
  );

  const updateBookmark = useCallback(
    (id: string, updates: Partial<ViewBookmark>): ViewBookmark | null => {
      const existing = bookmarksRef.current.get(id);
      if (!existing) return null;

      const updatedBookmark: ViewBookmark = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };
      bookmarksRef.current.set(id, updatedBookmark);
      return updatedBookmark;
    },
    []
  );

  const deleteBookmark = useCallback((id: string): boolean => {
    const deleted = bookmarksRef.current.delete(id);

    if (activeBookmarkIdRef.current === id) {
      activeBookmarkIdRef.current = undefined;
    }

    return deleted;
  }, []);

  const getBookmark = useCallback(
    (id: string): ViewBookmark | undefined => {
      return bookmarksRef.current.get(id);
    },
    []
  );

  const getBookmarks = useCallback((): ViewBookmark[] => {
    return Array.from(bookmarksRef.current.values());
  }, []);

  const applyBookmark = useCallback(
    async (
      id: string,
      transitionOptions: ViewBookmarkTransitionOptions = {}
    ): Promise<boolean> => {
      const bookmark = bookmarksRef.current.get(id);
      if (!bookmark || !controls || isTransitioningRef.current) {
        return false;
      }

      const {
        duration = DEFAULT_TRANSITION_DURATION,
        easing = 'easeInOut',
        onTransitionStart,
        onTransitionEnd,
      } = transitionOptions;

      isTransitioningRef.current = true;
      onTransitionStart?.();

      const currentPosition = new THREE.Vector3();
      const currentTarget = new THREE.Vector3();
      controls.getPosition(currentPosition);
      controls.getTarget(currentTarget);

      const targetPosition = new THREE.Vector3(
        bookmark.position[0],
        bookmark.position[1],
        bookmark.position[2]
      );
      const targetLookAt = new THREE.Vector3(
        bookmark.target[0],
        bookmark.target[1],
        bookmark.target[2]
      );

      const easeMap: Record<string, string> = {
        linear: 'none',
        easeIn: 'power2.in',
        easeOut: 'power2.out',
        easeInOut: 'power2.inOut',
      };

      const gsapEase = easeMap[easing] || 'power2.inOut';

      return new Promise(resolve => {
        const tweenValues = {
          posX: currentPosition.x,
          posY: currentPosition.y,
          posZ: currentPosition.z,
          targetX: currentTarget.x,
          targetY: currentTarget.y,
          targetZ: currentTarget.z,
        };

        tweenRef.current = gsap.to(tweenValues, {
          posX: targetPosition.x,
          posY: targetPosition.y,
          posZ: targetPosition.z,
          targetX: targetLookAt.x,
          targetY: targetLookAt.y,
          targetZ: targetLookAt.z,
          duration: duration / 1000,
          ease: gsapEase,
          onUpdate: () => {
            controls.setLookAt(
              tweenValues.posX,
              tweenValues.posY,
              tweenValues.posZ,
              tweenValues.targetX,
              tweenValues.targetY,
              tweenValues.targetZ,
              false
            );
          },
          onComplete: () => {
            isTransitioningRef.current = false;
            activeBookmarkIdRef.current = id;
            onTransitionEnd?.();
            resolve(true);
          },
          onInterrupt: () => {
            isTransitioningRef.current = false;
            resolve(false);
          },
        });
      });
    },
    [controls]
  );

  const getCurrentViewAsBookmark = useCallback(
    (name: string): ViewBookmark => {
      const position = new THREE.Vector3();
      const target = new THREE.Vector3();

      if (controls) {
        controls.getPosition(position);
        controls.getTarget(target);
      }

      const now = Date.now();
      const bookmark: ViewBookmark = {
        id: generateId(),
        name,
        position: [position.x, position.y, position.z],
        target: [target.x, target.y, target.z],
        fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : undefined,
        near: camera.near,
        far: camera.far,
        zoom: camera.zoom,
        createdAt: now,
        updatedAt: now,
      };

      return bookmark;
    },
    [controls, camera]
  );

  const exportBookmarks = useCallback((): string => {
    return JSON.stringify(Array.from(bookmarksRef.current.values()), null, 2);
  }, []);

  const importBookmarks = useCallback((json: string) => {
    try {
      const importedBookmarks: ViewBookmark[] = JSON.parse(json);
      importedBookmarks.forEach(bookmark => {
        bookmarksRef.current.set(bookmark.id, bookmark);
      });
    } catch (e) {
      console.error('Failed to import bookmarks:', e);
    }
  }, []);

  const setActiveBookmark = useCallback((id: string) => {
    activeBookmarkIdRef.current = id;
  }, []);

  const getActiveBookmark = useCallback((): ViewBookmark | undefined => {
    if (!activeBookmarkIdRef.current) return undefined;
    return bookmarksRef.current.get(activeBookmarkIdRef.current);
  }, []);

  return useMemo(() => ({
    createBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmark,
    getBookmarks,
    applyBookmark,
    getCurrentViewAsBookmark,
    exportBookmarks,
    importBookmarks,
    setActiveBookmark,
    getActiveBookmark,
  }), [
    createBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmark,
    getBookmarks,
    applyBookmark,
    getCurrentViewAsBookmark,
    exportBookmarks,
    importBookmarks,
    setActiveBookmark,
    getActiveBookmark,
  ]);
}

export function createViewBookmarkFromObject(
  name: string,
  object: THREE.Object3D,
  camera: THREE.Camera,
  offset: Position3D = [0, 0, 5]
): ViewBookmark {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 2;

  const now = Date.now();

  return {
    id: generateId(),
    name,
    position: [
      center.x + offset[0] * distance,
      center.y + offset[1] * distance,
      center.z + offset[2] * distance,
    ],
    target: [center.x, center.y, center.z],
    fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function interpolateBookmarks(
  bookmark1: ViewBookmark,
  bookmark2: ViewBookmark,
  t: number
): { position: Position3D; target: Position3D } {
  const pos1 = bookmark1.position;
  const pos2 = bookmark2.position;
  const target1 = bookmark1.target;
  const target2 = bookmark2.target;

  return {
    position: [
      pos1[0] + (pos2[0] - pos1[0]) * t,
      pos1[1] + (pos2[1] - pos1[1]) * t,
      pos1[2] + (pos2[2] - pos1[2]) * t,
    ],
    target: [
      target1[0] + (target2[0] - target1[0]) * t,
      target1[1] + (target2[1] - target1[1]) * t,
      target1[2] + (target2[2] - target1[2]) * t,
    ],
  };
}
