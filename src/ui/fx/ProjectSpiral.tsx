'use client'

/**
 * ProjectSpiral — adapted from React Bits' InfiniteSpiral (MIT; attribution
 * in docs/assets/fx-attributions.md). The upstream helix math is preserved
 * verbatim; the integration is ours:
 *
 *   - FULL-BLEED (P11): the spiral renders as a fixed stage layer centered
 *     on the viewport — a section in itself, never boxed in a column;
 *   - tiles are TEXT cards from the owner's real repositories
 *     (github.com/adhirajmuduli), each carrying a two-stop gradient identity;
 *   - the animated layer is aria-hidden; screen readers get a plain list of
 *     the same links;
 *   - reduced motion renders a static fan (no loop, no scheduler work);
 *   - the private rAF loop is replaced by the shared runtime scheduler,
 *     gated on the chapter's visibility;
 *   - the drag surface is tagged so spiral drags never fight journey input.
 */

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import type { ClientProject } from '@/types/experience'
import { subscribeTick } from '@/runtime/scheduler'

export interface ProjectSpiralProps {
  projects: ClientProject[]
  /** Chapter settled/transitioning: the loop only runs while true. */
  active: boolean
  /** Quality tier cap; ticks are skipped to honor it. */
  fpsCap: number
  /** Per-chapter accent tint. */
  accent: string
  reducedMotion: boolean
  speed?: number
  direction?: 'up' | 'down'
  animationMode?: 'auto' | 'drag' | 'all'
  className?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1)
  return x * x * (3 - 2 * x)
}

// Helix geometry (upstream defaults preserved).
const RADIUS = 200
const CARD_WIDTH = 200
const CARD_HEIGHT = 128
const VERTICAL_SPACING = 90
const PERSPECTIVE = 1000
const CARDS_PER_TURN = 7
const CENTER_SCALE = 1.15
const EDGE_FADE = 0.34
// Upper bound of the depth scale (see depthScale below). The layout uses it
// to reserve room for the closest tile, which is the largest one.
const MAX_DEPTH_SCALE = 1.45

