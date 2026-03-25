/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import useVisibleModelsInRange from '@/hooks/useVisibleModel';

// 贴花类型枚举
export enum DecalType {
  TEXT = 'text',
  AMMETER = 'ammeter',
  SWITCH = 'switch',
  SIGNAL_LAMP = 'signal_lamp',
}

// 贴花配置接口
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

// 贴花管理器属性
interface DecalManagerProps {
  decals: DecalConfig[];
  onDecalUpdate?: (decalId: string, data: any) => void;
  onDecalRemove?: (decalId: string) => void;
  onManagerReady?: (manager: any) => void;
}

// 工具函数：确保Vector3类型
function ensureVector3(obj: any): THREE.Vector3 {
  if (obj instanceof THREE.Vector3) return obj;
  if (Array.isArray(obj) && obj.length === 3) {
    return new THREE.Vector3(obj[0], obj[1], obj[2]);
  }
  if (
    obj &&
    typeof obj === 'object' &&
    'x' in obj &&
    'y' in obj &&
    'z' in obj
  ) {
    return new THREE.Vector3(obj.x, obj.y, obj.z);
  }
  return new THREE.Vector3(0, 0, 0);
}

// 工具函数：确保Euler类型
function ensureEuler(obj: any): THREE.Euler {
  if (obj instanceof THREE.Euler) return obj;
  if (Array.isArray(obj) && obj.length === 3) {
    return new THREE.Euler(obj[0], obj[1], obj[2]);
  }
  if (
    obj &&
    typeof obj === 'object' &&
    'x' in obj &&
    'y' in obj &&
    'z' in obj
  ) {
    return new THREE.Euler(obj.x, obj.y, obj.z);
  }
  return new THREE.Euler(0, 0, 0);
}

// 创建优化的贴花材质 - 使用MeshStandardMaterial以更好地利用环境光照
function createOptimizedDecalMaterial(
  texture: THREE.Texture
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    metalness: 0.1, // 低金属度，保持贴花清晰
    roughness: 0.3, // 适中的粗糙度，提供良好的光照响应
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    blending: THREE.NormalBlending,
    emissive: 0x111111, // 轻微自发光，确保在低光照下可见
    emissiveIntensity: 0.1, // 自发光强度适中
    // PBR材质属性
    envMapIntensity: 1.0, // 环境贴图强度
    normalScale: new THREE.Vector2(1, 1), // 法线贴图缩放
    // 光照相关
    lightMapIntensity: 1.0, // 光照贴图强度
    aoMapIntensity: 1.0, // 环境光遮蔽强度
  });
}

