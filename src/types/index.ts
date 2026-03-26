import { ThreeEvent } from '@react-three/fiber';
export * from './sceneConfig';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import type {
  Material,
  MeshBasicMaterialParameters,
  Object3D,
  Object3DEventMap,
} from 'three';

import { ScriptableContext } from 'chart.js';
import { CameraControls } from '@react-three/drei';

export interface ModelViewerProps {
  /** GLTF模型文件的URL地址 */
  modelUrl: string;
  /** 容器宽度 */
  width?: string | number;
  /** 容器高度 */
  height?: string | number;
  /** 模型初始位置 [x, y, z] */
  position?: [number, number, number];
  /** 模型初始旋转 [x, y, z] */
  rotation?: [number, number, number];
  /** 模型缩放比例 [x, y, z] 或单个数值 */
  scale?: [number, number, number] | number;
  /** 相机初始位置 [x, y, z] */
  cameraPosition?: [number, number, number];
  /** 相机目标位置 [x, y, z] */
  cameraTarget?: [number, number, number];
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否启用阴影 */
  enableShadows?: boolean;
  /** 是否启用控制器（缩放、旋转、平移） */
  enableControls?: boolean;
  /** 是否自动旋转 */
  autoRotate?: boolean;
  /** 自动旋转速度 */
  autoRotateSpeed?: number;
  /** 环境光强度 */
  ambientLightIntensity?: number;
  /** 方向光强度 */
  directionalLightIntensity?: number;
  /** 方向光位置 */
  directionalLightPosition?: [number, number, number];
  /** 加载完成回调 */
  onLoad?: (scence: Object3D<Object3DEventMap>) => void;
  loadStatusCallBack?: (
    status: 'loadComplete' | 'loadError',
    scence?: Object3D<Object3DEventMap>
  ) => void;
  /** 加载进度回调 */
  onProgress?: (progress: number) => void;
  /** 加载错误回调 */
  onError?: (error: Error) => void;
  /** 模型点击回调 */
  modelClick?: (model: Object3D) => void;
  /** 自定义加载中组件 */
  loadingComponent?: ReactNode;
  /** 自定义错误组件 */
  errorComponent?: ReactNode;
  /** 容器className */
  className?: string;
  /** 容器样式 */
  style?: React.CSSProperties;
}

export interface GLTFModelProps {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number] | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoad?: (scene?: any) => void;
  loadStatusCallBack?: (
    status: 'loadComplete' | 'loadError',
    scence?: Object3D<Object3DEventMap>
  ) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  modelClick?: (model: Object3D) => void;
  modelRightClick?: (model: Object3D) => void;
  forbidSelectionModelNameList?: string[];
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  /** 环境光强度 */
  ambientLightIntensity: number;
  /** 方向光强度 */
  directionalLightIntensity: number;
  /** 方向光位置 */
  directionalLightPosition: [number, number, number];

  enableShadows: boolean;

  hdrUrl: string;

  smartLightingEnabled?: boolean;
  enableSmartPerspectiveEnabled?: boolean;
  controlsRef: RefObject<CameraControls | null>;
}

export interface HubModelProps {
  ambientLightIntensity: number;
  enableShadows: boolean;
  directionalLightPosition: [number, number, number];
  directionalLightIntensity: number;
  hdrUrl: string;
  onClick?: (model: ThreeEvent<globalThis.MouseEvent>, force?: boolean) => void;
}

export interface ViewModelProps extends HubModelProps {
  /** 是否启用发光效果 */
  enableGlow?: boolean;
  /** 发光颜色 */
  glowColor?: number;
  /** 发光强度 */
  glowIntensity?: number;
  /** 是否启用轮盘菜单 */
  enableRoulette?: boolean;
  /** 副相机距离 */
  secondaryCameraDistance?: number;
}

export interface DeviceLabelManagerConfig {
  /** 设备标签配置列表 */
  labels?: DeviceLabelConfig[];
  /** 设备标签默认偏移 */
  defaultOffset?: [number, number, number];
  /** 是否启用设备标签自动定位 */
  autoPosition?: boolean;
  /** 是否启用设备标签 */
  enabled?: boolean;
  /** 全局可见性控制 */
  globalVisible?: boolean;
  /** 位置计算模式 */
  positionMode?:
    | 'bbox-center'
    | 'bbox-top'
    | 'world-position'
    | 'legacy'
    | 'robust-bbox';
}

