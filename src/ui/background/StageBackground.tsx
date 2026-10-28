'use client'

/**
 * StageBackground (new_plan.md §7.6, P11 plasma edition) — the living
 * per-chapter background.
 *
 * Two palette layers cross-fade on settle (chapter colors), and each layer
 * carries three large radial-gradient plasma blobs drifting on slow
 * compositor-only transform keyframes (never background-position paint).
 * The drift is the one sanctioned continuous decorative animation: it is
 * transform/opacity only, hidden-document-free (CSS animations pause
 * offscreen), and fully suppressed under prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react'

import type { ClientChapter } from '@/types/experience'
import { useNarrativeStore } from '@/runtime/stores/narrative'

const BLOBS = [
  { className: 'stage-background__blob stage-background__blob--a' },
  { className: 'stage-background__blob stage-background__blob--b' },
  { className: 'stage-background__blob stage-background__blob--c' },
]

function Layer({ layerRef }: { layerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="stage-background__layer" ref={layerRef} data-bg-active="false">
      {BLOBS.map((blob) => (
        <div className={blob.className} key={blob.className} />
      ))}
    </div>
  )
}

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

      const [base, plasmaA, plasmaB] = chapter.background
      const target = first ? current : next

      target.style.setProperty('--bg-base', base)
      target.style.setProperty('--bg-plasma-a', plasmaA)
      target.style.setProperty('--bg-plasma-b', plasmaB)

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
      <Layer layerRef={layerARef} />
      <Layer layerRef={layerBRef} />
      <div className="stage-background__vignette" />
    </div>
  )
}
