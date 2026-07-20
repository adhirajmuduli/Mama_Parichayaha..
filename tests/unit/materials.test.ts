import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { applyDnaMaterial } from '@/lib/materials'

describe('DNA material treatment', () => {
  it('leaves incompatible materials untouched', () => {
    const material = new THREE.MeshBasicMaterial({ color: '#ffffff' })

    applyDnaMaterial(material)

    expect(material.color.getHexString()).toBe('ffffff')
  })

  it('applies the approved standard-material treatment', () => {
    const material = new THREE.MeshStandardMaterial()

    applyDnaMaterial(material)

    expect(material.color.getHexString()).toBe('f97316')
    expect(material.emissive.getHexString()).toBe('ea580c')
    expect(material.emissiveIntensity).toBe(1.8)
    expect(material.roughness).toBe(0.15)
    expect(material.metalness).toBe(0.35)
    expect(material.version).toBeGreaterThan(0)
  })

  it('adds clearcoat only to physical materials', () => {
    const material = new THREE.MeshPhysicalMaterial()

    applyDnaMaterial(material)

    expect(material.clearcoat).toBe(1)
    expect(material.clearcoatRoughness).toBe(0)
    expect(material.reflectivity).toBe(1)
  })
})
