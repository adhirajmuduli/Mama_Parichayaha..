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
  textRef?: RefObject<HTMLSpanElement | null>
  canvasRef?: RefObject<HTMLCanvasElement | null>
}

function drawColoredFrame(
  frame: NonNullable<ReturnType<NonNullable<AsciiExhibitSource['renderColored']>>>,
  source: AsciiExhibitSource,
  pre: HTMLPreElement,
  canvas: HTMLCanvasElement,
): boolean {
  const context = canvas.getContext('2d')
  const palette = source.palette
  if (!context || !palette || palette.length === 0 || !source.grid) return false

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const width = pre.clientWidth
  const height = pre.clientHeight
  const canvasWidth = Math.round(width * pixelRatio)
  const canvasHeight = Math.round(height * pixelRatio)
  if (canvas.width !== canvasWidth) canvas.width = canvasWidth
  if (canvas.height !== canvasHeight) canvas.height = canvasHeight

  const style = window.getComputedStyle(pre)
  const fontSize = Number.parseFloat(style.fontSize)
  const lineHeight = Number.parseFloat(style.lineHeight)
  const paddingLeft = Number.parseFloat(style.paddingLeft)
  const paddingTop = Number.parseFloat(style.paddingTop)

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, width, height)
  // The canvas `font` shorthand must parse or it silently keeps the 10px
  // sans-serif default — and for this stack the computed shorthand serializes
  // to "" (var()-resolved family list), which drew every colored frame at the
  // wrong metrics. Rebuild the font from the computed longhands instead.
  const resolvedLineHeight = Number.isFinite(lineHeight)
    ? `${lineHeight}px`
    : `${(fontSize * 1.15).toFixed(2)}px`
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} / ${resolvedLineHeight} ${style.fontFamily}`
  context.textBaseline = 'top'
  context.textAlign = 'left'
  const cellWidth = context.measureText('M').width
  const lines = frame.text.split('\n')

  for (let row = 0; row < source.grid.rows; row += 1) {
    const text = lines[row] ?? ''
    let col = 0

    while (col < source.grid.cols) {
      const cellIndex = row * source.grid.cols + col
      const colorIndex = frame.colorIndices[cellIndex] ?? 0
      let end = col + 1

      while (
        end < source.grid.cols &&
        (frame.colorIndices[row * source.grid.cols + end] ?? 0) === colorIndex
      ) {
        end += 1
      }

      const run = text.slice(col, end)
      if (run.trim()) {
        context.fillStyle = palette[colorIndex] ?? palette[0] ?? '#ffffff'
        context.fillText(
          run,
          paddingLeft + col * cellWidth,
          paddingTop + row * (Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.15),
        )
      }
      col = end
    }
  }

  pre.dataset.artColored = 'true'
  return true
}

export function AsciiFramePlayer({
  source,
  fpsCap,
  playing,
  frameRef,
  textRef,
  canvasRef,
}: AsciiFramePlayerProps) {
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

      const colored = source.renderColored?.(index, elapsedRef.current)
      const next = colored?.text ?? readSourceFrame(source, index, elapsedRef.current)

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

      if (
        colored &&
        canvasRef?.current &&
        drawColoredFrame(colored, source, frame, canvasRef.current)
      ) {
        if (textRef?.current) textRef.current.textContent = next
      } else if (textRef?.current) {
        textRef.current.textContent = next
      } else {
        frame.textContent = next
      }
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
  }, [source, fpsCap, playing, frameRef, textRef, canvasRef])

  return null
}
