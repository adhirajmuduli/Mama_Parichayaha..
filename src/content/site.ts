import { z } from 'zod'

const ClaimSourceSchema = z
  .object({
    file: z.string().trim().min(1),
    location: z.string().trim().min(1),
  })
  .strict()

const CreditLinkSchema = z
  .object({
    href: z.string().url(),
    label: z.string().trim().min(1).max(100),
  })
  .strict()

export const PublicProfileSchema = z
  .object({
    external: z.boolean(),
    href: z.union([z.string().url(), z.string().regex(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/)]),
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
    assetId: z.enum(['dna', 'protein', 'tardigrade']),
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
        description: z.string().trim().min(1).max(400),
        eyebrow: z.string().trim().min(1).max(80),
        id: z.literal('credits'),
        models: z.array(ModelCreditSchema).min(1),
        title: z.string().trim().min(1).max(140),
      })
      .strict(),
    publications: PublicationStatusSchema,
    publicProfiles: z.array(PublicProfileSchema).min(1),
  })
  .strict()

export type SiteContent = z.infer<typeof SiteContentSchema>

const modelProvenanceSource = {
  file: 'docs/assets/model-provenance.md',
  location: 'Retained assets',
} as const

const phase8Source = {
  file: 'docs/content/phase8-content-provenance.md',
  location: 'Owner-approved public details',
} as const

export const siteContent: SiteContent = SiteContentSchema.parse({
  contact: {
    id: 'contact',
    eyebrow: 'Contact and public profiles',
    title: 'Get in touch',
    description: 'Email, source code, and the public ORCID record are available below.',
    privacyNotice:
      'This site does not collect contact-form submissions. Selecting the email link opens your email client or provider.',
  },
  credits: {
    id: 'credits',
    eyebrow: 'Credits',
    title: 'Model and scientific-source attribution',
    description:
      'The interactive molecular models used by this portfolio retain their required source and license attribution.',
    models: [
      {
        assetId: 'dna',
        title: 'DNA VR Interactive Animation',
        attribution: 'DNA VR Interactive Animation by nilantunes, via Sketchfab.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
            label: 'DNA source on Sketchfab',
          },
          {
            href: 'https://sketchfab.com/nilantunes',
            label: 'nilantunes on Sketchfab',
          },
        ],
        source: modelProvenanceSource,
      },
      {
        assetId: 'protein',
        title: 'Green Fluorescent Protein, PDB 1GFL',
        attribution:
          'PDB 1GFL from RCSB Protein Data Bank; simplified and exported locally with UCSF ChimeraX 1.11.1.',
        license: 'PDB archive coordinate data are available under CC0 1.0.',
        links: [
          {
            href: 'https://www.rcsb.org/structure/1GFL',
            label: 'RCSB PDB 1GFL',
          },
        ],
        source: modelProvenanceSource,
      },
      {
        assetId: 'tardigrade',
        title: 'Water Bear',
        attribution: 'Water Bear by oneillbeck, via Sketchfab.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://sketchfab.com/3d-models/water-bear-6e0ecc9d43ad4cf9a17efab2900f72ee',
            label: 'Water Bear source on Sketchfab',
          },
          {
            href: 'https://sketchfab.com/oneillbeck',
            label: 'oneillbeck on Sketchfab',
          },
        ],
        source: modelProvenanceSource,
      },
    ],
  },
  publications: {
    id: 'publications',
    eyebrow: 'Publications and talks',
    title: 'No publications or talks listed',
    description:
      'No publications, talks, or research articles are currently listed in this portfolio.',
  },
  publicProfiles: [
    {
      external: false,
      href: 'mailto:adhiraj.muduli@niser.ac.in',
      label: 'Email Adhiraj',
      source: phase8Source,
    },
    {
      external: true,
      href: 'https://github.com/adhirajmuduli',
      label: 'GitHub profile',
      source: phase8Source,
    },
    {
      external: true,
      href: 'https://orcid.org/0009-0005-5655-8120?lang=en',
      label: 'ORCID record',
      source: phase8Source,
    },
  ],
})
