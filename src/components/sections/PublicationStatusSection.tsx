import LiquidGlassPanel from '@/components/liquid-glass/LiquidGlassPanel'
import { siteContent } from '@/content/site'

export default function PublicationStatusSection() {
  const { publications } = siteContent
  const headingId = `${publications.id}-heading`

  return (
    <section
      id={publications.id}
      aria-labelledby={headingId}
      className="relative z-10 scroll-mt-24 px-6 py-20 sm:px-12"
    >
      <article className="mx-auto max-w-4xl">
        <LiquidGlassPanel className="max-w-2xl" tone="strong">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-200">
            {publications.eyebrow}
          </p>
          <h2 id={headingId} className="text-3xl font-semibold sm:text-4xl">
            {publications.title}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--site-muted)]">
            {publications.description}
          </p>
        </LiquidGlassPanel>
      </article>
    </section>
  )
}
