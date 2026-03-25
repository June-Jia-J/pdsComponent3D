import React, { useEffect, useRef } from 'react';
import {
  Box3,
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';
// import { useFrame } from '@react-three/fiber';

interface BoundingBoxHelperProps {
  /** 目标对象，为其显示包围盒 */
  target?: Object3D;
  /** 包围盒线条颜色 */
  boxColor?: string;
  /** 中心点颜色 */
  centerColor?: string;
  /** 是否显示包围盒 */
  showBox?: boolean;
  /** 是否显示中心点 */
  showCenter?: boolean;
  /** 中心点球体大小 */
  centerSize?: number;
  /** 包围盒线条宽度 */
  lineWidth?: number;
}

const BoundingBoxHelper: React.FC<BoundingBoxHelperProps> = ({
  target,
  boxColor = '#00ff00',
  centerColor = '#ff0000',
  showBox = true,
  showCenter = true,
  centerSize = 0.1,
  lineWidth = 2,
}) => {
  const groupRef = useRef<Group>(null);
  const boxRef = useRef<LineSegments | null>(null);
  const centerRef = useRef<Mesh | null>(null);

  // 更新包围盒显示
  const updateBoundingBox = () => {
    if (!target || !groupRef.current) return;

    // 清除之前的几何体
    if (boxRef.current) {
      groupRef.current.remove(boxRef.current);
      boxRef.current.geometry.dispose();
      if (boxRef.current.material instanceof LineBasicMaterial) {
        boxRef.current.material.dispose();
      }
      boxRef.current = null;
    }

    if (centerRef.current) {
      groupRef.current.remove(centerRef.current);
      centerRef.current.geometry.dispose();
      if (centerRef.current.material instanceof MeshBasicMaterial) {
        centerRef.current.material.dispose();
      }
      centerRef.current = null;
    }

    // 计算包围盒
    const box = new Box3().setFromObject(target);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    // 输出详细的包围盒信息
    console.log('🎯 === 模型包围盒分析 ===');
    console.log('📏 尺寸信息:');
    console.log(`   长度(X): ${size.x.toFixed(3)} 单位`);
    console.log(`   宽度(Z): ${size.z.toFixed(3)} 单位`);
    console.log(`   高度(Y): ${size.y.toFixed(3)} 单位`);
    console.log(`   体积: ${(size.x * size.y * size.z).toFixed(3)} 立方单位`);

    console.log('📍 位置信息:');
    console.log(
      `   最小坐标: (${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)})`
    );
    console.log(
      `   最大坐标: (${box.max.x.toFixed(3)}, ${box.max.y.toFixed(3)}, ${box.max.z.toFixed(3)})`
    );
    console.log(
      `   中心点: (${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)})`
    );

    console.log('🎮 观察建议:');
    const recommendedDistance = Math.max(size.x, size.y, size.z) * 1.5;
    console.log(`   推荐相机距离: ${recommendedDistance.toFixed(2)} 单位`);
    console.log('========================');

    if (showBox) {
      // 创建包围盒几何体
      const boxGeometry = new BoxGeometry(size.x, size.y, size.z);
      const edges = new EdgesGeometry(boxGeometry);
      const lineMaterial = new LineBasicMaterial({
        color: boxColor,
        linewidth: lineWidth,
      });

      const boxLines = new LineSegments(edges, lineMaterial);
      boxLines.position.copy(center);

      boxRef.current = boxLines;
      groupRef.current.add(boxLines);
    }

    if (showCenter) {
      // 创建中心点几何体
      const sphereGeometry = new SphereGeometry(centerSize, 16, 16);
      const sphereMaterial = new MeshBasicMaterial({ color: centerColor });

      const centerSphere = new Mesh(sphereGeometry, sphereMaterial);
      centerSphere.position.copy(center);

      centerRef.current = centerSphere;
      groupRef.current.add(centerSphere);
    }
  };

  useEffect(() => {
    updateBoundingBox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    target,
    boxColor,
    centerColor,
    showBox,
    showCenter,
    centerSize,
    lineWidth,
  ]);

  // 注释掉实时更新，只在初始化时计算一次
  // useFrame(() => {
  //   if (target) {
  //     updateBoundingBox();
  //   }
  // });

  return <group ref={groupRef} />;
};

export default BoundingBoxHelper;
