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
      'Contact submissions are sent by email and retained in the recipient inbox until manually deleted. The site stores no message archive; temporary abuse-control hashes expire automatically.',
  },
  credits: {
    id: 'credits',
    eyebrow: 'Credits',
    title: 'Model and scientific-source attribution',
    description:
      'The interactive molecular models used by this portfolio retain their required source and license attribution.',
    models: [
      {
        assetId: 'dna-alt',
        title: 'DNA VR Interactive Animation (Alternate)',
        attribution: 'DNA VR Interactive Animation by nilantunes, via Sketchfab.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
            label: 'Alternate DNA source on Sketchfab',
          },
          {
            href: 'https://sketchfab.com/nilantunes',
            label: 'nilantunes on Sketchfab',
          },
        ],
        source: {
          file: 'docs/assets/model-provenance.md',
          location: 'Retained assets',
        },
      },
      {
        assetId: 'bacteriophage',
        title: 'Bacteriophage Model',
        attribution: 'Procedural bacteriophage study, portfolio source.',
        license: 'Original implementation.',
        links: [
          {
            href: 'https://github.com/adhirajmuduli',
            label: 'GitHub repository',
          },
        ],
        source: {
          file: 'docs/assets/model-provenance.md',
          location: 'Retained assets',
        },
      },
      {
        assetId: 'hemoglobin-ribbon',
        title: 'Hemoglobin Ribbon (6HHB)',
        attribution: 'Hemoglobin ribbon structure from NIH 3D Print Exchange.',
        license: 'CC0 (Public Domain).',
        links: [
          {
            href: 'https://3d.nih.gov/',
            label: 'NIH 3D Print Exchange',
          },
        ],
        source: {
          file: 'docs/assets/model-provenance.md',
          location: 'Retained assets',
        },
      },
      {
        assetId: 'brain-point-cloud',
        title: 'Brain Point Cloud',
        attribution: 'Brain point cloud data from Human Cell Atlas / EBI.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://www.ebi.ac.uk/',
            label: 'European Bioinformatics Institute',
          },
        ],
        source: {
          file: 'docs/assets/model-provenance.md',
          location: 'Retained assets',
        },
      },
      {
        assetId: 'earth-animated',
        title: 'Animated Earth',
        attribution: 'Animated Earth model from NASA Visible Earth.',
        license: 'Public Domain.',
        links: [
          {
            href: 'https://visibleearth.nasa.gov/',
            label: 'NASA Visible Earth',
          },
        ],
        source: {
          file: 'docs/assets/model-provenance.md',
          location: 'Retained assets',
        },
      },
      {
        assetId: 'dna',
        title: 'DNA VR Interactive Animation (Rollback)',
        attribution: 'DNA VR Interactive Animation by nilantunes, via Sketchfab.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
            label: 'DNA source on Sketchfab',
          },
          {
            href: 'https://sketchfab.com/nilantunes',
            label: 'Rollback DNA author on Sketchfab',
          },
        ],
        source: {
          file: 'docs/assets/model-provenance.md',
          location: 'Retained assets',
        },
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
      source: {
        file: 'docs/content/phase8-content-provenance.md',
        location: 'Owner-approved public details',
      },
    },
    {
      external: true,
      href: 'https://github.com/adhirajmuduli',
      label: 'GitHub profile',
      source: {
        file: 'docs/content/phase8-content-provenance.md',
        location: 'Owner-approved public details',
      },
    },
    {
      external: true,
      href: 'https://orcid.org/0009-0005-5655-8120?lang=en',
      label: 'ORCID record',
      source: {
        file: 'docs/content/phase8-content-provenance.md',
        location: 'Owner-approved public details',
      },
    },
  ],
})
