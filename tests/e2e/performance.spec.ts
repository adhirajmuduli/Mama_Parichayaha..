import { writeFile } from 'node:fs/promises'

import { expect, test, type Page } from '@playwright/test'

const chapterSelectors = ['#origins', '#interests', '#research', '#computation', '#future']
const heapToleranceBytes = 6 * 1024 * 1024

async function completeScrollCycle(page: Page) {
  for (const selector of [...chapterSelectors, ...chapterSelectors.toReversed()]) {
    await page.locator(selector).scrollIntoViewIfNeeded()
    await page.waitForTimeout(120)
  }

  await page.mouse.move(96, 192)
  await page.mouse.move(864, 384, { steps: 12 })
}

function getMetric(metrics: Array<{ name: string; value: number }>, name: string) {
  const value = metrics.find((metric) => metric.name === name)?.value

  if (value === undefined) {
    throw new Error(`Missing Chrome performance metric: ${name}`)
  }

  return value
}

test('keeps warm navigation cycles within heap and long-task budgets', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'The production performance trace is captured once using deterministic software WebGL.',
  )
  test.setTimeout(120_000)

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'Adhiraj Muduli' })).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(1)

  await completeScrollCycle(page)

  const session = await page.context().newCDPSession(page)
  await session.send('Performance.enable')
  await session.send('HeapProfiler.enable')
  await session.send('HeapProfiler.collectGarbage')

  const baselineMetrics = await session.send('Performance.getMetrics')
  const traceEvents: Array<{ cat?: string; dur?: number; name?: string }> = []
  const traceComplete = new Promise<void>((resolve) => {
    session.once('Tracing.tracingComplete', () => resolve())
  })

  session.on('Tracing.dataCollected', ({ value }) => {
    traceEvents.push(...value)
  })

  await session.send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline,toplevel',
    transferMode: 'ReportEvents',
  })

  await completeScrollCycle(page)
  await completeScrollCycle(page)

  await session.send('Tracing.end')
  await traceComplete
  await session.send('HeapProfiler.collectGarbage')

  const finalMetrics = await session.send('Performance.getMetrics')
  const baselineHeapBytes = getMetric(baselineMetrics.metrics, 'JSHeapUsedSize')
  const finalHeapBytes = getMetric(finalMetrics.metrics, 'JSHeapUsedSize')
  const heapDeltaBytes = finalHeapBytes - baselineHeapBytes
  const longTaskDurationsMilliseconds = traceEvents
    .filter(
      (event) =>
        event.name === 'RunTask' &&
        event.cat?.includes('toplevel') &&
        typeof event.dur === 'number' &&
        event.dur >= 50_000,
    )
    .map((event) => (event.dur ?? 0) / 1_000)

  const summaryPath = testInfo.outputPath('phase11-performance-summary.json')
  await writeFile(
    summaryPath,
    `${JSON.stringify(
      {
        baselineHeapBytes,
        finalHeapBytes,
        heapDeltaBytes,
        heapToleranceBytes,
        longTaskDurationsMilliseconds,
        traceEventCount: traceEvents.length,
      },
      null,
      2,
    )}\n`,
  )

  await testInfo.attach('phase11-performance-summary.json', {
    path: summaryPath,
    contentType: 'application/json',
  })

  expect(heapDeltaBytes).toBeLessThanOrEqual(heapToleranceBytes)
  expect(longTaskDurationsMilliseconds).toEqual([])
})
