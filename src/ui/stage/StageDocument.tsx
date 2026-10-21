'use client'

/**
 * StageDocument (new_plan.md §7.6) — the semantic container. One DOM tree
 * for both modes: publications/contact are simply their chapter sections;
 * no chrome, no header, no footer (R1). The host ref carries the stage root
 * to the input coordinator in ImmersiveStage.
 *
 * data-hydrated flips once on mount so CSS can distinguish "boot script says
 * immersive but React has not hydrated yet" (keep the stacked document) from
 * the fully interactive stage (fixed viewport).
 */

import { useEffect, type RefObject } from 'react'

import type { ClientContent } from '@/types/experience'

import { ChapterDeck } from './ChapterDeck'

export interface StageDocumentProps {
  content: ClientContent
  immersive: boolean
  hostRef: RefObject<HTMLDivElement | null>
}

export function StageDocument({ content, immersive, hostRef }: StageDocumentProps) {
  const landingChapterId = content.chapters[0]?.id

  useEffect(() => {
    if (hostRef.current) {
      hostRef.current.dataset.hydrated = 'true'
    }
  }, [hostRef])

  return (
    <main className="stage-root" aria-label="Portfolio journey" ref={hostRef}>
      {landingChapterId ? (
        <a href={`#${landingChapterId}`} className="skip-link">
          Skip to portfolio content
        </a>
      ) : null}
      <ChapterDeck content={content} immersive={immersive} />
    </main>
  )
}
