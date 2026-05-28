import FadeReveal from "@/components/motion/FadeReveal"

export default function InterestsSection() {
  return (
    <section
      className="
        relative
        flex
        min-h-screen
        items-center
        px-6
      "
    >
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-6xl
          gap-6

          md:grid-cols-2
        "
      >
        
        <FadeReveal delay={0}>
          <div
            className="
              rounded-[28px]
              border
              border-white/10

              bg-white/5

              p-8

              backdrop-blur-xl
            "
          >
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-300">
              Interests
            </p>

            <h2 className="mb-4 text-4xl font-semibold text-white">
              Molecular Systems & Biological Computation
            </h2>

            <p className="leading-relaxed text-zinc-300">
              Interested in computational biology,
              protein systems, molecular simulation,
              AI-assisted scientific workflows,
              bioinformatics, and scientific
              visualization interfaces.
            </p>
          </div>
        </FadeReveal>

        <FadeReveal delay={0.2}>
          <div
            className="
              rounded-[28px]
              border
              border-white/10

              bg-white/5

              p-8

              backdrop-blur-xl
            "
          >
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-300">
              Current Exploration
            </p>

            <ul className="space-y-4 text-zinc-300">
              <li>
                • Molecular visualization systems
              </li>

              <li>
                • AI-assisted drug discovery
              </li>

              <li>
                • Protein structure analysis
              </li>

              <li>
                • Computational genomics
              </li>

              <li>
                • Scientific interface design
              </li>
            </ul>
          </div>
        </FadeReveal>

      </div>
    </section>
  )
}