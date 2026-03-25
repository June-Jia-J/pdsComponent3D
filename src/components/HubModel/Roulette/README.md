# Chart.js 饼图轮盘组件

## 概述

这是一个基于Chart.js实现的饼图轮盘组件，用于替代原有的CSS轮盘实现。该组件提供了更好的交互体验和更丰富的视觉效果。

## 特性

- ✅ 基于Chart.js的饼图实现
- ✅ 支持2-4个选项的动态布局
  - 二宫格：正左边与正右边
  - 三宫格：正上方、左下方、右下方
  - 四宫格：正上、正右、正下、正左
- ✅ 悬停和选中状态的高亮效果
- ✅ 平滑的动画过渡
- ✅ 响应式设计
- ✅ 支持自定义图标和标签
- ✅ 中心关闭按钮

## 使用方法

### 基本使用

```tsx
import ChartRoulette from '@/components/HubModel/Roulette/ChartRoulette';

function App() {
  const handleRouletteClick = (id: string, model: any) => {
    console.log('点击了轮盘选项:', id, model);
  };

  const handleRouletteClose = () => {
    console.log('关闭轮盘');
  };

  return (
    <ChartRoulette
      onSelect={handleRouletteClick}
      onClose={handleRouletteClose}
    />
  );
}
```

### 自定义选项

```tsx
const customOptions = [
  {
    id: 'custom1',
    label: '自定义选项1',
    icon: '/path/to/icon1.svg',
  },
  {
    id: 'custom2',
    label: '自定义选项2',
    icon: '/path/to/icon2.svg',
  },
];

<ChartRoulette
  options={customOptions}
  onSelect={handleRouletteClick}
  onClose={handleRouletteClose}
/>;
```

## 默认选项

如果不提供自定义选项，组件会使用以下默认选项：

1. **监测数据** - 显示设备监测数据
2. **数据对比** - 进行数据对比分析
3. **设备信息** - 查看设备详细信息
4. **诊断结论** - 查看诊断结果

## 技术实现

### 核心依赖

- `chart.js` - 图表库
- `@emotion/styled` - 样式组件
- `jotai` - 状态管理

### 主要功能

1. **图表初始化**: 使用Chart.js创建环形图
2. **交互处理**: 处理点击和悬停事件
3. **状态管理**: 管理选中和悬停状态
4. **动画效果**: 提供平滑的过渡动画
5. **标签定位**: 动态计算标签位置

### 样式特性

- 半透明背景
- 渐变色彩效果
- 悬停高亮
- 阴影和模糊效果
- 响应式布局

## 与原有轮盘的对比

| 特性     | 原有CSS轮盘 | Chart.js轮盘    |
| -------- | ----------- | --------------- |
| 实现方式 | CSS + DOM   | Chart.js Canvas |
| 性能     | 中等        | 更好            |
| 动画效果 | 基础        | 丰富            |
| 交互体验 | 一般        | 优秀            |
| 维护性   | 复杂        | 简单            |
| 扩展性   | 有限        | 强大            |

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
