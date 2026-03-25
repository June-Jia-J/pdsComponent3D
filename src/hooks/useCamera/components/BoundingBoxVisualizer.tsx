import { Line } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

// 绘制包围盒的组件
function BoundingBoxVisualizer({ box }: { box: Box3 | null }) {
  if (!box) return null;

  // 计算包围盒的8个顶点
  const min = box.min;
  const max = box.max;

  const points = [
    [min.x, min.y, min.z], // 0
    [max.x, min.y, min.z], // 1
    [max.x, min.y, max.z], // 2
    [min.x, min.y, max.z], // 3
    [min.x, max.y, min.z], // 4
    [max.x, max.y, min.z], // 5
    [max.x, max.y, max.z], // 6
    [min.x, max.y, max.z], // 7
  ];

  // 定义连接顶点的线段
  const lines = [
    // 底面
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    // 顶面
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    // 连接底面和顶面的线
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  // 将线段转换为drei的Line组件可以使用的格式
  const linePoints = lines
    .map(([a, b]) => [new Vector3(...points[a]), new Vector3(...points[b])])
    .flat();

  return <Line points={linePoints} color='yellow' lineWidth={2} />;
}

export default BoundingBoxVisualizer;
