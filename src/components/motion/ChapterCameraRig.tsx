'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import useChapter from '@/hooks/useChapter'
import { getCameraPose } from '@/lib/chapterRegistry'

export default function ChapterCameraRig() {
  const { camera, size } = useThree()
  const { chapter } = useChapter()
  const desiredPositionRef = useRef(new THREE.Vector3())
  const desiredTargetRef = useRef(new THREE.Vector3())
  const targetRef = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const pose = getCameraPose(chapter, size.width)

    desiredPositionRef.current.fromArray(pose.position)
    desiredTargetRef.current.fromArray(pose.target)
    const interpolation = 1 - Math.exp(-4.2 * delta)
    camera.position.lerp(desiredPositionRef.current, interpolation)
    targetRef.current.lerp(desiredTargetRef.current, interpolation)
    camera.lookAt(targetRef.current)
  })

  return null
}
