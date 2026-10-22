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

async function cycleForward(page: import('@playwright/test').Page, from: string, to: string) {
  await expect(page.locator(`#${from}`)).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })

  await page.mouse.move(640, 360)
  await page.mouse.wheel(0, 600)

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

  const bootCompletedAt = await page.evaluate(() => performance.now() + 3_000)

  // Two forward wheel cycles (origins → interests → research).
  await cycleForward(page, 'origins', 'interests')
  await cycleForward(page, 'interests', 'research')

  const heapBefore = await page.evaluate(() =>
    (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
      ?.usedJSHeapSize ?? 0,
  )

  // Two more cycles back and forth to catch playback churn.
  await page.mouse.wheel(0, -600)
  await expect(page.locator('#interests')).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })

  await page.mouse.wheel(0, 600)
  await expect(page.locator('#research')).toHaveAttribute('data-card-state', 'settled', {
    timeout: 20_000,
  })

  const heapAfter = await page.evaluate(() =>
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
