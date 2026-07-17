'use client'

import type { ChapterNavigationItem } from './ChapterNavigation'

import { useNarrativeStore } from '@/stores/narrativeStore'

interface ChapterProgressIndicatorProps {
  chapters: readonly ChapterNavigationItem[]
}

export default function ChapterProgressIndicator({ chapters }: ChapterProgressIndicatorProps) {
  const activeChapter = useNarrativeStore((state) => state.activeChapter)
  const setActiveChapter = useNarrativeStore((state) => state.setActiveChapter)

  return (
    <nav
      aria-label="Chapter progress"
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 sm:block"
    >
      <ol className="flex flex-col gap-2 rounded-full border border-white/10 bg-[#0b0715]/90 p-2">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === activeChapter

          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.sectionId}`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${chapter.navigationLabel} (${index + 1} of ${chapters.length})`}
                className={`block h-2.5 w-2.5 rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-violet-300 ${
                  isActive ? 'bg-violet-200' : 'bg-white/35 hover:bg-white/75'
                }`}
                onClick={() => setActiveChapter(chapter.id)}
              >
                <span className="sr-only">{chapter.navigationLabel}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
