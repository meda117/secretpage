import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // تم التعديل هنا: يجب أن يكون المسار '/' فقط لأنك تستخدم دومين مخصص الآن
  base: '/', 
})