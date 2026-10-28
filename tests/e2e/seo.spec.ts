import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Canonical metadata is env-driven (NEXT_PUBLIC_SITE_URL; no production
 * origin literal in the repo — deploy secret scanners flag those). Local
 * e2e runs resolve the documented fallback origin.
 */

const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'

const expectedOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

test('serves canonical metadata, structured data, and public discovery routes', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveTitle('Adhiraj Muduli | Biological Sciences')
  // Next normalizes the root canonical without a trailing slash.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${expectedOrigin}`)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    new RegExp(
      `^${expectedOrigin.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}/opengraph-image\\?[a-f0-9]+$`,
    ),
  )

  const structuredData = await page.locator('script[type="application/ld+json"]').textContent()
  const entries = JSON.parse(structuredData ?? '[]') as Array<{ '@type': string }>
  expect(entries.map((entry) => entry['@type'])).toEqual(['Person', 'WebSite'])

  // In immersive mode only the settled chapter is a11y-visible, so these
  // are DOM-presence assertions (server-rendered anchors); the no-js boot
  // spec covers their visible document-mode behavior.
  const privacyLink = page.locator('#contact a[href="/privacy"]')

  await expect(privacyLink).toHaveText('Privacy details')
  await expect(page.locator('#contact a[href="/credits"]')).toHaveText('Credits')
})

test('serves privacy, credits, robots, sitemap, manifest, and social-image routes', async ({
  page,
}, testInfo) => {
  test.skip(!isScripted(testInfo), 'route discovery mirrors the scripted runtime env')

  await page.goto('/privacy')
  await expect(page.getByRole('heading', { name: 'Contact and processing notice' })).toBeVisible()

  await page.goto('/credits')
  await expect(
    page.getByRole('heading', { name: 'Model and scientific-source attribution' }),
  ).toBeVisible()

  const [robots, sitemap, manifest, socialImage] = await Promise.all([
    page.request.get('/robots.txt'),
    page.request.get('/sitemap.xml'),
    page.request.get('/manifest.webmanifest'),
    page.request.get('/opengraph-image'),
  ])

  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(`Sitemap: ${expectedOrigin}/sitemap.xml`)
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).toContain(`${expectedOrigin}/privacy`)
  expect(manifest.status()).toBe(200)
  expect((await manifest.json()) as { name: string }).toMatchObject({
    name: 'Adhiraj Muduli | Biological Sciences',
  })
  expect(socialImage.status()).toBe(200)
  expect(socialImage.headers()['content-type']).toContain('image/png')
})
