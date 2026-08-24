'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import useChapterPresence from '@/hooks/useChapterPresence'
import { getChapterEntry } from '@/lib/chapterRegistry'

const [centerX, centerY, centerZ] = getChapterEntry('computation').scene.center

const latticeExtent = 4
const latticeSpacing = 0.6
const nodeCount = latticeExtent ** 3

const nodeGeometry = new THREE.BoxGeometry(0.14, 0.14, 0.14)

const nodeMaterial = new THREE.MeshStandardMaterial({
  color: '#818cf8',
  emissive: '#4338ca',
  emissiveIntensity: 0.45,
  metalness: 0.15,
  roughness: 0.4,
})

function createNodeOffsets() {
  const offsets: [number, number, number][] = []
  const half = ((latticeExtent - 1) * latticeSpacing) / 2

  for (let x = 0; x < latticeExtent; x += 1) {
    for (let y = 0; y < latticeExtent; y += 1) {
      for (let z = 0; z < latticeExtent; z += 1) {
        offsets.push([
          x * latticeSpacing - half,
          y * latticeSpacing - half,
          z * latticeSpacing - half,
        ])
      }
    }
  }

  return offsets
}

const nodeOffsets = createNodeOffsets()

export default function LatticeExhibit() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const targetScaleRef = useRef(new THREE.Vector3())
  const scratch = useMemo(() => new THREE.Object3D(), [])
  const presence = useChapterPresence('computation')

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) {
      return
    }

    targetScaleRef.current.setScalar(presence.nearby ? 1 : 0.1)
    groupRef.current.scale.lerp(targetScaleRef.current, 1 - Math.exp(-3 * delta))
    groupRef.current.visible = presence.distance <= 2
    groupRef.current.rotation.y += delta * 0.045

    const elapsed = state.clock.elapsedTime

    for (let index = 0; index < nodeCount; index += 1) {
      const offset = nodeOffsets[index]

      if (!offset) {
        continue
      }

      const [x, y, z] = offset
      const distance = Math.sqrt(x * x + y * y + z * z)
      const pulse = 0.75 + Math.sin(elapsed * 0.9 - distance * 1.6) * 0.25
      scratch.position.set(x, y, z)
      scratch.scale.setScalar(pulse)
      scratch.updateMatrix()
      meshRef.current.setMatrixAt(index, scratch.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={groupRef} position={[centerX, centerY, centerZ]} scale={0.1}>
      <instancedMesh
        ref={meshRef}
        args={[nodeGeometry, nodeMaterial, nodeCount]}
        frustumCulled={false}
      />
    </group>
  )
}
