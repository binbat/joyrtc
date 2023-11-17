import { defineConfig } from "vite";
import { resolve } from "path";
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "index.ts"),  // 配置入口文件路径
      name: "@joyrtc/webcomponents",
      fileName: "index",
      formats: ["es", "umd"], // 打包生成的格式
    },
  },
  plugins: [dts()]
});

