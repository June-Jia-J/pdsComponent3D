import { Vector3, Object3D, Box3 } from 'three';

export type Position3D = [number, number, number];
export type Rotation3D = [number, number, number];

export interface BoundingBoxInfo {
  min: Position3D;
  max: Position3D;
  center: Position3D;
  size: Position3D;
}

export interface PickingResult {
  object: Object3D | null;
  point: Position3D | null;
  worldPosition: Position3D | null;
  boundingBox: BoundingBoxInfo | null;
  normal: Position3D | null;
  distance: number;
  businessId?: string;
  labelId?: string;
}

export interface AnchorPoint {
  id: string;
  name: string;
  worldPosition: Position3D;
  localPosition?: Position3D;
  normal?: Position3D;
  businessId?: string;
  labelId?: string;
  modelName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CoordinateSystem {
  type: 'world' | 'local' | 'normalized';
  origin: Position3D;
  scale: number;
  unit: 'meter' | 'centimeter' | 'millimeter';
}

export interface ViewBookmark {
  id: string;
  name: string;
  description?: string;
  position: Position3D;
  target: Position3D;
  fov?: number;
  near?: number;
  far?: number;
  zoom?: number;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ViewBookmarkTransitionOptions {
  duration?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

export interface ViewportConfig {
  id: string;
  name: string;
  bookmarkId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  syncTarget?: boolean;
  visible?: boolean;
}

export interface LightingPreset {
  id: string;
  name: string;
  description?: string;
  ambient: {
    intensity: number;
    color?: string;
  };
  mainLight: {
    position: Position3D;
    intensity: number;
    color?: string;
    angle?: number;
    penumbra?: number;
    castShadow?: boolean;
  };
  auxLight?: {
    position: Position3D;
    intensity: number;
    color?: string;
    angle?: number;
    penumbra?: number;
  };
  environment: {
    intensity: number;
    hdrUrl?: string;
    background?: boolean;
  };
  shadows?: {
    enabled: boolean;
    mapSize?: number;
    blur?: number;
    opacity?: number;
  };
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export type LightingPresetName = 
  | 'default'
  | 'studio'
  | 'outdoor'
  | 'sunset'
  | 'night'
  | 'industrial'
  | 'inspection'
  | 'presentation';

export interface SceneConfig {
  id: string;
  name: string;
  description?: string;
  coordinateSystem: CoordinateSystem;
  viewBookmarks: ViewBookmark[];
  activeBookmarkId?: string;
  lightingPresetId: string;
  anchorPoints: AnchorPoint[];
  viewports?: ViewportConfig[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface SceneConfigSnapshot {
  version: string;
  timestamp: number;
  config: SceneConfig;
}

export interface PickingSystemOptions {
  enabled?: boolean;
  pickMode?: 'single' | 'multiple';
  filter?: (object: Object3D) => boolean;
  includeInvisible?: boolean;
  includePoints?: boolean;
  threshold?: number;
}

export interface PickingSystemAPI {
  pick: (screenX: number, screenY: number) => PickingResult | null;
  pickByRay: (origin: Position3D, direction: Position3D) => PickingResult | null;
  pickModelByName: (name: string) => PickingResult | null;
  getWorldPosition: (object: Object3D) => Position3D;
  getBoundingBox: (object: Object3D) => BoundingBoxInfo;
  normalizePosition: (worldPos: Position3D) => Position3D;
  denormalizePosition: (normalizedPos: Position3D) => Position3D;
  bindAnchorToLabel: (anchorId: string, labelId: string) => void;
  bindAnchorToBusinessId: (anchorId: string, businessId: string) => void;
  createAnchor: (name: string, worldPosition: Position3D, options?: Partial<AnchorPoint>) => AnchorPoint;
  removeAnchor: (anchorId: string) => void;
  getAnchor: (anchorId: string) => AnchorPoint | undefined;
  getAnchors: () => AnchorPoint[];
  exportAnchors: () => string;
  importAnchors: (json: string) => void;
}

export interface ViewBookmarksAPI {
  createBookmark: (name: string, options?: Partial<ViewBookmark>) => ViewBookmark;
  updateBookmark: (id: string, updates: Partial<ViewBookmark>) => ViewBookmark | null;
  deleteBookmark: (id: string) => boolean;
  getBookmark: (id: string) => ViewBookmark | undefined;
  getBookmarks: () => ViewBookmark[];
  applyBookmark: (id: string, options?: ViewBookmarkTransitionOptions) => Promise<boolean>;
  getCurrentViewAsBookmark: (name: string) => ViewBookmark;
  exportBookmarks: () => string;
  importBookmarks: (json: string) => void;
  setActiveBookmark: (id: string) => void;
  getActiveBookmark: () => ViewBookmark | undefined;
}

export interface LightingPresetsAPI {
  createPreset: (name: string, config: Partial<LightingPreset>) => LightingPreset;
  updatePreset: (id: string, updates: Partial<LightingPreset>) => LightingPreset | null;
  deletePreset: (id: string) => boolean;
  getPreset: (id: string) => LightingPreset | undefined;
  getPresets: () => LightingPreset[];
  applyPreset: (id: string) => void;
  getCurrentAsPreset: (name: string) => LightingPreset;
  exportPresets: () => string;
  importPresets: (json: string) => void;
  getBuiltInPreset: (name: LightingPresetName) => LightingPreset;
}

export interface SceneConfigAPI {
  picking: PickingSystemAPI;
  bookmarks: ViewBookmarksAPI;
  lighting: LightingPresetsAPI;
  getSceneConfig: () => SceneConfig;
  setSceneConfig: (config: Partial<SceneConfig>) => void;
  exportConfig: () => string;
  importConfig: (json: string) => void;
  reset: () => void;
}

export const BUILT_IN_LIGHTING_PRESETS: Record<LightingPresetName, Omit<LightingPreset, 'id' | 'createdAt' | 'updatedAt'>> = {
  default: {
    name: '默认',
    description: '标准照明配置',
    ambient: { intensity: 0.2, color: '#ffffff' },
    mainLight: {
      position: [10, 10, 5],
      intensity: 0.5,
      color: '#ffffff',
      castShadow: true,
    },
    environment: {
      intensity: 1,
      hdrUrl: './assets/potsdamer_platz_1k.hdr',
      background: false,
    },
    shadows: {
      enabled: true,
      mapSize: 2048,
      blur: 1,
      opacity: 0.4,
    },
  },
  studio: {
    name: '工作室',
    description: '专业产品展示照明',
    ambient: { intensity: 0.4, color: '#ffffff' },
    mainLight: {
      position: [5, 8, 5],
      intensity: 0.8,
      color: '#ffffff',
      angle: Math.PI / 4,
      penumbra: 0.5,
      castShadow: true,
    },
    auxLight: {
      position: [-5, 6, -5],
      intensity: 0.3,
      color: '#ffeedd',
    },
    environment: {
      intensity: 0.5,
      background: false,
    },
    shadows: {
      enabled: true,
      mapSize: 2048,
      blur: 2,
      opacity: 0.3,
    },
  },
  outdoor: {
    name: '户外',
    description: '自然日光照明',
    ambient: { intensity: 0.6, color: '#87ceeb' },
    mainLight: {
      position: [50, 100, 50],
      intensity: 1.2,
      color: '#fffacd',
      castShadow: true,
    },
    environment: {
      intensity: 0.8,
      background: false,
    },
    shadows: {
      enabled: true,
      mapSize: 4096,
      blur: 0.5,
      opacity: 0.5,
    },
  },
  sunset: {
    name: '日落',
    description: '温暖日落氛围',
    ambient: { intensity: 0.3, color: '#ff6b35' },
    mainLight: {
      position: [30, 5, 0],
      intensity: 0.9,
      color: '#ff4500',
      angle: Math.PI / 6,
      penumbra: 0.8,
      castShadow: true,
    },
    environment: {
      intensity: 0.4,
      background: false,
    },
    shadows: {
      enabled: true,
      mapSize: 2048,
      blur: 3,
      opacity: 0.6,
    },
  },
  night: {
    name: '夜间',
    description: '低光照夜间模式',
    ambient: { intensity: 0.05, color: '#4169e1' },
    mainLight: {
      position: [0, 20, 0],
      intensity: 0.2,
      color: '#e6e6fa',
      castShadow: false,
    },
    environment: {
      intensity: 0.1,
      background: false,
    },
    shadows: {
      enabled: false,
    },
  },
  industrial: {
    name: '工业',
    description: '工业设备巡检照明',
    ambient: { intensity: 0.3, color: '#d3d3d3' },
    mainLight: {
      position: [15, 15, 10],
      intensity: 0.7,
      color: '#f5f5dc',
      castShadow: true,
    },
    auxLight: {
      position: [-10, 10, -10],
      intensity: 0.4,
      color: '#fffaf0',
    },
    environment: {
      intensity: 0.6,
      background: false,
    },
    shadows: {
      enabled: true,
      mapSize: 2048,
      blur: 1,
      opacity: 0.4,
    },
  },
  inspection: {
    name: '巡检',
    description: '高对比度巡检模式',
    ambient: { intensity: 0.5, color: '#ffffff' },
    mainLight: {
      position: [8, 12, 8],
      intensity: 1.0,
      color: '#ffffff',
      castShadow: true,
    },
    auxLight: {
      position: [-8, 8, -8],
      intensity: 0.5,
      color: '#ffffff',
    },
    environment: {
      intensity: 0.3,
      background: false,
    },
    shadows: {
      enabled: true,
      mapSize: 2048,
      blur: 0.5,
      opacity: 0.3,
    },
  },
  presentation: {
    name: '演示',
    description: '演示汇报模式',
    ambient: { intensity: 0.35, color: '#ffffff' },
    mainLight: {
      position: [10, 10, 10],
      intensity: 0.6,
      color: '#ffffff',
      angle: Math.PI / 3,
      penumbra: 0.3,
      castShadow: true,
    },
    auxLight: {
      position: [-8, 6, -8],
      intensity: 0.35,
      color: '#f0f8ff',
    },
    environment: {
      intensity: 0.7,
      background: false,
    },
    shadows: {
      enabled: true,
      mapSize: 2048,
      blur: 1.5,
      opacity: 0.35,
    },
  },
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function positionToArray(pos: Vector3 | Position3D): Position3D {
  if (Array.isArray(pos)) return pos;
  return [pos.x, pos.y, pos.z];
}

export function arrayToVector3(pos: Position3D): Vector3 {
  return new Vector3(pos[0], pos[1], pos[2]);
}

export function boundingBoxToInfo(box: Box3): BoundingBoxInfo {
  const min = box.min.clone();
  const max = box.max.clone();
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  
  return {
    min: [min.x, min.y, min.z],
    max: [max.x, max.y, max.z],
    center: [center.x, center.y, center.z],
    size: [size.x, size.y, size.z],
  };
}
