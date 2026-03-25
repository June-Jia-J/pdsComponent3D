import { useRef, useEffect, useMemo, forwardRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LabelTextItem } from '../../types';

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
  onClick?: (event: any) => void;
  /** Canvas像素宽度 */
  canvasWidth?: number;
  /** Canvas像素高度 */
  canvasHeight?: number;
  /** 图标在canvas上的位置 */
  iconPosition?: { x: number; y: number };
  /** 图标在canvas上的尺寸 */
  iconSize?: { width: number; height: number };
  /** 材质额外选项 */
  materialOptions?: Partial<THREE.MeshBasicMaterialParameters>;
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

const DeviceInfoLabel = forwardRef<THREE.Group, DeviceInfoLabelProps>(
  (
    {
      position = [0, 0, 0],
      width = 1,
      height = 1,
      bgUrl,
      backgroundColor = '#2E7D32', // 默认深绿色背景
      iconUrl,
      labelList = [],
      onClick,
      canvasWidth = 256,
      canvasHeight = 256,
      iconPosition = { x: 128, y: 64 },
      iconSize = { width: 80, height: 80 },
      materialOptions = {},
      lookAtCamera = true,
      visible = true,
      border,
    },
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    // 持久化的画布和纹理引用
    const canvasRef = useRef<any>(null);
    const textureRef = useRef<THREE.CanvasTexture | null>(null);
    const bgImgRef = useRef<any>(null);
    const iconImgRef = useRef<any>(null);

    // 创建稳定的纹理（只创建一次）
    useMemo(() => {
      if (canvasRef.current) {
        // 如果画布已存在，直接使用
        const tex = new THREE.CanvasTexture(canvasRef.current);
        if (tex.colorSpace !== undefined) {
          tex.colorSpace = THREE.SRGBColorSpace;
        }
        textureRef.current = tex;
      }
    }, []); // 空依赖数组，确保纹理只创建一次

    // 初始化画布
    useEffect(() => {
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvasRef.current = canvas;

        // 创建纹理
        if (!textureRef.current) {
          const tex = new THREE.CanvasTexture(canvas);
          if (tex.colorSpace !== undefined) {
            tex.colorSpace = THREE.SRGBColorSpace;
          }
          textureRef.current = tex;
        }
      }
    }, [canvasWidth, canvasHeight]);

    // 绘制内容的函数
    const drawContent = useCallback(() => {
      const canvas = canvasRef.current;
      const texture = textureRef.current;
      if (!canvas || !texture) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 清空画布
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 绘制背景
      if (bgImgRef.current && bgImgRef.current.complete) {
        ctx.drawImage(bgImgRef.current, 0, 0, canvasWidth, canvasHeight);
      } else if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 绘制边框
        if (border && border.width && border.color) {
          ctx.strokeStyle = border.color;
          ctx.lineWidth = border.width;
          if (border.radius) {
            // 使用路径绘制圆角
            ctx.beginPath();
            ctx.moveTo(border.width / 2 + border.radius, border.width / 2);
            ctx.lineTo(
              canvasWidth - border.width / 2 - border.radius,
              border.width / 2
            );
            ctx.quadraticCurveTo(
              canvasWidth - border.width / 2,
              border.width / 2,
              canvasWidth - border.width / 2,
              border.width / 2 + border.radius
            );
            ctx.lineTo(
              canvasWidth - border.width / 2,
              canvasHeight - border.width / 2 - border.radius
            );
            ctx.quadraticCurveTo(
              canvasWidth - border.width / 2,
              canvasHeight - border.width / 2,
              canvasWidth - border.width / 2 - border.radius,
              canvasHeight - border.width / 2
            );
            ctx.lineTo(
              border.width / 2 + border.radius,
              canvasHeight - border.width / 2
            );
            ctx.quadraticCurveTo(
              border.width / 2,
              canvasHeight - border.width / 2,
              border.width / 2,
              canvasHeight - border.width / 2 - border.radius
            );
            ctx.lineTo(border.width / 2, border.width / 2 + border.radius);
            ctx.quadraticCurveTo(
              border.width / 2,
              border.width / 2,
              border.width / 2 + border.radius,
              border.width / 2
            );
            ctx.closePath();
            ctx.stroke();
          } else {
            ctx.strokeRect(
              border.width / 2,
              border.width / 2,
              canvasWidth - border.width,
              canvasHeight - border.width
            );
          }
        }
      }

      // 绘制图标
      if (iconImgRef.current && iconImgRef.current.complete) {
        ctx.drawImage(
          iconImgRef.current,
          iconPosition.x,
          iconPosition.y,
          iconSize.width,
          iconSize.height
        );
      }

      // 绘制文字
      labelList.forEach(label => {
        const separator = label.separator || ':';
        let currentX = label.labelPosition.x;
        const y = label.labelPosition.y;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // 绘制属性
        if (label.property) {
          ctx.font = `${label.propertyStyle?.weight || 'bold'} ${label.propertyStyle?.size || '16px'} ${label.propertyStyle?.family || 'Arial'}`;
          ctx.fillStyle = label.propertyStyle?.color || '#fff';
          ctx.fillText(label.property, currentX, y);
          currentX += ctx.measureText(label.property).width;
        }

        // 绘制分隔符
        ctx.font = `${label.separatorStyle?.weight || ''} ${label.separatorStyle?.size || '16px'} ${label.separatorStyle?.family || 'Arial'}`;
        ctx.fillStyle = label.separatorStyle?.color || '#fff';
        ctx.fillText(separator, currentX, y);
        currentX += ctx.measureText(separator).width;

        // 绘制值
        if (
          label.value !== undefined &&
          label.value !== null &&
          label.value !== ''
        ) {
          ctx.font = `${label.valueStyle?.weight || ''} ${label.valueStyle?.size || '16px'} ${label.valueStyle?.family || 'Arial'}`;
          ctx.fillStyle = label.valueStyle?.color || '#fff';
          ctx.fillText(String(label.value), currentX, y);
          currentX += ctx.measureText(String(label.value)).width;
        }

        // 绘制单位
        if (label.unit) {
          currentX += 4;
          ctx.font = `${label.unitStyle?.weight || ''} ${label.unitStyle?.size || '14px'} ${label.unitStyle?.family || 'Arial'}`;
          ctx.fillStyle = label.unitStyle?.color || '#ccc';
          ctx.fillText(label.unit, currentX, y);
        }
      });

      // 更新纹理
      texture.needsUpdate = true;
    }, [
      backgroundColor,
      border,
      iconPosition,
      iconSize,
      labelList,
      canvasWidth,
      canvasHeight,
    ]);

    // 加载背景图片
    useEffect(() => {
      if (!bgUrl) {
        bgImgRef.current = null;
        drawContent();
        return;
      }

      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        bgImgRef.current = img;
        drawContent();
      };
      img.onerror = () => {
        console.warn('Failed to load background image:', bgUrl);
        bgImgRef.current = null;
        drawContent();
      };
      img.src = bgUrl;
    }, [bgUrl, drawContent]);

    // 加载图标
    useEffect(() => {
      if (!iconUrl) {
        iconImgRef.current = null;
        drawContent();
        return;
      }

      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        iconImgRef.current = img;
        drawContent();
      };
      img.onerror = () => {
        console.warn('Failed to load icon image:', iconUrl);
        iconImgRef.current = null;
        drawContent();
      };
      img.src = iconUrl;
    }, [iconUrl, drawContent]);

    // 相机朝向
    useFrame(() => {
      if (lookAtCamera && groupRef.current && camera) {
        groupRef.current.lookAt(camera.position);
      }
    });

    // 暴露 ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(groupRef.current);
        } else {
          ref.current = groupRef.current;
        }
      }
    }, [ref]);

    const handleClick = (event: any) => {
      event.stopPropagation();
      onClick?.(event);
    };

    // 清理
    useEffect(() => {
      return () => {
        textureRef.current?.dispose();
      };
    }, []);

    if (!textureRef.current) return null;

    return (
      <group ref={groupRef} position={position} visible={visible}>
        <mesh ref={meshRef} onClick={handleClick}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={textureRef.current}
            transparent={true}
            opacity={1}
            side={THREE.DoubleSide}
            {...materialOptions}
          />
        </mesh>
      </group>
    );
  }
);

DeviceInfoLabel.displayName = 'DeviceInfoLabel';

export default DeviceInfoLabel;
