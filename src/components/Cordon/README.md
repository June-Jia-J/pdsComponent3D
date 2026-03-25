# 警戒线组件 (Cordon)

## 功能描述

警戒线组件用于在3D场景中为指定区域模型绘制警戒线。组件会根据模型的包围盒自动计算警戒线位置，并在模型周围绘制多层黄色警戒线。

## 特性

- 🎯 自动计算模型包围盒
- 🚧 绘制多层警戒线
- 🎨 可自定义颜色、宽度、间距
- 📏 支持指定警戒线距离
- 🔍 支持按模型名称查找
- ⚡ 实时更新（模型移动时）

## 基本用法

### 在GLTFViewer中使用

```tsx
import GLTFViewer from '@/components/GLTFViewer';

const App = () => {
  return (
    <GLTFViewer
      modelList={modelList}
      cordonConfig={{
        enabled: true,
        areaModelNames: ['GIS_103_DS_LOD2003', 'GIS_103_CT_LOD2003'], // 区域模型名称数组
        distance: 2, // 警戒线距离模型边缘的距离
        color: 'rgba(251, 255, 44, 1)', // 警戒线颜色
        lineWidth: 2, // 警戒线宽度
        lineCount: 10, // 警戒线行数
        lineSpacing: 0.3, // 警戒线间距
        cornerRadius: 0.5, // 拐角弧度半径
        visible: true, // 是否可见
        entryPoint: [0, 1, 0], // 进入点位置 [x, y, z]
        alertColor: 'rgba(255, 0, 0, 1)', // 红色警戒颜色
      }}
    />
  );
};
```

### 独立使用

```tsx
import Cordon from '@/components/Cordon';

const MyScene = () => {
  return (
    <Canvas>
      {/* 其他3D内容 */}

      <Cordon
        areaModelNames={['GIS_103_DS_LOD2003', 'GIS_103_CT_LOD2003']}
        distance={2}
        color='rgba(251, 255, 44, 1)'
        lineWidth={2}
        lineCount={10}
        lineSpacing={0.3}
        cornerRadius={0.5}
        visible={true}
        entryPoint={[0, 1, 0]}
        alertColor='rgba(255, 0, 0, 1)'
        scene={sceneObject}
      />
    </Canvas>
  );
};
```

## 属性说明

| 属性             | 类型                       | 默认值                    | 说明                               |
| ---------------- | -------------------------- | ------------------------- | ---------------------------------- |
| `areaModelNames` | `string[]`                 | -                         | 区域模型名称数组，用于查找目标模型 |
| `distance`       | `number`                   | `2`                       | 警戒线距离模型边缘的距离           |
| `color`          | `string`                   | `"rgba(251, 255, 44, 1)"` | 警戒线颜色                         |
| `lineWidth`      | `number`                   | `2`                       | 警戒线宽度                         |
| `lineCount`      | `number`                   | `10`                      | 警戒线行数                         |
| `lineSpacing`    | `number`                   | `0.3`                     | 警戒线间距                         |
| `cornerRadius`   | `number`                   | `0.5`                     | 拐角弧度半径                       |
| `visible`        | `boolean`                  | `true`                    | 是否可见                           |
| `entryPoint`     | `[number, number, number]` | -                         | 进入点位置，用于动态颜色渐变       |
| `alertColor`     | `string`                   | `"rgba(255, 0, 0, 1)"`    | 红色警戒颜色                       |
| `scene`          | `Object3D`                 | -                         | 场景对象，用于查找模型             |

## 工作原理

1. **模型查找**: 组件会根据`areaModelNames`数组在场景中查找对应的所有模型
2. **包围盒合并**: 使用Three.js的`Box3.union()`方法将所有模型的包围盒合并计算出一个总的包围盒
3. **警戒线生成**: 根据合并后的包围盒和配置参数生成多层警戒线
4. **实时更新**: 当模型移动时，警戒线会自动更新位置

## 警戒线结构

组件会生成以下类型的警戒线：

- **水平警戒线**: 在XZ平面上绘制圆角矩形轮廓，拐角处有平滑的弧度
- **垂直警戒线**: 连接不同高度的水平线，形成立体效果

## 动态颜色渐变

当设置了 `entryPoint` 时，警戒线会根据距离进入点的远近动态改变颜色：

- **靠近进入点**: 显示红色（`alertColor`）
- **远离进入点**: 显示黄色（`color`）
- **渐变过渡**: 在影响半径内平滑过渡
- **影响半径**: 默认为警戒线宽度的30%

## 注意事项

1. 确保`areaModelNames`数组中的名称与场景中的模型名称完全匹配
2. 如果找不到指定模型，组件会在控制台输出警告信息
3. 警戒线会自动适应所有模型的尺寸和位置变化
4. 组件会自动清理资源，避免内存泄漏
5. 多个模型的包围盒会被合并计算，形成一个包含所有模型的警戒区域

## 示例效果

警戒线会在所有指定模型周围形成一个黄色的立体警戒区域，提醒用户注意安全距离。多个模型的包围盒会被合并，形成一个统一的警戒区域。

## 修订历史

- **v1.0.0** - 刘君杰(liujunjie@pdstars.com) - 初始版本，实现基本警戒线功能
- **v1.1.0** - 刘君杰(liujunjie@pdstars.com) - 支持多个模型名称数组，合并计算包围盒
- **v1.2.0** - 刘君杰(liujunjie@pdstars.com) - 优化线段间距，添加圆角效果，提升视觉效果
- **v1.3.0** - 刘君杰(liujunjie@pdstars.com) - 添加动态颜色渐变功能，支持基于进入点的红色到黄色渐变
