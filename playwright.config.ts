import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './tests/e2e',
  // Cold-start insurance: loaded CI machines (and Hyper-V guests) have
  // shown 10x slowdowns; heavy specs do several 20s polls plus lazy chunks.
  timeout: 180_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // Retries absorb OS scheduling noise on shared dev boxes (a CPU-starved
  // renderer shows sporadic multi-second "long tasks" that are not the
  // page's fault — measured: 2 tasks/140 ms max on a quiet box vs 350/5.1 s
  // while starved). The assertions themselves are unchanged and strict: a
  // deterministic regression (e.g. the pre-fix 60 fps render loop that
  // produced 1,350 long tasks up to 3.8 s) fails every retry.
  retries: 2,
  ...(process.env.CI ? { workers: 1 } : {}),
  outputDir: 'test-results',
  preserveOutput: 'always',
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL,
    browserName: 'chromium',
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
