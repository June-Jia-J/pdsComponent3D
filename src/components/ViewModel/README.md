# ViewModel 组件

## 概述

ViewModel 是一个基于 drei 的 View 组件实现的模型查看器，用于替代原有的 HubModel 组件。它提供了更好的性能和更现代的 API。

## 主要特性

- **基于 View 组件**: 使用 drei 的 View 组件替代 Hud 组件，提供更好的渲染性能
- **模型选择**: 支持选中模型和区域模型的显示
- **发光效果**: 为选中的模型添加蓝色发光效果
- **相机同步**: 副相机与主相机保持同步，提供更好的视角体验
- **交互功能**: 支持模型点击和轮盘菜单交互
- **屏幕坐标计算**: 自动计算模型在屏幕上的位置

## 组件接口

```typescript
interface ViewModelProps extends HubModelProps {
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

interface HubModelProps {
  ambientLightIntensity: number;
  enableShadows: boolean;
  directionalLightPosition: [number, number, number];
  directionalLightIntensity: number;
  hdrUrl: string;
  onClick: (model: ThreeEvent<globalThis.MouseEvent>, force?: boolean) => void;
}
```

## 使用方法

```tsx
import ViewModel from '@/components/ViewModel';

// 在 GLTFViewer 中使用
<ViewModel
  ambientLightIntensity={0.5}
  enableShadows={true}
  directionalLightPosition={[10, 10, 5]}
  directionalLightIntensity={1}
  hdrUrl='./assets/environment.hdr'
  onClick={(e, force) => {
    // 处理模型点击事件
    console.log('Model clicked:', e);
  }}
  // 新增的配置选项
  enableGlow={true}
  glowColor={0x0088ff}
  glowIntensity={1}
  enableRoulette={true}
  secondaryCameraDistance={12}
/>;
```

## 与 HubModel 的区别

1. **渲染方式**: 使用 View 组件替代 Hud 组件
2. **性能优化**: View 组件提供更好的渲染性能
3. **API 现代化**: 使用更现代的 drei API
4. **样式控制**: 通过 style 属性进行样式控制

## 依赖项

- @react-three/drei
- @react-three/fiber
- three
- jotai (状态管理)
- 其他相关组件: EnvirComponent, Roulette

## 版本历史

- **v1.0.0** - 刘君杰(liujunjie@pdstars.com) - 初始版本，基于 View 组件实现

## 注意事项

1. 确保在使用前已正确配置了相关的 atom 状态
2. 需要提供正确的环境贴图路径
3. 组件的显示依赖于 selectedModel 和 selectedAreaModel 状态
4. 发光效果会自动应用到选中的模型上
