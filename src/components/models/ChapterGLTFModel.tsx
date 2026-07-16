"use client"

import { Center, useAnimations, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import useChapterPresence from "@/hooks/useChapterPresence"
import type { Chapter } from "@/lib/chapters"

interface Props {
  chapter: Chapter
  displaySize: number
  modelPath: string
  position: [number, number, number]
  rotation?: [number, number, number]
  rotationSpeed?: number
}

export default function ChapterGLTFModel({ chapter, ...props }: Props) {
  const presence = useChapterPresence(chapter)

  return presence.nearby ? <LoadedModel {...props} active={presence.active} /> : null
}

function LoadedModel({
  active,
  displaySize,
  modelPath,
  position,
  rotation = [0, 0, 0],
  rotationSpeed = 0.08,
}: Omit<Props, "chapter"> & { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const targetScale = useRef(new THREE.Vector3())
  const { animations, scene } = useGLTF(modelPath)
  const model = useMemo(() => scene.clone(true), [scene])
  const normalization = useMemo(() => {
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3())
    const maximum = Math.max(size.x, size.y, size.z)
    return maximum > 0 ? 1 / maximum : 1
  }, [model])
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
  }, [model])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    targetScale.current.setScalar(active ? displaySize : displaySize * 0.42)
    groupRef.current.scale.lerp(targetScale.current, 0.08)
    groupRef.current.rotation.y += rotationSpeed * delta
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={0.001}>
      <Center>
        <primitive object={model} scale={normalization} />
      </Center>
    </group>
  )
}