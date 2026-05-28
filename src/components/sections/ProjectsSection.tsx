import FadeReveal from "@/components/motion/FadeReveal"

export default function ProjectsSection() {
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
      <div className="mx-auto w-full max-w-6xl">
        
        <FadeReveal>
          <div
            className="
              rounded-[32px]

              border
              border-white/10

              bg-white/5

              p-10

              backdrop-blur-xl
            "
          >
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-300">
              Projects
            </p>

            <h2 className="mb-6 text-5xl font-semibold text-white">
              Scientific & Computational Work
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              
              <FadeReveal delay={0.1}>
                <div className="rounded-2xl bg-white/5 p-6">
                  <h3 className="mb-3 text-2xl text-white">
                    Ecological Linguistics Analysis
                  </h3>

                  <p className="text-zinc-300">
                    Comparative quantitative analysis
                    of word-species diversity and
                    density across books from
                    multiple domains.
                  </p>
                </div>
              </FadeReveal>

              <FadeReveal delay={0.25}>
                <div className="rounded-2xl bg-white/5 p-6">
                  <h3 className="mb-3 text-2xl text-white">
                    Molecular Visualization Systems
                  </h3>

                  <p className="text-zinc-300">
                    Interactive biological rendering
                    systems using React Three Fiber
                    and scientific 3D workflows.
                  </p>
                </div>
              </FadeReveal>

            </div>
          </div>
        </FadeReveal>

      </div>
    </section>
  )
}