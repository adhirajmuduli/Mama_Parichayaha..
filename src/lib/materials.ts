import * as THREE from 'three'

export function applyDnaMaterial(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) {
    return
  }

  material.color.set('#f97316')
  material.emissive.set('#ea580c')
  material.emissiveIntensity = 0.3
  material.roughness = 0.5
  material.metalness = 0.2

  if (material instanceof THREE.MeshPhysicalMaterial) {
    material.clearcoat = 0.5
    material.clearcoatRoughness = 0.3
    material.reflectivity = 0.6
  }

  material.needsUpdate = true
}
