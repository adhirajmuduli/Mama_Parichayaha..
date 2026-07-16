import { expect, test } from '@playwright/test'

test('serves the portfolio and its local application icon without failed asset responses', async ({
  page,
}, testInfo) => {
  const failedResponses: string[] = []
  const browserErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    browserErrors.push(error.message)
  })
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`)
    }
  })

  const documentResponse = await page.goto('/', { waitUntil: 'networkidle' })

  expect(documentResponse).not.toBeNull()
  expect(documentResponse?.headers()).toMatchObject({
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'same-origin',
    'permissions-policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  })

  await expect(page).toHaveTitle('Adhiraj Muduli | Biological Sciences')
  await expect(page.locator('main')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Skip to portfolio content' })).toHaveAttribute(
    'href',
    '#portfolio-content',
  )
  await expect(page.getByRole('heading', { level: 1, name: 'Adhiraj Muduli' })).toBeVisible()

  if (testInfo.project.name === 'no-webgl') {
    await expect(page.locator('canvas')).toHaveCount(0)
  }

  const icon = await page.request.get('/icon.png')
  expect(icon.ok()).toBe(true)
  expect(icon.headers()['content-type']).toContain('image/png')
  expect(failedResponses).toEqual([])
  expect(browserErrors).toEqual([])
})
