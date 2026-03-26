import { atom } from 'jotai';
import type { SceneConfigAPI } from '../types/sceneConfig';

// 场景配置 API atom - 用于跨 React 树（Canvas 内部和外部）共享
export const sceneConfigApiAtom = atom<SceneConfigAPI | null>(null);

// 场景配置状态 atom
export const sceneConfigStateAtom = atom<{
  pickedMesh: any;
  bookmarks: any[];
  lightingPresets: any[];
  activePresetId: string | undefined;
  anchors: any[];
  isTransitioning: boolean;
}>({
  pickedMesh: null,
  bookmarks: [],
  lightingPresets: [],
  activePresetId: undefined,
  anchors: [],
  isTransitioning: false,
});

// 便捷的 selectors
export const sceneConfigPickedMeshAtom = atom(
  (get) => get(sceneConfigStateAtom).pickedMesh
);

export const sceneConfigBookmarksAtom = atom(
  (get) => get(sceneConfigStateAtom).bookmarks
);

export const sceneConfigLightingPresetsAtom = atom(
  (get) => get(sceneConfigStateAtom).lightingPresets
);

export const sceneConfigActivePresetIdAtom = atom(
  (get) => get(sceneConfigStateAtom).activePresetId
);

export const sceneConfigAnchorsAtom = atom(
  (get) => get(sceneConfigStateAtom).anchors
);

export const sceneConfigIsTransitioningAtom = atom(
  (get) => get(sceneConfigStateAtom).isTransitioning
);
