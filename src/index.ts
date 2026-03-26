// 导出类型定义
export * from './types';

// 导出工具函数
export * from './utils';

// 导出初始化函数和配置
export { init3DViewer, defaultViewerConfig } from './viewer';

// 导出场景配置系统
export { SceneConfigProvider, useSceneConfigContext, ScenePickingHandler, LightingPresetApplier } from './components/SceneConfigProvider';
export { SceneConfigPanel } from './components/SceneConfigPanel';
export { useSceneConfig } from './hooks/useSceneConfig';
export { useScenePicking } from './hooks/useScenePicking';
export { useViewBookmarks } from './hooks/useViewBookmarks';
export { useLightingPresets } from './hooks/useLightingPresets';

// 导出场景配置 Jotai Atoms（用于跨 React 树访问）
export {
  sceneConfigApiAtom,
  sceneConfigStateAtom,
  sceneConfigPickedMeshAtom,
  sceneConfigBookmarksAtom,
  sceneConfigLightingPresetsAtom,
  sceneConfigActivePresetIdAtom,
  sceneConfigAnchorsAtom,
  sceneConfigIsTransitioningAtom,
} from './atoms/sceneConfig';

// 导出场景配置类型
export type { SceneConfigAPI, SceneConfig, ViewBookmark, LightingPreset, AnchorPoint, PickedMesh, CoordinateInfo, BoundingBoxInfo, ViewTransitionOptions, RaycastOptions } from './types/sceneConfig';
