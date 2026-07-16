import { expect, test } from '@playwright/test'

test('serves the portfolio and its local application icon without failed asset responses', async ({
  page,
}) => {
  const failedResponses: string[] = []

  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`)
    }
  })

  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page).toHaveTitle('Adhiraj Muduli | Biological Sciences')
  await expect(page.locator('main')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Skip to portfolio content' })).toHaveAttribute(
    'href',
    '#portfolio-content',
  )
  await expect(page.getByRole('heading', { level: 1, name: 'Adhiraj Muduli' })).toBeVisible()

  const icon = await page.request.get('/icon.png')
  expect(icon.ok()).toBe(true)
  expect(icon.headers()['content-type']).toContain('image/png')
  expect(failedResponses).toEqual([])
})
