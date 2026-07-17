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

export const ChapterContentSchema = z
  .object({
    id: ChapterIdSchema,
    eyebrow: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(600),
    source: ClaimSourceSchema,
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
        name: z.string().trim().min(1).max(120),
        discipline: z.string().trim().min(1).max(160),
      })
      .strict(),
    chapters: ChapterContentListSchema,
  })
  .strict()

export type ChapterContent = z.infer<typeof ChapterContentSchema>
export type PortfolioContent = z.infer<typeof PortfolioContentSchema>

export const portfolioContent = PortfolioContentSchema.parse({
  profile: {
    name: 'Adhiraj Muduli',
    discipline: 'Biological Sciences undergraduate',
  },
  chapters: [
    {
      id: 'origins',
      eyebrow: 'Origins',
      title: 'Adhiraj Muduli',
      description:
        'Biological sciences undergraduate exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
      source: {
        file: 'src/components/cards/OriginsCard.tsx',
        location: 'existing portfolio copy',
      },
    },
    {
      id: 'interests',
      eyebrow: 'Interests',
      title: 'Molecular Systems & Biological Computation',
      description:
        'Protein systems, bioinformatics, molecular simulation, AI-assisted discovery, scientific visualization.',
      source: {
        file: 'src/components/cards/InterestsCard.tsx',
        location: 'existing portfolio copy',
      },
    },
    {
      id: 'research',
      eyebrow: 'Research',
      title: 'Protein Structure & Computational Biology',
      description:
        'Research projects, scientific software, computational workflows, and biological modeling.',
      source: {
        file: 'src/components/cards/ResearchCard.tsx',
        location: 'existing portfolio copy',
      },
    },
    {
      id: 'computation',
      eyebrow: 'Computation',
      title: 'Biological Computation & Scientific Visualization',
      description:
        'Computational biology, molecular systems, scientific visualization, and AI-assisted biological research.',
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
      source: {
        file: 'src/components/cards/OriginsCard.tsx',
        location: 'existing portfolio copy',
      },
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
