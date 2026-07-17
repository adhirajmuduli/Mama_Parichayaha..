import type { ChapterRegistryEntry } from '@/lib/chapterRegistry'
import { getChapterContent } from '@/lib/chapterRegistry'

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
      className="relative z-10 flex min-h-[100svh] scroll-mt-8 items-center px-6 py-20 sm:px-12"
    >
      <ChapterSectionObserver chapter={chapter.id} sectionId={chapter.sectionId} />

      <article className={`w-full ${alignment}`}>
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#0b0715]/80 p-8 shadow-2xl shadow-black/30 sm:p-10">
          <p
            className="mb-3 text-sm uppercase tracking-[0.3em]"
            style={{ color: chapter.scene.atmosphere.keyLight }}
          >
            {content.eyebrow}
          </p>

          <Heading id={headingId} className="mb-4 text-4xl font-semibold sm:text-5xl">
            {content.title}
          </Heading>

          <p className="leading-relaxed text-zinc-200">{content.description}</p>
        </div>
      </article>
    </section>
  )
}
