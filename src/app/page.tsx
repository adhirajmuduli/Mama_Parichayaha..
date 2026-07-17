import ChapterProgressIndicator from '@/components/layout/ChapterProgressIndicator'
import SiteHeader from '@/components/layout/SiteHeader'
import ChapterSection from '@/components/narrative/ChapterSection'
import SceneClient from '@/components/scene/SceneClient'
import ScenePoster from '@/components/scene/ScenePoster'
import CursorGlow from '@/components/ui/CursorGlow'
import { chapterRegistry } from '@/lib/chapterRegistry'

const chapterNavigation = chapterRegistry.map(({ id, navigationLabel, sectionId }) => ({
  id,
  sectionId,
  navigationLabel,
}))

export default function HomePage() {
  return (
    <>
      <a
        className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-white px-4 py-2 text-slate-950 focus:not-sr-only"
        href="#origins"
      >
        Skip to portfolio content
      </a>
      <ScenePoster />
      <SceneClient />
      <SiteHeader chapters={chapterNavigation} />
      <main id="portfolio-content" className="relative min-h-screen overflow-x-hidden">
        <div className="relative z-10">
          <CursorGlow />
          `n <ChapterProgressIndicator chapters={chapterNavigation} />
          {chapterRegistry.map((chapter) => (
            <ChapterSection key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </main>
    </>
  )
}
