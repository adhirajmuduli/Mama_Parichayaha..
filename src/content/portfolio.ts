import { z } from 'zod'

export const chapterIds = ['origins', 'interests', 'research', 'computation', 'future'] as const

export const ChapterIdSchema = z.enum(chapterIds)

export type ChapterId = z.infer<typeof ChapterIdSchema>

const ClaimSourceSchema = z
  .object({
    file: z.string().trim().min(1),
    location: z.string().trim().min(1),
  })
  .strict()

const ContentActionSchema = z
  .object({
    external: z.boolean(),
    href: z.union([
      z.string().regex(/^#[a-z][a-z0-9-]*$/i, 'Expected an in-page anchor.'),
      z.string().url(),
    ]),
    label: z.string().trim().min(1).max(80),
    source: ClaimSourceSchema,
  })
  .strict()
  .superRefine((action, context) => {
    const isAnchor = action.href.startsWith('#')

    if (action.external === isAnchor) {
      context.addIssue({
        code: 'custom',
        message: action.external
          ? 'External actions must use an absolute URL.'
          : 'In-page actions must use an anchor URL.',
        path: ['href'],
      })
    }
  })

const ChapterDetailItemSchema = z
  .object({
    description: z.string().trim().min(1).max(320),
    source: ClaimSourceSchema,
    status: z.enum(['active', 'completed', 'experimental']).optional(),
    title: z.string().trim().min(1).max(100),
  })
  .strict()

const ChapterDetailSchema = z
  .object({
    eyebrow: z.string().trim().min(1).max(80),
    items: z.array(ChapterDetailItemSchema).min(1).max(8),
    title: z.string().trim().min(1).max(140),
  })
  .strict()

export const ChapterContentSchema = z
  .object({
    actions: z.array(ContentActionSchema).max(3),
    description: z.string().trim().min(1).max(600),
    detail: ChapterDetailSchema,
    eyebrow: z.string().trim().min(1).max(80),
    id: ChapterIdSchema,
    source: ClaimSourceSchema,
    title: z.string().trim().min(1).max(140),
  })
  .strict()

export const ChapterContentListSchema = z
  .array(ChapterContentSchema)
  .length(chapterIds.length)
  .superRefine((entries, context) => {
    const seen = new Set<ChapterId>()

    entries.forEach((entry, index) => {
      if (seen.has(entry.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate chapter content id: ${entry.id}`,
          path: [index, 'id'],
        })
      }

      seen.add(entry.id)
    })
  })

export const PortfolioContentSchema = z
  .object({
    profile: z
      .object({
        discipline: z.string().trim().min(1).max(160),
        name: z.string().trim().min(1).max(120),
        positioning: z.string().trim().min(1).max(300),
      })
      .strict(),
    chapters: ChapterContentListSchema,
  })
  .strict()

export type ChapterContent = z.infer<typeof ChapterContentSchema>
export type PortfolioContent = z.infer<typeof PortfolioContentSchema>

const phase2Source = {
  file: 'docs/content/phase2-content-provenance.md',
  location: 'Phase 2 content provenance',
} as const

export const portfolioContent = PortfolioContentSchema.parse({
  profile: {
    name: 'Adhiraj Muduli',
    discipline: 'Biological Sciences undergraduate',
    positioning:
      'Exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
  },
  chapters: [
    {
      id: 'origins',
      eyebrow: 'Origins',
      title: 'Adhiraj Muduli',
      description:
        'Biological sciences undergraduate exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
      actions: [
        {
          external: false,
          href: '#interests',
          label: 'Explore scientific focus',
          source: {
            file: 'src/content/portfolio.ts',
            location: 'Origins in-page navigation',
          },
        },
        {
          external: true,
          href: 'https://github.com/adhirajmuduli',
          label: 'GitHub profile',
          source: {
            file: 'docs/content/phase3-site-provenance.md',
            location: 'Verified public profile',
          },
        },
      ],
      detail: {
        eyebrow: 'About',
        title: 'Education and scientific approach',
        items: [
          {
            title: 'Education context',
            description: 'Biological Sciences undergraduate.',
            source: {
              file: 'docs/content/phase2-content-provenance.md',
              location: 'Origins / identity and scientific-focus statement',
            },
          },
          {
            title: 'Scientific approach',
            description:
              'Molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
            source: {
              file: 'docs/content/phase2-content-provenance.md',
              location: 'Origins / identity and scientific-focus statement',
            },
          },
        ],
      },
      source: phase2Source,
    },
    {
      id: 'interests',
      eyebrow: 'Interests',
      title: 'Molecular Systems & Biological Computation',
      description:
        'Protein systems, bioinformatics, molecular simulation, AI-assisted discovery, scientific visualization.',
      actions: [],
      detail: {
        eyebrow: 'Research questions and methods',
        title: 'Scientific interests',
        items: [
          {
            title: 'Protein systems',
            description: 'Protein systems and molecular structure.',
            source: {
              file: 'docs/content/phase2-content-provenance.md',
              location: 'Interests / molecular-systems and biological-computation statement',
            },
          },
          {
            title: 'Biological computation',
            description: 'Bioinformatics, molecular simulation, and computational biology.',
            source: {
              file: 'docs/content/phase2-content-provenance.md',
              location: 'Interests / molecular-systems and biological-computation statement',
            },
          },
          {
            title: 'Scientific communication',
            description: 'Scientific visualization and AI-assisted discovery.',
            source: {
              file: 'docs/content/phase2-content-provenance.md',
              location: 'Interests / molecular-systems and biological-computation statement',
            },
          },
        ],
      },
      source: phase2Source,
    },
    {
      id: 'research',
      eyebrow: 'Research',
      title: 'Protein Structure & Computational Biology',
      description:
        'Research projects, scientific software, computational workflows, and biological modeling.',
      actions: [],
      detail: {
        eyebrow: 'Research focus',
        title: 'Protein structure and computational biology',
        items: [
          {
            title: 'Current scope',
            description:
              'The published portfolio currently describes research focus rather than verified research entries or outcomes.',
            source: {
              file: 'docs/content/phase2-content-provenance.md',
              location: 'Deferred data boundary',
            },
          },
        ],
      },
      source: phase2Source,
    },
    {
      id: 'computation',
      eyebrow: 'Computation',
      title: 'Biological Computation & Scientific Visualization',
      description:
        'Computational biology, molecular systems, scientific visualization, and AI-assisted biological research.',
      actions: [],
      detail: {
        eyebrow: 'Computational focus',
        title: 'Biological computation and visualization',
        items: [
          {
            title: 'Methods of interest',
            description:
              'Computational biology, molecular systems, scientific visualization, and AI-assisted biological research.',
            source: {
              file: 'README.md',
              location: 'Author / Interests include',
            },
          },
        ],
      },
      source: {
        file: 'README.md',
        location: 'Author / Interests include',
      },
    },
    {
      id: 'future',
      eyebrow: 'Future direction',
      title: 'Molecular Systems & AI-Assisted Discovery',
      description:
        'Exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
      actions: [],
      detail: {
        eyebrow: 'Current work',
        title: 'Active and exploratory work',
        items: [
          {
            status: 'active',
            title: 'Internship at NISER',
            description: 'Currently undertaking an internship at NISER.',
            source: {
              file: 'docs/content/phase8-content-provenance.md',
              location: 'Owner-approved active work status',
            },
          },
          {
            title: 'Exploration',
            description:
              'Exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
            source: {
              file: 'docs/content/phase2-content-provenance.md',
              location: 'Future / molecular-systems and AI-assisted-discovery direction',
            },
          },
        ],
      },
      source: phase2Source,
    },
  ],
})

export const chapterContentById = portfolioContent.chapters.reduce<
  Record<ChapterId, ChapterContent>
>(
  (contentById, content) => {
    contentById[content.id] = content
    return contentById
  },
  {} as Record<ChapterId, ChapterContent>,
)
