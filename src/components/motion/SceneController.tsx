"use client"

import { useFrame } from "@react-three/fiber"

import { useRef } from "react"

import * as THREE from "three"

import useChapter from "@/hooks/useChapter"

import { chapterPoses }
from "@/lib/chapterPoses"

interface SceneControllerProps {
  target: React.RefObject<
    THREE.Group | null
  >
}

export default function SceneController({
  target,
}: SceneControllerProps) {

  const { chapter } =
    useChapter()

  const smooth =
    useRef(0.05)

  useFrame(() => {

    if (!target.current)
      return

    const pose =
      chapterPoses[chapter]

    target.current.position.lerp(
      pose.position,
      smooth.current
    )

    target.current.rotation.x =
      THREE.MathUtils.lerp(
        target.current.rotation.x,
        pose.rotation.x,
        smooth.current
      )

    target.current.rotation.y =
      THREE.MathUtils.lerp(
        target.current.rotation.y,
        pose.rotation.y,
        smooth.current
      )

    target.current.rotation.z =
      THREE.MathUtils.lerp(
        target.current.rotation.z,
        pose.rotation.z,
        smooth.current
      )
  })

  return null
}