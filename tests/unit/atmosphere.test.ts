import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { createAtmosphereRuntime, transitionAtmosphereRuntime } from '@/lib/atmosphere'
import { getChapterEntry } from '@/lib/chapterRegistry'

describe('atmosphere runtime', () => {
  it('transitions every chapter-controlled visual parameter without replacing runtime objects', () => {
    const origins = getChapterEntry('origins')
    const research = getChapterEntry('research')
    const runtime = createAtmosphereRuntime(origins.scene.atmosphere, origins.scene.center)
    const background = runtime.background
    const center = runtime.center

    for (let frame = 0; frame < 180; frame += 1) {
      transitionAtmosphereRuntime(
        runtime,
        research.scene.atmosphere,
        research.scene.center,
        1 / 60,
        {
          reduceMotion: false,
        },
      )
    }

    expect(runtime.background).toBe(background)
    expect(runtime.center).toBe(center)
    expect(runtime.center.distanceToSquared(new THREE.Vector3(36, 2.999, 1.449))).toBeLessThan(
      0.0001,
    )
    expect(runtime.exposure).toBeCloseTo(research.scene.atmosphere.exposure, 3)
    expect(runtime.bloomIntensity).toBeCloseTo(research.scene.atmosphere.bloom.intensity, 3)
    expect(runtime.fogFar).toBeCloseTo(research.scene.atmosphere.fog.far, 3)
    expect(runtime.keyIntensity).toBeCloseTo(research.scene.atmosphere.lighting.key.intensity, 3)
  })

  it('damps background motion to a stable state for reduced-motion users', () => {
    const origins = getChapterEntry('origins')
    const runtime = createAtmosphereRuntime(origins.scene.atmosphere, origins.scene.center)

    for (let frame = 0; frame < 60; frame += 1) {
      transitionAtmosphereRuntime(runtime, origins.scene.atmosphere, origins.scene.center, 1 / 60, {
        reduceMotion: true,
      })
    }

    expect(runtime.motionFactor).toBeLessThan(0.001)
  })
})
