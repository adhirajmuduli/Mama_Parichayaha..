import ChapterNavigation, { type ChapterNavigationItem } from './ChapterNavigation'

interface SiteHeaderProps {
  chapters: readonly ChapterNavigationItem[]
}

export default function SiteHeader({ chapters }: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b0715]/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href={`#${chapters[0]?.sectionId ?? 'portfolio-content'}`}
          className="rounded-md text-sm font-semibold tracking-wide text-white outline-offset-4 focus-visible:outline-2 focus-visible:outline-violet-300"
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
                className="shrink-0 rounded-md px-2 py-2 text-sm text-zinc-200"
              >
                {chapter.navigationLabel}
              </a>
            ))}
          </nav>
        </noscript>
      </div>
    </header>
  )
}
