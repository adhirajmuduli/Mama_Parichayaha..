import { expect, it, describe } from 'vitest'

import { getStructuredData, siteUrlFor } from '@/lib/siteMetadata'

/**
 * Canonical metadata derives from NEXT_PUBLIC_SITE_URL (env-driven; no
 * production origin literal lives in the repo — deploy secret scanners
 * flag such literals). Local runs resolve the documented fallback.
 */

const expectedOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

describe('site metadata', () => {
  it('uses one canonical public origin', () => {
    expect(siteUrlFor()).toBe(`${expectedOrigin}/`)
    expect(siteUrlFor('/privacy')).toBe(`${expectedOrigin}/privacy`)
  })

  it('emits Person and WebSite structured data', () => {
    const entries = getStructuredData().map((entry) => entry['@type'])

    expect(entries).toContain('Person')
    expect(entries).toContain('WebSite')
  })
})
