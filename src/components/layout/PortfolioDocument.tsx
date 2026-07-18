import LiquidGlassPointerTracker from '@/components/liquid-glass/LiquidGlassPointerTracker'
import ChapterProgressIndicator from '@/components/layout/ChapterProgressIndicator'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteHeader from '@/components/layout/SiteHeader'
import ChapterSection from '@/components/narrative/ChapterSection'
import ContactSection from '@/components/sections/ContactSection'
import CreditsSection from '@/components/sections/CreditsSection'
import PublicationStatusSection from '@/components/sections/PublicationStatusSection'
import CursorGlow from '@/components/ui/CursorGlow'
import { chapterRegistry } from '@/lib/chapterRegistry'

const chapterNavigation = chapterRegistry.map(({ id, navigationLabel, sectionId }) => ({
  id,
  sectionId,
  navigationLabel,
}))

interface PortfolioDocumentProps {
  interactiveDecorations?: boolean
}

export default function PortfolioDocument({
  interactiveDecorations = false,
}: PortfolioDocumentProps) {
  return (
    <>
      <LiquidGlassPointerTracker />
      <a
        className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-white px-4 py-2 text-slate-950 focus:not-sr-only"
        href="#origins"
      >
        Skip to portfolio content
      </a>
      <SiteHeader chapters={chapterNavigation} />
      <main id="portfolio-content" className="relative min-h-screen overflow-x-hidden">
        <div className="relative z-10">
          {interactiveDecorations ? <CursorGlow /> : null}
          <ChapterProgressIndicator chapters={chapterNavigation} />
          {chapterRegistry.map((chapter) => (
            <ChapterSection key={chapter.id} chapter={chapter} />
          ))}
          <PublicationStatusSection />
          <ContactSection />
          <CreditsSection />
          <SiteFooter chapters={chapterNavigation} />
        </div>
      </main>
    </>
  )
}
