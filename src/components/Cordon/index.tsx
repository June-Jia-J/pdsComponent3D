import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Group,
  Box3,
  Vector3,
  Object3D,
  LineBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  LineSegments,
  Color,
} from 'three';

interface CordonProps {
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
  /** 场景对象，用于查找模型 */
  scene?: Object3D;
  /** 进入点位置 [x, y, z]，用于动态颜色渐变 */
  entryPoint?: [number, number, number];
  /** 红色警戒颜色 */
  alertColor?: string;
}

const Cordon: React.FC<CordonProps> = ({
  areaModelNames,
  distance = 2,
  color = 'rgba(251, 255, 44, 1)',
  lineWidth = 2,
  lineCount = 10,
  lineSpacing = 0.2,
  visible = true,
  scene,
  entryPoint,
  alertColor = 'rgba(255, 0, 0, 1)',
}) => {
  const groupRef = useRef<Group>(null);
  const linesRef = useRef<LineSegments[]>([]);

  // 查找指定名称的模型
  const findModelsByNames = useMemo(() => {
    return (names: string[], scene: Object3D): Object3D[] => {
      const targetModels: Object3D[] = [];

      const traverse = (object: Object3D) => {
        if (names.includes(object.name)) {
          targetModels.push(object);
        }
        object.children.forEach(child => traverse(child));
      };

      scene.traverse(traverse);
      return targetModels;
    };
  }, []);

  // 合并多个模型的包围盒
  const mergeBoundingBoxes = useMemo(() => {
    return (models: Object3D[]): Box3 | null => {
      if (models.length === 0) return null;

      const mergedBox = new Box3();

      models.forEach(model => {
        const modelBox = new Box3().setFromObject(model);
        mergedBox.union(modelBox);
      });

      return mergedBox;
    };
  }, []);

  // 解析RGBA颜色为RGB数组和alpha值
  const parseRGBA = (
    rgbaString: string
  ): { rgb: [number, number, number]; alpha: number } => {
    const match = rgbaString.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(',').map(v => v.trim());
      const r = parseInt(values[0]) / 255;
      const g = parseInt(values[1]) / 255;
      const b = parseInt(values[2]) / 255;
      const alpha = values.length > 3 ? parseFloat(values[3]) : 1;
      return { rgb: [r, g, b], alpha };
    }
    return { rgb: [1, 1, 0], alpha: 1 }; // 默认黄色
  };

  // 创建警戒线几何体
  const createCordonLines = useMemo(() => {
    return (
      box: Box3,
      distance: number,
      lineCount: number,
      lineSpacing: number
    ) => {
      const lines: LineSegments[] = [];
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      // 计算警戒线区域的大小
      const cordonWidth = size.x + distance * 2;
      const cordonLength = size.z + distance * 2;
      const cordonHeight = size.y + distance * 2;

      // 计算警戒线区域的边界
      const minX = center.x - cordonWidth / 2;
      const maxX = center.x + cordonWidth / 2;
      const minZ = center.z - cordonLength / 2;
      const maxZ = center.z + cordonLength / 2;

      // 调整Y轴范围，确保警戒线从地面开始
      const minY = Math.max(center.y - cordonHeight / 2, 0); // 不低于地面
      const maxY = center.y + cordonHeight / 2;

      // 创建水平警戒线（在XZ平面上）
      // 从地面开始向上绘制，避免线条到地下
      const startY = Math.max(minY, 0); // 确保不会低于地面
      const availableHeight = maxY - startY;
      const actualLineCount = Math.min(
        lineCount,
        Math.floor(availableHeight / lineSpacing) + 1
      );

      for (let i = 0; i < actualLineCount; i++) {
        const y = startY + i * lineSpacing;
        if (y > maxY) break;

        // 计算颜色渐变：越往上颜色越浅
        const progress = i / (actualLineCount - 1); // 0到1的进度
        const alpha = Math.max(0.3, 1 - progress * 0.7); // 透明度从1渐变到0.3，确保最低透明度

        // 计算动态颜色：基于进入点距离的红色到黄色渐变
        let currentRGB: [number, number, number] = [1, 1, 0]; // 默认黄色
        let currentAlpha = alpha;

        if (entryPoint) {
          // 计算当前线条中心点到进入点的距离
          const lineCenterX = (minX + maxX) / 2;
          const lineCenterZ = (minZ + maxZ) / 2;
          const lineCenterY = y;

          const distanceToEntry = Math.sqrt(
            Math.pow(lineCenterX - entryPoint[0], 2) +
              Math.pow(lineCenterY - entryPoint[1], 2) +
              Math.pow(lineCenterZ - entryPoint[2], 2)
          );

          // 定义影响范围（距离进入点多远开始渐变）
          const influenceRadius = Math.max(cordonWidth, cordonLength) * 0.3;

          if (distanceToEntry <= influenceRadius) {
            // 在影响范围内，计算红色到黄色的渐变
            const colorProgress = Math.min(
              1,
              distanceToEntry / influenceRadius
            );

            // 解析红色和黄色
            const redColor = parseRGBA(alertColor);
            const yellowColor = parseRGBA(color);

            // 线性插值计算RGB值
            const r =
              redColor.rgb[0] * (1 - colorProgress) +
              yellowColor.rgb[0] * colorProgress;
            const g =
              redColor.rgb[1] * (1 - colorProgress) +
              yellowColor.rgb[1] * colorProgress;
            const b =
              redColor.rgb[2] * (1 - colorProgress) +
              yellowColor.rgb[2] * colorProgress;

            currentRGB = [r, g, b];
            currentAlpha = alpha;
          } else {
            // 超出影响范围，使用原始黄色
            const yellowColor = parseRGBA(color);
            currentRGB = yellowColor.rgb;
            currentAlpha = alpha;
          }
        } else {
          // 没有进入点，使用原始颜色
          const yellowColor = parseRGBA(color);
          currentRGB = yellowColor.rgb;
          currentAlpha = alpha;
        }

        // 为每一层创建独立的材质，实现颜色渐变
        const layerMaterial = new LineBasicMaterial({
          color: new Color(currentRGB[0], currentRGB[1], currentRGB[2]),
          linewidth: lineWidth,
          transparent: true,
          opacity: currentAlpha,
        });

        // 先创建简单的矩形，确保四个面都能显示
        const rectPoints = [
          // 前面（Z=minZ）
          new Vector3(minX, y, minZ),
          new Vector3(maxX, y, minZ),
          // 右面（X=maxX）
          new Vector3(maxX, y, minZ),
          new Vector3(maxX, y, maxZ),
          // 后面（Z=maxZ）
          new Vector3(maxX, y, maxZ),
          new Vector3(minX, y, maxZ),
          // 左面（X=minX）
          new Vector3(minX, y, maxZ),
          new Vector3(minX, y, minZ),
        ];

        // 创建几何体
        const geometry = new BufferGeometry();
        geometry.setAttribute(
          'position',
          new Float32BufferAttribute(
            rectPoints.flatMap(p => [p.x, p.y, p.z]),
            3
          )
        );

        const line = new LineSegments(geometry, layerMaterial);
        lines.push(line);
      }

      return lines;
    };
  }, [color, lineWidth, entryPoint, alertColor]);

  // 更新警戒线
  const updateCordon = useCallback(() => {
    if (!groupRef.current) return;

    // 清除之前的线条
    linesRef.current.forEach(line => {
      if (line.geometry) line.geometry.dispose();
      if (line.material) {
        if (Array.isArray(line.material)) {
          line.material.forEach(mat => mat.dispose());
        } else {
          line.material.dispose();
        }
      }
      groupRef.current?.remove(line);
    });
    linesRef.current = [];

    // 获取目标模型
    let targetModels: Object3D[] = [];

    if (areaModelNames && scene && areaModelNames.length > 0) {
      targetModels = findModelsByNames(areaModelNames, scene);
    }

    if (targetModels.length === 0) {
      console.warn('⚠️ 警戒线组件: 未找到目标模型', areaModelNames);
      return;
    }

    // 合并计算包围盒
    const mergedBox = mergeBoundingBoxes(targetModels);
    if (!mergedBox) {
      console.warn('⚠️ 警戒线组件: 无法计算合并包围盒');
      return;
    }

    const center = mergedBox.getCenter(new Vector3());
    const size = mergedBox.getSize(new Vector3());

    console.log('🎯 === 警戒线包围盒分析 ===');
    console.log('📋 目标模型数量:', targetModels.length);
    console.log('📏 合并后模型尺寸:', {
      x: size.x.toFixed(3),
      y: size.y.toFixed(3),
      z: size.z.toFixed(3),
    });
    console.log('📍 合并后模型中心:', {
      x: center.x.toFixed(3),
      y: center.y.toFixed(3),
      z: center.z.toFixed(3),
    });
    console.log('🚧 警戒线参数:', {
      distance,
      lineCount,
      lineSpacing,
      color,
    });
    console.log('📐 警戒线高度范围:', {
      startY: Math.max(center.y - (size.y + distance * 2) / 2, 0).toFixed(3),
      maxY: (center.y + (size.y + distance * 2) / 2).toFixed(3),
      availableHeight: (
        center.y +
        (size.y + distance * 2) / 2 -
        Math.max(center.y - (size.y + distance * 2) / 2, 0)
      ).toFixed(3),
      actualLineCount: Math.min(
        lineCount,
        Math.floor(
          (center.y +
            (size.y + distance * 2) / 2 -
            Math.max(center.y - (size.y + distance * 2) / 2, 0)) /
            lineSpacing
        ) + 1
      ),
    });
    console.log('🎨 颜色渐变效果: 从下往上透明度逐渐降低 (1.0 → 0.3)');
    if (entryPoint) {
      console.log('🚨 进入点检测:', {
        entryPoint: entryPoint,
        alertColor: alertColor,
        influenceRadius: (
          Math.max(size.x + distance * 2, size.z + distance * 2) * 0.3
        ).toFixed(3),
      });
    } else {
      console.log('✅ 无进入点，使用默认黄色警戒线');
    }
    console.log('========================');

    // 创建警戒线
    const lines = createCordonLines(
      mergedBox,
      distance,
      lineCount,
      lineSpacing
    );

    // 添加到组中
    lines.forEach(line => {
      groupRef.current?.add(line);
      linesRef.current.push(line);
    });
  }, [
    areaModelNames,
    scene,
    distance,
    lineCount,
    lineSpacing,
    color,
    entryPoint,
    alertColor,
    createCordonLines,
    findModelsByNames,
    mergeBoundingBoxes,
  ]);

  // 监听模型变化
  useEffect(() => {
    updateCordon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    areaModelNames,
    distance,
    lineCount,
    lineSpacing,
    color,
    lineWidth,
    scene,
    entryPoint,
    alertColor,
  ]);

  // 清理资源
  useEffect(() => {
    return () => {
      linesRef.current.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) {
          if (Array.isArray(line.material)) {
            line.material.forEach(mat => mat.dispose());
          } else {
            line.material.dispose();
          }
        }
      });
    };
  }, []);

  if (!visible) return null;

  return <group ref={groupRef} />;
};

export default Cordon;
