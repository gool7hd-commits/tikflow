import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:21420',
        changeOrigin: true
      },
      '/overlay': {
        target: 'http://localhost:21420',
        changeOrigin: true
      },
      '/media': {
        target: 'http://localhost:21420',
        changeOrigin: true
      },
      '/default-sounds': {
        target: 'http://localhost:21420',
        changeOrigin: true
      },
      '/ws-overlay': {
        target: 'ws://localhost:21420',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
