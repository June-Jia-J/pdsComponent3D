import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import GLTFViewer from './components/GLTFViewer';
import type { GLTFViewerProps, TcordonConfigItem } from './types';
import { Leva } from 'leva';
import globalData, { setApp } from '@/store/globalData';
import { Object3D } from 'three';
import { defaultCordonConfig } from './atoms/cordonConfig';

type Toptions = GLTFViewerProps & {
  showDebug?: boolean;
  publicPath?: string;
  focusModelNames?: string[];
  // eslint-disable-next-line no-unused-vars
  onRouletteClick?: (type: string, model: Object3D) => void;
  onRouletteClose?: () => void;
  onControlEnd?: () => void;
  // eslint-disable-next-line no-unused-vars
  getRouletteOptions?: (model: Object3D) => [];
  // eslint-disable-next-line no-unused-vars
  getModelEventAble?: (model: Object3D) => boolean;
  // eslint-disable-next-line no-unused-vars
  flyEndHandle?: (model: Object3D) => void;
  // eslint-disable-next-line no-unused-vars
  onStatusPanelClick?: (id: string, model: Object3D) => void;
};

// 默认配置
export const defaultViewerConfig: Partial<Toptions> = {
  width: '100%',
  height: '100%',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
  cameraPosition: [0, 0, 5],
  backgroundColor: 'black',
  enableShadows: true,
  enableControls: true,
  autoRotate: false,
  autoRotateSpeed: 2,
  ambientLightIntensity: 0.2,
  directionalLightIntensity: 0.5,
  directionalLightPosition: [10, 10, 5],
  enableSmartLighting: false,
  enableSmartPerspective: false,
  smartLightingMode: 'camera',
  // enableAutoFocus: true,
  showDebug: false,
  onLoad: () => console.log('模型加载完成'),
  onProgress: progress => console.log(`加载进度: ${progress}%`),
  onError: error => console.error('加载错误:', error),
};

/**
 * 初始化3D查看器
 * @param container HTML容器元素或其ID
 * @param options 配置选项
 */
export function init3DViewer(
  container: string | HTMLElement,
  options: Partial<Toptions>
) {
  const {
    modelList,
    publicPath = './',
    focusModelNames,
    onRouletteClick,
    onRouletteClose,
    onControlEnd,
    getRouletteOptions,
    getModelEventAble,
    flyEndHandle,
    onStatusPanelClick,
    cordonConfig: cordonConfigOptions,
  } = options;

  if (focusModelNames) {
    setApp({
      focusModelNames,
    });
  }

  setApp({
    publicPath,
  });

  if (onRouletteClick) {
    setApp({
      onRouletteClick,
    });
  }

  if (onRouletteClose) {
    setApp({
      onRouletteClose,
    });
  }

  if (onControlEnd) {
    setApp({
      onControlEnd,
    });
  }

  if (getRouletteOptions) {
    setApp({
      getRouletteOptions,
    });
  }

  if (getModelEventAble) {
    setApp({
      getModelEventAble,
    });
  }

  if (flyEndHandle) {
    setApp({
      flyEndHandle,
    });
  }
  if (onStatusPanelClick) {
    setApp({
      onStatusPanelClick,
    });
  }

  let cordonConfig: TcordonConfigItem[] = [];
  if (cordonConfigOptions) {
    cordonConfig = cordonConfigOptions.map(item => ({
      ...defaultCordonConfig,
      ...item,
    }));
  }

  // 获取容器元素
  const containerElement =
    typeof container === 'string'
      ? document.getElementById(container)
      : container;

  if (!containerElement) {
    throw new Error('Container element not found');
  }

  // 创建React根节点
  const root = createRoot(containerElement);

  if (!modelList || modelList.length === 0) {
    root.render(<div>modelList is required</div>);
    return;
  }

  // 渲染组件
  root.render(
    <StrictMode>
      <Leva hidden={!options.showDebug} />
      <GLTFViewer
        {...defaultViewerConfig}
        {...options}
        cordonConfig={cordonConfig}
      />
    </StrictMode>
  );

  globalData.destroy = () => {
    root.unmount();
  };

  // 返回清理函数
  return globalData;
}
