import {
  SceneConfig,
  LightingPreset,
  EnvironmentPreset,
  CoordinateSystemConfig,
} from './types';

// 默认坐标系配置
export const DEFAULT_COORDINATE_SYSTEM: CoordinateSystemConfig = {
  type: 'world',
  normalization: 'none',
  unitScale: 1,
};

// 默认光影预设
export const DEFAULT_LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'default-daylight',
    name: '默认日光',
    description: '明亮的日光环境，适合日常查看',
    mainLight: {
      intensity: 1.0,
      position: [10, 10, 5],
      color: '#ffffff',
      castShadow: true,
      shadowMapSize: 2048,
    },
    auxLights: [
      {
        intensity: 0.3,
        position: [-5, 5, -5],
        color: '#e0e8ff',
      },
    ],
    ambientLight: {
      intensity: 0.2,
      color: '#ffffff',
    },
    environment: {
      enabled: true,
      hdrUrl: './assets/potsdamer_platz_1k.hdr',
      intensity: 1.0,
      rotation: 0,
    },
    shadows: {
      enabled: true,
      type: 'pcfsoft',
      mapSize: 2048,
      bias: -0.0001,
    },
    background: {
      color: '#000000',
      transparent: false,
    },
  },
  {
    id: 'indoor-warm',
    name: '室内暖光',
    description: '温暖的室内照明，适合设备巡检',
    mainLight: {
      intensity: 0.8,
      position: [5, 8, 3],
      color: '#ffecd1',
      castShadow: true,
      shadowMapSize: 2048,
    },
    auxLights: [
      {
        intensity: 0.4,
        position: [-3, 6, -3],
        color: '#ffd4a3',
      },
    ],
    ambientLight: {
      intensity: 0.3,
      color: '#fff8f0',
    },
    environment: {
      enabled: true,
      hdrUrl: './assets/potsdamer_platz_1k.hdr',
      intensity: 0.5,
      rotation: 0,
    },
    shadows: {
      enabled: true,
      type: 'pcf',
      mapSize: 1024,
      bias: -0.0001,
    },
    background: {
      color: '#1a1a2e',
      transparent: false,
    },
  },
  {
    id: 'inspection-mode',
    name: '巡检模式',
    description: '高对比度照明，便于发现设备异常',
    mainLight: {
      intensity: 1.2,
      position: [8, 12, 8],
      color: '#ffffff',
      castShadow: true,
      shadowMapSize: 4096,
    },
    auxLights: [
      {
        intensity: 0.5,
        position: [-8, 8, -8],
        color: '#c9e4ff',
      },
      {
        intensity: 0.3,
        position: [0, -5, 0],
        color: '#ffe4c9',
      },
    ],
    ambientLight: {
      intensity: 0.15,
      color: '#ffffff',
    },
    environment: {
      enabled: false,
      intensity: 0,
    },
    shadows: {
      enabled: true,
      type: 'pcfsoft',
      mapSize: 4096,
      bias: -0.0005,
    },
    background: {
      color: '#0d1117',
      transparent: false,
    },
  },
  {
    id: 'night-mode',
    name: '夜间模式',
    description: '低亮度环境，减少视觉疲劳',
    mainLight: {
      intensity: 0.4,
      position: [10, 10, 5],
      color: '#b8d4ff',
      castShadow: true,
      shadowMapSize: 1024,
    },
    auxLights: [
      {
        intensity: 0.2,
        position: [-5, 5, -5],
        color: '#4a5568',
      },
    ],
    ambientLight: {
      intensity: 0.1,
      color: '#1a202c',
    },
    environment: {
      enabled: true,
      hdrUrl: './assets/potsdamer_platz_1k.hdr',
      intensity: 0.3,
      rotation: 180,
    },
    shadows: {
      enabled: true,
      type: 'basic',
      mapSize: 1024,
      bias: -0.0001,
    },
    background: {
      color: '#000000',
      transparent: false,
    },
  },
  {
    id: 'presentation-mode',
    name: '演示模式',
    description: '专业演示照明，突出设备细节',
    mainLight: {
      intensity: 1.5,
      position: [15, 15, 10],
      color: '#ffffff',
      castShadow: true,
      shadowMapSize: 4096,
    },
    auxLights: [
      {
        intensity: 0.6,
        position: [-10, 10, -10],
        color: '#e0f2fe',
      },
      {
        intensity: 0.4,
        position: [0, 5, -15],
        color: '#fef3c7',
      },
    ],
    ambientLight: {
      intensity: 0.25,
      color: '#f8fafc',
    },
    environment: {
      enabled: true,
      hdrUrl: './assets/potsdamer_platz_1k.hdr',
      intensity: 1.2,
      rotation: 45,
    },
    shadows: {
      enabled: true,
      type: 'pcfsoft',
      mapSize: 4096,
      bias: -0.0001,
    },
    background: {
      color: '#0f172a',
      transparent: false,
    },
  },
];

// 默认环境预设
export const DEFAULT_ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  {
    id: 'potsdamer-platz',
    name: '波茨坦广场',
    hdrUrl: './assets/potsdamer_platz_1k.hdr',
    intensity: 1.0,
    rotation: 0,
  },
];

// 默认场景配置
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  version: '1.0.0',
  name: '默认场景配置',
  description: 'PDS 3D组件库默认场景配置',
  coordinateSystem: DEFAULT_COORDINATE_SYSTEM,
  anchorPoints: [],
  cameraBookmarks: [],
  activeLightingPresetId: 'default-daylight',
  lightingPresets: DEFAULT_LIGHTING_PRESETS,
  environmentPresets: DEFAULT_ENVIRONMENT_PRESETS,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// 存储键名
export const STORAGE_KEY = 'pds-scene-config';

// 事件名称
export const EVENT_NAMES = {
  PICK: 'pick',
  ANCHOR_ADDED: 'anchorAdded',
  ANCHOR_UPDATED: 'anchorUpdated',
  ANCHOR_REMOVED: 'anchorRemoved',
  BOOKMARK_ADDED: 'bookmarkAdded',
  BOOKMARK_UPDATED: 'bookmarkUpdated',
  BOOKMARK_REMOVED: 'bookmarkRemoved',
  BOOKMARK_RESTORED: 'bookmarkRestored',
  LIGHTING_PRESET_APPLIED: 'lightingPresetApplied',
  LIGHTING_PRESET_CHANGED: 'lightingPresetChanged',
  CONFIG_IMPORTED: 'configImported',
  CONFIG_EXPORTED: 'configExported',
} as const;

// 过渡动画默认配置
export const DEFAULT_TRANSITION_OPTIONS = {
  duration: 1000,
  easing: 'easeInOut' as const,
  smooth: true,
};

// 拾取配置
export const PICK_CONFIG = {
  // 射线递归深度
  recursive: true,
  // 是否排序（按距离）
  sortByDistance: true,
};
