'use client'

import { Center, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { getModelAsset, getModelDracoDecoderPath } from '@/content/assets'
import useChapterPresence from '@/hooks/useChapterPresence'
import useModelInteraction from '@/hooks/useModelInteraction'
import { getChapterEntry } from '@/lib/chapterRegistry'
import { createGLTFInstance, disposeGLTFInstance } from '@/lib/gltfRuntime'

const [centerX, centerY, centerZ] = getChapterEntry('computation').scene.center
const asset = getModelAsset('brain-point-cloud')

export default function BrainPointCloud() {
  const containerRef = useRef<THREE.Group>(null)
  const targetScaleRef = useRef(new THREE.Vector3())
  const { scene } = useGLTF(asset.url, getModelDracoDecoderPath(asset), true)
  const model = useMemo(() => createGLTFInstance(scene, asset.materialOwnership), [scene])
  const presence = useChapterPresence('computation')
  const interactionHandlers = useModelInteraction({
    autoRotateSpeed: 0.02,
    chapter: 'computation',
    exhibitId: 'brain-point-cloud',
    groupRef: containerRef,
    initialRotation: asset.normalization.orientation,
  })

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
            material.metalness = 0.1
            material.roughness = 0.5
            material.emissive = new THREE.Color('#22d3ee')
            material.emissiveIntensity = 0.2
          }
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return () => {
      disposeGLTFInstance(model, asset.materialOwnership)
    }
  }, [model])

  useFrame((state, delta) => {
    if (!containerRef.current) {
      return
    }

    const targetScale = presence.nearby
      ? asset.normalization.activeScale
      : asset.normalization.inactiveScale
    containerRef.current.position.y = centerY - 0.5 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1
    targetScaleRef.current.setScalar(targetScale)
    containerRef.current.scale.lerp(targetScaleRef.current, 1 - Math.exp(-3 * delta))
  })

  return (
    <group
      ref={containerRef}
      position={[centerX, centerY - 0.5, centerZ]}
      rotation={asset.normalization.orientation}
      scale={asset.normalization.inactiveScale}
      {...interactionHandlers}
    >
      <Center>
        <primitive object={model} scale={asset.normalization.unitScale} />
      </Center>
    </group>
  )
}