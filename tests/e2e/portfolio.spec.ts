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
    '#origins',
  )
  await expect(page.getByRole('heading', { level: 1, name: 'Adhiraj Muduli' })).toBeVisible()

  const chapters = [
    ['Origins', '#origins'],
    ['Interests', '#interests'],
    ['Research', '#research'],
    ['Computation', '#computation'],
    ['Future', '#future'],
  ] as const

  if (testInfo.project.name === 'mobile') {
    const menuTrigger = page.getByRole('button', { name: 'Menu' })
    await expect(menuTrigger).toBeVisible()
    await menuTrigger.click()

    const menu = page.getByRole('dialog', { name: 'Chapter navigation' })
    await expect(menu).toBeVisible()

    for (const [label, href] of chapters) {
      await expect(menu.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }

    await page.keyboard.press('Escape')
    await expect(menu).not.toBeVisible()
    await expect(menuTrigger).toBeFocused()
  } else {
    const navigation = page.getByRole('navigation', { exact: true, name: 'Chapter navigation' })

    for (const [label, href] of chapters) {
      await expect(navigation.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  }

  if (testInfo.project.name !== 'mobile') {
    const progress = page.getByRole('navigation', { exact: true, name: 'Chapter progress' })

    for (const [label, href] of chapters) {
      await expect(
        progress.getByRole('link', { name: new RegExp(`^${label} \\(`) }),
      ).toHaveAttribute('href', href)
    }
  }

  const footerNavigation = page.getByRole('navigation', {
    exact: true,
    name: 'Footer chapter navigation',
  })

  for (const [label, href] of chapters) {
    await expect(footerNavigation.getByRole('link', { name: label })).toHaveAttribute('href', href)
  }

  if (testInfo.project.name === 'no-webgl') {
    await expect(page.locator('canvas')).toHaveCount(0)
  }

  const icon = await page.request.get('/icon.png')
  expect(icon.ok()).toBe(true)
  expect(icon.headers()['content-type']).toContain('image/png')
  expect(failedResponses).toEqual([])
  expect(browserErrors).toEqual([])
})

test('serves complete chapter content and navigation without JavaScript', async ({
  browser,
}, testInfo) => {
  test.skip(
    !['desktop', 'mobile'].includes(testInfo.project.name),
    'Covered once per viewport class.',
  )

  const isMobile = testInfo.project.name === 'mobile'
  const context = await browser.newContext({
    isMobile,
    javaScriptEnabled: false,
    viewport: isMobile ? { height: 844, width: 390 } : { height: 720, width: 1280 },
  })
  const page = await context.newPage()

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'Adhiraj Muduli' })).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)

  const navigation = page.getByRole('navigation', { exact: true, name: 'Chapter navigation' })

  for (const [label, href] of [
    ['Origins', '#origins'],
    ['Interests', '#interests'],
    ['Research', '#research'],
    ['Computation', '#computation'],
    ['Future', '#future'],
  ] as const) {
    await expect(navigation.getByRole('link', { name: label })).toHaveAttribute('href', href)
  }

  await context.close()
})

test('renders a recovery route for unknown paths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Route recovery is viewport independent.')

  const response = await page.goto('/missing-portfolio-route', { waitUntil: 'networkidle' })

  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { level: 1, name: 'This page is not part of the portfolio.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return to origins' })).toHaveAttribute(
    'href',
    '/#origins',
  )
})
