import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './tests/e2e',
  // Cold-start server + multi-settle flows (two 20s polls plus lazy chunks)
  // need more headroom than the default budget on first-run CI machines.
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  outputDir: 'test-results',
  preserveOutput: 'always',
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL,
    browserName: 'chromium',
    ...(process.env.CI ? {} : { channel: 'chrome' }),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--enable-webgl', '--use-angle=swiftshader'] },
      },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], contextOptions: { reducedMotion: 'reduce' } },
    },
    {
      // JS disabled: the SSR semantic document IS the product for these
      // visitors — no immersive boot, no client runtime (new_plan.md §12.1).
      name: 'no-js',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: { javaScriptEnabled: false },
      },
    },
  ],
  webServer: {
    command: 'npm run start:standalone -- --port 3100',
    url: baseURL,
    timeout: 120_000,
    // Playwright's convention: local runs reuse a warm standalone server
    // (fast iteration), CI always boots its own.
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
