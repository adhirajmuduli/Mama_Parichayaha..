import LiquidGlass from '@/components/liquid-glass/LiquidGlass'

import ChapterNavigation, { type ChapterNavigationItem } from './ChapterNavigation'

interface SiteHeaderProps {
  chapters: readonly ChapterNavigationItem[]
}

export default function SiteHeader({ chapters }: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <LiquidGlass interactive={false} className="[--glass-radius:0px] border-x-0 border-t-0">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a
            href={`#${chapters[0]?.sectionId ?? 'portfolio-content'}`}
            className="rounded-md text-sm font-semibold tracking-wide text-white outline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--site-focus)]"
          >
            Adhiraj Muduli
          </a>
          <ChapterNavigation chapters={chapters} />
          <noscript>
            <nav
              aria-label="Chapter navigation"
              className="flex max-w-[60vw] gap-1 overflow-x-auto md:hidden"
            >
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`#${chapter.sectionId}`}
                  className="shrink-0 rounded-md px-2 py-2 text-sm text-[var(--site-muted)]"
                >
                  {chapter.navigationLabel}
                </a>
              ))}
            </nav>
          </noscript>
        </div>
      </LiquidGlass>
    </header>
  )
}
