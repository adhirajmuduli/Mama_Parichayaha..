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
 * Wheel travel semantics (the magnetic contract + P11 gesture clamp):
 * events are clamped to 80px = 8 units; a burst inside one 100ms debounce
 * window accumulates and the magnetic settle commits — but the P11 clamp
 * caps every gesture at ONE chapter (rest ± 50 units). Isolated events
 * spaced beyond the debounce settle back to the nearest center.
 *
 *   4-event forward burst  → input 57  → commits to interests (75),
 *   4-event backward burst → input −7  → commits to contact (−25).
 *
 * `page.mouse.wheel` roundtrips are trace/pipeline-latency dependent, so
 * multi-event bursts dispatch synthetic WheelEvents at the real target
 * with a deterministic cadence — the identical listener → clamp → nudge →
 * debounce → magnetic → spring path. One real-input test covers the
 * browser pipeline itself.
 */
async function wheelBurst(
  page: import('@playwright/test').Page,
  eventCount: number,
  deltaY: number,
) {
  await page.evaluate(
    ({ count, delta }: { count: number; delta: number }) => {
      // Dispatch at the stage host: the coordinator's wheel listener lives
      // there, and the host is never inside a card scroll region. Dispatching
      // at the viewport center instead lets tall cards (contact) claim the
      // wheel — correct product behavior (arbitration), wrong for
      // travel-semantics tests.
      const target =
        document.querySelector('.stage-root') ??
        document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2) ??
        document.body

      for (let event = 0; event < count; event += 1) {
        target.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: delta,
            deltaMode: 0,
            cancelable: true,
            bubbles: true,
          }),
        )
      }
    },
    { count: eventCount, delta: deltaY },
  )
}

test('travels forward by wheel and settles at the next chapter', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'journey input requires JavaScript')
  test.skip(isReducedMotion(testInfo), 'reduced motion jumps instantly; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  await page.mouse.move(640, 360)
  await wheelBurst(page, 4, 600)

  // P11 clamp: one chapter per gesture, however violent the burst.
  await waitForSettled(page, 'interests')
  await expect(page).toHaveURL(/#interests$/)

  // A second burst advances exactly one more chapter.
  await wheelBurst(page, 4, 600)
  await waitForSettled(page, 'research')
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

test('bounces an isolated real wheel click back to the nearest center', async ({
  page,
}, testInfo) => {
  test.skip(!isScripted(testInfo), 'journey input requires JavaScript')
  test.skip(isReducedMotion(testInfo), 'reduced motion jumps instantly; see its own test')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForSettled(page, 'origins')

  // A single slow click (real input pipeline): the spring advances briefly
  // and the magnetic settle returns to the nearest dwell center.
  await page.mouse.move(640, 360)
  await page.mouse.wheel(0, 600)

  await waitForSettled(page, 'origins')
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
  await wheelBurst(page, 4, 600)

  await waitForSettled(page, 'interests')

  await expect(page.locator('[data-card-state="settled"]')).toHaveCount(1)
  await expect(page.locator('[data-card-state="outgoing"]')).toHaveCount(0)
  await expect(page.locator('[data-card-state="incoming"]')).toHaveCount(0)
})
