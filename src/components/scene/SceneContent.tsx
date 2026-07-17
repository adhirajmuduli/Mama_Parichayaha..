'use client'

import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

import type { ExhibitId } from '@/lib/chapterRegistry'
import { chapterRegistry, exhibitIds } from '@/lib/chapterRegistry'

import { assertExhibitLoaders, exhibitLoaders } from './exhibitLoaders'
import SceneErrorBoundary from './SceneErrorBoundary'

assertExhibitLoaders()

const exhibitComponents = Object.fromEntries(
  exhibitIds.map((exhibitId) => [exhibitId, lazy(exhibitLoaders[exhibitId])]),
) as Record<ExhibitId, LazyExoticComponent<ComponentType>>

export default function SceneContent() {
  const exhibitIdsInScene = chapterRegistry.flatMap((chapter) =>
    chapter.scene.exhibits.map((exhibit) => exhibit.id),
  )

  return (
    <>
      {exhibitIdsInScene.map((exhibitId) => {
        const Exhibit = exhibitComponents[exhibitId]

        return (
          <SceneErrorBoundary key={exhibitId} name={exhibitId}>
            <Exhibit />
          </SceneErrorBoundary>
        )
      })}
    </>
  )
}
