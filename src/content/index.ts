/**
 * Server-facing content surface (new_plan.md §7.2).
 *
 * Route handlers and server components import from here; nothing else should
 * reach into schemas or data files directly (enforced by the boundaries
 * script for client layers).
 */

import { validatedContent } from './validate'
import type { ValidatedContent } from './validate'

export { buildClientContent } from './projection'
export { validatedContent }

/** Validated site content for secondary routes (/contact, /credits, /privacy). */
export const siteContent: ValidatedContent['site'] = validatedContent.site

export type { ValidatedContent }
