import { useCallback, useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import {
  SceneConfig,
  SceneConfigAPI,
  SceneConfigEvent,
  SceneConfigEventListener,
} from '../types';
import { DEFAULT_SCENE_CONFIG, STORAGE_KEY } from '../constants';
import { usePicking, useAnchorManager } from './usePicking';
import { useCameraBookmarks } from './useCameraBookmarks';
import { useLightingPresets } from './useLightingPresets';

/* global localStorage */

/* eslint-disable no-unused-vars */
export interface UseSceneConfigOptions {
  /** 是否启用持久化 */
  persist?: boolean;
  /** 存储键名 */
  storageKey?: string;
  /** 配置变更回调 */
  onConfigChange?: (config: SceneConfig) => void;
  /** 事件监听 */
  onEvent?: SceneConfigEventListener;
}

export interface UseSceneConfigReturn extends SceneConfigAPI {
  /** 当前配置 */
  config: SceneConfig;
  /** 初始化配置 */
  initConfig: (config?: Partial<SceneConfig>) => void;
  /** 销毁 */
  destroy: () => void;
}
/* eslint-enable no-unused-vars */

/**
 * 场景配置主 Hook
 * 整合所有配置管理能力
 */
export function useSceneConfig(
  options: UseSceneConfigOptions = {}
): UseSceneConfigReturn {
  const {
    persist = false,
    storageKey = STORAGE_KEY,
    onConfigChange,
    onEvent,
  } = options;
  useThree();

  // 配置引用
  const configRef = useRef<SceneConfig>({ ...DEFAULT_SCENE_CONFIG });
  const listenersRef = useRef<Set<SceneConfigEventListener>>(new Set());

  // 使用 state 来触发重新渲染
  const [activePresetId, setActivePresetId] = useState(
    DEFAULT_SCENE_CONFIG.activeLightingPresetId
  );

  // 使用子 hooks
  const picking = usePicking({
    enabled: true,
  });

  const anchorManager = useAnchorManager();

  const cameraBookmarks = useCameraBookmarks({
    enabled: true,
    onBookmarksChange: bookmarks => {
      configRef.current.cameraBookmarks = bookmarks;
      configRef.current.updatedAt = Date.now();
      persistConfig();
      emitEvent({
        type: 'bookmarkUpdated',
        payload: bookmarks,
        timestamp: Date.now(),
      });
    },
  });

  const lightingPresets = useLightingPresets({
    enabled: true,
    onPresetChange: (presetId, preset) => {
      configRef.current.activeLightingPresetId = presetId;
      configRef.current.updatedAt = Date.now();
      setActivePresetId(presetId); // 触发重新渲染
      persistConfig();
      emitEvent({
        type: 'lightingPresetApplied',
        payload: { presetId, preset },
        timestamp: Date.now(),
      });
    },
  });

  /**
   * 触发事件
   */
  const emitEvent = useCallback(
    (event: SceneConfigEvent) => {
      onEvent?.(event);
      listenersRef.current.forEach(listener => listener(event));
    },
    [onEvent]
  );

  /**
   * 添加事件监听（保留供未来使用）
   */
  // const _addEventListener = useCallback((listener: SceneConfigEventListener) => {
  //   listenersRef.current.add(listener);
  //   return () => listenersRef.current.delete(listener);
  // }, []);

  /**
   * 持久化配置
   */
  const persistConfig = useCallback(() => {
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(configRef.current));
      } catch (e) {
        console.warn('场景配置持久化失败:', e);
      }
    }
  }, [persist, storageKey]);

  /**
   * 从存储加载配置
   */
  const loadFromStorage = useCallback((): SceneConfig | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as SceneConfig;
      }
    } catch (e) {
      console.warn('从存储加载场景配置失败:', e);
    }
    return null;
  }, [storageKey]);

  /**
   * 初始化配置
   */
  const initConfig = useCallback(
    (initialConfig?: Partial<SceneConfig>) => {
      let config = { ...DEFAULT_SCENE_CONFIG };

      // 尝试从存储加载
      if (persist) {
        const stored = loadFromStorage();
        if (stored) {
          config = { ...config, ...stored };
        }
      }

      // 合并初始配置
      if (initialConfig) {
        config = { ...config, ...initialConfig };
      }

      configRef.current = config;

      // 同步到各管理器
      anchorManager.setAnchors(config.anchorPoints);
      cameraBookmarks.setBookmarks(config.cameraBookmarks);
      lightingPresets.setLightingPresets(config.lightingPresets);
      lightingPresets.setEnvironmentPresets(config.environmentPresets);

      // 应用当前光影预设
      lightingPresets.applyLightingPreset(config.activeLightingPresetId);
      setActivePresetId(config.activeLightingPresetId);

      onConfigChange?.(config);
    },
    [
      persist,
      loadFromStorage,
      anchorManager,
      cameraBookmarks,
      lightingPresets,
      onConfigChange,
    ]
  );

  /**
   * 导出配置为JSON
   */
  const exportConfig = useCallback((): string => {
    const config = {
      ...configRef.current,
      anchorPoints: anchorManager.getAnchors(),
      cameraBookmarks: cameraBookmarks.getBookmarks(),
      lightingPresets: lightingPresets.getLightingPresets(),
      environmentPresets: lightingPresets.getEnvironmentPresets(),
      updatedAt: Date.now(),
    };
    emitEvent({
      type: 'configExported',
      payload: config,
      timestamp: Date.now(),
    });
    return JSON.stringify(config, null, 2);
  }, [anchorManager, cameraBookmarks, lightingPresets, emitEvent]);

  /**
   * 从JSON导入配置
   */
  const importConfig = useCallback(
    (json: string): boolean => {
      try {
        const parsed = JSON.parse(json) as SceneConfig;

        // 验证版本
        if (!parsed.version) {
          console.warn('配置缺少版本号');
          return false;
        }

        configRef.current = {
          ...DEFAULT_SCENE_CONFIG,
          ...parsed,
          updatedAt: Date.now(),
        };

        // 同步到各管理器
        anchorManager.setAnchors(configRef.current.anchorPoints);
        cameraBookmarks.setBookmarks(configRef.current.cameraBookmarks);
        lightingPresets.setLightingPresets(configRef.current.lightingPresets);
        lightingPresets.setEnvironmentPresets(
          configRef.current.environmentPresets
        );

        // 应用光影预设
        lightingPresets.applyLightingPreset(
          configRef.current.activeLightingPresetId
        );
        setActivePresetId(configRef.current.activeLightingPresetId);

        persistConfig();
        onConfigChange?.(configRef.current);
        emitEvent({
          type: 'configImported',
          payload: configRef.current,
          timestamp: Date.now(),
        });

        return true;
      } catch (e) {
        console.error('导入配置失败:', e);
        return false;
      }
    },
    [
      anchorManager,
      cameraBookmarks,
      lightingPresets,
      persistConfig,
      onConfigChange,
      emitEvent,
    ]
  );

  /**
   * 重置为默认配置
   */
  const resetToDefault = useCallback(() => {
    configRef.current = { ...DEFAULT_SCENE_CONFIG, updatedAt: Date.now() };
    anchorManager.clearAnchors();
    cameraBookmarks.clearBookmarks();
    lightingPresets.applyLightingPreset(
      DEFAULT_SCENE_CONFIG.activeLightingPresetId
    );
    setActivePresetId(DEFAULT_SCENE_CONFIG.activeLightingPresetId);
    persistConfig();
    onConfigChange?.(configRef.current);
  }, [
    anchorManager,
    cameraBookmarks,
    lightingPresets,
    persistConfig,
    onConfigChange,
  ]);

  /**
   * 获取当前配置快照
   */
  const getCurrentConfig = useCallback((): SceneConfig => {
    return {
      ...configRef.current,
      anchorPoints: anchorManager.getAnchors(),
      cameraBookmarks: cameraBookmarks.getBookmarks(),
      lightingPresets: lightingPresets.getLightingPresets(),
      environmentPresets: lightingPresets.getEnvironmentPresets(),
    };
  }, [anchorManager, cameraBookmarks, lightingPresets]);

  /**
   * 销毁
   */
  const destroy = useCallback(() => {
    listenersRef.current.clear();
  }, []);

  // 初始化时加载存储的配置
  useEffect(() => {
    initConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ API 实现 ============

  // 坐标与拾取
  const pick = useCallback(
    (screenX: number, screenY: number) => {
      const result = picking.pick(screenX, screenY);
      if (result) {
        emitEvent({ type: 'pick', payload: result, timestamp: Date.now() });
      }
      return result;
    },
    [picking, emitEvent]
  );

  const addAnchor = useCallback(
    (anchor: Parameters<typeof anchorManager.addAnchor>[0]) => {
      const newAnchor = anchorManager.addAnchor(anchor);
      configRef.current.anchorPoints = anchorManager.getAnchors();
      configRef.current.updatedAt = Date.now();
      persistConfig();
      emitEvent({
        type: 'anchorAdded',
        payload: newAnchor,
        timestamp: Date.now(),
      });
      return newAnchor;
    },
    [anchorManager, emitEvent, persistConfig]
  );

  const updateAnchor = useCallback(
    (id: string, updates: Parameters<typeof anchorManager.updateAnchor>[1]) => {
      const success = anchorManager.updateAnchor(id, updates);
      if (success) {
        configRef.current.anchorPoints = anchorManager.getAnchors();
        configRef.current.updatedAt = Date.now();
        persistConfig();
        emitEvent({
          type: 'anchorUpdated',
          payload: { id, updates },
          timestamp: Date.now(),
        });
      }
      return success;
    },
    [anchorManager, emitEvent, persistConfig]
  );

  const removeAnchor = useCallback(
    (id: string) => {
      const success = anchorManager.removeAnchor(id);
      if (success) {
        configRef.current.anchorPoints = anchorManager.getAnchors();
        configRef.current.updatedAt = Date.now();
        persistConfig();
        emitEvent({
          type: 'anchorRemoved',
          payload: { id },
          timestamp: Date.now(),
        });
      }
      return success;
    },
    [anchorManager, emitEvent, persistConfig]
  );

  const getAnchors = useCallback(
    () => anchorManager.getAnchors(),
    [anchorManager]
  );
  const getAnchorById = useCallback(
    (id: string) => anchorManager.getAnchorById(id),
    [anchorManager]
  );
  const getAnchorsByBusinessId = useCallback(
    (businessId: string) => anchorManager.getAnchorsByBusinessId(businessId),
    [anchorManager]
  );
  const getBoundingBox = useCallback(
    (objectNameOrId: string) => picking.getBoundingBox(objectNameOrId),
    [picking]
  );

  // 相机书签
  const saveBookmark = useCallback(
    (
      name: string,
      options?: Partial<Parameters<typeof cameraBookmarks.saveBookmark>[1]>
    ) => {
      const bookmark = cameraBookmarks.saveBookmark(name, options);
      emitEvent({
        type: 'bookmarkAdded',
        payload: bookmark,
        timestamp: Date.now(),
      });
      return bookmark;
    },
    [cameraBookmarks, emitEvent]
  );

  const updateBookmark = useCallback(
    (
      id: string,
      updates: Parameters<typeof cameraBookmarks.updateBookmark>[1]
    ) => {
      const success = cameraBookmarks.updateBookmark(id, updates);
      if (success) {
        emitEvent({
          type: 'bookmarkUpdated',
          payload: { id, updates },
          timestamp: Date.now(),
        });
      }
      return success;
    },
    [cameraBookmarks, emitEvent]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      const success = cameraBookmarks.removeBookmark(id);
      if (success) {
        emitEvent({
          type: 'bookmarkRemoved',
          payload: { id },
          timestamp: Date.now(),
        });
      }
      return success;
    },
    [cameraBookmarks, emitEvent]
  );

  const getBookmarks = useCallback(
    () => cameraBookmarks.getBookmarks(),
    [cameraBookmarks]
  );
  const restoreBookmark = useCallback(
    (
      id: string,
      transitionOptions?: Parameters<typeof cameraBookmarks.restoreBookmark>[1]
    ) => {
      const success = cameraBookmarks.restoreBookmark(id, transitionOptions);
      if (success) {
        const bookmark = cameraBookmarks.getBookmarkById(id);
        emitEvent({
          type: 'bookmarkRestored',
          payload: bookmark,
          timestamp: Date.now(),
        });
      }
      return success;
    },
    [cameraBookmarks, emitEvent]
  );
  const generateThumbnail = useCallback(
    (id: string) => cameraBookmarks.generateThumbnail(id),
    [cameraBookmarks]
  );

  // 光影预设
  const applyLightingPreset = useCallback(
    (presetId: string) => {
      const success = lightingPresets.applyLightingPreset(presetId);
      if (success) {
        configRef.current.activeLightingPresetId = presetId;
        configRef.current.updatedAt = Date.now();
        setActivePresetId(presetId); // 触发重新渲染
        persistConfig();
        const preset = lightingPresets.getLightingPresetById(presetId);
        emitEvent({
          type: 'lightingPresetChanged',
          payload: { presetId, preset },
          timestamp: Date.now(),
        });
      }
      return success;
    },
    [lightingPresets, emitEvent, persistConfig]
  );

  const addLightingPreset = useCallback(
    (preset: Parameters<typeof lightingPresets.addLightingPreset>[0]) => {
      const newPreset = lightingPresets.addLightingPreset(preset);
      configRef.current.lightingPresets = lightingPresets.getLightingPresets();
      configRef.current.updatedAt = Date.now();
      persistConfig();
      return newPreset;
    },
    [lightingPresets, persistConfig]
  );

  const updateLightingPreset = useCallback(
    (
      id: string,
      updates: Parameters<typeof lightingPresets.updateLightingPreset>[1]
    ) => {
      const success = lightingPresets.updateLightingPreset(id, updates);
      if (success) {
        configRef.current.lightingPresets =
          lightingPresets.getLightingPresets();
        configRef.current.updatedAt = Date.now();
        persistConfig();
      }
      return success;
    },
    [lightingPresets, persistConfig]
  );

  const removeLightingPreset = useCallback(
    (id: string) => {
      const success = lightingPresets.removeLightingPreset(id);
      if (success) {
        configRef.current.lightingPresets =
          lightingPresets.getLightingPresets();
        configRef.current.updatedAt = Date.now();
        persistConfig();
      }
      return success;
    },
    [lightingPresets, persistConfig]
  );

  const getLightingPresets = useCallback(
    () => lightingPresets.getLightingPresets(),
    [lightingPresets]
  );

  return {
    // 配置 - 使用 state 来触发重新渲染
    config: {
      ...configRef.current,
      activeLightingPresetId: activePresetId,
    },
    initConfig,
    destroy,

    // 坐标与拾取
    pick,
    addAnchor,
    updateAnchor,
    removeAnchor,
    getAnchors,
    getAnchorById,
    getAnchorsByBusinessId,
    getBoundingBox,

    // 相机书签
    saveBookmark,
    updateBookmark,
    removeBookmark,
    getBookmarks,
    restoreBookmark,
    generateThumbnail,

    // 光影预设
    applyLightingPreset,
    addLightingPreset,
    updateLightingPreset,
    removeLightingPreset,
    getLightingPresets,

    // 配置整体操作
    exportConfig,
    importConfig,
    resetToDefault,
    getCurrentConfig,
  };
}
