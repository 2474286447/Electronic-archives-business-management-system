import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  return {
    appType: 'spa',
    plugins: [react()],
    root: '.',
    server: {
      port: 3100,
      host: true,
      open: false,
      proxy: {
        '/__face_models_proxy__': {
          target: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__face_models_proxy__/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: 'index.html'
      }
    }
  }
})
