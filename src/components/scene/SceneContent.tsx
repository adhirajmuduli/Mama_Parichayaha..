'use client'

import { useEffect, useMemo } from 'react'

import { getSceneAsset, isRuntimeExhibitAvailable, resolveRuntimeExhibitId } from '@/content/assets'
import { getAdjacentChapterIds } from '@/lib/chapterSelectors'
import { chapterRegistry } from '@/lib/chapterRegistry'
import type { SceneQualityTier } from '@/lib/sceneRuntime'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

import { assertExhibitLoaders } from './exhibitLoaders'
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
  const markExhibitUnavailable = useSceneInteractionStore((state) => state.markExhibitUnavailable)
  const setAvailableExhibits = useSceneInteractionStore((state) => state.setAvailableExhibits)

  const availableExhibits = useMemo(() => {
    return chapterRegistry.flatMap((chapter) => {
      if (chapter.scene.exhibits.length === 0) {
        return []
      }
      const intended = chapter.scene.exhibits[0]
      if (!intended) {
        return []
      }
      const runtimeId = resolveRuntimeExhibitId(intended.id)

      return isRuntimeExhibitAvailable(intended.id, tier) ? [runtimeId] : []
    })
  }, [tier])

  useEffect(() => {
    setAvailableExhibits(availableExhibits)
    return () => {
      setAvailableExhibits([])
    }
  }, [availableExhibits, setAvailableExhibits])

  useEffect(() => {
    const preloadAssets = async () => {
      const originsRuntimeId = resolveRuntimeExhibitId('dna-alt')
      const originsAsset = getSceneAsset(originsRuntimeId)
      if (originsAsset.kind === 'gltf' && originsAsset.policy.preload === 'current') {
        await preloadModelAsset(originsRuntimeId)
      }

      const adjacentIds = getAdjacentChapterIds('origins')
      for (const chapterId of adjacentIds) {
        const chapter = chapterRegistry.find((entry) => entry.id === chapterId)
        if (!chapter || chapter.scene.exhibits.length === 0) {
          continue
        }
        const adjacentExhibit = chapter.scene.exhibits[0]
        if (!adjacentExhibit) {
          continue
        }

        const exhibitId = resolveRuntimeExhibitId(adjacentExhibit.id)
        const asset = getSceneAsset(exhibitId)
        if (asset.kind === 'gltf' && asset.policy.preload === 'adjacent') {
          await preloadModelAsset(exhibitId)
        }
      }

      const remainingIds = chapterRegistry
        .filter(
          (entry) => entry.id !== 'origins' && !getAdjacentChapterIds('origins').includes(entry.id),
        )
        .flatMap((entry) => {
          if (entry.scene.exhibits.length === 0) {
            return []
          }
          const exhibit = entry.scene.exhibits[0]
          return exhibit ? [resolveRuntimeExhibitId(exhibit.id)] : []
        })
      for (const exhibitId of remainingIds) {
        const asset = getSceneAsset(exhibitId)
        if (asset.kind === 'gltf' && asset.policy.preload === 'none') {
          await preloadModelAsset(exhibitId)
        }
      }
    }

    return scheduleIdleWork(preloadAssets)
  }, [])

  return (
    <>
      {chapterRegistry.map((chapter) => {
        if (chapter.scene.exhibits.length === 0) {
          return null
        }
        const intended = chapter.scene.exhibits[0]
        if (!intended) {
          return null
        }

        const exhibitId = resolveRuntimeExhibitId(intended.id)
        const asset = getSceneAsset(exhibitId)

        if (asset.kind !== 'gltf' || !isRuntimeExhibitAvailable(intended.id, tier)) {
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
