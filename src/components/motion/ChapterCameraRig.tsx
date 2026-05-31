"use client"

import { useFrame } from "@react-three/fiber"

import { useThree } from "@react-three/fiber"

import { useRef } from "react"

import * as THREE from "three"

import type { Chapter } from "@/lib/chapters"

import { cameraPoses }
from "@/lib/cameraPoses"

interface ChapterCameraRigProps {
  chapter: Chapter
}

export default function ChapterCameraRig({
  chapter
}: ChapterCameraRigProps) {

  const { camera } =
    useThree()

  const targetRef =
    useRef(
      new THREE.Vector3()
    )

  useFrame(() => {

    const pose =
      cameraPoses[chapter]

    camera.position.lerp(
      pose.position,
      0.03
    )

    targetRef.current.lerp(
      pose.target,
      0.03
    )

    camera.lookAt(
      targetRef.current
    )
  })

  return null
}