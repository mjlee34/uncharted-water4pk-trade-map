import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/uncharted-water4pk-trade-map/',
  plugins: [react()],
})
