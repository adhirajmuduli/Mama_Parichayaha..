'use client'

import { lazy, useEffect, useMemo } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

import { getSceneAsset, isSceneAssetAvailable } from '@/content/assets'
import { getAdjacentChapterIds } from '@/lib/chapterSelectors'
import { chapterRegistry, exhibitIds, type ExhibitId } from '@/lib/chapterRegistry'
import type { SceneQualityTier } from '@/lib/sceneRuntime'
import { useNarrativeStore } from '@/stores/narrativeStore'

import { assertExhibitLoaders, exhibitLoaders } from './exhibitLoaders'
import { preloadModelAsset } from './modelPreload'
import SceneErrorBoundary from './SceneErrorBoundary'

assertExhibitLoaders()

const exhibitComponents = Object.fromEntries(
  exhibitIds.map((exhibitId) => [exhibitId, lazy(exhibitLoaders[exhibitId])]),
) as Record<ExhibitId, LazyExoticComponent<ComponentType>>

interface IdleWindow {
  cancelIdleCallback?: (handle: number) => void
  requestIdleCallback?: (callback: () => void, options: { timeout: number }) => number
}

function scheduleIdleWork(callback: () => void) {
  const idleWindow = window as Window & IdleWindow

  if (typeof idleWindow.requestIdleCallback === 'function') {
    const idleCallback = idleWindow.requestIdleCallback(callback, { timeout: 2_000 })
    return () => idleWindow.cancelIdleCallback?.(idleCallback)
  }

  const timeout = window.setTimeout(callback, 500)
  return () => window.clearTimeout(timeout)
}

export default function SceneContent({ tier }: { tier: Exclude<SceneQualityTier, 'static'> }) {
  const activeChapter = useNarrativeStore((state) => state.activeChapter)
  const activeAndAdjacentExhibits = useMemo(() => {
    const nearbyChapterIds = new Set([activeChapter, ...getAdjacentChapterIds(activeChapter)])

    return chapterRegistry
      .filter((chapter) => nearbyChapterIds.has(chapter.id))
      .flatMap((chapter) => chapter.scene.exhibits.map((exhibit) => exhibit.id))
      .filter((exhibitId) => isSceneAssetAvailable(exhibitId, tier))
  }, [activeChapter, tier])

  useEffect(() => {
    return scheduleIdleWork(() => {
      for (const exhibitId of activeAndAdjacentExhibits) {
        const asset = getSceneAsset(exhibitId)

        if (asset.kind === 'gltf' && asset.policy.preload === 'adjacent') {
          preloadModelAsset(exhibitId)
        }
      }
    })
  }, [activeAndAdjacentExhibits])

  return (
    <>
      {activeAndAdjacentExhibits.map((exhibitId) => {
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
