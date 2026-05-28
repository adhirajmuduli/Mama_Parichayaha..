"use client"

import { motion } from "framer-motion"

import { ReactNode } from "react"

interface FadeRevealProps {
  children: ReactNode

  delay?: number
}

export default function FadeReveal({
  children,
  delay = 0
}: FadeRevealProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50
      }}

      whileInView={{
        opacity: 1,
        y: 0
      }}

      viewport={{
        once: true,
        amount: 0.3
      }}

      transition={{
        duration: 1,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  )
}