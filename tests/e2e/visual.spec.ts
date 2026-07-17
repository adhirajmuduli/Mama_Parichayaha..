import { expect, test } from '@playwright/test'

test('keeps the initial portfolio shell visually stable', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.locator('canvas').evaluateAll((canvases) => {
    canvases.forEach((canvas) => {
      canvas.style.visibility = 'hidden'
    })
  })

  await expect(page).toHaveScreenshot(`portfolio-${testInfo.project.name}.png`, {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.01,
    timeout: 30_000,
  })
})
