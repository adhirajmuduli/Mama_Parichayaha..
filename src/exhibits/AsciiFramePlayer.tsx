'use client'

/**
 * AsciiFramePlayer (new_plan.md §10.3) — binds a source to the shared
 * scheduler and writes frames imperatively.
 *
 * Discipline:
 *   - at most ONE textContent write per tick,
 *   - zero allocations per tick (scalar frame math + cached frame strings),
 *   - frame skipping when behind (index advances with elapsed time, never
 *     "+1 per tick"),
 *   - dev-only grid drift warning (first frame defines rows/cols; the
 *     bookkeeping resets per source — placeholder upgrades are legitimate
 *     grid changes).
 */

import { useEffect, useRef, type RefObject } from 'react'

import { readSourceFrame, type AsciiExhibitSource } from './types'
import { subscribeTick } from '@/runtime/scheduler'

export interface AsciiFramePlayerProps {
  source: AsciiExhibitSource
  /** Effective rate cap from the quality tier (0 → static frame 0). */
  fpsCap: number
  /** 'playing' runs the loop; anything else renders one static frame. */
  playing: boolean
  frameRef: RefObject<HTMLPreElement | null>
}

export function AsciiFramePlayer({ source, fpsCap, playing, frameRef }: AsciiFramePlayerProps) {
  const elapsedRef = useRef(0)
  const renderedIndexRef = useRef(-1)
  const gridRef = useRef<{ rows: number; cols: number } | null>(null)
  const warnedRef = useRef(false)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    // Per-source grid bookkeeping: the placeholder→owner-source upgrade (or
    // any source swap) legitimately changes the grid, so the drift
    // reference resets with every source change.
    gridRef.current = null
    warnedRef.current = false
    renderedIndexRef.current = -1
    elapsedRef.current = 0

    const effectiveFps = Math.max(0, Math.min(source.fps, fpsCap))
    const frameIntervalMs = effectiveFps > 0 ? 1000 / effectiveFps : 0

    const writeFrame = (index: number) => {
      // Redundant-write dedupe applies ONLY to precomputed frame sets: a
      // generative source may produce different output for the same index as
      // elapsed time advances, so its render must run every tick.
      if (source.frames && index === renderedIndexRef.current) return

      const next = readSourceFrame(source, index, elapsedRef.current)

      if (next === null) return

      if (process.env.NODE_ENV !== 'production' && !warnedRef.current) {
        const reference = gridRef.current

        if (!reference) {
          const rows = next.split('\n').length
          const cols = next.split('\n').reduce((width, line) => Math.max(width, line.length), 0)
          gridRef.current = { rows, cols }
        } else {
          const rows = next.split('\n').length

          if (rows !== reference.rows && !warnedRef.current) {
            warnedRef.current = true
            // Grid drift would reflow the panel; CSS clips, dev gets a signal.
            console.warn(
              `[ascii-exhibit] source "${source.id}" frame ${index} has ${rows} rows; first frame declared ${reference.rows}. Clipping is active.`,
            )
          }
        }
      }

      renderedIndexRef.current = index
      frame.textContent = next
    }

    // Static or paused: exactly one write, then no scheduler work.
    if (!playing || effectiveFps === 0) {
      writeFrame(0)
      return
    }

    writeFrame(Math.floor(elapsedRef.current / frameIntervalMs))

    const unsubscribe = subscribeTick((deltaMs) => {
      elapsedRef.current += deltaMs

      // Frame skip: advance by elapsed time; slow ticks drop frames rather
      // than slowing the authored cadence.
      writeFrame(Math.floor(elapsedRef.current / frameIntervalMs))
    })

    return () => {
      unsubscribe()
    }
  }, [source, fpsCap, playing, frameRef])

  return null
}
