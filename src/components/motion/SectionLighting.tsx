"use client"

import { useRef } from "react"

import { useFrame } from "@react-three/fiber"

import * as THREE from "three"

import useSectionState from "@/hooks/useSectionState"

export default function SectionLighting() {
  const lightRef =
    useRef<THREE.PointLight>(null)

  const section =
    useSectionState()

  useFrame(() => {
    if (!lightRef.current) return

    let targetColor =
      new THREE.Color("#c084fc")

    let targetIntensity = 8

    /*
      SECTION STATES
    */

    if (section === "hero") {
      targetColor.set("#c084fc")
      targetIntensity = 8
    }

    else if (
      section === "interests"
    ) {
      targetColor.set("#f97316")
      targetIntensity = 15
    }

    else if (
      section === "projects"
    ) {
      targetColor.set("#67e8f9")
      targetIntensity = 12
    }

    else {
      targetColor.set("#a78bfa")
      targetIntensity = 5
    }

    lightRef.current.color.lerp(
      targetColor,
      0.03
    )

    lightRef.current.intensity =
      THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensity,
        0.03
      )
  })

  return (
    <pointLight
      ref={lightRef}
      position={[0, 2, 3]}
      intensity={8}
      color="#c084fc"
    />
  )
}