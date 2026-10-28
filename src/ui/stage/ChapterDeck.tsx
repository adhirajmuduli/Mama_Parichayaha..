'use client'

/**
 * ChapterDeck (new_plan.md §7.6) — maps chapters to card sections and derives
 * each card's window state from the narrative store. Card roots are stable
 * (N sections, always); only data attributes change, and the deck subscribes
 * to the frame stream once to write the exit-shift CSS variable so outgoing/
 * incoming cards fly in the travel direction.
 */

import { useEffect, useRef } from 'react'

import type { ClientContent } from '@/types/experience'
import { useJourneyRuntime } from '@/runtime/journeyRuntime'
import { useNarrativeStore } from '@/runtime/stores/narrative'

import { ChapterCard, type ChapterCardProps } from './ChapterCard'

type CardState = 'settled' | 'outgoing' | 'incoming' | 'idle'

function deriveCardStates(
  chapters: ClientContent['chapters'],
  settledChapterId: string,
  visibleChapterIds: readonly string[],
  travelMode: 'dwell' | 'transition',
): CardState[] {
  return chapters.map((chapter) => {
    if (chapter.id === settledChapterId && travelMode === 'dwell') {
      return 'settled'
    }

    if (travelMode === 'transition' && visibleChapterIds.length === 2) {
      if (visibleChapterIds[0] === chapter.id) return 'outgoing'
      if (visibleChapterIds[1] === chapter.id) return 'incoming'
    }

    return 'idle'
  })
}

export interface ChapterDeckProps {
  content: ClientContent
  immersive: boolean
}

export function ChapterDeck({ content, immersive }: ChapterDeckProps) {
  const runtime = useJourneyRuntime()
  const deckRef = useRef<HTMLDivElement | null>(null)

  const settledChapterId = useNarrativeStore((state) => state.settledChapterId)
  const visibleChapterIds = useNarrativeStore((state) => state.visibleChapterIds)
  const travelMode = useNarrativeStore((state) => state.travelMode)
  const keyboardFocusToken = useNarrativeStore((state) => state.keyboardFocusToken)
  const focusableChapterId = useNarrativeStore((state) => state.focusableChapterId)

  const cardStates = deriveCardStates(
    content.chapters,
    settledChapterId,
    visibleChapterIds,
    travelMode,
  )

  // Frame-driven exit direction: outgoing cards fly opposite to travel.
  useEffect(() => {
    if (!immersive) return

    return runtime.subscribeFrame((frame) => {
      const deck = deckRef.current

      if (deck && frame.direction !== 0) {
        deck.style.setProperty('--card-exit-shift', String(frame.direction))
      }
    })
  }, [runtime, immersive])

  // Keyboard-focus token: focus the focusable card's surface.
  useEffect(() => {
    if (keyboardFocusToken === 0 || !focusableChapterId) return

    const surface = document.querySelector<HTMLElement>(
      `#${focusableChapterId} .stage-card__surface`,
    )

    surface?.focus({ preventScroll: true })
  }, [keyboardFocusToken, focusableChapterId])

  return (
    <div className="stage-deck" ref={deckRef}>
      {content.chapters.map((chapter, index) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          cardState={cardStates[index] ?? 'idle'}
          immersive={immersive}
          isLanding={index === 0}
          profileName={content.profile.name}
          profileDiscipline={content.profile.discipline}
          portrait={content.portrait}
          privacyNotice={content.contact.privacyNotice}
          contactExtras={chapter.id === content.contact.id}
          projects={content.projects}
        />
      ))}
    </div>
  )
}

export type { ChapterCardProps }
