import { Box3, Object3D } from 'three';

// ==================== 空间坐标与拾取体系 ====================

export interface CoordinateInfo {
  world: [number, number, number];
  local: [number, number, number];
  normalized: [number, number, number];
}

export interface BoundingBoxInfo {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  size: [number, number, number];
}

export interface PickedPoint {
  point: CoordinateInfo;
  normal?: [number, number, number];
  uv?: [number, number];
  faceIndex?: number;
}

export interface PickedMesh {
  mesh: Object3D;
  meshId: number;
  meshName: string;
  parentName?: string;
  point: PickedPoint;
  boundingBox: BoundingBoxInfo;
  distance: number;
}

export interface AnchorPoint {
  id: string;
  name?: string;
  type: 'point' | 'device';
  position: CoordinateInfo;
  bindingId?: string;
  businessData?: Record<string, unknown>;
  tags?: string[];
  createdAt: number;
}

export interface RaycastOptions {
  filterMesh?: (mesh: Object3D) => boolean;
  recursive?: boolean;
  near?: number;
  far?: number;
}

// ==================== 相机视角书签系统 ====================

export interface ViewBookmark {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  zoom?: number;
  thumbnail?: string;
  description?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ViewTransitionOptions {
  duration?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  heightBoost?: number;
}

export interface MultiViewportConfig {
  enabled: boolean;
  viewports: {
    id: string;
    name: string;
    bounds: [number, number, number, number];
    syncTarget?: string;
    bookmarkId?: string;
  }[];
}

// ==================== 光影与环境预设系统 ====================

export interface LightConfig {
  type: 'ambient' | 'directional' | 'spot' | 'point';
  enabled: boolean;
  color: string;
  intensity: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  castShadow?: boolean;
  shadowMapSize?: [number, number];
  shadowBias?: number;
  distance?: number;
  angle?: number;
  penumbra?: number;
  decay?: number;
}

export interface EnvironmentConfig {
  enabled: boolean;
  type: 'hdr' | 'cube' | 'color';
  source?: string;
  intensity: number;
  backgroundColor: string;
  backgroundBlurriness?: number;
  backgroundRotation?: [number, number, number];
  toneMapping?: string;
  toneMappingExposure?: number;
}

export interface ShadowConfig {
  enabled: boolean;
  type: 'basic' | 'pcf' | 'pcfsoft' | 'vsm';
  mapSize: [number, number];
  bias: number;
  normalBias: number;
  radius: number;
}

export interface LightingPreset {
  id: string;
  name: string;
  description?: string;
  category?: string;
  lights: Record<string, LightConfig>;
  environment: EnvironmentConfig;
  shadows: ShadowConfig;
  createdAt: number;
  updatedAt: number;
}

// ==================== 统一场景配置 ====================

export interface SceneConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  
  viewBookmarks: ViewBookmark[];
  lightingPresets: LightingPreset[];
  activeLightingPresetId?: string;
  anchorPoints: AnchorPoint[];
  
  settings: {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableControls: boolean;
    enableShadows: boolean;
    pixelRatio: number;
  };
}

// ==================== API 类型定义 ====================

export interface SceneConfigAPI {
  coordinate: {
    worldToLocal: (worldPoint: [number, number, number], object: Object3D) => [number, number, number];
    localToWorld: (localPoint: [number, number, number], object: Object3D) => [number, number, number];
    normalizePoint: (point: [number, number, number], bounds: Box3) => [number, number, number];
    denormalizePoint: (normalized: [number, number, number], bounds: Box3) => [number, number, number];
  };
  
  picking: {
    raycastFromScreen: (screenX: number, screenY: number, options?: RaycastOptions) => PickedMesh | null;
    raycastFromPoint: (origin: [number, number, number], direction: [number, number, number], options?: RaycastOptions) => PickedMesh | null;
    getMeshInfo: (mesh: Object3D) => { boundingBox: BoundingBoxInfo; position: CoordinateInfo };
    getPickedMesh: () => PickedMesh | null;
    setPickedMesh: (mesh: PickedMesh | null) => void;
    clearSelection: () => void;
    setPickFilter: (filter: ((mesh: Object3D) => boolean) | null) => void;
  };
  
  anchors: {
    add: (anchor: Omit<AnchorPoint, 'id' | 'createdAt'>) => AnchorPoint;
    remove: (id: string) => boolean;
    update: (id: string, updates: Partial<AnchorPoint>) => AnchorPoint | null;
    get: (id: string) => AnchorPoint | undefined;
    getAll: () => AnchorPoint[];
    findByBinding: (bindingId: string) => AnchorPoint[];
    findByTag: (tag: string) => AnchorPoint[];
    clear: () => void;
  };
  
  camera: {
    saveBookmark: (name: string, options?: Partial<Omit<ViewBookmark, 'id' | 'name' | 'createdAt' | 'updatedAt'>>) => ViewBookmark;
    removeBookmark: (id: string) => boolean;
    updateBookmark: (id: string, updates: Partial<ViewBookmark>) => ViewBookmark | null;
    getBookmark: (id: string) => ViewBookmark | undefined;
    getAllBookmarks: () => ViewBookmark[];
    restoreBookmark: (id: string, options?: ViewTransitionOptions) => Promise<void>;
    flyToPosition: (position: [number, number, number], target: [number, number, number], options?: ViewTransitionOptions) => Promise<void>;
    getCurrentView: () => Omit<ViewBookmark, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
    clearBookmarks: () => void;
    importBookmarks: (json: string, merge?: boolean) => ViewBookmark[];
    exportBookmarks: () => string;
  };
  
  lighting: {
    createPreset: (name: string, config: Omit<LightingPreset, 'id' | 'name' | 'createdAt' | 'updatedAt'>) => LightingPreset;
    removePreset: (id: string) => boolean;
    updatePreset: (id: string, updates: Partial<LightingPreset>) => LightingPreset | null;
    getPreset: (id: string) => LightingPreset | undefined;
    getAllPresets: () => LightingPreset[];
    applyPreset: (id: string) => boolean;
    getActivePreset: () => LightingPreset | undefined;
    serializePreset: (id: string) => string;
    deserializePreset: (json: string) => LightingPreset | null;
    exportAllPresets: () => string;
    importPresets: (json: string, merge?: boolean) => LightingPreset[];
    getCurrentLightingState: () => Omit<LightingPreset, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
  };
  
  config: {
    save: () => SceneConfig;
    load: (config: SceneConfig) => boolean;
    export: () => string;
    import: (json: string) => boolean;
    reset: () => void;
  };
}

// ==================== 事件类型 ====================

export interface SceneConfigEvents {
  onMeshPicked?: (mesh: PickedMesh | null) => void;
  onBookmarkChanged?: (bookmarks: ViewBookmark[]) => void;
  onPresetChanged?: (presets: LightingPreset[]) => void;
  onAnchorChanged?: (anchors: AnchorPoint[]) => void;
  onViewRestored?: (bookmark: ViewBookmark) => void;
  onPresetApplied?: (preset: LightingPreset) => void;
}
