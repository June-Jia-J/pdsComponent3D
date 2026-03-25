# StatusPanel 设备状态面板组件

## 功能概述

StatusPanel 是一个用于在3D模型两侧显示设备状态信息的组件，支持在模型左边显示方形面板，右边显示圆形指示器。该组件完全可配置，无需Chart.js依赖。

## 主要特性

- **双布局支持**：左侧方形面板 + 右侧圆形指示器
- **完全可配置**：显示数量、内容、图标、颜色等均可自定义
- **交互响应**：支持悬停高亮、点击事件、状态管理
- **选中效果**：点击状态项显示绿色背景、蓝绿色字体、粗壮白色边框
- **响应式设计**：自动适应不同数量的状态项
- **样式统一**：与Roulette组件保持一致的视觉风格

## 组件结构

```
StatusPanel
├── 左侧方形面板 (StatusPanelContainer)
│   ├── 状态项1 (ItemContainer type="panel")
│   ├── 状态项2 (ItemContainer type="panel")
│   └── 状态项3 (ItemContainer type="panel")
├── 右侧圆形指示器 (StatusPanelContainer)
│   ├── 指示器1 (ItemContainer type="circle")
│   ├── 指示器2 (ItemContainer type="circle")
│   └── 指示器3 (ItemContainer type="circle")
└── 中央关闭按钮 (CloseButton)
```

## 接口定义

### StatusItem 接口

```typescript
interface StatusItem {
  id: string; // 唯一标识符
  label: string; // 显示标签
  value?: string; // 数值（可选）
  icon?: string; // 图标路径（可选）
  unit?: string; // 单位（可选）
  color?: string; // 自定义颜色（可选）
  type: 'panel' | 'circle'; // 类型：方形面板或圆形指示器
  onClick?: () => void; // 点击回调（可选）
}
```

### DeviceStatusPanelProps 接口

```typescript
interface DeviceStatusPanelProps {
  leftItems?: StatusItem[]; // 左侧方形面板项
  rightItems?: StatusItem[]; // 右侧圆形指示器项
  selectedId?: string; // 当前选中项ID
  onItemClick?: (id: string) => void; // 项点击回调
  onClose?: () => void; // 关闭回调
}
```

## 使用方法

### 基础用法

```tsx
import StatusPanel from '@/components/HubModel/StatusPanel';

// 在HubModel组件中使用
<StatusPanel
  onClose={() => {
    // 处理关闭逻辑
  }}
/>;
```

### 自定义配置

```tsx
// 通过globalData.app配置自定义项
globalData.app = {
  // ... 其他配置
  getStatusPanelLeftItems: selectedModel => [
    {
      id: 'custom1',
      label: '自定义指标1',
      value: '123',
      unit: '单位',
      icon: '/path/to/icon.svg',
      type: 'panel',
      color: '#FF0000',
    },
  ],
  getStatusPanelRightItems: selectedModel => [
    {
      id: 'custom2',
      label: '自定义指示器',
      value: '状态',
      icon: '/path/to/icon.svg',
      type: 'circle',
      color: '#00FF00',
    },
  ],
};
```

## 默认配置

### 左侧方形面板（默认）

1. **电池电压**
   - 标签：电池电压
   - 数值：3371
   - 单位：mV
   - 颜色：#00FF00（绿色）

2. **信号强度**
   - 标签：信号强度
   - 数值：-42
   - 单位：dBm
   - 颜色：#FFA500（橙色）

3. **信噪比**
   - 标签：信噪比
   - 数值：7
   - 单位：dB
   - 颜色：#00FF00（绿色）

### 右侧圆形指示器（默认）

1. **AE**
   - 标签：AE
   - 颜色：#10CECA（青色）

2. **TEV**
   - 标签：TEV
   - 颜色：#FFFFFF（白色）

3. **温度**
   - 标签：温度
   - 数值：35
   - 单位：°C
   - 颜色：#10CECA（青色）

## 样式定制

### 尺寸配置

```typescript
const containerWidth = 200; // 容器宽度
const itemSize = 60; // 单个项尺寸
const itemSpacing = 20; // 项间距
```

### 颜色主题

- **基础背景**：rgba(52, 56, 59, 0.9)
- **边框颜色**：rgba(255, 0, 0, 0.8)（默认红色）
- **悬停边框**：rgba(0, 160, 233, 0.8)（蓝色）
- **激活文字**：#10CECA（青色）
- **默认文字**：#FFFFFF（白色）

## 事件处理

### 内置事件

- **onStatusPanelClick**: 状态项点击事件
- **onStatusPanelClose**: 面板关闭事件

### 选中功能

- **默认选中**：AE状态项在组件加载时默认被选中
- **点击选中**：点击任意状态项会显示选中效果
- **取消选中**：再次点击已选中的状态项可以取消选中
- **视觉反馈**：选中状态包含以下视觉效果：
  - 绿色背景：rgba(34, 139, 34, 0.85)
  - 蓝绿色字体：#10CECA
  - 粗壮白色发光边框：4px solid rgba(255, 255, 255, 1)
  - 多层白色光晕效果
  - 轻微放大效果 (scale 1.02)
- **状态管理**：组件内部自动管理选中状态，关闭面板时自动清除

### 自定义事件

```typescript
// 在globalData.app中实现
onStatusPanelClick: (id: string, selectedModel: any) => {
  console.log('点击了状态项:', id, '模型:', selectedModel);
  // 处理点击逻辑
},

onStatusPanelClose: () => {
  console.log('关闭状态面板');
  // 处理关闭逻辑
}
```

## 性能优化

- 使用 `useCallback` 和 `useMemo` 优化渲染性能
- 状态变化时只更新必要的部分
- 延迟显示避免闪烁（300ms延迟）

## 兼容性

- React 16.8+
- TypeScript 4.0+
- Emotion styled-components
- Jotai 状态管理

## 版本历史

- **v1.0.0** - 初始版本，支持基础功能
- **作者**: jiajing(jiajing@pdstars.com)
- **创建时间**: 2025-01-27

## 注意事项

1. 确保图标文件路径正确，否则图标将不显示
2. 自定义配置会覆盖默认配置
3. 组件会自动处理不同数量项的布局
4. 关闭按钮位于中央，点击后清除选中模型
