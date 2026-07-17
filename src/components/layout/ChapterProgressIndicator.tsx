'use client'

import LiquidGlass from '@/components/liquid-glass/LiquidGlass'

import type { ChapterNavigationItem } from './ChapterNavigation'
import { useNarrativeStore } from '@/stores/narrativeStore'

interface ChapterProgressIndicatorProps {
  chapters: readonly ChapterNavigationItem[]
}

export default function ChapterProgressIndicator({ chapters }: ChapterProgressIndicatorProps) {
  const activeChapter = useNarrativeStore((state) => state.activeChapter)
  const setActiveChapter = useNarrativeStore((state) => state.setActiveChapter)

  return (
    <LiquidGlass
      as="nav"
      aria-label="Chapter progress"
      interactive={false}
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 [--glass-radius:999px] sm:block"
    >
      <ol className="flex flex-col gap-2 p-2">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === activeChapter

          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.sectionId}`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${chapter.navigationLabel} (${index + 1} of ${chapters.length})`}
                className={`block h-2.5 w-2.5 rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--site-focus)] ${
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
    </LiquidGlass>
  )
}
