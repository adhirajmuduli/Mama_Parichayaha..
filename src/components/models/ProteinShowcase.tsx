'use client'

import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import InteractiveModel from '@/components/models/InteractiveModel'
import { getModelAsset } from '@/content/assets'
import useChapterPresence from '@/hooks/useChapterPresence'
import { getChapterEntry } from '@/lib/chapterRegistry'

const [centerX, centerY, centerZ] = getChapterEntry('research').scene.center
const asset = getModelAsset('protein')

export default function ProteinShowcase() {
  const groupRef = useRef<THREE.Group>(null)
  const presence = useChapterPresence('research')

  useFrame(() => {
    if (!groupRef.current) {
      return
    }

    const targetScale = presence.nearby ? 1 : 0.1
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
  })

  return (
    <group ref={groupRef} position={[centerX, centerY, centerZ]}>
      <Sparkles
        color="#67e8f9"
        count={72}
        opacity={0.65}
        scale={[5, 4, 5]}
        size={2.2}
        speed={0.25}
      />
      <InteractiveModel
        assetId="protein"
        color="#06b6d4"
        emissive="#0e7490"
        emissiveIntensity={1.35}
        position={[0, -0.8, -2]}
        rotation={asset.normalization.orientation}
        scale={asset.normalization.activeScale}
      />
    </group>
  )
}
