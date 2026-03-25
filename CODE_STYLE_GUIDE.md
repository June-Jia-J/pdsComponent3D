# 代码格式化规范指南

本项目采用统一的代码格式化规范，确保代码风格一致性和可读性。

## 工具配置

### Prettier 配置

- **配置文件**: `.prettierrc.json`
- **忽略文件**: `.prettierignore`

### ESLint 配置

- **配置文件**: `eslint.config.js`
- **集成**: ESLint + Prettier 集成，自动修复格式问题

### VSCode 配置

- **工作区设置**: `.vscode/settings.json`
- **推荐扩展**: `.vscode/extensions.json`

## 格式化规则

### 基本规则

- **分号**: 使用分号 (`;`)
- **引号**: 单引号 (`'`) 用于字符串，JSX 中使用单引号
- **缩进**: 2个空格
- **行宽**: 80字符
- **尾随逗号**: ES5语法支持的地方使用
- **箭头函数**: 单参数时省略括号
- **行尾**: LF (`\n`)

### TypeScript/JavaScript 规则

- 优先使用 `const` 和 `let`，禁用 `var`
- 未使用的变量以 `_` 开头
- React 组件不需要显式导入 React
- 自动组织导入语句

## 使用方法

### 命令行工具

```bash
# 格式化 src 目录下的所有文件
pnpm format

# 检查格式化（不修改文件）
pnpm format:check

# 格式化所有文件（包括配置文件）
pnpm format:all

# 运行 ESLint 检查
pnpm lint

# 运行 ESLint 并自动修复
pnpm lint:fix

# 综合代码风格检查和修复
pnpm code-style

# 综合代码风格检查（不修改）
pnpm code-style:check
```

### VSCode 集成

安装推荐扩展后，VSCode 将自动：

- 保存时格式化代码
- 粘贴时格式化代码
- 显示 ESLint 错误和警告
- 自动修复可修复的问题
- 组织导入语句

### Git Hooks（推荐）

可以添加 pre-commit hook 确保提交的代码符合规范：

```bash
# 安装 husky 和 lint-staged
pnpm add -D husky lint-staged

# 配置 package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

## 文件类型支持

- **TypeScript**: `.ts`, `.tsx`
- **JavaScript**: `.js`, `.jsx`
- **样式文件**: `.css`, `.scss`, `.less`
- **配置文件**: `.json`, `.jsonc`
- **文档文件**: `.md`
- **HTML**: `.html`

## 忽略规则

以下文件和目录会被格式化工具忽略：

- `node_modules/`
- `dist/`、`build/`
- 配置文件 (`*.config.js`, `*.config.ts`)
- 生成的文件 (`*.d.ts`)
- 测试报告和缓存目录

## 自定义规则

如需修改格式化规则，请编辑：

- `.prettierrc.json` - Prettier 规则
- `eslint.config.js` - ESLint 规则
- `.vscode/settings.json` - VSCode 编辑器设置

## 故障排除

### 常见问题

1. **格式化不生效**
   - 确保安装了 Prettier 和 ESLint 扩展
   - 检查 VSCode 设置中的默认格式化工具
   - 重启 VSCode

2. **ESLint 错误**
   - 运行 `pnpm lint:fix` 自动修复
   - 检查 `eslint.config.js` 配置

3. **格式化冲突**
   - Prettier 和 ESLint 已配置为协同工作
   - 如有冲突，Prettier 规则优先

---

## 修订历史

| 版本 | 日期       | 作者                          | 说明                         |
| ---- | ---------- | ----------------------------- | ---------------------------- |
| v1   | 2024-01-XX | 刘君杰(liujunjie@pdstars.com) | 初始版本，配置基础格式化规则 |
