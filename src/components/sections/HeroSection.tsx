"use client"

import Experience from "@/components/scene/Experience"

import BlurCard from "@/components/ui/BlurCard"

export default function HeroSection() {
  return (
    <section
      className="
        relative
        flex
        min-h-screen
        items-center
        overflow-hidden
      "
    >
      {/* 3D CANVAS */}
      <div
        className="
          absolute
          inset-0
          z-0
        "
      >
        <Experience />
      </div>

      {/* CONTENT */}
      <div
        className="
          relative
          z-10

          mx-auto
          flex
          w-full
          max-w-7xl
          justify-end

          px-6
        "
      >
        <BlurCard />
      </div>
    </section>
  )
}