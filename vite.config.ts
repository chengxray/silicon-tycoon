import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: false
  },
  build: {
    assetsDir: 'static',
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false
  }
});
