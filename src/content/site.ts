import { z } from 'zod'

export const PublicProfileSchema = z
  .object({
    href: z.string().url(),
    label: z.string().trim().min(1).max(80),
    source: z
      .object({
        file: z.string().trim().min(1),
        location: z.string().trim().min(1),
      })
      .strict(),
  })
  .strict()

export const SiteContentSchema = z
  .object({
    contact: z
      .object({
        description: z.string().trim().min(1).max(400),
        eyebrow: z.string().trim().min(1).max(80),
        id: z.literal('contact'),
        title: z.string().trim().min(1).max(140),
      })
      .strict(),
    publicProfiles: z.array(PublicProfileSchema).min(1),
  })
  .strict()

export type SiteContent = z.infer<typeof SiteContentSchema>

export const siteContent: SiteContent = SiteContentSchema.parse({
  contact: {
    id: 'contact',
    eyebrow: 'Public profile',
    title: 'Current work on GitHub',
    description:
      'The public portfolio repository and related technical work are available through the GitHub profile.',
  },
  publicProfiles: [
    {
      href: 'https://github.com/adhirajmuduli',
      label: 'GitHub profile',
      source: {
        file: 'docs/content/phase3-site-provenance.md',
        location: 'Verified public profile',
      },
    },
  ],
})
