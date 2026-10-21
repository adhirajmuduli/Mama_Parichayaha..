/**
 * Journey topology schema (new_plan.md §7.2).
 *
 * The chapter count is data: any N ≥ 3 validates. Downstream systems derive
 * geometry, timelines, rails and windows from N — nothing may hard-code it.
 */

import { z } from 'zod'

import { slugSchema } from './common.schema'

export const journeySchema = z
  .object({
    /** Ordered ring of chapter ids; index 0 is the landing chapter. */
    chapterIds: z.array(slugSchema).min(3).max(12),
  })
  .strict()
  .superRefine((journey, context) => {
    const seen = new Set<string>()

    journey.chapterIds.forEach((id, index) => {
      if (seen.has(id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate journey chapter id: ${id}`,
          path: ['chapterIds', index],
        })
      }

      seen.add(id)
    })
  })

export type JourneyContent = z.infer<typeof journeySchema>