export function ProjectSpiral({
  projects,
  active,
  fpsCap,
  accent,
  reducedMotion,
  speed = 0.5,
  direction = 'up',
  animationMode = 'all',
  className = '',
}: ProjectSpiralProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const helixRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const progressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const autoSpeedRef = useRef(0)
  const hoveredRef = useRef(false)
  const draggingRef = useRef(false)
  const lastPointerYRef = useRef(0)
  const dragMovedRef = useRef(false)

  const dragEnabled = animationMode === 'drag' || animationMode === 'all'
  const autoEnabled = animationMode === 'auto' || animationMode === 'all'

  const tiles = useMemo(
    () =>
      projects.map((project, index) => ({
        project,
        key: `${project.href}-${index}`,
      })),
    [projects],
  )

  useEffect(() => {
    const root = rootRef.current
    const helix = helixRef.current

    if (!root || !helix || tiles.length === 0 || reducedMotion || !active) return

    let bounds = helix.getBoundingClientRect()
    let tickAccumulatorMs = 0
    const effectiveFps = Math.max(1, fpsCap)
    const frameIntervalMs = 1000 / effectiveFps

    // The tile size follows the band the helix owns: a 200px card is half a
    // phone screen wide, so narrow viewports get a smaller card (and the CSS
    // custom properties follow, keeping DOM and math in sync).
    const measure = () => {
      bounds = helix.getBoundingClientRect()

      const width = Math.max(bounds.width, 1)
      const cardWidth = Math.min(CARD_WIDTH, Math.max(120, width * 0.38))
      const cardHeight = (cardWidth * CARD_HEIGHT) / CARD_WIDTH

      root.style.setProperty('--spiral-width', `${Math.round(cardWidth)}px`)
      root.style.setProperty('--spiral-height', `${Math.round(cardHeight)}px`)
    }

    measure()

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(helix)

    const unsubscribeTick = subscribeTick((deltaMs) => {
      // fpsCap: skip whole ticks when behind — the helix positions are
      // functions of progress, so skipping cannot desynchronize anything.
      tickAccumulatorMs += deltaMs

      if (tickAccumulatorMs < frameIntervalMs) return

      const delta = Math.min(tickAccumulatorMs / 1000, 0.05)
      tickAccumulatorMs = 0

      const motionPaused = draggingRef.current || hoveredRef.current
      const directionMultiplier = direction === 'down' ? -1 : 1
      const desiredAutoSpeed = autoEnabled && !motionPaused ? speed * directionMultiplier : 0

      const speedBlend = 1 - Math.exp(-delta * 7)
      autoSpeedRef.current += (desiredAutoSpeed - autoSpeedRef.current) * speedBlend
      targetProgressRef.current += autoSpeedRef.current * delta

      const followBlend = 1 - Math.exp(-delta * (draggingRef.current ? 22 : 11))
      progressRef.current += (targetProgressRef.current - progressRef.current) * followBlend

      const count = tiles.length
      const half = count / 2
      const width = Math.max(bounds.width, 1)
      const height = Math.max(bounds.height, 1)
      const cardWidth = Math.min(CARD_WIDTH, Math.max(120, width * 0.38))
      const cardHeight = (cardWidth * CARD_HEIGHT) / CARD_WIDTH
      const fit = Math.min(1, width / (cardWidth * 2.4), height / (cardHeight * 2.1))

      // The radius may not push the closest tile past the band edge: the
      // depth scale grows the front card, so the room it needs is reserved
      // before the radius is chosen.
      const depthScaleFor = (radius: number) =>
        clamp(PERSPECTIVE / Math.max(PERSPECTIVE - radius, 1), 0.72, MAX_DEPTH_SCALE)
      const tileHalfWidth = (cardWidth * CENTER_SCALE * depthScaleFor(RADIUS * fit)) / 2
      const maxRadius = Math.max(36, width / 2 - tileHalfWidth)
      const responsiveRadius = Math.min(RADIUS, Math.max(90, width * 0.3), maxRadius) * fit

      // The cascade must stay INSIDE the band it owns. On short bands the
      // vertical spread is compressed instead of spilling over the chapter
      // copy (the spiral is a section, never a backdrop behind the words).
      const depthScale = depthScaleFor(responsiveRadius)
      const tileHalfHeight = (cardHeight * CENTER_SCALE * depthScale) / 2
      const verticalSpread = Math.max(half, 1) * VERTICAL_SPACING * fit
      const verticalFit = clamp(
        (height / 2 - tileHalfHeight) / Math.max(verticalSpread, 1),
        0.25,
        1,
      )
      const fadeStart = clamp(1 - EDGE_FADE, 0, 0.98)
      const turnSize = Math.max(CARDS_PER_TURN, 1)

      cardRefs.current.forEach((card, index) => {
        if (!card) return

        const offset = modulo(index - progressRef.current + half, count) - half
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1)
        const opacity = 1 - smoothstep(fadeStart, 1, edge)
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1)
        const scale = (1 + (CENTER_SCALE - 1) * focus) * fit
        const angle = offset * (360 / turnSize)
        const angleRadians = (angle * Math.PI) / 180
        const x = Math.sin(angleRadians) * responsiveRadius
        const z = Math.cos(angleRadians) * responsiveRadius
        const tileDepthScale = clamp(
          PERSPECTIVE / Math.max(PERSPECTIVE - z, 1),
          0.72,
          MAX_DEPTH_SCALE,
        )
        const visualScale = scale * tileDepthScale
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2
        // No per-tile blur: eight animated blur layers were the most
        // expensive paint on this chapter. The opacity ramp carries the depth
        // read on its own.

        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * VERTICAL_SPACING * fit * verticalFit}px, 0) scale(${visualScale})`
        card.style.opacity = opacity.toFixed(3)
        card.style.filter = 'none'
        card.style.zIndex = String(Math.round(depth * 100000) + index)
        card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none'
      })
    })

    return () => {
      unsubscribeTick()
      resizeObserver.disconnect()
    }
  }, [tiles, speed, direction, animationMode, autoEnabled, fpsCap, active, reducedMotion])

  const rootStyle = {
    perspective: `${PERSPECTIVE}px`,
    '--spiral-width': `${CARD_WIDTH}px`,
    '--spiral-height': `${CARD_HEIGHT}px`,
    '--panel-accent': accent,
    cursor: dragEnabled ? 'grab' : 'default',
    touchAction: dragEnabled ? 'none' : 'auto',
    userSelect: dragEnabled ? 'none' : 'auto',
  } as CSSProperties

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return

    draggingRef.current = false

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    event.currentTarget.style.cursor = dragEnabled ? 'grab' : 'default'
  }

  const staticMode = reducedMotion || !active

  return (
    <div
      ref={rootRef}
      className={`spiral-stage ${staticMode ? 'spiral-stage--static' : ''} ${className}`.trim()}
      data-spiral-surface=""
      data-spiral-state={staticMode ? 'static' : 'auto'}
      data-visual-active={active ? 'true' : 'false'}
      style={rootStyle}
      onMouseEnter={() => {
        hoveredRef.current = true
      }}
      onMouseLeave={() => {
        hoveredRef.current = false
      }}
      onPointerDown={(event) => {
        if (!dragEnabled || event.button !== 0) return

        draggingRef.current = true
        dragMovedRef.current = false
        lastPointerYRef.current = event.clientY
        targetProgressRef.current = progressRef.current
        event.currentTarget.setPointerCapture(event.pointerId)
        event.currentTarget.style.cursor = 'grabbing'
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return

        const pointerDelta = event.clientY - lastPointerYRef.current
        lastPointerYRef.current = event.clientY

        if (Math.abs(pointerDelta) > 0.5) dragMovedRef.current = true

        targetProgressRef.current -= pointerDelta / Math.max(VERTICAL_SPACING, 1)
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={(event) => {
        if (!dragMovedRef.current) return

        event.preventDefault()
        event.stopPropagation()
        dragMovedRef.current = false
      }}
    >
      {/* Screen-reader list: the animated layer is aria-hidden; the same
          links stay available as a plain, ordered list. */}
      <ul className="spiral__sr-list">
        {tiles.map(({ project, key }) => (
          <li key={key}>
            <a href={project.href} target="_blank" rel="noreferrer noopener">
              {project.title}
            </a>
          </li>
        ))}
      </ul>

      <div className="spiral-stage__helix" aria-hidden="true" ref={helixRef}>
        {tiles.map(({ project, key }, index) => (
          <a
            key={key}
            ref={(node) => {
              cardRefs.current[index] = node
            }}
            className="spiral__tile"
            href={project.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-hidden="true"
            tabIndex={-1}
            style={
              {
                '--tile-gradient-from': project.gradient[0],
                '--tile-gradient-to': project.gradient[1],
              } as CSSProperties
            }
          >
            <span className="spiral__tile-title">{project.title}</span>
            <span className="spiral__tile-description">{project.description}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
