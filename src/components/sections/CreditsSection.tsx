import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'
import LiquidGlassPanel from '@/components/liquid-glass/LiquidGlassPanel'
import { siteContent } from '@/content/site'

export default function CreditsSection() {
  const { credits } = siteContent
  const headingId = `${credits.id}-heading`

  return (
    <section
      id={credits.id}
      aria-labelledby={headingId}
      className="relative z-10 scroll-mt-24 px-6 py-20 sm:px-12"
    >
      <article className="mx-auto max-w-4xl">
        <LiquidGlassPanel tone="strong">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-200">
            {credits.eyebrow}
          </p>
          <h2 id={headingId} className="text-3xl font-semibold sm:text-4xl">
            {credits.title}
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-[var(--site-muted)]">
            {credits.description}
          </p>
          <ul className="mt-8 grid gap-5 lg:grid-cols-3" aria-label="Model credits">
            {credits.models.map((model) => (
              <li key={model.assetId} className="rounded-xl border border-white/12 bg-black/15 p-5">
                <h3 className="font-semibold text-white">{model.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
                  {model.attribution}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
                  {model.license}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {model.links.map((link) => (
                    <LiquidGlassButton
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-sm"
                    >
                      {link.label}
                    </LiquidGlassButton>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </LiquidGlassPanel>
      </article>
    </section>
  )
}