// 创建文字纹理
function createTextTexture(
  text: string,
  config: any = {}
): THREE.CanvasTexture {
  const {
    font = 'bold 64px Arial',
    color = 'black',
    backgroundColor = 'rgba(255, 255, 255, 0.8)',
    padding = 20,
    textureScale = 2,
  } = config;

  // 检查是否在浏览器环境中
  if (typeof document === 'undefined') {
    // 在非浏览器环境中返回默认纹理
    const canvas = new OffscreenCanvas(256, 256);
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, 256, 256);
      context.fillStyle = color;
      context.font = font;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('无法创建Canvas上下文');

  context.font = font;
  const textMetrics = context.measureText(text);
  const fontHeight =
    (textMetrics.fontBoundingBoxAscent || 64) +
    (textMetrics.fontBoundingBoxDescent || 0);

  canvas.width = (textMetrics.width + padding * 2) * textureScale;
  canvas.height = (fontHeight + padding * 2) * textureScale;

  const fontSizeMatch = font.match(/(\d+)px/);
  let scaledFont = font;
  if (fontSizeMatch) {
    const size = parseInt(fontSizeMatch[1], 10);
    scaledFont = font.replace(/(\d+)px/, `${size * textureScale}px`);
  }
  context.font = scaledFont;

  context.setTransform(textureScale, 0, 0, textureScale, 0, 0);

  context.fillStyle = backgroundColor;
  context.fillRect(
    0,
    0,
    canvas.width / textureScale,
    canvas.height / textureScale
  );
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
    text,
    canvas.width / textureScale / 2,
    canvas.height / textureScale / 2
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// 创建电流表纹理
function createAmmeterTexture(
  bgImg: HTMLImageElement,
  value: number,
  min: number,
  max: number,
  config: any = {}
): THREE.CanvasTexture {
  const {
    pointerColor = 'black',
    pointerWidth = 6,
    textureSize = 512,
    pointerLengthRatio = 0.7,
    angleStart = -120,
    angleEnd = 120,
    centerOffsetX = 0,
    centerOffsetY = 0,
  } = config;

  // 检查是否在浏览器环境中
  if (typeof document === 'undefined') {
    const canvas = new OffscreenCanvas(textureSize, textureSize);
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#f0f0f0';
      context.fillRect(0, 0, textureSize, textureSize);
    }
    return new THREE.CanvasTexture(canvas);
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = textureSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建Canvas上下文');

  // 绘制背景图
  ctx.drawImage(bgImg, 0, 0, textureSize, textureSize);

  // 计算指针角度
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle =
    ((angleStart + (angleEnd - angleStart) * percent) * Math.PI) / 180;

  // 指针参数
  const cx = textureSize / 2 + centerOffsetX;
  const cy = textureSize / 2 + centerOffsetY;
  const r = (textureSize / 2) * pointerLengthRatio;

  // 绘制指针
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -r);
  ctx.strokeStyle = pointerColor;
  ctx.lineWidth = pointerWidth;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// 创建开关纹理
function createSwitchTexture({
  state = 0,
  states = 3,
  size = 256,
}: {
  state: number;
  states: number;
  size: number;
}): THREE.CanvasTexture {
  // 检查是否在浏览器环境中
  if (typeof document === 'undefined') {
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#e0e0e0';
      context.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建Canvas上下文');

  ctx.clearRect(0, 0, size, size);

  // 底盘
  ctx.save();
  ctx.beginPath();
  ctx.rect(size * 0.01, size * 0.01, size * 0.9, size * 1.65);
  ctx.fillStyle = '#e0e0e0';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#888';
  ctx.stroke();
  ctx.restore();

  // 刻度线
  const angles = [0, -Math.PI / 2];
  for (let i = 0; i < states; i++) {
    const angle = angles[i];
    const x1 = size / 2 + Math.cos(angle) * size * 0.32;
    const y1 = size / 2 + Math.sin(angle) * size * 0.32;
    const x2 = size / 2 + Math.cos(angle) * size * 0.42;
    const y2 = size / 2 + Math.sin(angle) * size * 0.42;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#333';
    ctx.stroke();
  }

  // 旋钮
  ctx.save();
  const pointerAngles = [0, Math.PI / 2];
  const angle = pointerAngles[state] || 0;
  ctx.translate(size / 2, size / 2);
  ctx.rotate(angle);

  // 旋钮本体
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, 2 * Math.PI);
  ctx.fillStyle = '#222';
  ctx.fill();

  // 指针
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, 0);
  ctx.lineTo(size * 0.38, 0);
  ctx.lineWidth = 32;
  ctx.strokeStyle = '#111';
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// 创建信号灯纹理
function createSignalLampTexture({
  color = 'green',
  size = 256,
  glow = true,
}: {
  color: string;
  size: number;
  glow: boolean;
}): THREE.CanvasTexture {
  // 检查是否在浏览器环境中
  if (typeof document === 'undefined') {
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = color;
      context.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建Canvas上下文');

  ctx.clearRect(0, 0, size, size);

  // 灯泡参数
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;

  // 发光渐变
  if (glow) {
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.2, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // 灯泡本体
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fill();

  // 灯泡高光
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 0;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// 贴花管理器组件
const DecalManager: React.FC<DecalManagerProps> = ({
  decals,
  onDecalUpdate,
  onDecalRemove,
  onManagerReady,
}) => {
  const { scene } = useThree();
  const decalRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  //目标开关柜模型名称
  const targetModelNameList = [
    '网格008_4',
    '网格008_1',
    '网格008_6',
    '10kV-SWG_SWG@245_245',
    // '110kV-GIS_145_CT_PDS-US02C',
  ];
  // const targetModelNameList = [
  //   "110kV-GIS_104_CB_PDS-S500-AE"
  // ]
  const { visibleModels } = useVisibleModelsInRange(5, targetModelNameList);

  const handleDecalVisibilityRef = useRef<
    (showCallback?: () => void, hideCallback?: () => void) => void
  >(() => {});
  // 处理贴花显示/隐藏的方法
  handleDecalVisibilityRef.current = useCallback(
    (showCallback?: () => void, hideCallback?: () => void) => {
      console.log('821kkg visibleModels', visibleModels);
      if (visibleModels && visibleModels.length > 0) {
        // 有可见模型时，执行显示回调
        if (showCallback) {
          showCallback();
        }
      } else {
        // 没有可见模型时，执行隐藏回调
        if (hideCallback) {
          hideCallback();
        }
      }
    },
    [visibleModels]
  );

  // 显示所有贴花
  const showAllDecalsRef = useRef(() => {});
  showAllDecalsRef.current = useCallback(() => {
    decalRefs.current.forEach(decalMesh => {
      decalMesh.visible = true;
    });
    console.log('🎯 DecalManager: 已显示所有贴花');
  }, []);

  // 隐藏所有贴花
  const hideAllDecalsRef = useRef(() => {});
  hideAllDecalsRef.current = useCallback(() => {
    decalRefs.current.forEach(decalMesh => {
      decalMesh.visible = false;
    });
    console.log('🚫 DecalManager: 已隐藏所有贴花');
  }, []);

  // 创建贴花
  const createDecalRef = useRef<(config: DecalConfig) => void>(() => {});
  createDecalRef.current = useCallback(
    (config: DecalConfig) => {
      const targetObject = scene.getObjectByName(config.modelName);
      if (!targetObject) {
        // if (typeof console !== "undefined") {
        //   console.warn(`[DecalManager] 目标模型 "${config.modelName}" 未找到`);
        // }
        return;
      }

      targetObject.updateMatrixWorld(true);
      let meshToDecal: THREE.Mesh | undefined;

      targetObject.traverse(child => {
        if ((child as any).isMesh && !meshToDecal) {
          meshToDecal = child as THREE.Mesh;
        }
      });

      if (!meshToDecal) {
        if (typeof console !== 'undefined') {
          // console.warn(
          //   `[DecalManager] 模型 "${config.modelName}" 中未找到可应用贴花的网格`
          // );
        }
        return;
      }

      const box = new THREE.Box3().setFromObject(meshToDecal);
      const boxSize = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const options = config.options || {};
      const realRotation = ensureEuler(
        options.rotation || { x: -Math.PI / 2, y: 0, z: 0 }
      );
      const realDecalSize = ensureVector3(
        options.decalSize || {
          x: boxSize.x * 0.8,
          y: boxSize.z * 0.8,
          z: boxSize.y,
        }
      );
      const realPositionOffset = ensureVector3(
        options.positionOffset || { x: 0, y: 0, z: 0 }
      );
      const decalPosition = new THREE.Vector3(
        center.x,
        box.max.y + 1,
        center.z
      ).add(realPositionOffset);

      let texture: THREE.Texture;
      let material: THREE.Material | undefined;

      switch (config.type) {
        case DecalType.TEXT:
          if (!options.text) break;
          texture = createTextTexture(options.text, options.textConfig);
          material = createOptimizedDecalMaterial(texture);
          break;

        case DecalType.AMMETER:
          const ammeterConfig = options.ammeterConfig || {};
          if (ammeterConfig.bgUrl) {
            const cachedImg = imageCache.current.get(ammeterConfig.bgUrl);
            if (cachedImg) {
              texture = createAmmeterTexture(
                cachedImg,
                ammeterConfig.value || 0,
                ammeterConfig.min || 0,
                ammeterConfig.max || 200,
                ammeterConfig
              );
              material = createOptimizedDecalMaterial(texture);
            } else {
              // 异步加载图片
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                imageCache.current.set(ammeterConfig.bgUrl!, img);
                const newTexture = createAmmeterTexture(
                  img,
                  ammeterConfig.value || 0,
                  ammeterConfig.min || 0,
                  ammeterConfig.max || 200,
                  ammeterConfig
                );
                const existingDecal = decalRefs.current.get(config.id);
                if (existingDecal) {
                  (existingDecal.material as THREE.MeshStandardMaterial).map =
                    newTexture;
                  (
                    existingDecal.material as THREE.MeshStandardMaterial
                  ).needsUpdate = true;
                }
              };
              img.src = ammeterConfig.bgUrl;
              // 临时纹理
              texture = createTextTexture('', { color: '#666' });
              material = createOptimizedDecalMaterial(texture);
            }
          } else {
            texture = createTextTexture('无底图', { color: '#666' });
            material = createOptimizedDecalMaterial(texture);
          }
          break;

        case DecalType.SWITCH:
          const switchConfig = options.switchConfig || {};
          texture = createSwitchTexture({
            state: switchConfig.state || 0,
            states: switchConfig.states || 2,
            size: 256,
          });
          material = createOptimizedDecalMaterial(texture);
          break;

        case DecalType.SIGNAL_LAMP:
          const signalLampConfig = options.signalLampConfig || {};
          texture = createSignalLampTexture({
            color: signalLampConfig.color || 'green',
            size: 256,
            glow: signalLampConfig.glow !== false,
          });
          material = createOptimizedDecalMaterial(texture);
          break;

        default:
          return;
      }

      // 确保material已创建
      if (!material) {
        // console.warn(`[DecalManager] 无法创建贴花材质: ${config.type}`);
        return;
      }

      if (options.debug) {
        const planeGeometry = new THREE.PlaneGeometry(
          realDecalSize.x,
          realDecalSize.y
        );
        const decalMesh = new THREE.Mesh(planeGeometry, material);
        decalMesh.position.copy(decalPosition);
        decalMesh.rotation.copy(realRotation);
        decalMesh.name = `decal_${config.id}`;
        // 将配置信息保存到贴花对象的userData中
        decalMesh.userData.decalConfig = config;
        decalMesh.userData.decalType = config.type;
        scene.add(decalMesh);
        decalRefs.current.set(config.id, decalMesh);
      } else {
        const decalGeometry = new DecalGeometry(
          meshToDecal,
          decalPosition,
          realRotation,
          realDecalSize
        );
        const decalMesh = new THREE.Mesh(decalGeometry, material);
        decalMesh.name = `decal_${config.id}`;
        // 将配置信息保存到贴花对象的userData中
        decalMesh.userData.decalConfig = config;
        decalMesh.userData.decalType = config.type;
        scene.add(decalMesh);
        decalRefs.current.set(config.id, decalMesh);
      }
    },
    [scene]
  );

  // 更新贴花
  const updateDecalRef = useRef<
    (decalId: string, data: any, config?: DecalConfig) => void
  >(() => {});
  updateDecalRef.current = useCallback(
    (decalId: string, data: any, config?: DecalConfig) => {
      const decalMesh = decalRefs.current.get(decalId);
      if (!decalMesh) return;

      // 优先使用传入的配置，其次从贴花对象的用户数据中获取，最后从decals上下文查找
      let targetConfig = config;

      if (!targetConfig) {
        // 从贴花对象中获取保存的配置
        targetConfig = decalMesh.userData.decalConfig;
      }

      if (!targetConfig) {
        // 最后从decals上下文查找（保持向后兼容）
        targetConfig = decals.find(d => d.id === decalId);
      }

      if (!targetConfig) {
        console.warn(`[DecalManager] 无法找到贴花配置: ${decalId}`);
        return;
      }

      switch (targetConfig.type) {
        case DecalType.TEXT:
          if (data.text) {
            const newTexture = createTextTexture(
              data.text,
              data.textConfig || targetConfig.options?.textConfig
            );
            (decalMesh.material as THREE.MeshStandardMaterial).map = newTexture;
            (decalMesh.material as THREE.MeshStandardMaterial).needsUpdate =
              true;
          }
          break;

        case DecalType.AMMETER:
          if (
            data.value !== undefined ||
            data.min !== undefined ||
            data.max !== undefined
          ) {
            const ammeterConfig = {
              ...targetConfig.options?.ammeterConfig,
              ...data,
            };
            const cachedImg = imageCache.current.get(ammeterConfig.bgUrl || '');
            if (cachedImg) {
              const newTexture = createAmmeterTexture(
                cachedImg,
                ammeterConfig.value || 0,
                ammeterConfig.min || 0,
                ammeterConfig.max || 200,
                ammeterConfig
              );
              (decalMesh.material as THREE.MeshStandardMaterial).map =
                newTexture;
              (decalMesh.material as THREE.MeshStandardMaterial).needsUpdate =
                true;
            }
          }
          break;

        case DecalType.SWITCH:
          if (data.state !== undefined) {
            const switchConfig = {
              ...targetConfig.options?.switchConfig,
              ...data,
            };
            const newTexture = createSwitchTexture({
              state: switchConfig.state || 0,
              states: switchConfig.states || 2,
              size: 256,
            });
            (decalMesh.material as THREE.MeshStandardMaterial).map = newTexture;
            (decalMesh.material as THREE.MeshStandardMaterial).needsUpdate =
              true;
          }
          break;

        case DecalType.SIGNAL_LAMP:
          if (data.color) {
            const signalLampConfig = {
              ...targetConfig.options?.signalLampConfig,
              ...data,
            };
            const newTexture = createSignalLampTexture({
              color: signalLampConfig.color || 'green',
              size: 256,
              glow: signalLampConfig.glow !== false,
            });
            (decalMesh.material as THREE.MeshStandardMaterial).map = newTexture;
            (decalMesh.material as THREE.MeshStandardMaterial).needsUpdate =
              true;
          }
          break;
      }

      onDecalUpdate?.(decalId, data);
    },
    [decals, onDecalUpdate]
  );

  // 移除贴花
  const removeDecalRef = useRef<(decalId: string) => void>(() => {});
  removeDecalRef.current = useCallback(
    (decalId: string) => {
      const decalMesh = decalRefs.current.get(decalId);
      if (decalMesh) {
        scene.remove(decalMesh);
        decalRefs.current.delete(decalId);
        onDecalRemove?.(decalId);
      }
    },
    [scene, onDecalRemove]
  );

  // 清空所有贴花
  const clearDecalsRef = useRef(() => {});
  clearDecalsRef.current = useCallback(() => {
    decalRefs.current.forEach(decalMesh => {
      scene.remove(decalMesh);
    });
    decalRefs.current.clear();
    console.log('🗑️ DecalManager: 已清空所有贴花');
  }, [scene]);

  // 暴露更新方法给父组件
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).decalManager = {
        updateDecal: (decalId: string, data: any, config?: DecalConfig) => {
          updateDecalRef.current(decalId, data, config);
        },
        removeDecal: (decalId: string) => {
          removeDecalRef.current(decalId);
        },
        createDecal: (config: DecalConfig) => {
          createDecalRef.current(config);
        },
        showAllDecals: () => {
          showAllDecalsRef.current();
        },
        hideAllDecals: () => {
          hideAllDecalsRef.current();
        },
        handleDecalVisibility: (
          showCallback?: () => void,
          hideCallback?: () => void
        ) => {
          handleDecalVisibilityRef.current(showCallback, hideCallback);
        },
      };
    }
  }, []);

  const getVisibleModelsRef = useRef<() => THREE.Object3D[]>(() => {
    return [];
  });

  //返回visibleModels
  getVisibleModelsRef.current = useCallback(() => {
    return visibleModels;
  }, [visibleModels]);

  // 通知父组件贴花管理器已准备就绪
  useEffect(() => {
    if (onManagerReady) {
      const managerInstance = {
        addDecal: (config: DecalConfig) => {
          createDecalRef.current(config);
        },
        updateDecal: (decalId: string, data: any, config?: DecalConfig) => {
          updateDecalRef.current(decalId, data, config);
        },
        removeDecal: (decalId: string) => {
          removeDecalRef.current(decalId);
        },
        clearDecals: () => {
          clearDecalsRef.current();
        },
        getDecal: (decalId: string) => decalRefs.current.get(decalId),
        getAllDecals: () => decalRefs.current,
        handleDecalVisibility: (
          showCallback?: () => void,
          hideCallback?: () => void
        ) => {
          handleDecalVisibilityRef.current(showCallback, hideCallback);
        },
        getVisibleModels: () => {
          return getVisibleModelsRef.current();
        },
      };
      onManagerReady(managerInstance);
    }
  }, [onManagerReady]);

  return null; // 这是一个逻辑组件，不渲染任何UI
};

export default DecalManager;
