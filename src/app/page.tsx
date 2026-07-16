import Experience from '@/components/scene/Experience'
import NarrativeScroll from '@/components/narrative/NarrativeScroll'
import NarrativeOverlay from '@/components/narrative/NarrativeOverlay'
import NarrativeEngine from '@/components/narrative/NarrativeEngine'
import CursorGlow from '@/components/ui/CursorGlow'

export default function HomePage() {
  return (
    <NarrativeEngine>
      <main className="relative min-h-screen overflow-x-hidden bg-[#05010a]">
        <div className="fixed inset-0 z-0">
          <Experience />
        </div>

        <div className="relative z-10">
          <CursorGlow />
          <NarrativeOverlay />
          <NarrativeScroll />
        </div>
      </main>
    </NarrativeEngine>
  )
}
