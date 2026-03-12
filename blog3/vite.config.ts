import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 비트 설정 정보: https://vitejs.dev/config/
export default defineConfig({
  base: '/portfolio/blog3/',
  plugins: [react()],
})
