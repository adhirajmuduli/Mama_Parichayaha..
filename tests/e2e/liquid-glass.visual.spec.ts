import { expect, test } from '@playwright/test'

test('keeps default, fallback, and reduced-motion glass states visually stable', async ({
  page,
}, testInfo) => {
  await page.goto('/lab/liquid-glass', { waitUntil: 'networkidle' })

  await expect(page).toHaveScreenshot(`liquid-glass-${testInfo.project.name}.png`, {
    animations: 'disabled',
    caret: 'hide',
    fullPage: true,
    maxDiffPixelRatio: 0.035,
    timeout: 30_000,
  })
})

test('keeps the keyboard focus surface visually stable', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'The shared focus treatment is viewport independent.',
  )

  await page.goto('/lab/liquid-glass', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Focusable action' }).focus()

  await expect(page).toHaveScreenshot('liquid-glass-focus.png', {
    animations: 'disabled',
    caret: 'hide',
    fullPage: true,
    maxDiffPixelRatio: 0.035,
    timeout: 30_000,
  })
})

test('keeps the fine-pointer specular state visually stable', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'Pointer tracking is intentionally disabled elsewhere.',
  )

  await page.goto('/lab/liquid-glass', { waitUntil: 'networkidle' })
  await page.locator('[data-glass-state="default"]').hover({ position: { x: 36, y: 36 } })

  await expect(page).toHaveScreenshot('liquid-glass-hover.png', {
    animations: 'disabled',
    caret: 'hide',
    fullPage: true,
    maxDiffPixelRatio: 0.035,
    timeout: 30_000,
  })
})
