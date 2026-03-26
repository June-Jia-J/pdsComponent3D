import { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useScenePicking } from './useScenePicking';
import { useViewBookmarks } from './useViewBookmarks';
import { useLightingPresets } from './useLightingPresets';
import {
  SceneConfig,
  SceneConfigAPI,
  RaycastOptions,
  AnchorPoint,
  ViewTransitionOptions,
  LightingPreset,
} from '../types/sceneConfig';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';

export const useSceneConfig = (
  controlsRef: React.RefObject<CameraControls | null>
) => {
  const { scene, camera } = useThree();
  
  const picking = useScenePicking();
  const bookmarks = useViewBookmarks(controlsRef);
  const lighting = useLightingPresets();
  
  const sceneRef = useRef(scene);
  const cameraRef = useRef(camera);

  useEffect(() => {
    sceneRef.current = scene;
    cameraRef.current = camera;
  }, [scene, camera]);

  const saveConfig = useCallback((): SceneConfig => {
    const config: SceneConfig = {
      id: `scene-${Date.now()}`,
      name: 'Scene Configuration',
      version: '1.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewBookmarks: bookmarks.bookmarks,
      lightingPresets: lighting.presets,
      activeLightingPresetId: lighting.activePresetId,
      anchorPoints: picking.anchorList,
      settings: {
        autoRotate: false,
        autoRotateSpeed: 2,
        enableControls: true,
        enableShadows: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      },
    };
    return config;
  }, [bookmarks.bookmarks, lighting.presets, lighting.activePresetId, picking.anchorList]);

  const loadConfig = useCallback((config: SceneConfig): boolean => {
    try {
      if (config.viewBookmarks && config.viewBookmarks.length > 0) {
        config.viewBookmarks.forEach(bookmark => {
          bookmarks.camera.saveBookmark(bookmark.name, bookmark);
        });
      }

      if (config.lightingPresets && config.lightingPresets.length > 0) {
        config.lightingPresets.forEach(preset => {
          lighting.lighting.createPreset(preset.name, preset);
        });
      }

      if (config.activeLightingPresetId) {
        lighting.lighting.applyPreset(config.activeLightingPresetId);
      }

      if (config.anchorPoints && config.anchorPoints.length > 0) {
        config.anchorPoints.forEach(anchor => {
          picking.anchors.add(anchor);
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to load scene config:', error);
      return false;
    }
  }, [bookmarks.camera, lighting.lighting, picking.anchors]);

  const exportConfig = useCallback((): string => {
    const config = saveConfig();
    return JSON.stringify(config, null, 2);
  }, [saveConfig]);

  const importConfig = useCallback((json: string): boolean => {
    try {
      const config = JSON.parse(json) as SceneConfig;
      return loadConfig(config);
    } catch (error) {
      console.error('Failed to import scene config:', error);
      return false;
    }
  }, [loadConfig]);

  const resetConfig = useCallback(() => {
  }, []);

  const api: SceneConfigAPI = {
    coordinate: {
      worldToLocal: picking.coordinate.worldToLocal,
      localToWorld: picking.coordinate.localToWorld,
      normalizePoint: picking.coordinate.normalizePoint,
      denormalizePoint: picking.coordinate.denormalizePoint,
    },

    picking: {
      raycastFromScreen: (screenX: number, screenY: number, options?: RaycastOptions) =>
        picking.picking.raycastFromScreen(screenX, screenY, options),
      raycastFromPoint: (origin: [number, number, number], direction: [number, number, number], options?: RaycastOptions) =>
        picking.picking.raycastFromPoint(origin, direction, options),
      getMeshInfo: (mesh: THREE.Object3D) => picking.picking.getMeshInfo(mesh),
      getPickedMesh: () => picking.picking.getPickedMesh(),
      setPickedMesh: (mesh) => picking.picking.setPickedMesh(mesh),
      clearSelection: () => picking.picking.clearSelection(),
      setPickFilter: (filter: ((mesh: THREE.Object3D) => boolean) | null) => picking.picking.setPickFilter(filter),
    },

    anchors: {
      add: (anchor: Omit<AnchorPoint, 'id' | 'createdAt'>) => picking.anchors.add(anchor),
      remove: (id: string) => picking.anchors.remove(id),
      update: (id: string, updates: Partial<AnchorPoint>) => picking.anchors.update(id, updates),
      get: (id: string) => picking.anchors.get(id),
      getAll: () => picking.anchors.getAll(),
      findByBinding: (bindingId: string) => picking.anchors.findByBinding(bindingId),
      findByTag: (tag: string) => picking.anchors.findByTag(tag),
      clear: () => picking.anchors.clear(),
    },

    camera: {
      saveBookmark: (name: string, options?: Partial<import('../types/sceneConfig').ViewBookmark>) =>
        bookmarks.camera.saveBookmark(name, options),
      removeBookmark: (id: string) => bookmarks.camera.removeBookmark(id),
      updateBookmark: (id: string, updates: Partial<import('../types/sceneConfig').ViewBookmark>) =>
        bookmarks.camera.updateBookmark(id, updates),
      getBookmark: (id: string) => bookmarks.camera.getBookmark(id),
      getAllBookmarks: () => bookmarks.camera.getAllBookmarks(),
      restoreBookmark: (id: string, options?: ViewTransitionOptions) =>
        bookmarks.camera.restoreBookmark(id, options),
      flyToPosition: (position: [number, number, number], target: [number, number, number], options?: ViewTransitionOptions) =>
        bookmarks.camera.flyToPosition(position, target, options),
      getCurrentView: () => bookmarks.camera.getCurrentView(),
      clearBookmarks: () => bookmarks.camera.clearBookmarks(),
      importBookmarks: (json: string, merge?: boolean) => bookmarks.camera.importBookmarks(json, merge),
      exportBookmarks: () => bookmarks.camera.exportBookmarks(),
    },

    lighting: {
      createPreset: (name: string, config: Omit<LightingPreset, 'id' | 'name' | 'createdAt' | 'updatedAt'>) =>
        lighting.lighting.createPreset(name, config),
      removePreset: (id: string) => lighting.lighting.removePreset(id),
      updatePreset: (id: string, updates: Partial<LightingPreset>) =>
        lighting.lighting.updatePreset(id, updates),
      getPreset: (id: string) => lighting.lighting.getPreset(id),
      getAllPresets: () => lighting.lighting.getAllPresets(),
      applyPreset: (id: string) => lighting.lighting.applyPreset(id),
      getActivePreset: () => lighting.lighting.getActivePreset(),
      serializePreset: (id: string) => lighting.lighting.serializePreset(id),
      deserializePreset: (json: string) => lighting.lighting.deserializePreset(json),
      exportAllPresets: () => lighting.lighting.exportAllPresets(),
      importPresets: (json: string, merge?: boolean) => lighting.lighting.importPresets(json, merge),
      getCurrentLightingState: () => lighting.lighting.getCurrentLightingState(),
    },

    config: {
      save: saveConfig,
      load: loadConfig,
      export: exportConfig,
      import: importConfig,
      reset: resetConfig,
    },
  };

  return {
    api,
    pickedMesh: picking.pickedMesh,
    bookmarks: bookmarks.bookmarks,
    lightingPresets: lighting.presets,
    activePresetId: lighting.activePresetId,
    anchors: picking.anchorList,
    isTransitioning: bookmarks.isTransitioning,
    
    picking: picking.picking,
    camera: bookmarks.camera,
    lighting: lighting.lighting,
  };
};
