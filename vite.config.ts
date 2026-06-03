import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://8.129.36.219:8081/archives-admin'

  return {
    appType: 'spa',
    plugins: [react()],
    root: '.',
    server: {
      port: 3100,
      host: true,
      open: false,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          ws: true
        },
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
