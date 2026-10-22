import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Journey contract (new_plan.md §13 P7, §12.5): wheel travel, magnetic
 * settle, rail navigation, keyboard map, cyclic wrap, reduced-motion
 * instant jumps and the visible-window discipline.
 */

const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'
const isReducedMotion = (testInfo: TestInfo) => testInfo.project.name === 'reduced-motion'

async function waitForSettled(page: import('@playwright/test').Page, chapterId: string) {
  await expect(page.locator(`#${chapterId}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })
}

/**
 * The coordinator clamps every wheel event to 80px (= 8 journey units, the
 * verified legacy feel — see tests/unit/input-helpers.test.ts), so a single
 * large wheel delta bounces back magnetically. A 4-event burst accumulates
 * 32 units: enough to cross the dwell midpoint with a fast-release velocity,
 * so the magnetic settle commits exactly ONE chapter forward (an 8-event
 * burst flings two chapters — the hysteresis design, not a bug).
 */
async function wheelBurst(
  page: import('@playwright/test').Page,
  eventCount: number,
  deltaY: number,
) {
  for (let event = 0; event < eventCount; event += 1) {
    await page.mouse.wheel(0, deltaY)
    await page.waitForTimeout(16)
  }
}

test('travels forward by wheel and settles at the next chapter', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'journey input requires JavaScript')
  test.skip(isReducedMotion(testInfo), 'reduced motion jumps instantly; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.mouse.move(640, 360)
  await wheelBurst(page, 4, 600)

  await waitForSettled(page, 'interests')
  await expect(
    page.locator('.progress-rail__link[aria-current="step"]'),
  ).toHaveAttribute('href', '#interests')
})

test('travels backward by wheel across the seam', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'journey input requires JavaScript')
  test.skip(isReducedMotion(testInfo), 'reduced motion jumps instantly; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.mouse.move(640, 360)
  await wheelBurst(page, 4, -600)

  // Backward from origins crosses the seam to contact.
  await waitForSettled(page, 'contact')
})

test('navigates through the rail with history updates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'the labeled rail is a desktop surface')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.locator('a[href="#research"]').click()

  await waitForSettled(page, 'research')
  await expect(page).toHaveURL(/#research$/)
  await expect(
    page.locator('.progress-rail__link[aria-current="step"]'),
  ).toHaveAttribute('href', '#research')
})

test('maps keyboard intents with focus handoff', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'journey input requires JavaScript')
  test.skip(isReducedMotion(testInfo), 'reduced motion jumps instantly; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.keyboard.press('ArrowDown')
  await waitForSettled(page, 'interests')

  await page.keyboard.press('ArrowUp')
  await waitForSettled(page, 'origins')

  // Digit shortcuts use forward-only semantics (plan §6).
  await page.keyboard.press('3')
  await waitForSettled(page, 'research')

  await page.keyboard.press('Home')
  await waitForSettled(page, 'origins')

  // Space over the page (not a button) advances; shift+space goes back.
  await page.keyboard.press('Space')
  await waitForSettled(page, 'interests')

  await page.keyboard.press('Shift+Space')
  await waitForSettled(page, 'origins')
})

test('jumps instantly under reduced motion', async ({ page }, testInfo) => {
  test.skip(!isReducedMotion(testInfo), 'reduced-motion instant semantics are project-gated')

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // The boot script mirrors the media query before hydration.
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true')

  await waitForSettled(page, 'origins')

  const startedAt = Date.now()

  await page.keyboard.press('ArrowDown')
  await waitForSettled(page, 'interests')

  // No spring animation: the settle is synchronous.
  expect(Date.now() - startedAt).toBeLessThan(1_500)
})

test('keeps the visible window tight while traveling', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the window discipline requires the runtime')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  // At rest exactly one settled card exists; idle cards are hidden.
  await expect(page.locator('[data-card-state="settled"]')).toHaveCount(1)
  await expect(page.locator('[data-card-state="outgoing"]')).toHaveCount(0)
  await expect(page.locator('[data-card-state="incoming"]')).toHaveCount(0)

  await page.mouse.move(640, 360)
  await wheelBurst(page, 8, 600)

  await waitForSettled(page, 'interests')

  await expect(page.locator('[data-card-state="settled"]')).toHaveCount(1)
  await expect(page.locator('[data-card-state="outgoing"]')).toHaveCount(0)
  await expect(page.locator('[data-card-state="incoming"]')).toHaveCount(0)
})
