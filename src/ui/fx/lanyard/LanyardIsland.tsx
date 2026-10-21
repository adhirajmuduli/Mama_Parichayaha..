'use client'

/**
 * LanyardIsland (new_plan.md §10.8, R11) — the lazy mount for the three.js
 * Lanyard. three exists ONLY inside this dynamic chunk; the static portrait
 * fallback renders during load and whenever the island is gated off.
 *
 * The island keeps its own self-parking rAF (documented §11.1 exception):
 * it stops when the card rests, leaves the viewport, or the tab hides, and
 * it disposes every GPU resource on unmount.
 */

import dynamic from 'next/dynamic'
import type { CSSProperties } from 'react'

import type { ClientChapter } from '@/types/experience'

const Lanyard = dynamic(() => import('./Lanyard').then((module) => module.default), {
  ssr: false,
  loading: () => null,
})

export interface LanyardIslandProps {
  chapter: ClientChapter
  portrait: string
  profileName: string
  profileDiscipline: string
}

export function LanyardIsland({
  chapter,
  portrait,
  profileName,
  profileDiscipline,
}: LanyardIslandProps) {
  return (
    <figure
      className="lanyard-stage"
      data-lanyard-stage=""
      data-lanyard-state="interactive"
      style={{ '--panel-accent': chapter.accent } as CSSProperties}
      role="img"
      aria-label={`${profileName} — ${profileDiscipline}. Interactive hanging badge: drag to swing, click to flip.`}
    >
      <Lanyard
        frontImage={portrait}
        imageFit="cover"
        cardColor="#101521"
        strapColor={chapter.accent}
        metal="graphite"
        finish="glossy"
        orientation="portrait"
        anchor="center"
        interactive
        intro
      />
    </figure>
  )
}
