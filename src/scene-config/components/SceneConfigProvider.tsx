import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { useThree } from '@react-three/fiber';
import { SceneConfig, SceneConfigAPI } from '../types';
import { useSceneConfig, UseSceneConfigOptions } from '../hooks';
import { setApp } from '@/store/globalData';

/* eslint-disable no-unused-vars */
interface SceneConfigContextValue extends SceneConfigAPI {
  /** 当前配置 */
  config: SceneConfig;
  /** 初始化配置 */
  initConfig: (config?: Partial<SceneConfig>) => void;
  /** 销毁 */
  destroy: () => void;
  /** 是否已初始化 */
  isInitialized: boolean;
}
/* eslint-enable no-unused-vars */

const SceneConfigContext = createContext<SceneConfigContextValue | null>(null);

export interface SceneConfigProviderProps {
  children: ReactNode;
  options?: UseSceneConfigOptions;
}

/**
 * 场景配置提供者组件
 * 在 Three.js 场景中提供配置管理能力
 */
export function SceneConfigProvider({
  children,
  options,
}: SceneConfigProviderProps) {
  useThree();
  const initializedRef = useRef(false);

  const sceneConfig = useSceneConfig({
    ...options,
    onConfigChange: _config => {
      options?.onConfigChange?.(_config);
      // 同步到 globalData
      syncToGlobalData(_config);
    },
  });

  // 同步配置到 globalData
  const syncToGlobalData = useCallback(
    (config: SceneConfig) => {
      setApp({
        sceneConfig: config,
        sceneConfigAPI: {
          pick: sceneConfig.pick,
          addAnchor: sceneConfig.addAnchor,
          updateAnchor: sceneConfig.updateAnchor,
          removeAnchor: sceneConfig.removeAnchor,
          getAnchors: sceneConfig.getAnchors,
          getAnchorById: sceneConfig.getAnchorById,
          getAnchorsByBusinessId: sceneConfig.getAnchorsByBusinessId,
          getBoundingBox: sceneConfig.getBoundingBox,
          saveBookmark: sceneConfig.saveBookmark,
          updateBookmark: sceneConfig.updateBookmark,
          removeBookmark: sceneConfig.removeBookmark,
          getBookmarks: sceneConfig.getBookmarks,
          restoreBookmark: sceneConfig.restoreBookmark,
          generateThumbnail: sceneConfig.generateThumbnail,
          applyLightingPreset: sceneConfig.applyLightingPreset,
          addLightingPreset: sceneConfig.addLightingPreset,
          updateLightingPreset: sceneConfig.updateLightingPreset,
          removeLightingPreset: sceneConfig.removeLightingPreset,
          getLightingPresets: sceneConfig.getLightingPresets,
          exportConfig: sceneConfig.exportConfig,
          importConfig: sceneConfig.importConfig,
          resetToDefault: sceneConfig.resetToDefault,
          getCurrentConfig: sceneConfig.getCurrentConfig,
        },
      });
    },
    [sceneConfig]
  );

  // 初始化
  const initConfig = useCallback(
    (config?: Partial<SceneConfig>) => {
      sceneConfig.initConfig(config);
      initializedRef.current = true;
    },
    [sceneConfig]
  );

  const value: SceneConfigContextValue = {
    ...sceneConfig,
    initConfig,
    isInitialized: initializedRef.current,
  };

  return (
    <SceneConfigContext.Provider value={value}>
      {children}
    </SceneConfigContext.Provider>
  );
}

/**
 * 使用场景配置的 Hook
 */
export function useSceneConfigContext(): SceneConfigContextValue {
  const context = useContext(SceneConfigContext);
  if (!context) {
    throw new Error('useSceneConfigContext 必须在 SceneConfigProvider 内使用');
  }
  return context;
}

/**
 * 获取场景配置 API（非 Hook 方式，用于类组件或外部调用）
 */
export function getSceneConfigAPI(): Partial<SceneConfigAPI> {
  if (typeof window === 'undefined') return {};
  // 从 globalData 获取
  const globalData = (window as any).__PDS_GLOBAL_DATA__;
  return globalData?.app?.sceneConfigAPI || {};
}
