"use client"

import {
  useFrame,
  useThree
} from "@react-three/fiber"

import { useRef } from "react"

import * as THREE from "three"

import useSectionState from "@/hooks/useSectionState"

export default function CameraRig() {
  const { camera, mouse } =
    useThree()

  const section =
    useSectionState()

  const targetPosition =
    useRef(
      new THREE.Vector3(0, 0, 7)
    )

  useFrame(() => {
    /*
      SECTION FRAMING
    */

    if (section === "hero") {
      targetPosition.current.set(
        mouse.x * 0.4,
        mouse.y * 0.25,
        7
      )
    }

    else if (
      section === "interests"
    ) {
      targetPosition.current.set(
        mouse.x * 0.8 - 1.5,
        mouse.y * 0.35,
        8
      )
    }

    else if (
      section === "projects"
    ) {
      targetPosition.current.set(
        mouse.x * 0.5 + 1.5,
        mouse.y * 0.3,
        6.5
      )
    }

    else {
      targetPosition.current.set(
        mouse.x * 0.2,
        mouse.y * 0.1 - 0.5,
        9
      )
    }

    /*
      INTERPOLATION
    */

    camera.position.lerp(
      targetPosition.current,
      0.03
    )

    camera.lookAt(0, 0, 0)
  })

  return null
}