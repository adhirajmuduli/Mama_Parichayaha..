import { expect, test } from '@playwright/test'

const chapters = [
  ['Origins', '#origins'],
  ['Interests', '#interests'],
  ['Research', '#research'],
  ['Computation', '#computation'],
  ['Future', '#future'],
] as const

test('serves the portfolio and its local application icon without failed asset responses', async ({
  page,
}, testInfo) => {
  const failedResponses: string[] = []
  const remoteSceneOrFontRequests: string[] = []
  const browserErrors: string[] = []

  page.on('request', (request) => {
    const resourceType = request.resourceType()
    const url = new URL(request.url())

    if (
      ['font', 'image', 'media', 'script', 'xhr', 'fetch'].includes(resourceType) &&
      url.origin !== 'http://127.0.0.1:3100' &&
      url.origin !== 'https://challenges.cloudflare.com'
    ) {
      remoteSceneOrFontRequests.push(request.url())
    }
  })

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
  await expect(page.locator('header')).toHaveCount(0)
  await expect(page.locator('footer')).toHaveCount(0)

  for (const [, href] of chapters) {
    await expect(page.locator(href)).toHaveCount(1)
  }

  if (testInfo.project.name !== 'mobile') {
    const progress = page.getByRole('navigation', { exact: true, name: 'Chapter progress' })

    for (const [label, href] of chapters) {
      await expect(
        progress.getByRole('link', { name: new RegExp(`^${label} \\(`) }),
      ).toHaveAttribute('href', href)
    }
  }

  const publications = page.getByRole('region', { name: 'No publications or talks listed' })
  await expect(publications).toContainText(
    'No publications, talks, or research articles are currently listed in this portfolio.',
  )

  const contact = page.getByRole('region', { name: 'Get in touch' })
  await expect(contact.getByRole('link', { name: 'Email Adhiraj' })).toHaveAttribute(
    'href',
    'mailto:adhiraj.muduli@niser.ac.in',
  )
  await expect(contact.getByRole('link', { name: /GitHub profile/ })).toHaveAttribute(
    'href',
    'https://github.com/adhirajmuduli',
  )
  await expect(contact.getByRole('link', { name: /ORCID record/ })).toHaveAttribute(
    'href',
    'https://orcid.org/0009-0005-5655-8120?lang=en',
  )

  const credits = page.getByRole('region', { name: 'Model and scientific-source attribution' })
  await expect(credits.getByRole('link', { name: 'DNA source on Sketchfab' })).toHaveAttribute(
    'href',
    'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
  )
  await expect(credits.getByRole('link', { name: 'RCSB PDB 1GFL' })).toHaveCount(0)

  if (testInfo.project.name === 'no-webgl') {
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.locator('[data-scene-enhancement="webgl"]')).toHaveCount(0)
  }

  const icon = await page.request.get('/icon.png')
  expect(icon.ok()).toBe(true)
  expect(icon.headers()['content-type']).toContain('image/png')
  expect(failedResponses).toEqual([])
  expect(remoteSceneOrFontRequests).toEqual([])
  expect(browserErrors).toEqual([])
})

test('renders complete chapter content without JavaScript or document chrome', async ({
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

  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { level: 1, name: 'Adhiraj Muduli' })).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('header')).toHaveCount(0)
  await expect(page.locator('footer')).toHaveCount(0)

  for (const [, href] of chapters) {
    await expect(page.locator(href)).toHaveCount(1)
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
