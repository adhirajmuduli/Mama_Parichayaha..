import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Exhibit contract (new_plan.md §10, §12.7, P11): labeled panels, automatic
 * playback (the redundant pause/restart controls are gone), reduced-motion
 * static frames, the full-bleed spiral with real repository tiles, the
 * lanyard fallbacks, and the ≤2-active-window discipline.
 */

const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'
const isReducedMotion = (testInfo: TestInfo) => testInfo.project.name === 'reduced-motion'
const isDesktop = (testInfo: TestInfo) => testInfo.project.name === 'desktop'

async function waitForSettled(page: import('@playwright/test').Page, chapterId: string) {
  await expect(page.locator(`#${chapterId}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })
}

test('renders labeled panels with mock sources and automatic playback', async ({
  page,
}, testInfo) => {
  test.skip(!isScripted(testInfo), 'the exhibit engine requires JavaScript')
  test.skip(isReducedMotion(testInfo), 'reduced motion renders static panels; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('2')
  await waitForSettled(page, 'interests')

  const panel = page.locator('#interests .ascii-panel')

  await expect(panel).toHaveAttribute('role', 'img')
  await expect(panel).toHaveAttribute('data-placeholder', 'false')
  await expect(panel).toHaveAttribute('data-mock', 'true')
  await expect(panel).not.toHaveAttribute('data-ascii-state', 'idle')

  // P11: no user controls anywhere — playback is automatic.
  await expect(page.locator('[data-animation-controls]')).toHaveCount(0)

  // The mock source animates on its own: two samples differ over time.
  const frame = panel.locator('pre')
  const first = await frame.textContent()

  await page.waitForTimeout(600)

  const second = await frame.textContent()

  expect(first?.length ?? 0).toBeGreaterThan(0)
  expect(second).not.toBe(first)

  // The grid stays stable across samples.
  const lines = (second ?? '').split('\n')

  expect(lines.length).toBeGreaterThan(0)
  lines.forEach((line) => expect(line.length).toBeGreaterThan(0))
})

test('renders static panels under reduced motion', async ({ page }, testInfo) => {
  test.skip(!isReducedMotion(testInfo), 'reduced-motion playback is project-gated')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('2')
  await waitForSettled(page, 'interests')

  const panel = page.locator('#interests .ascii-panel')

  await expect(panel).toHaveAttribute('role', 'img')

  const frame = panel.locator('pre')
  const first = await frame.textContent()

  await page.waitForTimeout(600)

  // Static: the frame never advances under reduced motion.
  expect(await frame.textContent()).toBe(first)
  expect(first?.length ?? 0).toBeGreaterThan(0)
})

test('caps the active window at two panels', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the window discipline requires the runtime')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.mouse.move(640, 360)

  const activeCounts: number[] = []

  const sample = () =>
    page
      .locator('.ascii-panel[data-ascii-state="active"]')
      .count()
      .then((count) => {
        activeCounts.push(count)
      })

  await sample()

  // Deterministic-cadence burst (see journey.spec.ts): one clamped fling.
  await page.evaluate(() => {
    const target =
      document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2) ?? document.body

    for (let event = 0; event < 4; event += 1) {
      target.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 600, deltaMode: 0, cancelable: true, bubbles: true }),
      )
    }
  })

  await sample()
  await waitForSettled(page, 'interests')
  await sample()

  expect(Math.max(...activeCounts)).toBeLessThanOrEqual(2)
})

test('mounts the lanyard island on capable desktops', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo), 'the lanyard island is a desktop-pointer surface')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  // The lazy three.js chunk loads only for the origins slot.
  await expect(page.locator('[data-lanyard]')).toBeAttached({ timeout: 20_000 })

  const slot = page.locator('#origins .stage-card__visual-slot')

  await expect(slot).toHaveAttribute('data-visual-kind', 'lanyard')
  await expect(slot.locator('figure')).toHaveAttribute('role', 'img')
})

test('falls back to the static portrait card on mobile and reduced motion', async ({
  page,
}, testInfo) => {
  test.skip(!isScripted(testInfo), 'fallbacks are rendered client-side')
  test.skip(isDesktop(testInfo), 'desktop mounts the island; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await expect(page.locator('[data-lanyard]')).toHaveCount(0)
  await expect(page.locator('#origins .lanyard-fallback')).toBeVisible()
})

test('renders the full-bleed spiral with real repository tiles', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the spiral requires the runtime')
  test.skip(isReducedMotion(testInfo), 'reduced motion renders the static fan; see below')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('3')
  await waitForSettled(page, 'research')

  const spiralStage = page.locator('#research .spiral-stage')

  await expect(spiralStage).toBeAttached()

  const animatedTiles = spiralStage.locator('.spiral__tile')

  expect(await animatedTiles.count()).toBeGreaterThan(0)

  const first = animatedTiles.first()

  await expect(first).toHaveAttribute('href', /github\.com/)

  const gradientVars = await first.evaluate((node) => {
    const anchor = node as HTMLAnchorElement

    return {
      from: anchor.style.getPropertyValue('--tile-gradient-from'),
      to: anchor.style.getPropertyValue('--tile-gradient-to'),
    }
  })

  expect(gradientVars.from).toMatch(/^#/)
  expect(gradientVars.to).toMatch(/^#/)

  // The screen-reader list mirrors every tile link.
  const srLinks = spiralStage.locator('.spiral__sr-list a')

  expect(await srLinks.count()).toBe(await animatedTiles.count())
})

test('renders the static spiral fan under reduced motion', async ({ page }, testInfo) => {
  test.skip(!isReducedMotion(testInfo), 'the static fan is project-gated')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('3')
  await waitForSettled(page, 'research')

  await expect(page.locator('#research .spiral-stage')).toHaveAttribute(
    'data-spiral-state',
    'static',
  )

  const tiles = page.locator('#research .spiral__tile')

  expect(await tiles.count()).toBeGreaterThan(0)
})
