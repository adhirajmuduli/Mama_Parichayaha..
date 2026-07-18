'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import Phage from '@/components/models/Phage'
import useChapterPresence from '@/hooks/useChapterPresence'
import useModelInteraction from '@/hooks/useModelInteraction'
import { getChapterEntry } from '@/lib/chapterRegistry'

const [centerX, centerY, centerZ] = getChapterEntry('interests').scene.center

export default function PhageSystem() {
  const groupRef = useRef<THREE.Group>(null)
  const presence = useChapterPresence('interests')
  const interactionHandlers = useModelInteraction({
    autoRotateSpeed: 0.09,
    chapter: 'interests',
    exhibitId: 'phages',
    groupRef,
    initialRotation: [0, 0, 0],
  })

  useFrame(() => {
    if (!groupRef.current) {
      return
    }

    const scale = presence.nearby ? 1 : 0.1
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05)
    groupRef.current.visible = presence.distance <= 2
  })

  return (
    <group ref={groupRef} position={[centerX, centerY - 0.5, centerZ]} {...interactionHandlers}>
      <Phage position={[-4, 1.5, -2]} scale={0.9} speed={1} />
      <Phage position={[0, 2.3, -3]} scale={1.1} speed={0.7} />
      <Phage position={[3.8, 1.2, -1]} scale={0.85} speed={1.3} />
    </group>
  )
}
