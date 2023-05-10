import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    commonjsOptions: {
      include: ["tailwind.config.js", "node_modules/**"],
    },
  },
  optimizeDeps: {
    include: ["tailwind-config"],
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ["FormLabel", "Input"].includes(tag),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "tailwind-config": path.resolve(__dirname, "./tailwind.config.js"),
    },
  },
  // 백엔드와 연결
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      //"/q-api": "http://192.168.0.250:3000",
    },
  },
});
