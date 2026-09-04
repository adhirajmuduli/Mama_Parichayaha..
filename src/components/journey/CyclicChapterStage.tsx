'use client'

import { useEffect, useRef } from 'react'

import ChapterCardShell from '@/components/journey/ChapterCardShell'
import ChapterDetail from '@/components/narrative/ChapterDetail'
import { chapterRegistry, getChapterContent } from '@/lib/chapterRegistry'
import { useJourneyRuntime } from '@/lib/journeyRuntime'
import { getDwellCenter, getNearestOrdinalForIndex } from '@/lib/journeyTimeline'
import { useNarrativeStore } from '@/stores/narrativeStore'

export default function CyclicChapterStage() {
  const runtime = useJourneyRuntime()
  const settledChapterId = useNarrativeStore((state) => state.settledChapterId)
  const visibleChapterIds = useNarrativeStore((state) => state.visibleChapterIds)
  const focusableChapterId = useNarrativeStore((state) => state.focusableChapterId)
  const keyboardFocusToken = useNarrativeStore((state) => state.keyboardFocusToken)
  const activeCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (keyboardFocusToken === 0) {
      return
    }

    activeCardRef.current?.focus({ preventScroll: true })
  }, [keyboardFocusToken])

  return (
    <>
      <p className="sr-only" id="journey-instructions">
        Scroll, swipe vertically, or use arrow keys to move between five looping chapters.
      </p>

      {chapterRegistry.filter((entry) => visibleChapterIds.includes(entry.id)).map((entry) => {
        const content = getChapterContent(entry.id)
        const visible = visibleChapterIds.includes(entry.id)
        const focusable = focusableChapterId === entry.id
        const labelledById = `${entry.sectionId}-heading`
        const isSettled = settledChapterId === entry.id

        return (
          <ChapterCardShell
            key={entry.id}
            cardSide={entry.order % 2 === 0 ? 'left' : 'right'}
            chapterId={entry.id}
            focusable={focusable}
            glow={entry.scene.atmosphere.keyLight}
            labelledById={labelledById}
            visible={visible}
          >
            <div ref={isSettled ? activeCardRef : undefined} tabIndex={-1} className="outline-none">
              <p
                className="mb-3 text-sm uppercase tracking-[0.3em]"
                style={{ color: entry.scene.atmosphere.keyLight }}
              >
                {content.eyebrow}
              </p>
              <h2 id={labelledById} className="mb-4 text-4xl font-semibold sm:text-5xl">
                {content.title}
              </h2>
              <p className="leading-relaxed text-[var(--site-muted)]">{content.description}</p>
              <ChapterDetail
                chapter={content}
                onAnchorNavigation={(chapterId) => {
                  runtime.navigateTo(
                    getDwellCenter(
                      getNearestOrdinalForIndex(
                        runtime.inputUnits.get(),
                        chapterIndexFor(chapterId),
                      ),
                    ),
                  )
                  useNarrativeStore.getState().requestKeyboardFocus()
                }}
              />
            </div>
          </ChapterCardShell>
        )
      })}
    </>
  )
}

function chapterIndexFor(chapterId: string): number {
  const entry = chapterRegistry.find((candidate) => candidate.id === chapterId)

  return entry?.order ?? 0
}
