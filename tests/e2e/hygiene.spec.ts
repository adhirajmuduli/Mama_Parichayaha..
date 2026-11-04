import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Hygiene contract (new_plan.md §11.4, §17): zero model artifacts on any
 * route, zero third-party origins, clean caches — the network discipline
 * the GLB era broke.
 */

const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'

const ROUTES = ['/', '/contact', '/credits', '/privacy'] as const

for (const route of ROUTES) {
  test(`serves ${route} without any model artifacts`, async ({ page }, testInfo) => {
    test.skip(!isScripted(testInfo), 'no-js cannot fetch; the HTML itself is artifact-free')

    const artifactRequests: string[] = []

    page.on('request', (request) => {
      const url = request.url()

      if (url.includes('/models/') || url.endsWith('.glb') || url.endsWith('.gltf')) {
        artifactRequests.push(url)
      }
    })

    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)

    expect(artifactRequests).toEqual([])
  })
}

test('loads the immersive stage from first-party origins only', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'no-js issues no requests beyond the document')

  // page.url() is still "about:blank" while the FIRST request fires, so the
  // baseline must be the configured server origin — not the page's current
  // URL (whose origin is literally "null" pre-navigation).
  const firstPartyOrigin = new URL('http://127.0.0.1:3100').origin

  const thirdPartyOrigins = new Set<string>()

  page.on('request', (request) => {
    const origin = new URL(request.url()).origin

    if (origin !== firstPartyOrigin) {
      thirdPartyOrigins.add(origin)
    }
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Give lazy layers time to settle before auditing origins.
  await page.waitForTimeout(1_500)

  expect([...thirdPartyOrigins]).toEqual([])
})

test('ships zero diagnostics surface in production builds', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'no-js renders no overlay by construction')

  // The diagnostics overlay, its registry and window.__JOURNEY__ are dev-only
  // (FEATURES.diagnostics). The invariant is structural: a production build
  // must not mount the overlay or expose the global, so diagnostics can never
  // leak into a shipped page (new_plan.md §7.4: "zero production cost").
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#origins[data-card-state="settled"]', { timeout: 20_000 })
  await page.waitForTimeout(1_000)

  await expect(page.locator('[data-diagnostics]')).toHaveCount(0)

  const exposed = await page.evaluate(
    () => (window as unknown as Record<string, unknown>).__JOURNEY__ ?? null,
  )
  expect(exposed).toBeNull()
})
