import { describe, expect, it } from 'vitest'

import { getStructuredData, siteUrlFor } from '@/lib/siteMetadata'

describe('site metadata', () => {
  it('uses one canonical public origin', () => {
    expect(siteUrlFor()).toBe('https://adhirajmuduli.netlify.app/')
    expect(siteUrlFor('/privacy')).toBe('https://adhirajmuduli.netlify.app/privacy')
  })

  it('emits only verified Person and WebSite structured-data entities', () => {
    const entries = getStructuredData()

    expect(entries.map((entry) => entry['@type'])).toEqual(['Person', 'WebSite'])
    expect(entries[0]).toMatchObject({
      name: 'Adhiraj Muduli',
      sameAs: ['https://github.com/adhirajmuduli', 'https://orcid.org/0009-0005-5655-8120?lang=en'],
    })
  })
})
