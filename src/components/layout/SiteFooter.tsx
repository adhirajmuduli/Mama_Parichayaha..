import LiquidGlass from '@/components/liquid-glass/LiquidGlass'

import type { ChapterNavigationItem } from './ChapterNavigation'

interface SiteFooterProps {
  chapters: readonly ChapterNavigationItem[]
}

export default function SiteFooter({ chapters }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <LiquidGlass
      as="footer"
      interactive={false}
      className="relative z-10 border-x-0 px-6 py-10 text-sm text-[var(--site-muted)] sm:px-12"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-white">Adhiraj Muduli</p>
          <p className="mt-1">&copy; {year} Adhiraj Muduli. Released under the MIT License.</p>
        </div>
        <nav aria-label="Footer chapter navigation" className="flex flex-wrap gap-x-4 gap-y-2">
          {chapters.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.sectionId}`}
              className="rounded-md underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-focus)]"
            >
              {chapter.navigationLabel}
            </a>
          ))}
        </nav>
      </div>
    </LiquidGlass>
  )
}
