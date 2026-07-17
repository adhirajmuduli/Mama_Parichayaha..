import ChapterSection from '@/components/narrative/ChapterSection'
import Experience from '@/components/scene/Experience'
import CursorGlow from '@/components/ui/CursorGlow'
import { chapterRegistry } from '@/lib/chapterRegistry'

export default function HomePage() {
  return (
    <>
      <a
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-white px-4 py-2 text-slate-950 focus:not-sr-only"
        href="#portfolio-content"
      >
        Skip to portfolio content
      </a>
      <main
        id="portfolio-content"
        tabIndex={-1}
        className="relative min-h-screen overflow-x-hidden bg-[#05010a]"
      >
        <div className="fixed inset-0 z-0">
          <Experience />
        </div>

        <div className="relative z-10">
          <CursorGlow />
          {chapterRegistry.map((chapter) => (
            <ChapterSection key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </main>
    </>
  )
}
