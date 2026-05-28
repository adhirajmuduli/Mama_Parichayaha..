"use client"

import { useThree, useFrame } from "@react-three/fiber"

import * as THREE from "three"

import useSectionState from "@/hooks/useSectionState"

export default function WorldAtmosphere() {
  const { scene } =
    useThree()

  const section =
    useSectionState()

  const targetColor =
    new THREE.Color()

  useFrame(() => {
    /*
      SECTION ATMOSPHERES
    */

    if (section === "hero") {
      targetColor.set("#07020f")
    }

    else if (
      section === "interests"
    ) {
      targetColor.set("#12061f")
    }

    else if (
      section === "projects"
    ) {
      targetColor.set("#041018")
    }

    else {
      targetColor.set("#020308")
    }

    /*
      SMOOTH INTERPOLATION
    */

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(
        targetColor,
        0.03
      )
    }
  })

  return null
}