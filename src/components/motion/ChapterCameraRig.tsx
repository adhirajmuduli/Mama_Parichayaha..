"use client"

import { useFrame }
from "@react-three/fiber"

import { useThree }
from "@react-three/fiber"

import { useRef }
from "react"

import * as THREE from "three"

import useChapter
from "@/hooks/useChapter"

import { cameraPoses }
from "@/lib/cameraPoses"

export default function ChapterCameraRig() {

  const { camera } =
    useThree()

  const { chapter } =
    useChapter()

  const targetRef =
    useRef(
      new THREE.Vector3()
    )

  useFrame(() => {

    const pose =
      cameraPoses[chapter]

    camera.position.lerp(
      pose.position,
      0.04
    )

    targetRef.current.lerp(
      pose.target,
      0.04
    )

    camera.lookAt(
      targetRef.current
    )

  })

  return null
}