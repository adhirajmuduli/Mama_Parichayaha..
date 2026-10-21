'use client'

/**
 * AsciiPanel (new_plan.md §10.3) — the exhibit slot's frame, player and
 * controls in one labeled figure.
 *
 * P5 shipped the static shell; P6 upgrades it to the full playback engine:
 * registry-resolved source, quality-capped frame cadence, gated playback,
 * user controls. The markup contract (role="img", aria-hidden <pre>,
 * caption) is unchanged so the stage-contract test and CSS stay stable.
 *
 * While only placeholder art exists (FEATURES.exhibits=false or unanimated
 * metadata) the panel renders frame 0 statically and the controls explain
 * themselves — zero scheduler work anywhere on the page at rest.
 */

import { useRef, type CSSProperties } from 'react'

import type { ClientExhibit } from '@/types/experience'
import { useQualityProfile } from '@/runtime/quality'

import { useExhibitSource } from './registry'
import { useExhibitPlayback } from './useExhibitPlayback'
import { useExhibitCommands } from './useExhibitCommands'
import { AsciiFramePlayer } from './AsciiFramePlayer'
import { AnimationControls } from './AnimationControls'
import { readSourceFrame } from './types'
import { PLACEHOLDER_DEFAULT_GRID, createPlaceholderFrame } from './sources/placeholder'

export interface AsciiPanelProps {
  exhibit: ClientExhibit | null
  accent: string
  aspect: 'wide' | 'square' | 'tall'
  /** settled/outgoing/incoming vs idle (hidden). */
  active: boolean
  chapterId: string
  caption?: string
}

export function AsciiPanel({
  exhibit,
  accent,
  aspect,
  active,
  chapterId,
  caption,
}: AsciiPanelProps) {
  const frameRef = useRef<HTMLPreElement | null>(null)
  const quality = useQualityProfile()

  const resolved = useExhibitSource(exhibit)

  const playbackState = useExhibitPlayback({
    exhibitId: exhibit?.id ?? 'none',
    active,
    animated: exhibit?.animated ?? false,
  })

  // Single ownership of playback state: every mutation flows through these
  // handlers (store commands translate here; controls never set state).
  useExhibitCommands(exhibit?.id ?? 'none', {
    onToggle: () => {
      playbackState.setUserPaused(playbackState.playback === 'playing')
    },
    onRestart: () => {
      playbackState.requestRestart()
      playbackState.setUserPaused(false)
    },
  })

  const label = exhibit?.label ?? 'Exhibit'
  const description =
    exhibit?.description ?? `Decorative ASCII panel for this chapter (${label.toLowerCase()}).`

  const fallbackFrame =
    exhibit === null
      ? createPlaceholderFrame({
          cols: PLACEHOLDER_DEFAULT_GRID.cols,
          rows: PLACEHOLDER_DEFAULT_GRID.rows,
          label: 'Panel',
          seed: chapterId,
        })
      : null

  const source = resolved?.source ?? null

  // The server-rendered frame: whatever the slot shows before any script
  // runs (no-JS/SEO baseline). The player takes over via textContent after
  // hydration; React never re-renders this <pre> while the source is stable.
  const initialFrame =
    source !== null ? (readSourceFrame(source, 0, 0) ?? '') : (fallbackFrame ?? '')

  return (
    <figure
      className="ascii-panel"
      data-ascii-state={active ? 'active' : 'idle'}
      data-aspect={aspect}
      // No exhibit metadata means decorative placeholder art by definition.
      data-placeholder={resolved ? (resolved.placeholder ? 'true' : 'false') : 'true'}
      style={{ '--panel-accent': accent } as CSSProperties}
      role="img"
      aria-label={description}
    >
      <pre className="ascii-panel__frame" aria-hidden="true" ref={frameRef}>
        {initialFrame}
      </pre>

      {source ? (
        <AsciiFramePlayer
          source={source}
          fpsCap={quality.fpsCap}
          playing={playbackState.playback === 'playing'}
          restartToken={playbackState.restartToken}
          frameRef={frameRef}
        />
      ) : null}

      <figcaption className="ascii-panel__caption">{caption ?? label}</figcaption>

      {exhibit ? (
        <AnimationControls
          exhibit={exhibit}
          chapterId={chapterId}
          playback={playbackState.playback}
        />
      ) : null}
    </figure>
  )
}
