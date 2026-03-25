/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 开发环境配置
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    host: true,
    cors: true,
  },
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
  // 指定开发环境入口文件
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
});
