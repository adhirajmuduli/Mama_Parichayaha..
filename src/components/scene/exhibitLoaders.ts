'use client'

import type { ComponentType } from 'react'

import { chapterRegistry, exhibitIds, type ExhibitId } from '@/lib/chapterRegistry'

export type ExhibitLoader = () => Promise<{ default: ComponentType }>

export const exhibitLoaders: Record<ExhibitId, ExhibitLoader> = {
  dna: () => import('@/components/models/DNA'),
  phages: () => import('@/components/models/PhageSystem'),
  protein: () => import('@/components/models/ProteinShowcase'),
  tardigrade: () => import('@/components/models/Tradigrade'),
}

export function assertExhibitLoaders(loaders: Record<ExhibitId, ExhibitLoader> = exhibitLoaders) {
  const registeredExhibits = new Set(
    chapterRegistry.flatMap((chapter) => chapter.scene.exhibits.map((exhibit) => exhibit.id)),
  )

  for (const exhibitId of exhibitIds) {
    if (!registeredExhibits.has(exhibitId)) {
      throw new Error(`Exhibit loader "${exhibitId}" has no chapter registry entry.`)
    }

    if (typeof loaders[exhibitId] !== 'function') {
      throw new Error(`Exhibit "${exhibitId}" has no dynamic loader.`)
    }
  }
}
