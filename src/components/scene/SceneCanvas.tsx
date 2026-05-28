"use client"

import Experience from "@/components/scene/Experience"

export default function SceneCanvas() {
  return (
    <div
      className="
        fixed
        inset-0
        z-0
        h-screen
        w-screen
      "
    >
      <Experience />
    </div>
  )
}