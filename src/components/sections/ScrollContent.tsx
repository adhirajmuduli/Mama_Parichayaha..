import HeroSection from "@/components/sections/HeroSection"
import InterestsSection from "@/components/sections/InterestsSection"
import ProjectsSection from "@/components/sections/ProjectsSection"
import FooterSection from "@/components/sections/FooterSection"

export default function ScrollContent() {
  return (
    <div className="relative z-10">
      
      <HeroSection />

      <InterestsSection />

      <ProjectsSection />

      <FooterSection />

    </div>
  )
}