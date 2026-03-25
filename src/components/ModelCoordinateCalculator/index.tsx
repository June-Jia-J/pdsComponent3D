import { useFrame, useThree } from '@react-three/fiber';
import { useAtom } from 'jotai';
import {
  selectedMonitorModelAtom,
  modelScreenPositionAtom,
} from '@/atoms/selectModel';
import { useRef, useEffect } from 'react';
import { Box3, Vector3, Object3D } from 'three';

/**
 * 监控模型坐标计算器
 * 在Canvas内部独立运行，不依赖其他组件的渲染条件
 */
const ModelCoordinateCalculator: React.FC = () => {
  const selectedMonitorModel = useAtom(selectedMonitorModelAtom)[0];
  const [modelScreenPosition, setSelectedMonitorModelScreenPosition] = useAtom(
    modelScreenPositionAtom
  );

  const { camera, size: screenSize } = useThree();
  const lastModelRef = useRef<Object3D | null>(null);

  // 当监控模型变化时，清空之前的坐标
  useEffect(() => {
    if (!selectedMonitorModel) {
      setSelectedMonitorModelScreenPosition({ x: 0, y: 0 });
      lastModelRef.current = null;
    }
  }, [selectedMonitorModel, setSelectedMonitorModelScreenPosition]);

  // 每帧计算监控模型的屏幕坐标
  useFrame(() => {
    if (!selectedMonitorModel || !camera) {
      return;
    }

    // 检查模型是否发生变化
    if (lastModelRef.current !== selectedMonitorModel) {
      lastModelRef.current = selectedMonitorModel;
    }

    try {
      // 计算监控模型的包围盒和中心点
      const box = new Box3().setFromObject(selectedMonitorModel);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      const monitorCenter = [
        center.x,
        center.y,
        center.z + size.z / 2 + 0.1, // 加0.1米的偏移，防止贴得太近
      ];

      // 创建世界坐标向量
      const worldPosition = new Vector3(...monitorCenter);

      // 将世界坐标转换为标准化设备坐标 (NDC)
      const vector = worldPosition.project(camera);

      // 将 NDC 坐标转换为屏幕像素坐标
      const x = ((vector.x + 1) * screenSize.width) / 2;
      const y = ((-vector.y + 1) * screenSize.height) / 2;

      // 只在坐标变化时更新状态
      if (modelScreenPosition.x !== x || modelScreenPosition.y !== y) {
        setSelectedMonitorModelScreenPosition({ x, y });
      }
    } catch (error) {
      console.warn('监控模型屏幕坐标计算失败:', error);
      // 发生错误时重置坐标
      setSelectedMonitorModelScreenPosition({ x: 0, y: 0 });
    }
  });

  // 这个组件不渲染任何内容，只负责计算坐标
  return null;
};

export default ModelCoordinateCalculator;
