'use client'

import { Center, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { getModelAsset, getModelDracoDecoderPath } from '@/content/assets'
import useChapterPresence from '@/hooks/useChapterPresence'
import useModelInteraction from '@/hooks/useModelInteraction'
import { getChapterEntry, type ExhibitId } from '@/lib/chapterRegistry'
import type { Chapter } from '@/lib/chapters'
import type { RouteVector } from '@/lib/closedRoute'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'
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
  const entry = getChapterEntry(chapter)
  const groupRef = useRef<THREE.Group>(null)
  const targetScaleRef = useRef(new THREE.Vector3())
  const { animations, scene } = useGLTF(asset.url, getModelDracoDecoderPath(asset), true)
  const model = useMemo(
    () => createGLTFInstance(scene, asset.materialOwnership),
    [asset.materialOwnership, scene],
  )
  const normalizedScale = useMemo(() => {
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3())
    const diameter = Math.max(size.x, size.y, size.z)
    if (!Number.isFinite(diameter) || diameter <= 0)
      throw new Error(`Invalid bounds for ${assetId}`)
    return entry.scene.targetDiameter / diameter
  }, [model, assetId, entry.scene.targetDiameter])
  const initialRotation = useMemo(
    () =>
      [
        asset.normalization.orientation[0],
        asset.normalization.orientation[1] + entry.scene.modelRotation[1],
        asset.normalization.orientation[2],
      ] as const,
    [asset, entry],
  )
  const { actions } = useAnimations(animations, model)
  const interactionHandlers = useModelInteraction({
    autoRotateSpeed: rotationSpeed,
    chapter,
    exhibitId: assetId,
    groupRef,
    initialRotation,
  })

  useEffect(() => {
    const store = useSceneInteractionStore.getState()
    store.setAvailableExhibits([...new Set([...store.availableExhibits, assetId])])
    return () => useSceneInteractionStore.getState().markExhibitUnavailable(assetId)
  }, [assetId])

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

    targetScaleRef.current.setScalar(active ? 1 : 0.8)
    groupRef.current.scale.lerp(targetScaleRef.current, 1 - Math.exp(-4.8 * delta))
  })

  return (
    <group
      ref={groupRef}
      position={[
        position[0] + entry.scene.modelOffset[0],
        position[1] + entry.scene.modelOffset[1],
        position[2] + entry.scene.modelOffset[2],
      ]}
      rotation={initialRotation}
      scale={0.8}
      {...interactionHandlers}
    >
      <Center>
        <primitive object={model} scale={normalizedScale} />
      </Center>
    </group>
  )
}
