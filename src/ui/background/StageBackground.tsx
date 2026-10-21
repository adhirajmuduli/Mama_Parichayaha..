'use client'

/**
 * StageBackground (new_plan.md §7.6) — two stacked gradient layers that
 * cross-fade between chapter palettes on settle. Compositor-only (opacity
 * transition); the store publication is the only trigger, so the component
 * never re-renders after mount.
 */

import { useEffect, useRef } from 'react'

import type { ClientChapter } from '@/types/experience'
import { useNarrativeStore } from '@/runtime/stores/narrative'

export function StageBackground({ chapters }: { chapters: ClientChapter[] }) {
  const layerARef = useRef<HTMLDivElement | null>(null)
  const layerBRef = useRef<HTMLDivElement | null>(null)
  const activeLayerRef = useRef<'a' | 'b'>('a')

  useEffect(() => {
    const applyPalette = (chapterId: string, first: boolean) => {
      const chapter = chapters.find((entry) => entry.id === chapterId)
      if (!chapter) return

      const current = activeLayerRef.current === 'a' ? layerARef.current : layerBRef.current
      // The new palette paints the currently-inactive layer, which then
      // cross-fades on top; the old layer fades beneath it.
      const next = activeLayerRef.current === 'a' ? layerBRef.current : layerARef.current

      if (!current || !next) return

      const [base, mid, accent] = chapter.background
      const target = first ? current : next

      target.style.setProperty('--bg-base', base)
      target.style.setProperty('--bg-mid', mid)
      target.style.setProperty('--bg-accent', accent)

      if (first) {
        target.dataset.bgActive = 'true'
        return
      }

      target.dataset.bgActive = 'true'
      current.dataset.bgActive = 'false'
      activeLayerRef.current = activeLayerRef.current === 'a' ? 'b' : 'a'
    }

    const initial = useNarrativeStore.getState().settledChapterId
    if (initial) {
      applyPalette(initial, true)
    }

    return useNarrativeStore.subscribe((state) => {
      if (state.settledChapterId) {
        applyPalette(state.settledChapterId, false)
      }
    })
  }, [chapters])

  return (
    <div className="stage-background" aria-hidden="true">
      <div className="stage-background__layer" ref={layerARef} data-bg-active="true" />
      <div className="stage-background__layer" ref={layerBRef} data-bg-active="false" />
    </div>
  )
}
