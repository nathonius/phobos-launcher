import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    dedupe: ["@angular/core", "@angular/common", "@angular/platform-browser"],
  },
  plugins: [angular(), tailwindcss()],
});
