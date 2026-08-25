import { expect, test } from '@playwright/test'

const chapters = ['origins', 'interests', 'research', 'computation', 'future'] as const

test('keeps the initial portfolio shell visually stable', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({
    content: 'canvas, .scene-poster__cloud, .scene-poster__grain { display: none !important; }',
  })

  if (testInfo.project.name === 'desktop') {
    // Wait for the renderer to mount and for the controls' fallback status to
    // detach so the panel height is final before the screenshot.
    await page
      .waitForFunction(() => Boolean(document.querySelector('[data-scene-enhancement="webgl"]')), {
        timeout: 30_000,
      })
      .catch(() => {})
    await page
      .waitForFunction(
        () => !document.querySelector('[data-model-interaction-controls] [role="status"]'),
        { timeout: 15_000 },
      )
      .catch(() => {})
  }
  await page.waitForTimeout(300)

  await expect(page).toHaveScreenshot(`portfolio-${testInfo.project.name}.png`, {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.035,
    timeout: 30_000,
  })
})

test('keeps every semantic chapter visually stable at each supported breakpoint', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext

    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      options?: unknown,
    ) {
      if (contextId === 'webgl' || contextId === 'webgl2') {
        return null
      }

      return Reflect.apply(getContext, this, [contextId, options])
    } as typeof HTMLCanvasElement.prototype.getContext
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1_000)
  await page.addStyleTag({
    content:
      'html { scroll-behavior: auto !important; } canvas, .scene-poster, .cursor-glow { display: none !important; }',
  })
  await page.locator('[data-liquid-glass="true"]').evaluateAll((surfaces) => {
    surfaces.forEach((surface) => {
      surface.setAttribute('data-glass-interactive', 'false')
      surface.style.setProperty('--glass-pointer-x', '50%')
      surface.style.setProperty('--glass-pointer-y', '50%')
    })
  })

  for (const chapterId of chapters) {
    const section = page.locator(`main#portfolio-content > div > section#${chapterId}`).first()
    await section.scrollIntoViewIfNeeded()

    await expect(section).toHaveScreenshot(`chapter-${chapterId}-${testInfo.project.name}.png`, {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.035,
      timeout: 30_000,
    })
  }
})
