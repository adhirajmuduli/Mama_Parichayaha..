"use client"

import { useFrame, useThree } from "@react-three/fiber"

import { useRef } from "react"

import * as THREE from "three"

import useScrollProgress from "@/hooks/useScrollProgress"

export default function CameraRig() {
  const { camera, mouse } =
    useThree()

  const scrollProgress =
    useScrollProgress()

  const targetPosition =
    useRef(
      new THREE.Vector3(0, 0, 7)
    )

  useFrame(() => {
    /*
      SECTION TARGETS
    */

    if (scrollProgress < 0.25) {
      targetPosition.current.set(
        mouse.x * 0.4,
        mouse.y * 0.25,
        7
      )
    }

    else if (scrollProgress < 0.5) {
      targetPosition.current.set(
        mouse.x * 0.8 - 1,
        mouse.y * 0.35,
        8
      )
    }

    else {
      targetPosition.current.set(
        mouse.x * 0.6 + 1,
        mouse.y * 0.4,
        6.5
      )
    }

    /*
      SMOOTH CAMERA INTERPOLATION
    */

    camera.position.lerp(
      targetPosition.current,
      0.03
    )

    /*
      LOOK TARGET
    */

    camera.lookAt(0, 0, 0)
  })

  return null
}