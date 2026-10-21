/**
 * Shared schema primitives for authored content (new_plan.md §7.2).
 *
 * Provenance: every authored fact carries a `source` claim pointing at the
 * documentation file that justifies it. Claims are authoring-side only —
 * the client projection strips them (R10).
 */

import { z } from 'zod'

export const ClaimSourceSchema = z
  .object({
    file: z.string().trim().min(1),
    location: z.string().trim().min(1),
  })
  .strict()

export type ClaimSource = z.infer<typeof ClaimSourceSchema>

/** Kebab-case identifier shared by chapters, exhibits and visual sources. */
export const slugSchema = z.string().regex(/^[a-z][a-z0-9-]*$/, 'Expected a kebab-case identifier.')

/** CSS hex color (3, 4, 6 or 8 digits) used by accents and backgrounds. */
export const hexColorSchema = z
  .string()
  .regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    'Expected a hex color.',
  )

/** Absolute https (or http for localhost tooling) URL. */
export const publicUrlSchema = z.string().url()
