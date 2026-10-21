'use client'

/**
 * LanyardFallback (new_plan.md §10.8) — the static portrait card shown when
 * the 3D island is gated off (mobile, reduced motion, no WebGL, flag off) or
 * still loading. Same figure contract as the island it substitutes for.
 */

import type { CSSProperties } from 'react'

export interface LanyardFallbackProps {
  portrait: string
  profileName: string
  profileDiscipline: string
  accent: string
}

export function LanyardFallback({
  portrait,
  profileName,
  profileDiscipline,
  accent,
}: LanyardFallbackProps) {
  return (
    <figure
      className="lanyard-fallback"
      data-lanyard-state="static"
      style={{ '--panel-accent': accent } as CSSProperties}
      aria-label={`${profileName} — ${profileDiscipline}`}
      role="img"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder portrait swap (owner photo) lands with P10 asset work */}
      <img
        className="lanyard-fallback__portrait"
        src={portrait}
        alt=""
        width={320}
        height={320}
        loading="eager"
      />
      <figcaption className="lanyard-fallback__caption">
        <span className="lanyard-fallback__name">{profileName}</span>
        <span className="lanyard-fallback__role">{profileDiscipline}</span>
      </figcaption>
    </figure>
  )
}
