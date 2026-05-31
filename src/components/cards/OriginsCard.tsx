"use client"

import FadeReveal from "@/components/motion/FadeReveal"

export default function OriginsCard() {
  return (
    <div
      className="
        absolute
        right-[8vw]
        top-1/2
        w-[520px]
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

              text-violet-300
            "
          >
            Origins
          </p>

          <h1
            className="
              mb-4
              text-5xl
              font-semibold
            "
          >
            Adhiraj Muduli
          </h1>

          <p
            className="
              leading-relaxed
              text-zinc-300
            "
          >
            Biological sciences undergraduate
            exploring molecular systems,
            computational biology,
            scientific visualization,
            and AI-assisted discovery.
          </p>

        </div>

      </FadeReveal>
    </div>
  )
}