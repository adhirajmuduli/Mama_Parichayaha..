'use client'

import { Center, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { getModelAsset } from '@/content/assets'
import useChapterPresence from '@/hooks/useChapterPresence'
import { getChapterEntry } from '@/lib/chapterRegistry'
import { createGLTFInstance, disposeGLTFInstance } from '@/lib/gltfRuntime'
import { applyDnaMaterial } from '@/lib/materials'

const [centerX, centerY, centerZ] = getChapterEntry('origins').scene.center
const asset = getModelAsset('dna')

export default function DNA() {
  const containerRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(asset.url, false, true)
  const model = useMemo(() => createGLTFInstance(scene, asset.materialOwnership), [scene])
  const { actions } = useAnimations(animations, model)
  const presence = useChapterPresence('origins')

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play())

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach(applyDnaMaterial)
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return () => {
      Object.values(actions).forEach((action) => action?.stop())
      disposeGLTFInstance(model, asset.materialOwnership)
    }
  }, [actions, model])

  useFrame((state) => {
    if (!containerRef.current) {
      return
    }

    const targetScale = presence.nearby
      ? asset.normalization.activeScale
      : asset.normalization.inactiveScale
    containerRef.current.position.y = centerY - 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.12
    containerRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
  })

  return (
    <group
      ref={containerRef}
      position={[centerX, centerY - 0.5, centerZ]}
      rotation={asset.normalization.orientation}
      scale={asset.normalization.inactiveScale}
    >
      <Center>
        <primitive object={model} scale={asset.normalization.unitScale} />
      </Center>
    </group>
  )
}
