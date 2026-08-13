import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:7160',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
