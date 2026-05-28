"use client"

import React, { ReactNode } from "react"

import {
  motion,
  useMotionValue,
  useSpring
} from "framer-motion"

interface MagneticButtonProps {
  children: ReactNode
}

export default function MagneticButton({
  children
}: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, {
    stiffness: 180,
    damping: 15
  })

  const springY = useSpring(y, {
    stiffness: 180,
    damping: 15
  })

  const handleMove = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect =
      e.currentTarget.getBoundingClientRect()

    const offsetX =
      e.clientX -
      (rect.left + rect.width / 2)

    const offsetY =
      e.clientY -
      (rect.top + rect.height / 2)

    x.set(offsetX * 0.2)
    y.set(offsetY * 0.2)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      style={{
        x: springX,
        y: springY
      }}

      onMouseMove={handleMove}

      onMouseLeave={handleLeave}

      whileHover={{
        scale: 1.04
      }}

      whileTap={{
        scale: 0.97
      }}

      className="
        rounded-full

        border
        border-white/10

        bg-white/10

        px-6
        py-3

        text-sm
        font-medium
        text-white

        backdrop-blur-xl
      "
    >
      {children}
    </motion.button>
  )
}