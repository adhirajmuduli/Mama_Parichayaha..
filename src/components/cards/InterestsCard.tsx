'use client'

import FadeReveal from '@/components/motion/FadeReveal'

export default function InterestsCard() {
  return (
    <div
      className="
        absolute
        left-[8vw]
        top-1/2
        w-[500px]
        -translate-y-1/2
      "
    >
      <FadeReveal>
        <div
          className="
            rounded-[32px]
            border
            border-white/10

            bg-white/5

            p-8

            backdrop-blur-xl
          "
        >
          <p
            className="
              mb-3
              text-sm
              uppercase

              tracking-[0.3em]

              text-orange-300
            "
          >
            Interests
          </p>

          <h2
            className="
              mb-4
              text-4xl
              font-semibold
            "
          >
            Molecular Systems & Biological Computation
          </h2>

          <p
            className="
              leading-relaxed
              text-zinc-300
            "
          >
            Protein systems, bioinformatics, molecular simulation, AI-assisted discovery, scientific
            visualization.
          </p>
        </div>
      </FadeReveal>
    </div>
  )
}
