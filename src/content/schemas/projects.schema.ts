/**
 * Project tiles schema — the research slot's spiral content (new_plan.md
 * §7.2). Tiles are real links to the owner's public work; never placeholders.
 */

import { z } from 'zod'

import { ClaimSourceSchema, publicUrlSchema } from './common.schema'

export const ProjectSchema = z
  .object({
    description: z.string().trim().min(1).max(200),
    href: publicUrlSchema,
    source: ClaimSourceSchema,
    title: z.string().trim().min(1).max(100),
  })
  .strict()

export const ProjectListSchema = z
  .array(ProjectSchema)
  .min(1)
  .max(12)
  .superRefine((entries, context) => {
    const seen = new Set<string>()

    entries.forEach((entry, index) => {
      if (seen.has(entry.href)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate project href: ${entry.href}`,
          path: [index, 'href'],
        })
      }

      seen.add(entry.href)
    })
  })

export type ProjectEntry = z.infer<typeof ProjectSchema>
