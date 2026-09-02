import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  // relative asset paths: the packaged Electron app loads dist/index.html via
  // file://, where a "/assets/..." absolute path resolves to the filesystem
  // root instead of the app's own dist folder and every asset 404s (blank window)
  base: './',
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
