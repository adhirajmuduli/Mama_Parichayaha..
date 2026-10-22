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
