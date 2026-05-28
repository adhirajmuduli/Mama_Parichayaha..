import Experience from "@/components/scene/Experience"

import HeroSection from "@/components/sections/HeroSection"

import InterestsSection from "@/components/sections/InterestsSection"

import ProjectsSection from "@/components/sections/ProjectsSection"

import CursorGlow from "@/components/ui/CursorGlow"

export default function HomePage() {
  return (
    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#05010a]
      "
    >
      {/* GLOBAL 3D WORLD */}
      <div
        className="
          fixed
          inset-0
          z-0
        "
      >
        <Experience />
      </div>

      {/* UI LAYER */}
      <div className="relative z-10">
        
        <CursorGlow />

        <HeroSection />

        <InterestsSection />

        <ProjectsSection />

      </div>
    </main>
  )
}