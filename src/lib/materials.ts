import * as THREE from 'three'

export function applyDnaMaterial(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) {
    return
  }

  material.color.set('#f97316')
  material.emissive.set('#ea580c')
  material.emissiveIntensity = 1.8
  material.roughness = 0.15
  material.metalness = 0.35

  if (material instanceof THREE.MeshPhysicalMaterial) {
    material.clearcoat = 1
    material.clearcoatRoughness = 0
    material.reflectivity = 1
  }

  material.needsUpdate = true
}
