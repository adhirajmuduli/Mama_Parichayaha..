'use client'

/**
 * Placeholder + owner-supplied source adapters (new_plan.md §10.1).
 *
 * The table maps `sourceKey` → dynamic loader. P5/P6 ship only the
 * placeholder; owner animation modules (P9b) land here as new keys — the
 * registry, player, controls and layout never change.
 */

import type { AsciiExhibitSource } from '../types'

export async function loadPlaceholderSource(exhibitId: string): Promise<AsciiExhibitSource> {
  const { createPlaceholderSource } = await import('./placeholder-source')

  return createPlaceholderSource(exhibitId)
}

export type AsciiSourceLoader = () => Promise<AsciiExhibitSource>

/**
 * Adapter table. Keys are authored in `content/data/exhibits.ts`
 * (`sourceKey`); unknown keys resolve to the placeholder with a diagnostics
 * note — never a thrown error.
 */
export const asciiSourceLoaders: Record<string, AsciiSourceLoader> = {
  placeholder: () => loadPlaceholderSource('placeholder'),
}

/**
 * Resolves an exhibit's animated source for its source key. Owner adapters
 * register here in P9b; keys absent from the table intentionally fall back
 * (for example the still-missing alternate DNA intake).
 */
export function getSourceLoader(sourceKey: string, exhibitId: string): AsciiSourceLoader {
  const loader = asciiSourceLoaders[sourceKey]

  if (loader) {
    return loader
  }

  return () => loadPlaceholderSource(exhibitId)
}
