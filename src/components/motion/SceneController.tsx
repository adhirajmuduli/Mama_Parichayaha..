"use client"

import { useFrame } from "@react-three/fiber"

import { useRef } from "react"

import * as THREE from "three"

import useScrollProgress from "@/hooks/useScrollProgress"

interface SceneControllerProps {
  target: React.RefObject<THREE.Group | null>
}

export default function SceneController({
  target
}: SceneControllerProps) {
  const scrollProgress =
    useScrollProgress()

  const current =
    useRef(0)

  useFrame(() => {
    if (!target.current) return

    current.current = THREE.MathUtils.lerp(
      current.current,
      scrollProgress,
      0.05
    )

    const p = current.current

    /*
      SECTION CHOREOGRAPHY
    */

    // HERO
    if (p < 0.25) {
      target.current.position.x =
        THREE.MathUtils.lerp(
          target.current.position.x,
          -2.8,
          0.05
        )

      target.current.rotation.y =
        THREE.MathUtils.lerp(
          target.current.rotation.y,
          -0.45,
          0.05
        )
    }

    // INTERESTS
    else if (p < 0.5) {
      target.current.position.x =
        THREE.MathUtils.lerp(
          target.current.position.x,
          -4.5,
          0.05
        )

      target.current.rotation.y =
        THREE.MathUtils.lerp(
          target.current.rotation.y,
          0.25,
          0.05
        )
    }

    // PROJECTS
    else {
      target.current.position.x =
        THREE.MathUtils.lerp(
          target.current.position.x,
          -1.5,
          0.05
        )

      target.current.rotation.y =
        THREE.MathUtils.lerp(
          target.current.rotation.y,
          0.8,
          0.05
        )
    }
  })

  return null
}