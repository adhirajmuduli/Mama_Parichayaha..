'use client'

import { Center, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { getModelAsset } from '@/content/assets'
import useChapterPresence from '@/hooks/useChapterPresence'
import { createGLTFInstance, disposeGLTFInstance } from '@/lib/gltfRuntime'
import type { Chapter } from '@/lib/chapters'
import type { ExhibitId } from '@/lib/chapterRegistry'

interface Props {
  assetId: ExhibitId
  chapter: Chapter
  position: [number, number, number]
  rotationSpeed?: number
}

export default function ChapterGLTFModel({ chapter, ...props }: Props) {
  const presence = useChapterPresence(chapter)

  return presence.nearby ? <LoadedModel {...props} active={presence.active} /> : null
}

function LoadedModel({
  active,
  assetId,
  position,
  rotationSpeed = 0.08,
}: Omit<Props, 'chapter'> & { active: boolean }) {
  const asset = getModelAsset(assetId)
  const groupRef = useRef<THREE.Group>(null)
  const targetScale = useRef(new THREE.Vector3())
  const { animations, scene } = useGLTF(asset.url, false, true)
  const model = useMemo(
    () => createGLTFInstance(scene, asset.materialOwnership),
    [asset.materialOwnership, scene],
  )
  const { actions } = useAnimations(animations, model)

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play())
    return () => Object.values(actions).forEach((action) => action?.stop())
  }, [actions])

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return () => disposeGLTFInstance(model, asset.materialOwnership)
  }, [asset.materialOwnership, model])

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    targetScale.current.setScalar(
      active ? asset.normalization.activeScale : asset.normalization.inactiveScale,
    )
    groupRef.current.scale.lerp(targetScale.current, 0.08)
    groupRef.current.rotation.y += rotationSpeed * delta
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={asset.normalization.orientation}
      scale={asset.normalization.inactiveScale}
    >
      <Center>
        <primitive object={model} scale={asset.normalization.unitScale} />
      </Center>
    </group>
  )
}
