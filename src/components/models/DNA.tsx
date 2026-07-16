'use client'

import { useEffect, useRef } from 'react'
import { Center, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import useChapterPresence from '@/hooks/useChapterPresence'
import { dnaMaterial } from '@/lib/materials'
import { worldLayout } from '@/lib/worldLayout'

export default function DNA() {
  const containerRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/DNA/dna.glb')
  const { actions } = useAnimations(animations, containerRef)
  const presence = useChapterPresence('origins')

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.play())

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = dnaMaterial
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [actions, scene])

  useFrame((state) => {
    if (!containerRef.current) return

    const t = state.clock.elapsedTime
    containerRef.current.position.y = worldLayout.origins.center.y - 0.5 + Math.sin(t * 0.8) * 0.12

    const targetScale = presence.nearby ? 0.24 : 0.05
    containerRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
  })

  return (
    <group
      ref={containerRef}
      position={[
        worldLayout.origins.center.x,
        worldLayout.origins.center.y - 0.5,
        worldLayout.origins.center.z,
      ]}
      rotation={[0.35, -0.45, 0.15]}
      scale={0.24}
    >
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/models/DNA/dna.glb')
