'use client'

import type { ComponentType } from 'react'

import type { ExhibitId } from '@/lib/chapterRegistry'

export type ExhibitLoader = () => Promise<{ default: ComponentType }>

export const exhibitLoaders: Record<ExhibitId, ExhibitLoader> = {
  dna: () => import('@/components/models/DNA'),
  phages: () => import('@/components/models/PhageSystem'),
  protein: () => import('@/components/models/ProteinShowcase'),
  tardigrade: () => import('@/components/models/Tradigrade'),
}
