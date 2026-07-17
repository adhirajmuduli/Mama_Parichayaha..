'use client'

import { Center, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { getModelAsset } from '@/content/assets'
import { createGLTFInstance, disposeGLTFInstance } from '@/lib/gltfRuntime'
import type { ExhibitId } from '@/lib/chapterRegistry'

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
  const isDragging = useRef(false)
  const velocity = useRef(0)
  const previousX = useRef(0)
  const [hovered, setHovered] = useState(false)
  const { scene } = useGLTF(asset.url, false, true)
  const model = useMemo(
    () => createGLTFInstance(scene, asset.materialOwnership),
    [asset.materialOwnership, scene],
  )

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

  useFrame(() => {
    if (!groupRef.current || isDragging.current) {
      return
    }

    velocity.current *= 0.94
    groupRef.current.rotation.y += velocity.current + 0.0015
  })

  const onPointerDown = (event: { clientX: number; stopPropagation: () => void }) => {
    event.stopPropagation()
    isDragging.current = true
    previousX.current = event.clientX
  }

  const onPointerUp = () => {
    isDragging.current = false
  }

  const onPointerMove = (event: { clientX: number }) => {
    if (!isDragging.current || !groupRef.current) {
      return
    }

    const delta = event.clientX - previousX.current
    previousX.current = event.clientX
    velocity.current = delta * 0.0009
    groupRef.current.rotation.y += velocity.current
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <Center>
        <primitive object={model} scale={asset.normalization.unitScale} />
      </Center>
    </group>
  )
}
