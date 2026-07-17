import { describe, expect, it } from 'vitest'

import { PublicProfileSchema, SiteContentSchema, siteContent } from '@/content/site'

describe('site content', () => {
  it('validates the public contact profile without unverified channels', () => {
    expect(SiteContentSchema.parse(siteContent)).toEqual(siteContent)
    expect(PublicProfileSchema.parse(siteContent.publicProfiles[0])).toEqual(
      siteContent.publicProfiles[0],
    )
    expect(siteContent.publicProfiles).toEqual([
      expect.objectContaining({
        href: 'https://github.com/adhirajmuduli',
        label: 'GitHub profile',
      }),
    ])
  })
})
