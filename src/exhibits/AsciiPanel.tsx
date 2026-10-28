'use client'

/**
 * AsciiPanel (new_plan.md §10.3) — the exhibit slot's frame and player in one
 * labeled figure.
 *
 * P11: the animation controls were removed as redundant (playback is
 * automatic); the panel is purely the labeled frame + engine. The markup
 * contract (role="img", aria-hidden <pre>, caption) is unchanged.
 *
 * While only placeholder art exists (FEATURES.exhibits=false or unanimated
 * metadata) the panel renders frame 0 statically — zero scheduler work
 * anywhere on the page at rest.
 */

import { useRef, type CSSProperties } from 'react'

import type { ClientExhibit } from '@/types/experience'
import { useQualityProfile } from '@/runtime/quality'

import { useExhibitSource } from './registry'
import { useExhibitPlayback } from './useExhibitPlayback'
import { AsciiFramePlayer } from './AsciiFramePlayer'
import { readSourceFrame, describeSourceGrid } from './types'
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
  const textRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const quality = useQualityProfile()

  const resolved = useExhibitSource(exhibit)

  const playbackState = useExhibitPlayback({
    exhibitId: exhibit?.id ?? 'none',
    active,
    animated: exhibit?.animated ?? false,
  })

  const label = exhibit?.label ?? 'Exhibit'
  const description =
    exhibit?.description ?? `Decorative ASCII panel for this chapter (${label.toLowerCase()}).`

  const fallbackFrame =
    exhibit === null
      ? createPlaceholderFrame({
          cols: PLACEHOLDER_DEFAULT_GRID.cols,
          rows: PLACEHOLDER_DEFAULT_GRID.rows,
          label: caption ?? 'Panel',
          seed: chapterId,
        })
      : null

  const source = resolved?.source ?? null

  // The server-rendered frame: whatever the slot shows before any script
  // runs (no-JS/SEO baseline). The player takes over via textContent after
  // hydration; React never re-renders this <pre> while the source is stable.
  const initialFrame =
    source !== null ? (readSourceFrame(source, 0, 0) ?? '') : (fallbackFrame ?? '')

  // Column count drives the type size: the frame is sized to the slot so the
  // grid never reflows and never gets clipped.
  const columns = source ? describeSourceGrid(source).cols : PLACEHOLDER_DEFAULT_GRID.cols

  return (
    <figure
      className="ascii-panel"
      data-ascii-state={active ? 'active' : 'idle'}
      data-aspect={aspect}
      // No exhibit metadata means decorative placeholder art by definition.
      data-placeholder={resolved ? (resolved.placeholder ? 'true' : 'false') : 'true'}
      // Mock-era preview animations identify themselves for the P9b swap.
      data-mock={resolved?.source.id.startsWith('mock:') ? 'true' : 'false'}
      style={{ '--panel-accent': accent, '--ascii-cols': columns } as CSSProperties}
      role="img"
      aria-label={description}
    >
      <pre className="ascii-panel__frame" aria-hidden="true" ref={frameRef}>
        <canvas className="ascii-panel__color-layer" ref={canvasRef} />
        <span ref={textRef}>{initialFrame}</span>
      </pre>

      {source ? (
        <AsciiFramePlayer
          source={source}
          fpsCap={quality.fpsCap}
          playing={playbackState.playback === 'playing'}
          frameRef={frameRef}
          textRef={textRef}
          canvasRef={canvasRef}
        />
      ) : null}

      <figcaption className="ascii-panel__caption">{caption ?? label}</figcaption>
    </figure>
  )
}
