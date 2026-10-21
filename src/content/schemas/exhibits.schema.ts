/**
 * ASCII exhibit metadata schema (new_plan.md §7.2, §10).
 *
 * Policy only — the animation code itself arrives later as owner-supplied
 * `AsciiExhibitSource` adapters and is never part of the content payload.
 * No credit/attribution fields live here (R10): credits are site content.
 */

import { z } from 'zod'

import { slugSchema } from './common.schema'

export const ExhibitSchema = z
  .object({
    /** Matches an adapter key in exhibits/sources (placeholder for now). */
    sourceKey: slugSchema.default('placeholder'),
    /** Stable exhibit id (chapter-scoped slot identity). */
    id: slugSchema,
    chapter: slugSchema,
    /** Controls group name, e.g. "DNA" → "DNA animation controls". */
    label: z.string().trim().min(1).max(40),
    /** Stable aria description of the intended animation. */
    description: z.string().trim().min(1).max(200),
    /** Authored frame rate; the player caps it by quality tier. */
    fps: z.number().min(1).max(30),
    /** False until owner-supplied animated sources are integrated. */
    animated: z.boolean(),
  })
  .strict()

export const ExhibitListSchema = z
  .array(ExhibitSchema)
  .max(12)
  .superRefine((entries, context) => {
    const seen = new Set<string>()

    entries.forEach((entry, index) => {
      if (seen.has(entry.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate exhibit id: ${entry.id}`,
          path: [index, 'id'],
        })
      }

      seen.add(entry.id)
    })
  })

export type ExhibitEntry = z.infer<typeof ExhibitSchema>
