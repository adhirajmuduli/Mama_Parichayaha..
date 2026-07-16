import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const config = [
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'docs/evidence/**',
      'node_modules/**',
      'playwright-report/**',
      'public/models/**',
      'test-results/**',
    ],
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'prettier'],
  }),
]

export default config
