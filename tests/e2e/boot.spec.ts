import { expect, test, type TestInfo } from '@playwright/test'

/**
 * Boot contract (new_plan.md §13 P7, §12.1).
 *
 * no-js visitors get the complete semantic document — every chapter section,
 * anchors, skip link, server-rendered exhibit frames and contact extras —
 * with zero scripts. Scripted visitors boot the immersive stage without a
 * single console error and mark the landing chapter on the rail.
 */

const CHAPTER_IDS = [
  'origins',
  'interests',
  'research',
  'computation',
  'future',
  'publications',
  'contact',
] as const

const isNoJs = (testInfo: TestInfo) => testInfo.project.name === 'no-js'
const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'

test('serves the complete semantic document without JavaScript', async ({ page }, testInfo) => {
  test.skip(!isNoJs(testInfo), 'document-mode baseline is asserted on the no-js project')

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // The boot script never ran: the document mode attribute is the default.
  await expect(page.locator('html')).toHaveAttribute('data-experience', 'document')

  // Every chapter section is present, headed, and anchored.
  for (const chapterId of CHAPTER_IDS) {
    const section = page.locator(`#${chapterId}`)

    await expect(section).toBeVisible()
    await expect(section.locator('.stage-card__title')).toBeVisible()
  }

  await expect(page.locator('h1')).toHaveText(/Adhiraj Muduli/)

  // Skip link targets the first chapter from data.
  await expect(page.locator('.skip-link')).toHaveAttribute('href', '#origins')

  // Exhibit frames are server-rendered: no empty ASCII slots without JS.
  const panels = page.locator('.ascii-panel')
  await expect(panels.first()).toBeVisible()

  const frameCount = await panels.count()
  expect(frameCount).toBeGreaterThan(0)

  for (let index = 0; index < frameCount; index += 1) {
    const frame = panels.nth(index).locator('pre')

    await expect(frame).toBeVisible()
    expect((await frame.textContent())?.length ?? 0).toBeGreaterThan(0)
  }

  // Contact extras: real profile links plus the privacy/credits routes.
  const contact = page.getByRole('region', { name: 'Get in touch' })

  await expect(contact.getByRole('link', { name: 'GitHub profile' })).toBeVisible()
  await expect(contact.getByRole('link', { name: 'Privacy details' })).toHaveAttribute(
    'href',
    '/privacy',
  )
  await expect(contact.getByRole('link', { name: 'Credits' })).toHaveAttribute('href', '/credits')

  // Publications region keeps its accessible name (seo/legacy contract).
  await expect(page.getByRole('region', { name: 'No publications or talks listed' })).toBeVisible()
})

test('boots the immersive stage without console errors', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'the immersive boot requires JavaScript')

  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // The pre-paint boot script claims immersive before hydration.
  await expect(page.locator('html')).toHaveAttribute('data-experience', 'immersive')

  // Hydration lands the settled landing chapter without a flash mismatch.
  await expect(page.locator('#origins')).toHaveAttribute('data-card-state', 'settled', {
    timeout: 15_000,
  })

  // Give the lazy layers (lanyard island where eligible) a beat to settle.
  await page.waitForTimeout(1_500)

  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})

test('marks the landing chapter on the rail', async ({ page }, testInfo) => {
  test.skip(!isScripted(testInfo), 'rail state requires the runtime')

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('#origins')).toHaveAttribute('data-card-state', 'settled', {
    timeout: 15_000,
  })

  await expect(page.locator('.progress-rail__link[aria-current="step"]')).toHaveAttribute(
    'href',
    '#origins',
  )
})
