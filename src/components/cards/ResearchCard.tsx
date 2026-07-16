'use client'

import FadeReveal from '@/components/motion/FadeReveal'

export default function ResearchCard() {
  return (
    <div
      className="
        absolute
        right-[8vw]
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

              text-cyan-300
            "
          >
            Research
          </p>

          <h2
            className="
              mb-4
              text-4xl
              font-semibold
            "
          >
            Protein Structure & Computational Biology
          </h2>

          <p
            className="
              leading-relaxed
              text-zinc-300
            "
          >
            Research projects, scientific software, computational workflows, and biological
            modeling.
          </p>
        </div>
      </FadeReveal>
    </div>
  )
}
