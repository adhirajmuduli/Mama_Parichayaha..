"use client"

import { motion } from "framer-motion"

import MagneticButton from "@/components/ui/MagneticButton"

export default function BlurCard() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 80
      }}

      animate={{
        opacity: 1,
        x: 0
      }}

      transition={{
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }}

      whileHover={{
        scale: 1.015
      }}

      className="
        relative

        max-w-xl

        overflow-hidden

        rounded-[32px]

        border
        border-white/10

        bg-white/5

        p-10

        backdrop-blur-2xl
      "
    >
      {/* BACKGROUND GLOW */}
      <div
        className="
          absolute
          inset-0

          bg-gradient-to-br
          from-violet-500/10
          via-transparent
          to-orange-500/10
        "
      />

      {/* TOP HIGHLIGHT */}
      <div
        className="
          absolute
          left-0
          top-0

          h-px
          w-full

          bg-gradient-to-r
          from-transparent
          via-violet-300/40
          to-transparent
        "
      />

      <div className="relative z-10">
        
        <p
          className="
            mb-4

            text-sm
            uppercase

            tracking-[0.35em]

            text-violet-300
          "
        >
          Biological Sciences
        </p>

        <h1
          className="
            mb-6

            text-6xl
            font-semibold

            leading-[1.02]

            text-white
          "
        >
          Adhiraj
          <br />
          Muduli
        </h1>

        <p
          className="
            mb-8

            leading-relaxed

            text-zinc-300
          "
        >
          Exploring computational biology,
          scientific visualization,
          molecular systems, AI-assisted
          research workflows, and
          interactive scientific interfaces.
        </p>

        <div className="flex gap-4">
          
          <MagneticButton>
            Explore Work
          </MagneticButton>

          <MagneticButton>
            Research Interests
          </MagneticButton>

        </div>
      </div>
    </motion.div>
  )
}