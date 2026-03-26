// 导出类型定义
export * from './types';

// 导出工具函数
export * from './utils';

// 导出初始化函数和配置
export { init3DViewer, defaultViewerConfig } from './viewer';

// 导出场景配置系统
export {
  SceneConfigProvider,
  SceneConfigPanel,
  SceneConfigWrapper,
  SceneConfigBridge,
  useSceneConfig,
  useSceneConfigState,
  useSceneConfigContext,
  usePicking,
  useBookmarks,
  useLighting,
  loadSceneConfigFromStorage,
  clearSceneConfigFromStorage,
} from './components/SceneConfigManager';

// 导出场景配置相关 Hooks
export { usePickingSystem } from './hooks/usePickingSystem';
export { useViewBookmarks, createViewBookmarkFromObject, interpolateBookmarks } from './hooks/useViewBookmarks';
export { useLightingPresets, serializeLightingState, deserializeLightingState, mergeLightingPresets } from './hooks/useLightingPresets';
