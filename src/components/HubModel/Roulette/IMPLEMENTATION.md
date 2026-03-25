# Chart.js 饼图轮盘实现说明

## 概述

本文档说明了如何使用Chart.js实现饼图轮盘功能，替代原有的CSS轮盘实现。

## 实现方案

### 1. 核心依赖

- `chart.js` - 图表库，提供环形图功能
- `@emotion/styled` - 样式组件
- `jotai` - 状态管理

### 2. 主要组件

#### ChartRoulette.tsx

基于Chart.js的饼图轮盘组件，主要特性：

- 使用Chart.js的PieController创建饼图
- 支持2-4个选项的动态布局
  - 二宫格：正左边与正右边
  - 三宫格：正上方、左下方、右下方
  - 四宫格：正上、正右、正下、正左
- 悬停和选中状态的高亮效果
- 平滑的动画过渡
- 响应式设计

#### 关键实现点

1. **Chart.js注册**

```typescript
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  ChartOptions,
  ChartData,
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend, PieController);
```

2. **图表初始化**

```typescript
useEffect(() => {
  if (canvasRef.current && !chartRef.current) {
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      chartRef.current = new ChartJS(ctx, {
        type: 'pie',
        data: getChartData(),
        options: getChartOptions(),
      });
    }
  }
}, []);
```

3. **交互处理**

```typescript
onClick: (event, elements) => {
  if (elements.length > 0) {
    const index = elements[0].index;
    const option = finalOptions[index];
    if (option) {
      handleClick(option.id)();
    }
  }
},
onHover: (event, elements) => {
  if (elements.length > 0) {
    const index = elements[0].index;
    const option = finalOptions[index];
    if (option) {
      setHoveredId(option.id);
    }
  } else {
    setHoveredId(null);
  }
},
```

### 3. 样式特性

- 半透明背景和渐变色彩
- 悬停高亮效果
- 阴影和模糊效果
- 响应式布局
- 平滑动画过渡

### 4. 与原有实现的对比

| 特性     | 原有CSS轮盘 | Chart.js饼图轮盘 |
| -------- | ----------- | ---------------- |
| 实现方式 | CSS + DOM   | Chart.js Canvas  |
| 性能     | 中等        | 更好             |
| 动画效果 | 基础        | 丰富             |
| 交互体验 | 一般        | 优秀             |
| 维护性   | 复杂        | 简单             |
| 扩展性   | 有限        | 强大             |

## 使用方法

### 基本使用

```tsx
import ChartRoulette from './ChartRoulette';

<ChartRoulette
  onSelect={id => console.log('点击了:', id)}
  onClose={() => console.log('关闭轮盘')}
/>;
```

### 自定义选项

```tsx
const customOptions = [
  { id: 'option1', label: '选项1', icon: '/icon1.svg' },
  { id: 'option2', label: '选项2', icon: '/icon2.svg' },
];

<ChartRoulette
  options={customOptions}
  onSelect={handleSelect}
  onClose={handleClose}
/>;
```

## 技术优势

1. **更好的性能**: Chart.js使用Canvas渲染，性能优于DOM操作
2. **丰富的动画**: 内置动画系统，提供流畅的过渡效果
3. **交互友好**: 内置的点击和悬停事件处理
4. **易于维护**: 代码结构清晰，易于扩展和修改
5. **响应式**: 自动适应不同屏幕尺寸

## 注意事项

1. 确保项目中已安装`chart.js`依赖
2. 组件会自动处理图表的创建和销毁
3. 标签位置会根据选项数量自动调整
4. 支持2-4个选项，超出范围会使用默认布局

## 版本历史

### v1.0.0

- 初始版本
- 基于Chart.js实现
- 支持基本交互功能

**作者**: 刘君杰(liujunjie@pdstars.com)
