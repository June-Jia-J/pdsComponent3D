import { Object3D, Vector3 } from 'three';

// ============================================
// 1. 空间坐标与拾取体系
// ============================================

export interface PickResult {
  /** 选中的对象 */
  object: Object3D;
  /** 世界坐标 */
  worldPosition: Vector3;
  /** 局部坐标 */
  localPosition: Vector3;
  /** 法向量 */
  normal: Vector3 | null;
  /** 距离 */
  distance: number;
  /** UV坐标 */
  uv: { u: number; v: number } | null;
  /** 屏幕坐标 */
  screenPosition: { x: number; y: number };
  /** 面索引 */
  faceIndex: number | null;
}

export interface AnchorPoint {
  /** 锚点唯一ID */
  id: string;
  /** 锚点名称 */
  name: string;
  /** 绑定的业务ID */
  businessId?: string;
  /** 世界坐标 */
  worldPosition: [number, number, number];
  /** 绑定的模型名称 */
  attachedModelName?: string;
  /** 绑定的模型ID */
  attachedModelId?: number;
  /** 相对于模型的局部坐标 */
  localPosition?: [number, number, number];
  /** 标签配置 */
  labelConfig?: {
    text: string;
    style?: {
      color?: string;
      fontSize?: number;
      backgroundColor?: string;
    };
  };
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

export interface BoundingBoxInfo {
  /** 中心点 */
  center: [number, number, number];
  /** 尺寸 */
  size: [number, number, number];
  /** 最小点 */
  min: [number, number, number];
  /** 最大点 */
  max: [number, number, number];
}

export interface CoordinateSystemConfig {
  /** 坐标系类型 */
  type: 'world' | 'local';
  /** 归一化策略 */
  normalization: 'none' | 'center' | 'bbox';
  /** 单位缩放 */
  unitScale: number;
}

// ============================================
// 2. 相机视角书签系统
// ============================================

export interface CameraBookmark {
  /** 书签唯一ID */
  id: string;
  /** 书签名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 相机位置 */
  position: [number, number, number];
  /** 相机目标点 */
  target: [number, number, number];
  /** 相机朝向（可选） */
  rotation?: [number, number, number];
  /** 视场角 */
  fov?: number;
  /** 近裁剪面 */
  near?: number;
  /** 远裁剪面 */
  far?: number;
  /** 缩略图（base64） */
  thumbnail?: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt?: number;
  /** 标签 */
  tags?: string[];
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

export interface CameraTransitionOptions {
  /** 过渡持续时间（毫秒） */
  duration: number;
  /** 缓动函数 */
  easing?: 'linear' | 'easeInOut' | 'easeOut' | 'easeIn' | 'elastic';
  /** 是否使用平滑过渡 */
  smooth?: boolean;
  /** 完成回调 */
  onComplete?: () => void;
  /** 开始回调 */
  onStart?: () => void;
}

export interface ViewportSyncConfig {
  /** 是否启用多视口同步 */
  enabled: boolean;
  /** 主视口ID */
  primaryViewportId?: string;
  /** 同步的视口IDs */
  syncedViewportIds?: string[];
  /** 同步模式 */
  syncMode?: 'position' | 'target' | 'both';
}

// ============================================
// 3. 光影环境预设系统
// ============================================

export interface LightingPreset {
  /** 预设唯一ID */
  id: string;
  /** 预设名称 */
  name: string;
  /** 预设描述 */
  description?: string;
  /** 主光源配置 */
  mainLight: {
    intensity: number;
    position: [number, number, number];
    color: string;
    castShadow: boolean;
    shadowMapSize?: number;
  };
  /** 辅光源配置 */
  auxLights?: Array<{
    intensity: number;
    position: [number, number, number];
    color: string;
  }>;
  /** 环境光配置 */
  ambientLight: {
    intensity: number;
    color: string;
  };
  /** HDR环境配置 */
  environment?: {
    enabled: boolean;
    hdrUrl?: string;
    intensity: number;
    rotation?: number;
  };
  /** 阴影配置 */
  shadows: {
    enabled: boolean;
    type: 'basic' | 'pcf' | 'pcfsoft';
    mapSize: number;
    bias?: number;
  };
  /** 背景配置 */
  background?: {
    color?: string;
    transparent?: boolean;
  };
}

export interface EnvironmentPreset {
  /** 预设唯一ID */
  id: string;
  /** 预设名称 */
  name: string;
  /** HDR资源URL */
  hdrUrl: string;
  /** 环境强度 */
  intensity: number;
  /** 旋转角度 */
  rotation?: number;
  /** 预览图 */
  thumbnail?: string;
}

// ============================================
// 4. 场景配置整合
// ============================================

export interface SceneConfig {
  /** 配置版本 */
  version: string;
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** 坐标系配置 */
  coordinateSystem: CoordinateSystemConfig;
  /** 锚点列表 */
  anchorPoints: AnchorPoint[];
  /** 相机书签列表 */
  cameraBookmarks: CameraBookmark[];
  /** 当前激活的光影预设ID */
  activeLightingPresetId: string;
  /** 光影预设列表 */
  lightingPresets: LightingPreset[];
  /** 环境预设列表 */
  environmentPresets: EnvironmentPreset[];
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

// ============================================
// 5. API 接口定义
// ============================================

/* eslint-disable no-unused-vars */
export interface SceneConfigAPI {
  // 坐标与拾取
  /** 执行射线拾取 */
  pick: (_screenX: number, _screenY: number) => PickResult | null;
  /** 添加锚点 */
  addAnchor: (_anchor: Omit<AnchorPoint, 'id'>) => AnchorPoint;
  /** 更新锚点 */
  updateAnchor: (_id: string, _updates: Partial<AnchorPoint>) => boolean;
  /** 删除锚点 */
  removeAnchor: (_id: string) => boolean;
  /** 获取锚点列表 */
  getAnchors: () => AnchorPoint[];
  /** 根据ID获取锚点 */
  getAnchorById: (_id: string) => AnchorPoint | undefined;
  /** 根据业务ID获取锚点 */
  getAnchorsByBusinessId: (_businessId: string) => AnchorPoint[];
  /** 获取对象的包围盒信息 */
  getBoundingBox: (_objectNameOrId: string) => BoundingBoxInfo | null;

