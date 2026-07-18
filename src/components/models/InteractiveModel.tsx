'use client'

import { Center, useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { getModelAsset } from '@/content/assets'
import useModelInteraction from '@/hooks/useModelInteraction'
import { createGLTFInstance, disposeGLTFInstance } from '@/lib/gltfRuntime'
import { getChapterEntry, type ExhibitId } from '@/lib/chapterRegistry'

interface InteractiveModelProps {
  assetId: ExhibitId
  color?: string
  emissive?: string
  emissiveIntensity?: number
  position?: readonly [number, number, number]
  rotation?: readonly [number, number, number]
  scale?: number
}

export default function InteractiveModel({
  assetId,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  color = '#ffffff',
  emissive = '#000000',
  emissiveIntensity = 0.7,
}: InteractiveModelProps) {
  const asset = getModelAsset(assetId)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { scene } = useGLTF(asset.url, false, true)
  const model = useMemo(
    () => createGLTFInstance(scene, asset.materialOwnership),
    [asset.materialOwnership, scene],
  )
  const interactionHandlers = useModelInteraction({
    autoRotateSpeed: 0.09,
    chapter: getChapterEntry(asset.chapter).id,
    exhibitId: assetId,
    groupRef,
    initialRotation: rotation,
  })

  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.set(color)
          material.emissive.set(emissive)
          material.emissiveIntensity = hovered ? 2.4 : emissiveIntensity
          material.roughness = 0.18
          material.metalness = 0.35
          material.needsUpdate = true
        }
      })
      child.castShadow = true
      child.receiveShadow = true
    })

    return () => disposeGLTFInstance(model, asset.materialOwnership)
  }, [asset.materialOwnership, color, emissive, emissiveIntensity, hovered, model])

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      {...interactionHandlers}
    >
      <Center>
        <primitive object={model} scale={asset.normalization.unitScale} />
      </Center>
    </group>
  )
}
