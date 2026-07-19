import { expect, test } from '@playwright/test'

test('recovers to semantic content after a WebGL context loss', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'The forced context-loss path is captured once with deterministic software WebGL.',
  )

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const canvas = page.locator('canvas')
  await expect(canvas).toHaveCount(1)
  await canvas.evaluate((element) => {
    element.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
  })

  await expect(page.locator('[data-scene-enhancement="webgl"]')).toHaveCount(0)
  await expect(
    page.getByText('The interactive 3D scene was stopped after graphics context loss.'),
  ).toBeVisible()
  await expect(page.locator('#origins')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Get in touch' })).toBeVisible()
})
