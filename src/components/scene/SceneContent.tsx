'use client'

import { useEffect, useMemo } from 'react'

import { getSceneAsset, isSceneAssetAvailable } from '@/content/assets'
import { getAdjacentChapterIds } from '@/lib/chapterSelectors'
import { chapterRegistry } from '@/lib/chapterRegistry'
import type { SceneQualityTier } from '@/lib/sceneRuntime'
import { useNarrativeStore } from '@/stores/narrativeStore'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

import { assertExhibitLoaders, exhibitLoaders } from './exhibitLoaders'
import { preloadModelAsset } from './modelPreload'
import SceneErrorBoundary from './SceneErrorBoundary'
import ChapterGLTFModel from './exhibits/ChapterGLTFModel'

assertExhibitLoaders()

function scheduleIdleWork(callback: () => void) {
  const idleWindow = window as Window & {
    cancelIdleCallback?: (handle: number) => void
    requestIdleCallback?: (callback: () => void, options: { timeout: number }) => number
  }

  if (typeof idleWindow.requestIdleCallback === 'function') {
    const idleCallback = idleWindow.requestIdleCallback(callback, { timeout: 2_000 })
    return () => idleWindow.cancelIdleCallback?.(idleCallback)
  }

  const timeout = window.setTimeout(callback, 500)
  return () => window.clearTimeout(timeout)
}

export default function SceneContent({ tier }: { tier: Exclude<SceneQualityTier, 'static'> }) {
  const activeChapter = useNarrativeStore((state) => state.activeChapter)
  const markExhibitUnavailable = useSceneInteractionStore((state) => state.markExhibitUnavailable)
  const setAvailableExhibits = useSceneInteractionStore((state) => state.setAvailableExhibits)

  // All five chapters are always mounted; ChapterGLTFModel handles presence/nearby logic internally
  const fiveChapterIds = chapterRegistry.map((chapter) => chapter.id)

  const availableExhibits = useMemo(() => {
    return chapterRegistry
      .filter((chapter) => isSceneAssetAvailable(chapter.scene.exhibits[0].id, tier))
      .flatMap((chapter) => chapter.scene.exhibits.map((exhibit) => exhibit.id))
  }, [tier])

  useEffect(() => {
    setAvailableExhibits(availableExhibits)
    return () => {
      setAvailableExhibits([])
    }
  }, [availableExhibits, setAvailableExhibits])

  // Preload: Origins immediately, adjacent after Origins interactive, remaining on idle
  useEffect(() => {
    const preloadAssets = async () => {
      // Preload Origins immediately
      const originsAsset = getSceneAsset('dna-alt')
      if (originsAsset.kind === 'gltf' && originsAsset.policy.preload === 'current') {
        await preloadModelAsset('dna-alt')
      }

      // Preload adjacent after Origins is interactive
      const activeChapter = 'origins'
      const adjacentIds = getAdjacentChapterIds(activeChapter)
      for (const chapterId of adjacentIds) {
        const chapter = chapterRegistry.find((c) => c.id === chapterId)
        if (chapter && chapter.scene.exhibits[0]) {
          const exhibitId = chapter.scene.exhibits[0].id
          const asset = getSceneAsset(exhibitId)
          if (asset.kind === 'gltf' && asset.policy.preload === 'adjacent') {
            await preloadModelAsset(exhibitId)
          }
        }
      }

      // Preload remaining on idle
      const remainingIds = chapterRegistry
        .filter((c) => c.id !== 'origins' && !getAdjacentChapterIds('origins').includes(c.id))
        .map((c) => c.scene.exhibits[0].id)
      for (const exhibitId of remainingIds) {
        const asset = getSceneAsset(exhibitId)
        if (asset.kind === 'gltf' && asset.policy.preload === 'none') {
          await preloadModelAsset(exhibitId)
        }
      }
    }

    scheduleIdleWork(preloadAssets)
  }, [])

  return (
    <>
      {chapterRegistry.map((chapter) => {
        const exhibitId = chapter.scene.exhibits[0].id
        const asset = getSceneAsset(exhibitId)

        if (asset.kind !== 'gltf') {
          return null
        }

        return (
          <SceneErrorBoundary
            key={exhibitId}
            name={exhibitId}
            onError={() => markExhibitUnavailable(exhibitId)}
          >
            <ChapterGLTFModel
              assetId={exhibitId}
              chapter={chapter.id}
              position={chapter.scene.center}
            />
          </SceneErrorBoundary>
        )
      })}
    </>
  )
}