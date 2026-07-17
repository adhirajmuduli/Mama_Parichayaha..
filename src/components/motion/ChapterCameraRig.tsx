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

  useFrame(() => {
    const pose = getCameraPose(chapter, size.width)

    desiredPositionRef.current.fromArray(pose.position)
    desiredTargetRef.current.fromArray(pose.target)
    camera.position.lerp(desiredPositionRef.current, 0.04)
    targetRef.current.lerp(desiredTargetRef.current, 0.04)
    camera.lookAt(targetRef.current)
  })

  return null
}
