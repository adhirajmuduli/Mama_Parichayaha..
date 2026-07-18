'use client'

import { useEffect } from 'react'

import { motion, useMotionValue, useSpring } from 'motion/react'

const glowDiameter = 224
const glowOffset = glowDiameter / 2

export default function CursorGlow() {
  const pointerX = useMotionValue(-glowOffset)
  const pointerY = useMotionValue(-glowOffset)
  const x = useSpring(pointerX, { damping: 48, mass: 0.35, stiffness: 620 })
  const y = useSpring(pointerY, { damping: 48, mass: 0.35, stiffness: 620 })

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let listening = false

    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX - glowOffset)
      pointerY.set(event.clientY - glowOffset)
    }

    const syncTracking = () => {
      const shouldTrack = finePointer.matches && !reducedMotion.matches

      if (shouldTrack === listening) {
        return
      }

      listening = shouldTrack

      if (shouldTrack) {
        window.addEventListener('pointermove', handlePointerMove, { passive: true })
      } else {
        window.removeEventListener('pointermove', handlePointerMove)
        pointerX.set(-glowOffset)
        pointerY.set(-glowOffset)
      }
    }

    finePointer.addEventListener('change', syncTracking)
    reducedMotion.addEventListener('change', syncTracking)
    syncTracking()

    return () => {
      finePointer.removeEventListener('change', syncTracking)
      reducedMotion.removeEventListener('change', syncTracking)

      if (listening) {
        window.removeEventListener('pointermove', handlePointerMove)
      }
    }
  }, [pointerX, pointerY])

  return (
    <motion.div
      style={{ x, y }}
      className="cursor-glow pointer-events-none fixed left-0 top-0 z-20 h-56 w-56 rounded-full bg-violet-400/5 opacity-70 blur-3xl"
    />
  )
}
