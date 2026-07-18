import { expect, test } from '@playwright/test'

test('exposes accessible controls only for active scene exhibits', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'networkidle' })

  const dnaControls = page.getByRole('group', { name: 'DNA model controls' })
  const phageControls = page.getByRole('group', { name: 'Bacteriophage model controls' })

  await expect(dnaControls).toHaveCount(1)
  await expect(phageControls).toHaveCount(1)
  await expect(page.getByRole('group', { name: 'Protein model controls' })).toHaveCount(0)
  await expect(page.getByRole('group', { name: 'Tardigrade model controls' })).toHaveCount(0)

  const rotateLeft = dnaControls.getByRole('button', { name: 'Rotate model left' })

  if (['no-webgl', 'reduced-motion'].includes(testInfo.project.name)) {
    await expect(rotateLeft).toBeDisabled()
    await expect(dnaControls.getByRole('status')).toContainText(
      'origins content remains fully available',
    )
    return
  }

  if (testInfo.project.name === 'desktop') {
    await expect(rotateLeft).toBeEnabled()
    await dnaControls.focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Home')
  }
})
