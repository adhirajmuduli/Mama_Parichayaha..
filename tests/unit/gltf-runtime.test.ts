import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { createGLTFInstance, disposeGLTFInstance } from '@/lib/gltfRuntime'

function createSource() {
  const source = new THREE.Group()
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial())
  source.add(mesh)
  return { material: mesh.material, source }
}

describe('GLTF runtime ownership', () => {
  it('keeps shared-material instances attached to the loader-owned material', () => {
    const { material, source } = createSource()
    const instance = createGLTFInstance(source, 'shared')
    const mesh = instance.children[0] as THREE.Mesh

    expect(mesh.material).toBe(material)
  })

  it('clones and disposes only instance-owned materials', () => {
    const { material, source } = createSource()
    const instance = createGLTFInstance(source, 'clone')
    const mesh = instance.children[0] as THREE.Mesh
    const clonedMaterial = mesh.material as THREE.Material
    const dispose = vi.spyOn(clonedMaterial, 'dispose')

    expect(clonedMaterial).not.toBe(material)
    disposeGLTFInstance(instance, 'clone')
    expect(dispose).toHaveBeenCalledOnce()

    disposeGLTFInstance(instance, 'shared')
    expect(dispose).toHaveBeenCalledOnce()
  })
})
