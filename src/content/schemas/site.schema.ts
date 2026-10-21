/**
 * Site content schema (new_plan.md §7.2) — migrated from the retired
 * `content/site.ts`, extended with `portrait` (lanyard face image) and the
 * open-source component attribution note rendered on /credits.
 */

import { z } from 'zod'

import { ClaimSourceSchema, publicUrlSchema } from './common.schema'

const CreditLinkSchema = z
  .object({
    href: publicUrlSchema,
    label: z.string().trim().min(1).max(100),
  })
  .strict()

export const PublicProfileSchema = z
  .object({
    external: z.boolean(),
    href: z.union([publicUrlSchema, z.string().regex(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/)]),
    label: z.string().trim().min(1).max(80),
    source: ClaimSourceSchema,
  })
  .strict()
  .superRefine((profile, context) => {
    const isEmail = profile.href.startsWith('mailto:')

    if (profile.external === isEmail) {
      context.addIssue({
        code: 'custom',
        message: profile.external
          ? 'External public profiles must use an absolute URL.'
          : 'Email contact must use a mailto URL.',
        path: ['href'],
      })
    }
  })

export const ModelCreditSchema = z
  .object({
    assetId: z.enum([
      'dna-alt',
      'bacteriophage',
      'hemoglobin-ribbon',
      'brain-point-cloud',
      'earth-animated',
      'dna',
    ]),
    attribution: z.string().trim().min(1).max(260),
    license: z.string().trim().min(1).max(160),
    links: z.array(CreditLinkSchema).min(1).max(2),
    source: ClaimSourceSchema,
    title: z.string().trim().min(1).max(160),
  })
  .strict()

const PublicationStatusSchema = z
  .object({
    description: z.string().trim().min(1).max(400),
    eyebrow: z.string().trim().min(1).max(80),
    id: z.literal('publications'),
    title: z.string().trim().min(1).max(140),
  })
  .strict()

export const SiteContentSchema = z
  .object({
    contact: z
      .object({
        description: z.string().trim().min(1).max(400),
        eyebrow: z.string().trim().min(1).max(80),
        id: z.literal('contact'),
        privacyNotice: z.string().trim().min(1).max(400),
        title: z.string().trim().min(1).max(140),
      })
      .strict(),
    credits: z
      .object({
        /** Open-source component attribution (React Bits / Magic UI, MIT). */
        components: z.string().trim().min(1).max(400),
        description: z.string().trim().min(1).max(400),
        eyebrow: z.string().trim().min(1).max(80),
        id: z.literal('credits'),
        models: z.array(ModelCreditSchema).min(1),
        title: z.string().trim().min(1).max(140),
      })
      .strict(),
    /** Lanyard face image (public asset path); placeholder until supplied. */
    portrait: z.string().regex(/^\/images\//, 'Expected a public image path under /images/.'),
    publications: PublicationStatusSchema,
    publicProfiles: z.array(PublicProfileSchema).min(1),
  })
  .strict()

export type SiteContentEntry = z.infer<typeof SiteContentSchema>