export interface FontStyle {
  /** 字体大小 */
  size?: string;
  /** 字体粗细 */
  weight?: string;
  /** 字体样式 */
  style?: string;
  /** 字体族 */
  family?: string;
  /** 文字颜色 */
  color?: string;
}

export type TcordonConfigItem = {
  /** 是否启用警戒线 */
  enabled?: boolean;
  /** 区域模型名称数组 */
  areaModelNames?: string[];
  /** 警戒线距离模型边缘的距离 */
  distance?: number;
  /** 警戒线颜色 */
  color?: string;
  /** 警戒线宽度 */
  lineWidth?: number;
  /** 警戒线行数 */
  lineCount?: number;
  /** 警戒线间距 */
  lineSpacing?: number;
  /** 拐角弧度半径 */
  cornerRadius?: number;
  /** 是否可见 */
  visible?: boolean;
  /** 进入点位置 [x, y, z]，用于动态颜色渐变 */
  entryPoint?: [number, number, number];
  /** 红色警戒颜色 */
  alertColor?: string;
};

export interface GLTFViewerProps extends Omit<ModelViewerProps, 'modelUrl'> {
  server?: string;
  showLoading?: boolean;
  /** GLTF模型文件列表 */
  modelList?: ModelFile[];
  enableSmartLighting?: boolean;
  smartLightingMode?: 'camera' | 'model';
  enableSmartPerspective?: boolean;
  /** 设备标签配置（统一管理） */
  deviceLabelConfig?: DeviceLabelManagerConfig;
  /** 标签管理方法回调 */
  onLabelMethodsReady?: (methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateLabel: (labelId: string, updates: any) => void;
    updateLabelText: (labelId: string, labelList: LabelTextItem[]) => void;
    addLabels: (labels: DeviceLabelConfig[]) => void;
    clearLabels: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLabels: () => any[];
  }) => void;
  /** 相机配置 */
  setPolarAngle?: {
    min: number;
    max: number;
    nearThreshold: number;
    maxPanY: number;
    minPanY: number;
  };
  setCameraLimit?: {
    minDistance?: number;
    maxDistance?: number;
    /** 相机边界限制配置 */
    boundaryLimits?: {
      /** X轴边界限制 */
      x: { min: number; max: number };
      /** Y轴边界限制 */
      y: { min: number; max: number };
      /** Z轴边界限制 */
      z: { min: number; max: number };
    };
  };
  /** 禁止选择模型名称列表 */
  forbidSelectionModelNameList?: string[];
  /** 包围盒辅助配置 */
  boundingBoxConfig?: {
    /** 是否启用包围盒显示 */
    enabled?: boolean;
    /** 是否显示包围盒线框 */
    showBox?: boolean;
    /** 是否显示中心点 */
    showCenter?: boolean;
    /** 包围盒线条颜色 */
    boxColor?: string;
    /** 中心点颜色 */
    centerColor?: string;
    /** 中心点球体大小 */
    centerSize?: number;
    /** 包围盒线条宽度 */
    lineWidth?: number;
  };
  /** 警戒线配置 */
  cordonConfig?: TcordonConfigItem[];
  /** 贴花配置列表 */
  decalConfigs?: DecalConfig[];
  hdrUrl?: string;
}

export interface DeviceLabelConfig {
  id: string;
  targetModelName?: string;
  position?: [number, number, number];
  offset?: [number, number, number];
  width?: number;
  height?: number;
  bgUrl?: string;
  iconUrl?: string;
  labelList?: LabelTextItem[];
  onClick?: (labelId: string, event: MouseEvent) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  iconPosition?: { x: number; y: number };
  iconSize?: { width: number; height: number };
  materialOptions?: Partial<Material>;
  lookAtCamera?: boolean;
  visible?: boolean;
}

export interface LabelTextItem {
  /** 属性名称 */
  property: string;
  /** 数值 */
  value: string;
  /** 单位 */
  unit?: string;
  /** 标签在canvas上的位置 */
  labelPosition: { x: number; y: number };
  /** 属性部分的字体样式 */
  propertyStyle?: FontStyle;
  /** 值部分的字体样式 */
  valueStyle?: FontStyle;
  /** 单位部分的字体样式 */
  unitStyle?: FontStyle;
  /** 分隔符样式（默认为":"） */
  separatorStyle?: FontStyle;
  /** 自定义分隔符（默认为":"） */
  separator?: string;
}

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  error: Error | null;
  loaded: boolean;
}

