'use client'

import { useEffect } from 'react'

import { motion, useMotionValue, useSpring } from 'motion/react'

export default function CursorGlow() {
  const pointerX = useMotionValue(-160)
  const pointerY = useMotionValue(-160)
  const x = useSpring(pointerX, { damping: 42, mass: 0.3, stiffness: 750 })
  const y = useSpring(pointerY, { damping: 42, mass: 0.3, stiffness: 750 })

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX - 160)
      pointerY.set(event.clientY - 160)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [pointerX, pointerY])

  return (
    <motion.div
      style={{ x, y }}
      className="
        pointer-events-none
        fixed
        left-0
        top-0
        z-20

        h-[320px]
        w-[320px]

        rounded-full

        bg-violet-500/10

        blur-3xl
      "
    />
  )
}
