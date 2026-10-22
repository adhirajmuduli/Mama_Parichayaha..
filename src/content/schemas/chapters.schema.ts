/**
 * Chapter copy schema (new_plan.md §7.2) — migrated verbatim from the retired
 * `content/portfolio.ts`, extended with `navLabel` and the interests-era
 * `rotating` word-cycle block.
 */

import { z } from 'zod'

import { ClaimSourceSchema, slugSchema } from './common.schema'

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
    items: z.array(ChapterDetailItemSchema).min(0).max(8),
    title: z.string().trim().min(1).max(140),
  })
  .strict()

const RotatingCopySchema = z
  .object({
    items: z.array(z.string().trim().min(1).max(60)).min(2).max(8),
    prefix: z.string().trim().min(1).max(40),
  })
  .strict()

const ChapterSchema = z
  .object({
    actions: z.array(ContentActionSchema).max(3),
    description: z.string().trim().min(1).max(600),
    detail: ChapterDetailSchema,
    eyebrow: z.string().trim().min(1).max(80),
    id: slugSchema,
    /** Short navigation label; defaults to eyebrow when omitted. */
    navLabel: z.string().trim().min(1).max(24).optional(),
    rotating: RotatingCopySchema.optional(),
    source: ClaimSourceSchema,
    title: z.string().trim().min(1).max(140),
  })
  .strict()

export const ChapterListSchema = z
  .array(ChapterSchema)
  .min(3)
  .max(12)
  .superRefine((entries, context) => {
    const seen = new Set<string>()

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

export const ProfileSchema = z
  .object({
    discipline: z.string().trim().min(1).max(160),
    name: z.string().trim().min(1).max(120),
    positioning: z.string().trim().min(1).max(300),
  })
  .strict()

export type ChapterEntry = z.infer<typeof ChapterSchema>
export type ProfileEntry = z.infer<typeof ProfileSchema>