  // 相机书签
  /** 保存当前视角为书签 */
  saveBookmark: (
    _name: string,
    _options?: Partial<CameraBookmark>
  ) => CameraBookmark;
  /** 更新书签 */
  updateBookmark: (_id: string, _updates: Partial<CameraBookmark>) => boolean;
  /** 删除书签 */
  removeBookmark: (_id: string) => boolean;
  /** 获取所有书签 */
  getBookmarks: () => CameraBookmark[];
  /** 恢复到指定书签视角 */
  restoreBookmark: (
    _id: string,
    _transitionOptions?: Partial<CameraTransitionOptions>
  ) => boolean;
  /** 生成书签缩略图 */
  generateThumbnail: (_id: string) => Promise<string | null>;

  // 光影预设
  /** 应用光影预设 */
  applyLightingPreset: (_presetId: string) => boolean;
  /** 添加光影预设 */
  addLightingPreset: (_preset: Omit<LightingPreset, 'id'>) => LightingPreset;
  /** 更新光影预设 */
  updateLightingPreset: (
    _id: string,
    _updates: Partial<LightingPreset>
  ) => boolean;
  /** 删除光影预设 */
  removeLightingPreset: (_id: string) => boolean;
  /** 获取所有光影预设 */
  getLightingPresets: () => LightingPreset[];

  // 场景配置整体操作
  /** 导出配置为JSON */
  exportConfig: () => string;
  /** 从JSON导入配置 */
  importConfig: (_json: string) => boolean;
  /** 重置为默认配置 */
  resetToDefault: () => void;
  /** 获取当前配置快照 */
  getCurrentConfig: () => SceneConfig;
}
/* eslint-enable no-unused-vars */

// ============================================
// 6. 事件类型
// ============================================

export type SceneConfigEventType =
  | 'pick'
  | 'anchorAdded'
  | 'anchorUpdated'
  | 'anchorRemoved'
  | 'bookmarkAdded'
  | 'bookmarkUpdated'
  | 'bookmarkRemoved'
  | 'bookmarkRestored'
  | 'lightingPresetApplied'
  | 'lightingPresetChanged'
  | 'configImported'
  | 'configExported';

export interface SceneConfigEvent {
  type: SceneConfigEventType;
  payload: unknown;
  timestamp: number;
}

/* eslint-disable no-unused-vars */
export type SceneConfigEventListener = (event: SceneConfigEvent) => void;
/* eslint-enable no-unused-vars */
