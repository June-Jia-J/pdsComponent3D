import React, { useEffect, useRef } from 'react';
import {
  Group,
  Box3,
  Vector3,
  Object3D,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  MeshBasicMaterial,
  Mesh,
} from 'three';

interface BoundingBoxProps {
  /** 目标对象，为其显示包围盒 */
  target?: Object3D;
  /** 包围盒填充颜色 */
  fillColor?: string;
  /** 包围盒边框颜色 */
  borderColor?: string;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 边框透明度 */
  borderOpacity?: number;
  /** 是否显示包围盒 */
  showBox?: boolean;
}

// 将rgba颜色转换为Three.js可用的颜色
const rgbaToHex = (rgba: string): number => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return (r << 16) | (g << 8) | b;
  }
  return 0x00ff00; // 默认绿色
};

const BoundingBox: React.FC<BoundingBoxProps> = ({
  target,
  fillColor = 'rgba(11, 228, 222, 0.25)',
  borderColor = 'rgba(11, 228, 222, 1)',
  fillOpacity = 0.25,
  borderOpacity = 1,
  showBox = true,
}) => {
  const groupRef = useRef<Group>(null);
  const boxRef = useRef<Mesh | null>(null);
  const borderRef = useRef<LineSegments | null>(null);

  // 更新包围盒显示
  const updateBoundingBox = () => {
    if (!target || !groupRef.current) return;

    // 清除之前的几何体
    if (boxRef.current) {
      groupRef.current.remove(boxRef.current);
      boxRef.current.geometry.dispose();
      if (boxRef.current.material instanceof MeshBasicMaterial) {
        boxRef.current.material.dispose();
      }
      boxRef.current = null;
    }

    if (borderRef.current) {
      groupRef.current.remove(borderRef.current);
      borderRef.current.geometry.dispose();
      if (borderRef.current.material instanceof LineBasicMaterial) {
        borderRef.current.material.dispose();
      }
      borderRef.current = null;
    }

    // 计算包围盒
    const box = new Box3().setFromObject(target);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    if (showBox) {
      // 创建包围盒几何体，稍微放大一点
      const scaleFactor = 1.05; // 放大5%
      const boxGeometry = new BoxGeometry(
        size.x * scaleFactor,
        size.y * scaleFactor,
        size.z * scaleFactor
      );

      // 创建填充材质
      const fillMaterial = new MeshBasicMaterial({
        color: rgbaToHex(fillColor),
        transparent: true,
        opacity: fillOpacity,
        depthWrite: false,
        side: 2, // 双面渲染
      });

      // 创建填充网格
      const boxMesh = new Mesh(boxGeometry, fillMaterial);
      boxMesh.position.copy(center);
      boxRef.current = boxMesh;
      groupRef.current.add(boxMesh);

      // 创建边框几何体
      const edges = new EdgesGeometry(boxGeometry);
      const borderMaterial = new LineBasicMaterial({
        color: rgbaToHex(borderColor),
        transparent: true,
        opacity: borderOpacity,
        linewidth: 2,
      });

      const borderLines = new LineSegments(edges, borderMaterial);
      borderLines.position.copy(center);
      borderRef.current = borderLines;
      groupRef.current.add(borderLines);
    }
  };

  useEffect(() => {
    updateBoundingBox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, showBox]);

  return <group ref={groupRef} />;
};

export default BoundingBox;
