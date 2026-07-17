'use client'

import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import InteractiveModel from '@/components/models/InteractiveModel'
import useChapterPresence from '@/hooks/useChapterPresence'
import { getChapterEntry } from '@/lib/chapterRegistry'

const [centerX, centerY, centerZ] = getChapterEntry('research').scene.center

export default function ProteinShowcase() {
  const groupRef = useRef<THREE.Group>(null)
  const presence = useChapterPresence('research')

  useFrame((state) => {
    if (!groupRef.current) return

    const targetScale = presence.nearby ? 1 : 0.1
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })

  return (
    <group ref={groupRef} position={[centerX, centerY, centerZ]}>
      <pointLight color="#22d3ee" intensity={20} distance={10} position={[2, 2, 3]} />
      <pointLight color="#a855f7" intensity={12} distance={8} position={[-2, -1, 2]} />

      <Sparkles
        count={72}
        scale={[5, 4, 5]}
        size={2.2}
        speed={0.25}
        opacity={0.65}
        color="#67e8f9"
      />

      <InteractiveModel
        modelPath="/models/Proteins/GFP.glb"
        position={[0, -0.8, -2]}
        scale={0.1}
        rotation={[0.2, 0.5, 0.5]}
        color="#06b6d4"
        emissive="#0e7490"
        emissiveIntensity={1.35}
      />
    </group>
  )
}
