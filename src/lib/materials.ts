import * as THREE from 'three'

export const dnaMaterial = new THREE.MeshPhysicalMaterial({
  color: '#f97316',

  emissive: '#ea580c',
  emissiveIntensity: 1.8,

  roughness: 0.15,
  metalness: 0.35,

  clearcoat: 1,
  clearcoatRoughness: 0,

  reflectivity: 1,
})
