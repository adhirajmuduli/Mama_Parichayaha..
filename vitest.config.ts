import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const srcDirectory = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcDirectory,
    },
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      exclude: ['src/test/**', '**/*.d.ts'],
      include: ['src/hooks/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
    },
  },
})
