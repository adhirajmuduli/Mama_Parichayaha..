/**
 * Per-chapter presentation schema (new_plan.md §7.2, R15).
 *
 * The retired 3D registry fields (route centers, camera poses, lighting rigs,
 * fog, bloom, model transforms) are intentionally gone: the DOM-first stage
 * derives its motion from the journey timeline, not from scene geometry.
 * What remains is presentation data the DOM layer actually consumes.
 */

import { z } from 'zod'

import { hexColorSchema, slugSchema } from './common.schema'

const chapterVisualKinds = ['ascii', 'spiral', 'lanyard'] as const

const SceneEntrySchema = z
  .object({
    /** Chapter id this presentation belongs to. */
    id: slugSchema,
    /** Which half of the desktop split the text card occupies. */
    cardSide: z.enum(['left', 'right']),
    /** Vivid per-chapter accent (old atmosphere palette[2]). */
    accent: hexColorSchema,
    /** Layered background ramp: [base, mid, accent]. */
    background: z.tuple([hexColorSchema, hexColorSchema, hexColorSchema]),
    /** Slot component selection (R15). */
    visual: z
      .object({
        kind: z.enum(chapterVisualKinds),
      })
      .strict(),
    /** Sizing hint for the visual slot. */
    panelAspect: z.enum(['wide', 'square', 'tall']),
  })
  .strict()

export const SceneContentSchema = z
  .array(SceneEntrySchema)
  .min(3)
  .max(12)
  .superRefine((entries, context) => {
    const seen = new Set<string>()

    entries.forEach((entry, index) => {
      if (seen.has(entry.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate scene entry id: ${entry.id}`,
          path: [index, 'id'],
        })
      }

      seen.add(entry.id)
    })
  })

export type SceneEntry = z.infer<typeof SceneEntrySchema>
