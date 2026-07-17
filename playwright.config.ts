import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
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
      use: { ...devices['Desktop Chrome'] },
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
      name: 'no-webgl',
      use: { ...devices['Desktop Chrome'], launchOptions: { args: ['--disable-webgl'] } },
    },
  ],
  webServer: {
    command: 'npm run start:standalone -- --port 3100',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
