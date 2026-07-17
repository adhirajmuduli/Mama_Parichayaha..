import { expect, test } from '@playwright/test'

test('renders bounded liquid-glass surfaces with an explicit fallback and keyboard focus', async ({
  page,
}, testInfo) => {
  await page.goto('/lab/liquid-glass', { waitUntil: 'networkidle' })

  const harness = page.getByRole('main')
  const surfaces = harness.locator('[data-liquid-glass="true"]')
  const fallback = harness.locator('[data-glass-state="fallback"]')
  const action = page.getByRole('link', { name: 'Focusable action' })

  await expect(page.getByRole('heading', { name: 'Liquid-glass states' })).toBeVisible()
  await expect(surfaces).toHaveCount(4)
  await expect(fallback).toHaveAttribute('data-glass-fallback', 'true')

  const layoutIsBounded = await surfaces.evaluateAll((elements) =>
    elements.every((element) => {
      const bounds = element.getBoundingClientRect()
      return bounds.width * bounds.height < window.innerWidth * window.innerHeight * 0.8
    }),
  )

  expect(layoutIsBounded).toBe(true)
  await expect(harness.locator('[data-liquid-glass] [data-liquid-glass]')).toHaveCount(0)

  const hasOversizedFilteredSurface = await surfaces.evaluateAll((elements) =>
    elements.some((element) => {
      const bounds = element.getBoundingClientRect()
      const hasBackdropFilter = getComputedStyle(element).backdropFilter !== 'none'

      return (
        hasBackdropFilter &&
        bounds.width * bounds.height >= window.innerWidth * window.innerHeight * 0.8
      )
    }),
  )

  expect(hasOversizedFilteredSurface).toBe(false)

  await action.focus()
  await expect(action).toBeFocused()

  if (testInfo.project.name === 'desktop') {
    const defaultSurface = harness.locator('[data-glass-state="default"]')

    await defaultSurface.hover({ position: { x: 24, y: 24 } })
    expect(
      await defaultSurface.evaluate((element) =>
        element.style.getPropertyValue('--glass-pointer-x'),
      ),
    ).not.toBe('')
  }
})

test('records a bounded liquid-glass paint trace', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'One Chromium trace is sufficient for the shared surface path.',
  )

  const session = await page.context().newCDPSession(page)
  let paintEventCount = 0
  let timelineEventCount = 0
  let traceEventCount = 0
  const traceComplete = new Promise<void>((resolve) => {
    session.once('Tracing.tracingComplete', () => resolve())
  })

  session.on('Tracing.dataCollected', ({ value }) => {
    traceEventCount += value.length

    value.forEach((event) => {
      if (event.cat?.includes('devtools.timeline')) {
        timelineEventCount += 1
      }

      if (event.name === 'Paint' || event.name === 'RasterTask') {
        paintEventCount += 1
      }
    })
  })

  await session.send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing',
    transferMode: 'ReportEvents',
  })

  await page.goto('/lab/liquid-glass', { waitUntil: 'networkidle' })
  await page.locator('[data-glass-state="default"]').hover({ position: { x: 36, y: 36 } })
  await session.send('Tracing.end')
  await traceComplete

  const surfaceMetrics = await page.locator('[data-liquid-glass="true"]').evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect()
      const viewportArea = window.innerWidth * window.innerHeight

      return {
        hasBackdropFilter: getComputedStyle(element).backdropFilter !== 'none',
        viewportAreaRatio: (bounds.width * bounds.height) / viewportArea,
      }
    }),
  )

  const maxFilteredSurfaceViewportRatio = Math.max(
    0,
    ...surfaceMetrics
      .filter((surface) => surface.hasBackdropFilter)
      .map((surface) => surface.viewportAreaRatio),
  )

  expect(traceEventCount).toBeGreaterThan(0)
  expect(timelineEventCount).toBeGreaterThan(0)
  expect(maxFilteredSurfaceViewportRatio).toBeLessThan(0.8)

  await testInfo.attach('liquid-glass-trace-summary.json', {
    body: Buffer.from(
      JSON.stringify({
        maxFilteredSurfaceViewportRatio,
        paintEventCount,
        timelineEventCount,
        traceEventCount,
      }),
    ),
    contentType: 'application/json',
  })
})
