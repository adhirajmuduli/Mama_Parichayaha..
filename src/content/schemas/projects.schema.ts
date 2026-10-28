/**
 * Project tiles schema — the research slot's spiral content (new_plan.md
 * §7.2). Tiles are real links to the owner's public work; never placeholders.
 * Each tile carries a two-stop gradient for its visual identity (P11: the
 * spiral cards must not render uncolored).
 */

import { z } from 'zod'

import { ClaimSourceSchema, hexColorSchema, publicUrlSchema } from './common.schema'

const ProjectSchema = z
  .object({
    description: z.string().trim().min(1).max(200),
    gradient: z.tuple([hexColorSchema, hexColorSchema]),
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
