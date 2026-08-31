'use client'

import { Center, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { getModelAsset, getModelDracoDecoderPath } from '@/content/assets'
import useChapterPresence from '@/hooks/useChapterPresence'
import useModelInteraction from '@/hooks/useModelInteraction'
import type { ExhibitId } from '@/lib/chapterRegistry'
import type { Chapter } from '@/lib/chapters'
import type { RouteVector } from '@/lib/closedRoute'
import { createGLTFInstance, disposeGLTFInstance } from '@/lib/gltfRuntime'

interface Props {
  assetId: ExhibitId
  chapter: Chapter
  position: RouteVector
  rotationSpeed?: number
}

export default function ChapterGLTFModel(props: Props) {
  const { chapter, ...rest } = props
  const presence = useChapterPresence(chapter)

  return presence.nearby ? (
    <LoadedModel active={presence.active} chapter={chapter} {...rest} />
  ) : null
}

function LoadedModel({
  active,
  assetId,
  chapter,
  position,
  rotationSpeed = 0.08,
}: Props & { active: boolean }) {
  const asset = getModelAsset(assetId)
  const groupRef = useRef<THREE.Group>(null)
  const targetScaleRef = useRef(new THREE.Vector3())
  const { animations, scene } = useGLTF(asset.url, getModelDracoDecoderPath(asset), true)
  const model = useMemo(
    () => createGLTFInstance(scene, asset.materialOwnership),
    [asset.materialOwnership, scene],
  )
  const { actions } = useAnimations(animations, model)
  const interactionHandlers = useModelInteraction({
    autoRotateSpeed: rotationSpeed,
    chapter,
    exhibitId: assetId,
    groupRef,
    initialRotation: asset.normalization.orientation,
  })

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play())
    return () => Object.values(actions).forEach((action) => action?.stop())
  }, [actions, model])

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

    targetScaleRef.current.setScalar(
      active ? asset.normalization.activeScale : asset.normalization.inactiveScale,
    )
    groupRef.current.scale.lerp(targetScaleRef.current, 1 - Math.exp(-4.8 * delta))
  })

  return (
    <group
      ref={groupRef}
      position={position}
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
