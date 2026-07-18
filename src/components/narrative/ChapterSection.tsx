import LiquidGlassPanel from '@/components/liquid-glass/LiquidGlassPanel'
import ModelInteractionControls from '@/components/models/ModelInteractionControls'
import type { ChapterRegistryEntry } from '@/lib/chapterRegistry'
import { getChapterContent } from '@/lib/chapterRegistry'

import ChapterDetail from './ChapterDetail'
import ChapterSectionObserver from './ChapterSectionObserver'

interface ChapterSectionProps {
  chapter: ChapterRegistryEntry
}

export default function ChapterSection({ chapter }: ChapterSectionProps) {
  const content = getChapterContent(chapter.id)
  const headingId = `${chapter.sectionId}-heading`
  const alignment = chapter.order % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
  const Heading = chapter.order === 0 ? 'h1' : 'h2'

  return (
    <section
      id={chapter.sectionId}
      aria-labelledby={headingId}
      className="relative z-10 flex min-h-[100svh] scroll-mt-24 items-center px-6 py-20 sm:px-12"
    >
      <ChapterSectionObserver chapter={chapter.id} sectionId={chapter.sectionId} />

      <article className={`w-full ${alignment}`}>
        <LiquidGlassPanel accent={chapter.scene.atmosphere.keyLight} className="max-w-xl">
          <p
            className="mb-3 text-sm uppercase tracking-[0.3em]"
            style={{ color: chapter.scene.atmosphere.keyLight }}
          >
            {content.eyebrow}
          </p>

          <Heading id={headingId} className="mb-4 text-4xl font-semibold sm:text-5xl">
            {content.title}
          </Heading>

          <p className="leading-relaxed text-[var(--site-muted)]">{content.description}</p>
          <ChapterDetail chapter={content} />
          {chapter.id === 'origins' ? (
            <p className="mt-6 text-sm leading-relaxed text-[var(--site-muted)]">
              Scroll through the chapters to move between the portfolio&apos;s scientific themes and
              interactive exhibits.
            </p>
          ) : null}
          <ModelInteractionControls chapter={chapter} />
        </LiquidGlassPanel>
      </article>
    </section>
  )
}
