import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    proxy: {
      // Proxying API calls al backend C# (evita CORS in dev)
      '/api': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
