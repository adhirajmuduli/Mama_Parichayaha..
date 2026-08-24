'use client'

import type { ComponentType } from 'react'

import { chapterRegistry, type ExhibitId } from '@/lib/chapterRegistry'

export type ExhibitLoader = () => Promise<{ default: ComponentType }>

export const exhibitLoaders = {
  dna: () => import('@/components/models/DNA'),
  phages: () => import('@/components/models/PhageSystem'),
  helix: () => import('@/components/models/HelixExhibit'),
  lattice: () => import('@/components/models/LatticeExhibit'),
  orbit: () => import('@/components/models/OrbitExhibit'),
} satisfies Record<ExhibitId, ExhibitLoader>

export function assertExhibitLoaders(
  loaders: Partial<Record<ExhibitId, ExhibitLoader>> = exhibitLoaders,
) {
  const registeredExhibits = new Set(
    chapterRegistry.flatMap((chapter) => chapter.scene.exhibits.map((exhibit) => exhibit.id)),
  )

  for (const exhibitId of registeredExhibits) {
    if (typeof loaders[exhibitId] !== 'function') {
      throw new Error(`Exhibit "${exhibitId}" has no dynamic loader.`)
    }
  }
}
