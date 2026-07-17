'use client'

import { useEffect, useState } from 'react'

import { motion } from 'motion/react'

export default function CursorGlow() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener('mousemove', handleMove)

    return () => {
      window.removeEventListener('mousemove', handleMove)
    }
  }, [])

  return (
    <motion.div
      animate={{
        x: position.x - 160,
        y: position.y - 160,
      }}

      transition={{
        type: 'spring',
        stiffness: 750,
        damping: 42,
        mass: 0.3,
      }}

      className="
        pointer-events-none
        fixed
        left-0
        top-0
        z-[999]

        h-[320px]
        w-[320px]

        rounded-full

        bg-violet-500/10

        blur-3xl
      "
    />
  )
}
