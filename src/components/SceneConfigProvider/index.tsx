import React, { createContext, useContext, useRef, useEffect } from 'react';
import { CameraControls } from '@react-three/drei';
import { useSceneConfig } from '../../hooks/useSceneConfig';
import { useSetAtom } from 'jotai';
import {
  sceneConfigApiAtom,
  sceneConfigStateAtom,
} from '../../atoms/sceneConfig';
import {
  SceneConfigAPI,
  PickedMesh,
  ViewBookmark,
  LightingPreset,
  AnchorPoint,
  SceneConfig,
  ViewTransitionOptions,
} from '../../types/sceneConfig';
interface SceneConfigContextValue {
 api: SceneConfigAPI;
 pickedMesh: PickedMesh | null;
 bookmarks: ViewBookmark[];
 lightingPresets: LightingPreset[];
 activePresetId: string | undefined;
 anchors: AnchorPoint[];
 isTransitioning: boolean;
 controlsRef: React.RefObject<CameraControls | null>;
 saveSceneConfig: () => SceneConfig;
 loadSceneConfig: (config: SceneConfig) => boolean;
 exportSceneConfig: () => string;
 importSceneConfig: (json: string) => boolean;
 flyTo: (position: [
 number,
 number,
 number
 ], target: [
 number,
 number,
 number
 ], options?: ViewTransitionOptions) => Promise<void>;
 applyLightingPreset: (id: string) => boolean;
 restoreViewBookmark: (id: string, options?: ViewTransitionOptions) => Promise<void>;
}
const SceneConfigContext = createContext<SceneConfigContextValue | null>(null);
export const useSceneConfigContext = () => {
 const context = useContext(SceneConfigContext);
 if (!context) {
 throw new Error('useSceneConfigContext must be used within a SceneConfigProvider');
 }
 return context;
};
interface SceneConfigProviderProps {
 children: React.ReactNode;
 controls: React.RefObject<CameraControls | null>;
 autoInit?: boolean;
 defaultLightingPreset?: string;
}
export const SceneConfigProvider: React.FC<SceneConfigProviderProps> = ({ children, controls: externalControlsRef, autoInit = true, defaultLightingPreset, }) => {
 const internalControlsRef = useRef<CameraControls | null>(null);
 const controlsRef = externalControlsRef || internalControlsRef;
 const sceneConfig = useSceneConfig(controlsRef);
 const setSceneConfigApi = useSetAtom(sceneConfigApiAtom);
 const setSceneConfigState = useSetAtom(sceneConfigStateAtom);
 
 // 将 API 同步到 jotai atom
 useEffect(() => {
 setSceneConfigApi(sceneConfig.api);
 }, [sceneConfig.api, setSceneConfigApi]);
 
 // 将状态同步到 jotai atom
 useEffect(() => {
 setSceneConfigState({
 pickedMesh: sceneConfig.pickedMesh,
 bookmarks: sceneConfig.bookmarks,
 lightingPresets: sceneConfig.lightingPresets,
 activePresetId: sceneConfig.activePresetId,
 anchors: sceneConfig.anchors,
 isTransitioning: sceneConfig.isTransitioning,
 });
 }, [
 sceneConfig.pickedMesh,
 sceneConfig.bookmarks,
 sceneConfig.lightingPresets,
 sceneConfig.activePresetId,
 sceneConfig.anchors,
 sceneConfig.isTransitioning,
 setSceneConfigState,
 ]);
 
 useEffect(() => {
 if (autoInit && defaultLightingPreset) {
 sceneConfig.lighting.applyPreset(defaultLightingPreset);
 }
 }, [autoInit, defaultLightingPreset, sceneConfig.lighting]);
 
 const saveSceneConfig = () => sceneConfig.api.config.save();
 const loadSceneConfig = (config: SceneConfig) => sceneConfig.api.config.load(config);
 const exportSceneConfig = () => sceneConfig.api.config.export();
 const importSceneConfig = (json: string) => sceneConfig.api.config.import(json);
 const flyTo = (position: [
 number,
 number,
 number
 ], target: [
 number,
 number,
 number
 ], options?: ViewTransitionOptions) => sceneConfig.api.camera.flyToPosition(position, target, options);
 const applyLightingPreset = (id: string) => sceneConfig.api.lighting.applyPreset(id);
 const restoreViewBookmark = (id: string, options?: ViewTransitionOptions) => sceneConfig.api.camera.restoreBookmark(id, options);
 
 const contextValue: SceneConfigContextValue = {
 api: sceneConfig.api,
 pickedMesh: sceneConfig.pickedMesh,
 bookmarks: sceneConfig.bookmarks,
 lightingPresets: sceneConfig.lightingPresets,
 activePresetId: sceneConfig.activePresetId,
 anchors: sceneConfig.anchors,
 isTransitioning: sceneConfig.isTransitioning,
 controlsRef,
 saveSceneConfig,
 loadSceneConfig,
 exportSceneConfig,
 importSceneConfig,
 flyTo,
 applyLightingPreset,
 restoreViewBookmark,
 };
 
 return (<SceneConfigContext.Provider value={contextValue}>
 {children}
 </SceneConfigContext.Provider>);
};
export const ScenePickingHandler: React.FC<{
 enabled?: boolean;
 onMeshPicked?: (mesh: PickedMesh | null) => void;
}> = ({ onMeshPicked }) => {
 const { pickedMesh } = useSceneConfigContext();
 useEffect(() => {
 if (onMeshPicked) {
 onMeshPicked(pickedMesh);
 }
 }, [pickedMesh, onMeshPicked]);
 return null;
};
export const LightingPresetApplier: React.FC<{
 presetId?: string;
}> = ({ presetId }) => {
 const { applyLightingPreset } = useSceneConfigContext();
 useEffect(() => {
 if (presetId) {
 applyLightingPreset(presetId);
 }
 }, [presetId, applyLightingPreset]);
 return null;
};