// 3D向量和变换
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Vector3;
  rotation: Vector3; // 欧拉角
  scale: Vector3;
}

// 视觉效果定义
export interface VisualEffect {
  type: 'highlight' | 'blink' | 'pulse' | 'outline' | 'colorChange';
  color?: number; // 十六进制颜色值
  intensity?: number; // 强度 0-1
  duration?: number; // 持续时间(ms)，0表示持续
  frequency?: number; // 闪烁频率(Hz)
}

// 设备选择信息
export interface DeviceSelection {
  deviceId: string;
  componentId?: string; // 具体部件ID
  hitPoint: Vector3; // 点击位置
  distance: number; // 相机距离
}

// 站级模型配置
export interface StationModelConfig {
  stationId: string;
  name: string;
  modelFiles: ModelFile[];
  boundingBox: BoundingBox;
  defaultCameraPosition: Transform;
  levelOfDetail: LODConfig[];
}

export interface ModelFile {
  id: string;
  fileId: string;
  url: string;
  format: 'gltf' | 'fbx' | 'obj';
  size: number;
  checksum: string;
}

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
}

// LOD配置
export interface LODConfig {
  distance: number; // 距离阈值
  modelFile: string; // 对应模型文件
  triangleCount: number; // 三角形数量
}

export enum KeyboardControlsEnum {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

export interface DeviceInfoLabelProps {
  /** 3D空间中的位置 */
  position?: [number, number, number];
  /** 标签在3D空间中的宽度 */
  width?: number;
  /** 标签在3D空间中的高度 */
  height?: number;
  /** 背景图片URL */
  bgUrl?: string;
  /** 背景颜色 (当没有bgUrl时使用) */
  backgroundColor?: string;
  /** 图标URL */
  iconUrl?: string;
  /** 文字列表 */
  labelList?: LabelTextItem[];
  /** 点击事件回调 */
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  /** Canvas像素宽度 */
  canvasWidth?: number;
  /** Canvas像素高度 */
  canvasHeight?: number;
  /** 图标在canvas上的位置 */
  iconPosition?: { x: number; y: number };
  /** 图标在canvas上的尺寸 */
  iconSize?: { width: number; height: number };
  /** 材质额外选项 */
  materialOptions?: Partial<MeshBasicMaterialParameters>;
  /** 是否始终朝向相机 */
  lookAtCamera?: boolean;
  /** 是否可见 */
  visible?: boolean;
  /** 边框设置 */
  border?: {
    width?: number;
    color?: string;
    radius?: number;
  };
}

export type TCreateRadialGradient3 = (
  context: ScriptableContext<'pie'>,
  c1: string,
  c2: string,
  c3: string
) => globalThis.CanvasGradient;

// 贴花相关类型定义
export enum DecalType {
  TEXT = 'text',
  AMMETER = 'ammeter',
  SWITCH = 'switch',
  SIGNAL_LAMP = 'signal_lamp',
}

export interface DecalConfig {
  id: string;
  type: DecalType;
  modelName: string;
  options?: {
    // 通用选项
    decalSize?: { x: number; y: number; z: number } | [number, number, number];
    rotation?: { x: number; y: number; z: number } | [number, number, number];
    positionOffset?:
      | { x: number; y: number; z: number }
      | [number, number, number];
    debug?: boolean;

    // 文字贴花选项
    text?: string;
    textConfig?: {
      font?: string;
      color?: string;
      backgroundColor?: string;
      padding?: number;
      textureScale?: number;
    };

    // 电流表贴花选项
    ammeterConfig?: {
      bgUrl?: string;
      value?: number;
      min?: number;
      max?: number;
      pointerColor?: string;
      pointerWidth?: number;
      textureSize?: number;
      pointerLengthRatio?: number;
      angleStart?: number;
      angleEnd?: number;
      centerOffsetX?: number;
      centerOffsetY?: number;
    };

    // 开关贴花选项
    switchConfig?: {
      state?: number;
      states?: number;
    };

    // 信号灯贴花选项
    signalLampConfig?: {
      color?: string;
      glow?: boolean;
    };
  };
}
