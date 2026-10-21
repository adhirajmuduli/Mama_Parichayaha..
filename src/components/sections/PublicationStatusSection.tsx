import { GlassCard } from '@/components/glass-card/GlassCard'

import type { ClientContent } from '@/types/experience'

export interface PublicationStatusSectionProps {
  publications: ClientContent['publications']
}

/** Props-driven since P5 (see ContactSection for the zod boundary note). */
export default function PublicationStatusSection({ publications }: PublicationStatusSectionProps) {
  const headingId = `publications-heading`

  return (
    <section
      id="publications"
      aria-labelledby={headingId}
      className="relative z-10 flex scroll-mt-24 items-center px-6 py-10 sm:px-12"
    >
      <article className="mx-auto max-w-4xl">
        <GlassCard className="max-w-2xl" glow="#A08B6F">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-200">
            {publications.eyebrow}
          </p>
          <h2 id={headingId} className="text-3xl font-semibold sm:text-4xl">
            {publications.title}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--site-muted)]">
            {publications.description}
          </p>
        </GlassCard>
      </article>
    </section>
  )
}
