import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vite.dev/config/](https://vite.dev/config/)
export default defineConfig({
  plugins: [react()],
  // هذا هو السطر الذي ينقصك وبدونه لن يعمل الموقع على جيت هاب
  base: '/secretpage/', 
})
