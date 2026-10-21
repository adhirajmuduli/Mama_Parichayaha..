'use client'

/**
 * ProgressRail (new_plan.md §7.6) — semantic chapter navigation.
 *
 * Real anchors (`#id`) work with zero JavaScript (document mode scrolls to
 * sections natively); immersive mode enhances clicks to journey navigation
 * with pushState. Count-agnostic; desktop shows the labeled dot rail, mobile
 * the compact position pill. The live region announces the settled chapter
 * for screen readers.
 */

import type { CSSProperties } from 'react'

import type { ClientContent } from '@/types/experience'
import { useJourneyRuntime } from '@/runtime/journeyRuntime'
import { useNarrativeStore } from '@/runtime/stores/narrative'

export interface ProgressRailProps {
  content: ClientContent
  immersive: boolean
}

export function ProgressRail({ content, immersive }: ProgressRailProps) {
  const runtime = useJourneyRuntime()
  const settledChapterId = useNarrativeStore((state) => state.settledChapterId)
  const settledIndex = useNarrativeStore((state) => state.settledIndex)

  const settledChapter = content.chapters.find((chapter) => chapter.id === settledChapterId)
  const accent = settledChapter?.accent

  const navigate = (chapterId: string) => {
    if (!immersive) return

    const index = runtime.getTopology().indexById(chapterId)

    if (index >= 0) {
      runtime.navigateToIndex(index)
      window.history.pushState(null, '', `#${chapterId}`)
      useNarrativeStore.getState().requestKeyboardFocus()
    }
  }

  return (
    <>
      <nav className="progress-rail" aria-label="Chapter progress">
        <ul className="progress-rail__list">
          {content.chapters.map((chapter, index) => {
            const active = chapter.id === settledChapterId

            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  className="progress-rail__link"
                  aria-current={active ? 'step' : undefined}
                  aria-keyshortcuts={index < 9 ? `${index + 1}` : undefined}
                  data-active={active ? 'true' : 'false'}
                  onClick={(event) => {
                    if (!immersive) return

                    // Anchors keep working; enhanced clicks own the journey.
                    event.preventDefault()
                    navigate(chapter.id)
                  }}
                >
                  <span>{chapter.navLabel}</span>
                  <span className="progress-rail__dot" aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ul>

        <p
          className="progress-rail__status"
          aria-live="polite"
          style={{ '--rail-accent': accent } as CSSProperties}
        >
          <span>{settledChapter?.navLabel ?? 'Journey'}</span>
          <span className="progress-rail__count">
            {String(settledIndex + 1).padStart(2, '0')} /{' '}
            {String(content.chapters.length).padStart(2, '0')}
          </span>
        </p>
      </nav>

      <p className="progress-rail__cue" aria-hidden="true">
        <span className="progress-rail__cue-arrow">↓</span>
        <span>Scroll to continue</span>
      </p>
    </>
  )
}
