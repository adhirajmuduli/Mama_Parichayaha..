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
    exclude: ['tests/e2e/**'],
    pool: 'forks',
    fileParallelism: false,
    restoreMocks: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      exclude: ['src/test/**', '**/*.d.ts', 'src/runtime/diagnostics/**', 'src/lib/contact/**'],
      include: [
        'src/journey/**/*.{ts,tsx}',
        'src/runtime/**/*.{ts,tsx}',
        'src/exhibits/**/*.{ts,tsx}',
        'src/content/projection.ts',
        'src/content/validate.ts',
      ],
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: {
        branches: 80,
        lines: 85,
        statements: 85,
      },
    },
  },
})
