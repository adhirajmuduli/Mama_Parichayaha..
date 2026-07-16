import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('has no critical or serious axe violations in the initial portfolio view', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' })

  const results = await new AxeBuilder({ page }).analyze()
  const blockingViolations = results.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact ?? ''),
  )

  expect(blockingViolations).toEqual([])
})
