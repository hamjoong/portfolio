import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 비트 설정 정보: https://vitejs.dev/config/
export default defineConfig({
  base: '/portfolio/blog3/',
  plugins: [react()],
  base: '/blog3/', // GitHub 레포지토리 이름과 일치시켜야 합니다.
})
