import { defineConfig as viteDefineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default viteDefineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    coverage: {
      provider: 'v8'
    },
  },
})
