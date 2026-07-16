'use client'

import { useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import usePresence from '@/hooks/usePresence'

import * as THREE from 'three'

import useChapterPresence from '@/hooks/useChapterPresence'

import { worldLayout } from '@/lib/worldLayout'

import Phage from '@/components/models/Phage'

export default function PhageSystem() {
  const groupRef = useRef<THREE.Group>(null)

  const presence = useChapterPresence('interests')

  useFrame(() => {
    if (!groupRef.current) return

    groupRef.current.scale.lerp(
      new THREE.Vector3(
        presence.nearby ? 1 : 0.1,
        presence.nearby ? 1 : 0.1,
        presence.nearby ? 1 : 0.1,
      ),
      0.05,
    )

    groupRef.current.visible = presence.distance <= 2

    groupRef.current.rotation.y += 0.0015
  })

  return (
    <group
      ref={groupRef}
      position={[
        worldLayout.interests.center.x,
        worldLayout.interests.center.y - 0.5,
        worldLayout.interests.center.z,
      ]}
    >
      <Phage position={[-4, 1.5, -2]} scale={0.9} speed={1} />

      <Phage position={[0, 2.3, -3]} scale={1.1} speed={0.7} />

      <Phage position={[3.8, 1.2, -1]} scale={0.85} speed={1.3} />
    </group>
  )
}
