'use client'

import { useJourneyRuntime } from '@/lib/journeyRuntime'
import { chapterRegistry } from '@/lib/chapterRegistry'
import { getDwellCenter, getNearestOrdinalForIndex } from '@/lib/journeyTimeline'
import { useNarrativeStore } from '@/stores/narrativeStore'

export default function ChapterProgress() {
  const runtime = useJourneyRuntime()
  const activeChapterId = useNarrativeStore((state) => state.settledChapterId)
  const focusableChapterId = useNarrativeStore((state) => state.focusableChapterId)
  const activeEntry = chapterRegistry.find((entry) => entry.id === activeChapterId)
  const displayEntry = chapterRegistry.find((entry) => entry.id === focusableChapterId) ?? activeEntry
  const displayIndex = displayEntry ? displayEntry.order + 1 : 1

  const onNavigate = (chapterId: string) => {
    const entry = chapterRegistry.find((candidate) => candidate.id === chapterId)

    if (!entry) {
      return
    }

    runtime.navigateTo(getDwellCenter(getNearestOrdinalForIndex(runtime.inputUnits.get(), entry.order)))
    useNarrativeStore.getState().requestKeyboardFocus()
  }

  return (
    <nav className="chapter-progress" aria-label="Chapter progress">
      <div className="chapter-progress__mobile-status" aria-live="polite">
        <span className="chapter-progress__count">
          {String(displayIndex).padStart(2, '0')} / {String(chapterRegistry.length).padStart(2, '0')}
        </span>
        <span>{displayEntry?.navigationLabel ?? 'Origins'}</span>
      </div>
      {activeChapterId === 'origins' ? (
        <p className="chapter-progress__cue" aria-hidden="true">
          <span className="chapter-progress__cue-arrow">↓</span>
          Scroll to explore
        </p>
      ) : null}
      <ol className="chapter-progress__rail">
        {chapterRegistry.map((entry) => {
          const isActive = entry.id === activeChapterId
          const isFocusable = entry.id === focusableChapterId

          return (
            <li key={entry.id}>
              <button
                type="button"
                className="chapter-progress__button"
                data-active={isActive ? 'true' : 'false'}
                data-focusable={isFocusable ? 'true' : 'false'}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Go to ${entry.navigationLabel}`}
                onClick={() => onNavigate(entry.id)}
              >
                <span className="chapter-progress__dot" aria-hidden="true" />
                <span className="chapter-progress__label">{entry.navigationLabel}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
