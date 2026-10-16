import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base relativo: serve tanto no GitHub Pages (/bullscash-dashboard-v2/) quanto local
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5179 },
})
