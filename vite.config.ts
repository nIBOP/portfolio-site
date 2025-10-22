import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/portfolio-site/', // пример: '/portfolio-site/'
  plugins: [react()],
})
