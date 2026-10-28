import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Performance gates (new_plan.md §11, §17 — replaces the retired spec):
 * the DOM-first stage must hold its memory flat and never block the main
 * thread across two full journey cycles.
 *
 *  - heap growth over two wheel cycles: ≤ 6 MiB (Chrome-only API),
 *  - long tasks (≥ 50 ms) after boot completes: zero,
 *  - the scheduler idles: zero rAF activity while resting (frame counter
 *    sampled through the diagnostics surface is not exposed in production,
 *    so rest idleness is observed as long-task silence + stable heap).
 */

const isDesktop = (testInfo: TestInfo) => testInfo.project.name === 'desktop'

async function burstWheel(
  page: import('@playwright/test').Page,
  eventCount: number,
  deltaY: number,
) {
  // Deterministic-cadence burst (see journey.spec.ts for the debounce math).
  await page.evaluate(
    ({ count, delta }: { count: number; delta: number }) => {
      // Dispatch at the stage host, exactly like journey.spec.ts: the
      // coordinator's wheel listener lives there and the host is never
      // inside a card scroll region. The viewport center sits inside the
      // contact card's copy, which legitimately claims the wheel (scroll
      // arbitration) — correct product behavior, wrong for a journey-cycle
      // measurement.
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

async function hopForward(page: import('@playwright/test').Page, from: string, to: string) {
  await expect(page.locator(`#${from}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })

  // P11 clamp: one chapter per gesture, so cycles hop chapter-by-chapter.
  await burstWheel(page, 4, 600)

  await expect(page.locator(`#${to}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })
}

async function cycleBackward(page: import('@playwright/test').Page, from: string, to: string) {
  await expect(page.locator(`#${from}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })

  await burstWheel(page, 4, -600)

  await expect(page.locator(`#${to}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })
}

test('holds memory flat and never blocks the main thread across two journey cycles', async ({
  page,
}, testInfo) => {
  test.skip(!isDesktop(testInfo), 'memory and long-task gates run on the desktop project')

  // Observe long tasks from the very start, but only count those that fire
  // AFTER the boot settle (initial chunk hydration is out of scope).
  await page.addInitScript(() => {
    const longTasks: { startTime: number; duration: number }[] = []

    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          longTasks.push({ startTime: entry.startTime, duration: entry.duration })
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
    } catch {
      // Long-task observation is unavailable; the heap gate still runs.
    }

    ;(window as unknown as { __longTasks: typeof longTasks }).__longTasks = longTasks
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Boot completion grace: hydration + the lazy lanyard island's one-time
  // three.js initialization (shader compile — heavy under software GL) must
  // finish before the measurement window opens. The stable-root slot keeps
  // the island mounted for the whole session, so this cost occurs exactly
  // once, here. Generous for cold CI machines (first-test cold-start
  // contention was observed at 6s on a cold standalone server).
  const bootCompletedAt = await page.evaluate(() => performance.now() + 10_000)

  // Two full journey cycles, chapter by chapter (origins → interests →
  // research → back), under the P11 one-chapter-per-gesture clamp.
  await hopForward(page, 'origins', 'interests')
  await hopForward(page, 'interests', 'research')

  const heapBefore = await page.evaluate(
    () =>
      (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
        ?.usedJSHeapSize ?? 0,
  )

  // Back and forth across the seam to catch playback churn on both edges.
  await cycleBackward(page, 'research', 'interests')
  await cycleBackward(page, 'interests', 'origins')
  await cycleBackward(page, 'origins', 'contact')
  await hopForward(page, 'contact', 'origins')

  const heapAfter = await page.evaluate(
    () =>
      (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
        ?.usedJSHeapSize ?? 0,
  )

  const postBootLongTasks = await page.evaluate(
    (cutoff) =>
      (
        (window as unknown as { __longTasks: { startTime: number; duration: number }[] })
          .__longTasks ?? []
      ).filter((task) => task.startTime >= cutoff && task.duration >= 50),
    bootCompletedAt,
  )

  expect(postBootLongTasks).toEqual([])

  // Heap growth across the cycles (JS only; GC noise tolerated by the 6 MiB
  // budget from the original gate).
  expect(heapAfter - heapBefore).toBeLessThanOrEqual(6 * 1024 * 1024)
})
