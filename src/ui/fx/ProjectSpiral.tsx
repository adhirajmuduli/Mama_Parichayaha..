'use client'

/**
 * ProjectSpiral — adapted from React Bits' InfiniteSpiral (MIT; attribution
 * in docs/assets/fx-attributions.md). The upstream helix math is preserved
 * verbatim; the integration is ours:
 *
 *   - the private rAF loop is replaced by the shared runtime scheduler
 *     (new_plan.md §11.1: one app-level loop; the spiral never runs while
 *     its chapter is outside the visible window),
 *   - tiles are TEXT cards (ClientProject: title/description/links) in our
 *     mono styling — images arrive later by extending the tile body,
 *   - the animated layer is aria-hidden; screen readers get a plain list of
 *     the same links (upstream labeled the animated layer instead),
 *   - reduced motion renders a static fan (no loop, no scheduler work),
 *   - quality fpsCap skips ticks when behind; scroll mode is dropped (the
 *     immersive stage does not scroll),
 *   - the drag surface is tagged for the journey coordinator so spiral drags
 *     and journey drags never fight over the same pointer.
 */

import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'

import type { ClientProject } from '@/types/experience'
import { subscribeTick } from '@/runtime/scheduler'

export interface ProjectSpiralProps {
  projects: ClientProject[]
  /** Chapter settled/transitioning: the loop only runs while true. */
  active: boolean
  /** Quality tier cap; ticks are skipped to honor it. */
  fpsCap: number
  /** Per-chapter accent tint for tile borders/glow. */
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
const RADIUS = 170
const CARD_WIDTH = 168
const CARD_HEIGHT = 116
const VERTICAL_SPACING = 78
const PERSPECTIVE = 1000
const CARDS_PER_TURN = 7
const CARD_TILT = 0
const CENTER_SCALE = 1.15
const EDGE_FADE = 0.3
const EDGE_BLUR = 5

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

    if (!root || tiles.length === 0 || reducedMotion || !active) return

    let bounds = root.getBoundingClientRect()
    let tickAccumulatorMs = 0
    const effectiveFps = Math.max(1, fpsCap)
    const frameIntervalMs = 1000 / effectiveFps

    const resizeObserver = new ResizeObserver(() => {
      bounds = root.getBoundingClientRect()
    })
    resizeObserver.observe(root)

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
      const fit = Math.min(1, width / (CARD_WIDTH * 2.8), height / (CARD_HEIGHT * 2.35))
      const responsiveRadius = Math.min(RADIUS, Math.max(72, width * 0.36)) * fit
      const fadeStart = clamp(1 - EDGE_FADE, 0, 0.98)
      const turnSize = Math.max(CARDS_PER_TURN, 1)

      cardRefs.current.forEach((card, index) => {
        if (!card) return

        const offset = modulo(index - progressRef.current + half, count) - half
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1)
        const opacity = 1 - smoothstep(fadeStart, 1, edge)
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1)
        const scale = (1 + (CENTER_SCALE - 1) * focus) * fit
        const angle = offset * (360 / turnSize) + CARD_TILT
        const angleRadians = (angle * Math.PI) / 180
        const x = Math.sin(angleRadians) * responsiveRadius
        const z = Math.cos(angleRadians) * responsiveRadius
        const depthScale = clamp(PERSPECTIVE / Math.max(PERSPECTIVE - z, 1), 0.72, 1.45)
        const visualScale = scale * depthScale
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2
        const blur = EDGE_BLUR * smoothstep(0.35, 1, edge)

        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * VERTICAL_SPACING * fit}px, 0) scale(${visualScale})`
        card.style.opacity = opacity.toFixed(3)
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none'
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
      className={`spiral ${staticMode ? 'spiral--static' : ''} ${className}`.trim()}
      data-spiral-surface=""
      data-spiral-state={staticMode ? 'static' : 'auto'}
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

      <div className="spiral__stage" aria-hidden="true">
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
          >
            <span className="spiral__tile-title">{project.title}</span>
            <span className="spiral__tile-description">{project.description}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
