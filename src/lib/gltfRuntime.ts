import * as THREE from 'three'

import type { ModelSceneAsset } from '@/content/assets'

function cloneMaterial(material: THREE.Material) {
  return material.clone()
}

export function createGLTFInstance(
  source: THREE.Object3D,
  materialOwnership: ModelSceneAsset['materialOwnership'],
) {
  const instance = source.clone(true)

  if (materialOwnership === 'clone') {
    instance.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return
      }

      child.material = Array.isArray(child.material)
        ? child.material.map(cloneMaterial)
        : cloneMaterial(child.material)
    })
  }

  return instance
}

export function disposeGLTFInstance(
  instance: THREE.Object3D,
  materialOwnership: ModelSceneAsset['materialOwnership'],
) {
  if (materialOwnership !== 'clone') {
    return
  }

  instance.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((material) => material.dispose())
  })
}
