import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/digitalvalue-api': {
        target: 'https://public.digitalvalue.es',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/digitalvalue-api/, ''),
      }
    }
  }
})
