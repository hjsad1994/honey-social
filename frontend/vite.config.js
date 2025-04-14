import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // get rid of CORS error
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Địa chỉ backend của bạn
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
