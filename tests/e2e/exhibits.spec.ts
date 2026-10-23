import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Exhibit contract (new_plan.md §10, §12.7, mock era): labeled panels,
 * working controls on capable devices, reduced-motion static frames,
 * the lanyard/spiral slot wiring, and the ≤2-active-window discipline.
 */

const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'
const isReducedMotion = (testInfo: TestInfo) => testInfo.project.name === 'reduced-motion'
const isDesktop = (testInfo: TestInfo) => testInfo.project.name === 'desktop'

async function waitForSettled(page: import('@playwright/test').Page, chapterId: string) {
  await expect(page.locator(`#${chapterId}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })
}

test('renders labeled panels with mock sources and working controls', async ({
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

  const controls = page.getByRole('group', { name: 'Bacteriophage animation controls' })

  await expect(controls).toBeVisible()

  const pauseButton = controls.getByRole('button', { name: 'Pause animation' })
  await expect(pauseButton).toBeEnabled()

  await expect(controls.getByRole('status')).toContainText('Animation playing.')

  // Pause freezes the frame; play resumes.
  await pauseButton.click()
  await expect(controls.getByRole('button', { name: 'Play animation' })).toBeEnabled()
  await expect(controls.getByRole('status')).toContainText('Animation paused.')

  await controls.getByRole('button', { name: 'Play animation' }).click()
  await expect(controls.getByRole('status')).toContainText('Animation playing.')

  // Restart rewinds to the first frame without breaking the grid.
  const frame = panel.locator('pre')

  await controls.getByRole('button', { name: 'Restart animation' }).click()

  const lines = (await frame.textContent())?.split('\n') ?? []

  expect(lines.length).toBeGreaterThan(0)
  lines.forEach((line) => expect(line.length).toBeGreaterThan(0))
})

test('renders static panels with explained controls under reduced motion', async ({
  page,
}, testInfo) => {
  test.skip(!isReducedMotion(testInfo), 'reduced-motion playback is project-gated')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('2')
  await waitForSettled(page, 'interests')

  const controls = page.getByRole('group', { name: 'Bacteriophage animation controls' })

  await expect(controls.getByRole('button', { name: /animation/ })).toBeDisabled()
  await expect(controls.getByRole('status')).toContainText(
    'interests content remains fully available',
  )

  // The static frame still renders the mock source's first frame.
  const frame = page.locator('#interests .ascii-panel pre')

  expect((await frame.textContent())?.length ?? 0).toBeGreaterThan(0)
})

test('caps the active window at two panels', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the window discipline requires the runtime')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  // At rest and in flight, no more than two panels may be active.
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

  // Deterministic-cadence burst (see journey.spec.ts): one magnetic fling.
  await page.evaluate(() => {
    const target =
      document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2) ?? document.body

    for (let event = 0; event < 12; event += 1) {
      target.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 600, deltaMode: 0, cancelable: true, bubbles: true }),
      )
    }
  })

  await sample()
  await waitForSettled(page, 'research')
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

test('renders the research spiral with real project links', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the spiral requires the runtime')
  test.skip(isReducedMotion(testInfo), 'reduced motion renders the static fan; see below')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('3')
  await waitForSettled(page, 'research')

  const spiral = page.locator('#research .spiral')

  await expect(spiral).toBeVisible()

  const animatedTiles = spiral.locator('.spiral__tile')

  expect(await animatedTiles.count()).toBeGreaterThan(0)

  // The screen-reader list mirrors every tile link.
  const srLinks = spiral.locator('.spiral__sr-list a')

  expect(await srLinks.count()).toBe(await animatedTiles.count())
})

test('renders the static spiral fan under reduced motion', async ({ page }, testInfo) => {
  test.skip(!isReducedMotion(testInfo), 'the static fan is project-gated')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('3')
  await waitForSettled(page, 'research')

  await expect(page.locator('#research .spiral')).toHaveAttribute('data-spiral-state', 'static')

  const tiles = page.locator('#research .spiral__tile')

  expect(await tiles.count()).toBeGreaterThan(0)
})
