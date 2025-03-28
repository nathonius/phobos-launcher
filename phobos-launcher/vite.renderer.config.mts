import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config
export default defineConfig({
  resolve: { mainFields: ["module"] },
  plugins: [angular({ jit: false }), tailwindcss()],
});
