import AxeBuilder from '@axe-core/playwright'
import { expect, test, type TestInfo } from '@playwright/test'

const isScripted = (testInfo: TestInfo) => testInfo.project.name !== 'no-js'

test('has no critical or serious axe violations in the initial portfolio view', async ({
  page,
}, testInfo) => {
  // axe-core injects and executes JavaScript; it cannot run without it.
  test.skip(!isScripted(testInfo), 'axe analysis requires a scripted browser')

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const results = await new AxeBuilder({ page }).analyze()
  const blockingViolations = results.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact ?? ''),
  )

  expect(blockingViolations).toEqual([])
})
