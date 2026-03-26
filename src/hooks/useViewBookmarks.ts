import { useRef, useCallback, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ViewBookmark,
  ViewTransitionOptions,
} from '../types/sceneConfig';
import { CameraControls } from '@react-three/drei';
import { Tween, Easing, update as updateTween } from '@tweenjs/tween.js';

export const useViewBookmarks = (
  controlsRef: React.RefObject<CameraControls | null>
) => {
  const { camera } = useThree();
  const [bookmarks, setBookmarks] = useState<ViewBookmark[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const cameraRef = useRef(camera);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const saveBookmark = useCallback((
    name: string,
    options?: Partial<Omit<ViewBookmark, 'id' | 'name' | 'createdAt' | 'updatedAt'>>
  ): ViewBookmark => {
    const currentCamera = cameraRef.current;
    const controls = controlsRef.current;

    if (!currentCamera || !controls) {
      throw new Error('Camera or controls not available');
    }

    const position = currentCamera.position;
    const target = controls.getTarget(new THREE.Vector3());

    const bookmark: ViewBookmark = {
      id: `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      position: [position.x, position.y, position.z],
      target: [target.x, target.y, target.z],
      fov: (currentCamera as THREE.PerspectiveCamera).fov,
      near: currentCamera.near,
      far: currentCamera.far,
      zoom: (currentCamera as any).zoom,
      thumbnail: undefined,
      description: options?.description,
      tags: options?.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...options,
    };

    setBookmarks(prev => [...prev, bookmark]);
    return bookmark;
  }, [controlsRef]);

  const removeBookmark = useCallback((id: string): boolean => {
    setBookmarks(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index > -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
    return true;
  }, []);

  const updateBookmark = useCallback((
    id: string,
    updates: Partial<ViewBookmark>
  ): ViewBookmark | null => {
    let updated: ViewBookmark | null = null;
    setBookmarks(prev => prev.map(bookmark => {
      if (bookmark.id === id) {
        updated = { ...bookmark, ...updates, updatedAt: Date.now() };
        return updated;
      }
      return bookmark;
    }));
    return updated;
  }, []);

  const getBookmark = useCallback((id: string): ViewBookmark | undefined => {
    return bookmarks.find(b => b.id === id);
  }, [bookmarks]);

  const getAllBookmarks = useCallback((): ViewBookmark[] => {
    return [...bookmarks];
  }, [bookmarks]);

  const restoreBookmark = useCallback(async (
    id: string,
    options?: ViewTransitionOptions
  ): Promise<void> => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) {
      throw new Error(`Bookmark ${id} not found`);
    }

    const controls = controlsRef.current;
    const currentCamera = cameraRef.current;

    if (!controls || !currentCamera) {
      throw new Error('Camera or controls not available');
    }

    setIsTransitioning(true);

    const { duration = 1000, easing = 'easeInOut' } = options || {};

    const easingFunction = {
      linear: Easing.Linear.None,
      easeIn: Easing.Quadratic.In,
      easeOut: Easing.Quadratic.Out,
      easeInOut: Easing.Quadratic.InOut,
    }[easing];

    const startPosition = currentCamera.position.clone();
    const startTarget = controls.getTarget(new THREE.Vector3());

    const endPosition = new THREE.Vector3(...bookmark.position);
    const endTarget = new THREE.Vector3(...bookmark.target);

    if (duration <= 0) {
      controls.setPosition(endPosition.x, endPosition.y, endPosition.z, false);
      controls.setTarget(endTarget.x, endTarget.y, endTarget.z, false);
      setIsTransitioning(false);
      return;
    }

    const animationData = {
      posX: startPosition.x,
      posY: startPosition.y,
      posZ: startPosition.z,
      tgtX: startTarget.x,
      tgtY: startTarget.y,
      tgtZ: startTarget.z,
    };

    await new Promise<void>((resolve) => {
      let animationId: number;
      
      new Tween(animationData)
        .to({
          posX: endPosition.x,
          posY: endPosition.y,
          posZ: endPosition.z,
          tgtX: endTarget.x,
          tgtY: endTarget.y,
          tgtZ: endTarget.z,
        }, duration)
        .easing(easingFunction)
        .onUpdate(() => {
          controls.setPosition(
            animationData.posX,
            animationData.posY,
            animationData.posZ,
            false
          );
          controls.setTarget(
            animationData.tgtX,
            animationData.tgtY,
            animationData.tgtZ,
            false
          );
        })
        .onComplete(() => {
          cancelAnimationFrame(animationId);
          resolve();
        })
        .start();

      const animate = (time: number) => {
        updateTween(time);
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    });

    if (bookmark.fov !== undefined) {
      (currentCamera as THREE.PerspectiveCamera).fov = bookmark.fov;
      (currentCamera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }

    setIsTransitioning(false);
  }, [bookmarks, controlsRef]);

  const flyToPosition = useCallback(async (
    position: [number, number, number],
    target: [number, number, number],
    options?: ViewTransitionOptions
  ): Promise<void> => {
    const controls = controlsRef.current;
    const currentCamera = cameraRef.current;

    if (!controls || !currentCamera) {
      throw new Error('Camera or controls not available');
    }

    setIsTransitioning(true);

    const { duration = 1000, easing = 'easeInOut' } = options || {};

    const easingFunction = {
      linear: Easing.Linear.None,
      easeIn: Easing.Quadratic.In,
      easeOut: Easing.Quadratic.Out,
      easeInOut: Easing.Quadratic.InOut,
    }[easing];

    const startPosition = currentCamera.position.clone();
    const startTarget = controls.getTarget(new THREE.Vector3());

    const endPosition = new THREE.Vector3(...position);
    const endTarget = new THREE.Vector3(...target);



    if (duration <= 0) {
      controls.setPosition(endPosition.x, endPosition.y, endPosition.z, false);
      controls.setTarget(endTarget.x, endTarget.y, endTarget.z, false);
      setIsTransitioning(false);
      return;
    }

    const animationData = {
      posX: startPosition.x,
      posY: startPosition.y,
      posZ: startPosition.z,
      tgtX: startTarget.x,
      tgtY: startTarget.y,
      tgtZ: startTarget.z,
    };

    await new Promise<void>((resolve) => {
      let animationId: number;
      
      new Tween(animationData)
        .to({
          posX: endPosition.x,
          posY: endPosition.y,
          posZ: endPosition.z,
          tgtX: endTarget.x,
          tgtY: endTarget.y,
          tgtZ: endTarget.z,
        }, duration)
        .easing(easingFunction)
        .onUpdate(() => {
          controls.setPosition(
            animationData.posX,
            animationData.posY,
            animationData.posZ,
            false
          );
          controls.setTarget(
            animationData.tgtX,
            animationData.tgtY,
            animationData.tgtZ,
            false
          );
        })
        .onComplete(() => {
          cancelAnimationFrame(animationId);
          resolve();
        })
        .start();

      const animate = (time: number) => {
        updateTween(time);
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    });

    setIsTransitioning(false);
  }, [controlsRef]);

  const getCurrentView = useCallback(() => {
    const currentCamera = cameraRef.current;
    const controls = controlsRef.current;

    if (!currentCamera || !controls) {
      return {
        position: [0, 0, 0] as [number, number, number],
        target: [0, 0, 0] as [number, number, number],
      };
    }

    const position = currentCamera.position;
    const target = controls.getTarget(new THREE.Vector3());

    return {
      position: [position.x, position.y, position.z] as [number, number, number],
      target: [target.x, target.y, target.z] as [number, number, number],
      fov: (currentCamera as THREE.PerspectiveCamera).fov,
      near: currentCamera.near,
      far: currentCamera.far,
      zoom: (currentCamera as any).zoom,
    };
  }, [controlsRef]);

  const exportBookmarks = useCallback((): string => {
    return JSON.stringify(bookmarks, null, 2);
  }, [bookmarks]);

  const importBookmarks = useCallback((json: string, merge = true): ViewBookmark[] => {
    try {
      const imported = JSON.parse(json) as ViewBookmark[];
      const validBookmarks = imported.filter(b => 
        b.id && b.name && b.position && b.target
      );
      
      if (merge) {
        const existingIds = new Set(bookmarks.map(b => b.id));
        const newBookmarks = validBookmarks.filter(b => !existingIds.has(b.id));
        setBookmarks(prev => [...prev, ...newBookmarks]);
        return newBookmarks;
      } else {
        setBookmarks(validBookmarks);
        return validBookmarks;
      }
    } catch (error) {
      console.error('Failed to import bookmarks:', error);
      return [];
    }
  }, [bookmarks]);

  const clearBookmarks = useCallback((): void => {
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    isTransitioning,
    
    camera: {
      saveBookmark,
      removeBookmark,
      updateBookmark,
      getBookmark,
      getAllBookmarks,
      restoreBookmark,
      flyToPosition,
      getCurrentView,
      exportBookmarks,
      importBookmarks,
      clearBookmarks,
    },
  };
};
