import { defineConfig as viteDefineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig as vitestDefineConfig } from 'vitest/config'

// https://vite.dev/config/
export default viteDefineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
  },
})
