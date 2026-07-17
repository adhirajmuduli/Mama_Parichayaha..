'use client'

import FadeReveal from '@/components/motion/FadeReveal'
import type { ChapterId } from '@/content/portfolio'
import { getChapterContent, getChapterEntry } from '@/lib/chapterRegistry'

interface NarrativeChapterCardProps {
  chapter: ChapterId
}

export default function NarrativeChapterCard({ chapter }: NarrativeChapterCardProps) {
  const entry = getChapterEntry(chapter)
  const content = getChapterContent(chapter)
  const Heading = chapter === 'origins' ? 'h1' : 'h2'
  const alignment = entry.order % 2 === 0 ? 'right-[8vw]' : 'left-[8vw]'

  return (
    <div
      className={`absolute top-1/2 w-[min(520px,calc(100vw-3rem))] -translate-y-1/2 ${alignment}`}
    >
      <FadeReveal>
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <p
            className="mb-3 text-sm uppercase tracking-[0.3em]"
            style={{ color: entry.scene.atmosphere.keyLight }}
          >
            {content.eyebrow}
          </p>

          <Heading className="mb-4 text-4xl font-semibold sm:text-5xl">{content.title}</Heading>

          <p className="leading-relaxed text-zinc-300">{content.description}</p>
        </div>
      </FadeReveal>
    </div>
  )
}
