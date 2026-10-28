'use client'

/**
 * Progress position chip (P11) — the right-edge chapter rail, the "scroll to
 * continue" cue and the animation controls were removed as redundant. What
 * remains: a compact mobile-only position chip (chapter label + index)
 * announced politely, because touch users have no keyboard shortcuts and no
 * visible rail to orient by. Desktop shows nothing — the journey itself is
 * the interface.
 */

import type { CSSProperties } from 'react'

import type { ClientContent } from '@/types/experience'
import { useNarrativeStore } from '@/runtime/stores/narrative'

export interface ProgressRailProps {
  content: ClientContent
}

export function ProgressRail({ content }: ProgressRailProps) {
  const settledChapterId = useNarrativeStore((state) => state.settledChapterId)
  const settledIndex = useNarrativeStore((state) => state.settledIndex)

  const settledChapter = content.chapters.find((chapter) => chapter.id === settledChapterId)
  const accent = settledChapter?.accent

  return (
    <p
      className="progress-chip"
      aria-live="polite"
      style={{ '--rail-accent': accent } as CSSProperties}
    >
      <span>{settledChapter?.navLabel ?? 'Journey'}</span>
      <span className="progress-chip__count">
        {String(settledIndex + 1).padStart(2, '0')} /{' '}
        {String(content.chapters.length).padStart(2, '0')}
      </span>
    </p>
  )
}
