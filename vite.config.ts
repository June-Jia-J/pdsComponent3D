/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 开箱即用的 Vite 配置
export default defineConfig(({ command, mode }) => {
  const isDev = command === "serve";
  const isBuild = command === "build";
  const isTest = mode === "test";

  return {
    define: {
      "process.env": {
        ...process.env,
        NODE_ENV: isDev ? "development" : "production",
      },
      __DEV__: isDev,
      __BUILD__: isBuild,
      __TEST__: isTest,
    },
    plugins: [
      react(),
      // 只在构建时生成类型声明文件
      isBuild &&
        dts({
          insertTypesEntry: true,
          rollupTypes: true,
          logLevel: "info",
        }),
    ].filter(Boolean),

    // 预览服务器配置
    preview: {
      port: 4173,
      open: true,
      host: true,
    },

    // 公共资源目录
    publicDir: "public",

    // 路径解析
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@components": path.resolve(__dirname, "src/components"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@types": path.resolve(__dirname, "src/types"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@assets": path.resolve(__dirname, "public/assets"),
        "@models": path.resolve(__dirname, "public/Upload/Model"),
        "@atoms": path.resolve(__dirname, "src/atoms"),
      },
    },

    // 构建配置
    build: {
      // 库模式构建
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "PdsComponent3D",
        formats: ["es", "umd", "cjs"],
        fileName: (format) => `index.${format}.js`,
      },

      // 输出目录
      outDir: "dist",

      // 源码映射
      sourcemap: true,

      // 压缩配置 - 使用 esbuild 而不是 terser
      minify: "esbuild",

      // Rollup 配置
      rollupOptions: {
        // 将所有依赖打包到库中，不设置 external
        output: {
          // 输出文件配置
          assetFileNames: (assetInfo) => {
            if (/\.(css)$/.test(assetInfo.name)) {
              return `styles/[name].[ext]`;
            }
            return `assets/[name]-[hash].[ext]`;
          },

          // 代码分割 - 将 React 和 Three.js 分别打包
          // manualChunks: {
          //   "react-vendor": ["react", "react-dom"],
          //   "three-vendor": [
          //     "three",
          //     "@react-three/fiber",
          //     "@react-three/drei",
          //     "@react-three/cannon",
          //     "@react-three/postprocessing",
          //   ],
          //   "utils-vendor": ["leva"],
          // },
        },
      },

      // 构建优化
      target: "es2015",
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
    },

    // CSS 配置
    css: {
      devSourcemap: true,
    },

    // 优化配置 - 预构建所有依赖
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@react-three/fiber",
        "@react-three/drei",
        "@react-three/cannon",
        "@react-three/postprocessing",
        "@react-spring/three",
        "gsap",
        "three",
        "leva",
      ],
    },
  };
});
