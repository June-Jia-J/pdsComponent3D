import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";

export default [
  // 全局忽略文件
  {
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "public/",
      "*.config.js",
      "*.config.ts",
      "vite.config.ts",
      "vite.dev.config.ts",
      "*.d.ts",
      "*.test.ts",
      "*.test.tsx",
      "*.spec.ts",
      "*.spec.tsx",
      "coverage/",
      ".nyc_output/",
      ".cache/",
      ".storybook/",
      "src/decal.tsx",
    ],
  },

  // JavaScript推荐规则
  js.configs.recommended,

  // 类型定义文件配置（不检查未使用变量）
  {
    files: ["**/types/**/*.{ts,tsx}", "**/*.d.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        React: "readonly",
        HTMLElement: "readonly",
        THREE: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
    },
  },

  // 主要TypeScript配置
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        React: "readonly",
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLImageElement: "readonly",
        OffscreenCanvas: "readonly",
        Image: "readonly",
        clearTimeout: "readonly",
        setTimeout: "readonly",
        NodeJS: "readonly",
        performance: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettier,
    },
    rules: {
      // Prettier规则
      "prettier/prettier": "error",

      // TypeScript规则
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      // React规则
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // 代码质量规则
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Prettier配置 - 禁用与Prettier冲突的ESLint规则
  prettierConfig,

  // React Hooks规则
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Storybook规则
  {
    files: ["**/*.stories.{ts,tsx}", "**/*.story.{ts,tsx}"],
    plugins: {
      storybook: storybook,
    },
    rules: {
      ...storybook.configs.recommended.rules,
    },
  },
];
