'use client'

/**
 * BlobCursor (new_plan.md R16) — the LIGHT cursor blob: a single spring-
 * followed element, transform/opacity writes only, blend-mode accent, grow
 * over interactive targets. No WebGL, no per-frame filters. The react-bits
 * shader blob (metaballs + PMREM + shadow maps) stays an optional flagged
 * upgrade for later.
 *
 * Gates: FEATURES.cursorBlob, immersive mode, fine pointer, no reduced
 * motion, no save-data (CSS also hides it per html data attributes).
 */

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { FEATURES } from '@/config/flags'

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, summary, [role="button"], [data-blob-grow]'

const FOLLOW_SPRING = { stiffness: 350, damping: 28, mass: 0.6 }
const SCALE_SPRING = { stiffness: 260, damping: 22 }

const HIDDEN = 0
const VISIBLE = 0.5
const GROWN = 0.75
const SCALE_REST = 1
const SCALE_GROW = 1.9

export function BlobCursor() {
  const [enabled, setEnabled] = useState(false)
  const interactiveRef = useRef(false)

  const pointerX = useMotionValue(HIDDEN)
  const pointerY = useMotionValue(HIDDEN)
  const blobX = useSpring(pointerX, FOLLOW_SPRING)
  const blobY = useSpring(pointerY, FOLLOW_SPRING)

  const targetScale = useMotionValue(SCALE_REST)
  const scale = useSpring(targetScale, SCALE_SPRING)
  const targetOpacity = useMotionValue(HIDDEN)
  const opacity = useSpring(targetOpacity, SCALE_SPRING)

  useEffect(() => {
    if (!FEATURES.cursorBlob) return

    let gate = true

    const evaluateGate = () => {
      const root = document.documentElement
      const immersive = root.dataset.experience === 'immersive'
      const reduced =
        root.dataset.reducedMotion === 'true' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const coarse =
        root.dataset.coarsePointer === 'true' || window.matchMedia('(pointer: coarse)').matches
      const saveData = root.dataset.saveData === 'true'
      const next = immersive && !reduced && !coarse && !saveData

      if (next !== gate) {
        gate = next
        setEnabled(next)
      }
    }

    evaluateGate()

    if (!gate) return

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      pointerX.set(event.clientX)
      pointerY.set(event.clientY)
      targetOpacity.set(interactiveRef.current ? GROWN : VISIBLE)
    }

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      const target = event.target instanceof Element ? event.target : null
      interactiveRef.current = target?.closest(INTERACTIVE_SELECTOR) !== null
      targetScale.set(interactiveRef.current ? SCALE_GROW : SCALE_REST)
      targetOpacity.set(interactiveRef.current ? GROWN : VISIBLE)
    }

    const onPointerLeaveWindow = () => {
      targetOpacity.set(HIDDEN)
    }

    const observer = new MutationObserver(evaluateGate)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-experience'],
    })

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    document.addEventListener('pointerout', onPointerLeaveWindow)

    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerLeaveWindow)
    }
  }, [pointerX, pointerY, targetOpacity, targetScale])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden="true"
      className="fx-cursor-blob"
      style={{
        x: blobX,
        y: blobY,
        scale,
        opacity,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />
  )
}
