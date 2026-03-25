# ESLint 配置说明

## 配置概述

本项目已配置了完整的 ESLint 规则，适用于 React + TypeScript 项目。

## 主要特性

- ✅ TypeScript 支持
- ✅ React 最佳实践
- ✅ React Hooks 规则
- ✅ 自动修复功能
- ✅ Storybook 集成
- ✅ 编辑器集成

## 使用方法

### 命令行使用

```bash
# 检查代码
pnpm lint

# 自动修复可修复的问题
pnpm lint:fix

# 静默检查（只显示错误）
pnpm lint:check
```

### 编辑器集成

在 VSCode 中，ESLint 会自动：

- 实时显示错误和警告
- 保存时自动修复
- 提供快速修复建议

## 主要规则

### TypeScript 规则

- 禁止使用`any`类型（警告）
- 未使用变量检查（错误）
- 允许下划线开头的未使用变量
- 非空断言检查（警告）

### React 规则

- 禁用`react/react-in-jsx-scope`（使用新的 JSX 转换）
- 禁用`react/prop-types`（使用 TypeScript 类型检查）
- React Hooks 规则检查

### 代码质量规则

- 强制使用`const`而不是`var`
- 控制台输出警告
- 自动修复格式问题

## 忽略文件

以下文件和目录会被 ESLint 忽略：

- `dist/` - 构建输出
- `node_modules/` - 依赖
- `*.config.js/ts` - 配置文件
- `*.d.ts` - 类型定义文件
- 测试文件

## 自定义规则

如需修改规则，请编辑`.eslintrc.json`文件中的`rules`部分。
