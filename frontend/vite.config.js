import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '.trycloudflare.com',
    ],
    proxy: {
      // Backend API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Backend health check
      '/hello': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // MinIO images + audio
      '/minio': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ''),
      },
    },
  },
})