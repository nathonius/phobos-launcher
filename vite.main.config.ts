import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@aws-sdk/client-s3': './src/empty.ts',
    },
  },
});
