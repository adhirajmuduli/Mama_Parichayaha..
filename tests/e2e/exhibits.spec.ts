import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Exhibit contract: labeled multicolor artworks, automatic playback,
 * reduced-motion static frames, preserved project links, and the
 * ≤2-active-window discipline.
 */

const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'
const isReducedMotion = (testInfo: TestInfo) => testInfo.project.name === 'reduced-motion'
const isDesktop = (testInfo: TestInfo) => testInfo.project.name === 'desktop'

async function waitForSettled(page: import('@playwright/test').Page, chapterId: string) {
  await expect(page.locator(`#${chapterId}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })
}

test('renders labeled colored artwork with automatic playback', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the exhibit engine requires JavaScript')
  test.skip(isReducedMotion(testInfo), 'reduced motion renders static panels; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('2')
  await waitForSettled(page, 'interests')

  const panel = page.locator('#interests .ascii-panel')

  await expect(panel).toHaveAttribute('role', 'img')
  await expect(panel).toHaveAttribute('data-placeholder', 'false')
  await expect(panel).toHaveAttribute('data-mock', 'false')
  await expect(panel.locator('pre')).toHaveAttribute('data-art-colored', 'true')
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
    // Stage host, not the viewport center: the center can sit inside a card
    // scroll region (the copy claims the wheel — correct arbitration), which
    // would stall this travel-semantics check.
    const target =
      document.querySelector('.stage-root') ??
      document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2) ??
      document.body

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

test('renders the cellular artwork in the origins chapter', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo), 'the authored color-canvas check runs on desktop')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  const panel = page.locator('#origins .ascii-panel')
  await expect(panel).toHaveAttribute('role', 'img')
  await expect(panel).toHaveAttribute('data-placeholder', 'false')
  await expect(panel.locator('pre')).toHaveAttribute('data-art-colored', 'true')
  await expect(panel.locator('canvas')).toBeVisible()
})

test('renders a distinct colored artwork in every chapter', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo), 'the full artwork journey is checked on desktop')

  const chapterIds = [
    'origins',
    'interests',
    'research',
    'computation',
    'future',
    'publications',
    'contact',
  ]

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  for (let index = 0; index < chapterIds.length; index += 1) {
    const chapterId = chapterIds[index]
    if (!chapterId) continue

    if (index > 0) await page.keyboard.press('ArrowDown')
    await waitForSettled(page, chapterId)

    const panel = page.locator(`#${chapterId} .ascii-panel`)
    await expect(panel).toHaveAttribute('data-placeholder', 'false')
    await expect(panel.locator('pre')).toHaveAttribute('data-art-colored', 'true')

    const colors = await panel.locator('canvas').evaluate((canvas) => {
      const element = canvas as HTMLCanvasElement
      const context = element.getContext('2d')
      if (!context || element.width === 0 || element.height === 0) return 0

      const pixels = context.getImageData(0, 0, element.width, element.height).data
      const observed = new Set<string>()
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset + 3] !== 0) {
          observed.add(`${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]}`)
        }
      }
      return observed.size
    })

    expect(colors).toBeGreaterThan(3)
  }
})

test('renders the protein foldscape and preserves project links', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the spiral requires the runtime')
  test.skip(isReducedMotion(testInfo), 'reduced-motion artwork is checked separately')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('3')
  await waitForSettled(page, 'research')

  const panel = page.locator('#research .ascii-panel')
  await expect(panel).toHaveAttribute('data-placeholder', 'false')
  await expect(panel.locator('pre')).toHaveAttribute('data-art-colored', 'true')

  const projectLinks = page.locator('#research .stage-card__projects a')
  expect(await projectLinks.count()).toBeGreaterThan(0)
  await expect(projectLinks.first()).toHaveAttribute('href', /github\.com/)
})

test('renders a static protein artwork under reduced motion', async ({ page }, testInfo) => {
  test.skip(!isReducedMotion(testInfo), 'reduced-motion playback is project-gated')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('3')
  await waitForSettled(page, 'research')

  const panel = page.locator('#research .ascii-panel')
  await expect(panel).toHaveAttribute('data-placeholder', 'false')
  const first = await panel.locator('pre').textContent()
  await page.waitForTimeout(600)
  expect(await panel.locator('pre').textContent()).toBe(first)
  expect(first?.length ?? 0).toBeGreaterThan(0)
})
