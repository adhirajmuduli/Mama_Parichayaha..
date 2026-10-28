'use client'

/** Lazy loaders for the authored procedural artwork modules. */

import type { AsciiExhibitSource } from '../types'

async function loadPlaceholderSource(exhibitId: string): Promise<AsciiExhibitSource> {
  const { createPlaceholderSource } = await import('./placeholder-source')

  return createPlaceholderSource(exhibitId)
}

export type AsciiSourceLoader = () => Promise<AsciiExhibitSource>

const asciiSourceLoaders: Record<string, AsciiSourceLoader> = {
  placeholder: () => loadPlaceholderSource('placeholder'),
  origins: () => import('@/arts/origins').then((module) => module.originsArtwork),
  interests: () => import('@/arts/interests').then((module) => module.interestsArtwork),
  research: () => import('@/arts/research').then((module) => module.researchArtwork),
  computation: () => import('@/arts/computation').then((module) => module.computationArtwork),
  future: () => import('@/arts/future').then((module) => module.futureArtwork),
  publications: () => import('@/arts/publications').then((module) => module.publicationsArtwork),
  contact: () => import('@/arts/contact').then((module) => module.contactArtwork),
}

/**
 * Unknown keys intentionally fall back to the deterministic placeholder.
 */
export function getSourceLoader(sourceKey: string, exhibitId: string): AsciiSourceLoader {
  const loader = asciiSourceLoaders[sourceKey]

  if (loader) {
    return loader
  }

  return () => loadPlaceholderSource(exhibitId)
}
