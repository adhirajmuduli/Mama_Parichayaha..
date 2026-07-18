import { expect, test } from '@playwright/test'

test('exposes an accessible model-control fallback and keyboard surface', async ({
  page,
}, testInfo) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.locator('#research').scrollIntoViewIfNeeded()

  await expect(page.getByRole('group', { name: 'DNA model controls' })).toHaveCount(1)
  await expect(page.getByRole('group', { name: 'Bacteriophage model controls' })).toHaveCount(1)
  await expect(page.getByRole('group', { name: 'Tardigrade model controls' })).toHaveCount(1)

  const controls = page.getByRole('group', { name: 'Protein model controls' })
  await expect(controls).toBeVisible()
  await expect(controls).toContainText('Touch scrolling remains vertical by default')

  const rotateLeft = controls.getByRole('button', { name: 'Rotate model left' })

  if (['no-webgl', 'reduced-motion'].includes(testInfo.project.name)) {
    await expect(rotateLeft).toBeDisabled()
    await expect(controls.getByRole('status')).toContainText(
      'research content remains fully available',
    )
    return
  }

  if (testInfo.project.name === 'desktop') {
    await expect(rotateLeft).toBeEnabled()
    await controls.focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Home')
  }
})
