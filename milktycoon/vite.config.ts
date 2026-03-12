import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/portfolio/milktycoon/',
  plugins: [react()],
  base: '/milktycoon/', // GitHub Pages 저장소 명칭과 일치하도록 설정
})
