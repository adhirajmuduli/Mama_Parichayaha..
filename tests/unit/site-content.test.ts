import { describe, expect, it } from 'vitest'

import {
  ModelCreditSchema,
  PublicProfileSchema,
  SiteContentSchema,
  siteContent,
} from '@/content/site'
import { getModelAsset } from '@/content/assets'

describe('site content', () => {
  it('validates the public contact profile without unverified channels', () => {
    expect(SiteContentSchema.parse(siteContent)).toEqual(siteContent)
    expect(PublicProfileSchema.parse(siteContent.publicProfiles[0])).toEqual(
      siteContent.publicProfiles[0],
    )
    expect(siteContent.publicProfiles).toEqual([
      expect.objectContaining({
        external: false,
        href: 'mailto:adhiraj.muduli@niser.ac.in',
        label: 'Email Adhiraj',
      }),
      expect.objectContaining({
        external: true,
        href: 'https://github.com/adhirajmuduli',
        label: 'GitHub profile',
      }),
      expect.objectContaining({
        external: true,
        href: 'https://orcid.org/0009-0005-5655-8120?lang=en',
        label: 'ORCID record',
      }),
    ])
    expect(siteContent.publications.description).toContain(
      'No publications, talks, or research articles',
    )
  })

  it('keeps every assigned GLB credit source-linked and license-labelled', () => {
    expect(siteContent.credits.models.map((model) => model.assetId)).toEqual(['dna'])

    siteContent.credits.models.forEach((model) => {
      const asset = getModelAsset(model.assetId)

      expect(ModelCreditSchema.parse(model)).toEqual(model)
      expect(model.links.every((link) => link.href.startsWith('https://'))).toBe(true)
      expect(model.links.some((link) => link.href === asset.credit.sourceUrl)).toBe(true)
      expect(model.license).not.toHaveLength(0)
      expect(model.source.file).toBe('docs/assets/model-provenance.md')
    })
  })
})
