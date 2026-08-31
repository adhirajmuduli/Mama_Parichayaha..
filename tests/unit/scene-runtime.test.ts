import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  assertSceneAssetManifest,
  getModelAsset,
  isSceneAssetAvailable,
  modelAssetIds,
  unassignedModelCandidates,
} from '@/content/assets'
import {
  getSceneProfileForTier,
  getSceneRuntimeProfile,
  SceneQualityGovernor,
  supportsWebGL,
} from '@/lib/sceneRuntime'

const originalGetContext = HTMLCanvasElement.prototype.getContext

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

interface RuntimeSignals {
  coarsePointer?: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
  reducedMotion?: boolean
  saveData?: boolean
}

function setRuntimeSignals({
  coarsePointer = false,
  deviceMemory = 16,
  hardwareConcurrency = 12,
  reducedMotion = false,
  saveData = false,
}: RuntimeSignals = {}) {
  vi.mocked(window.matchMedia).mockImplementation((query) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches:
      (query.includes('prefers-reduced-motion') && reducedMotion) ||
      (query.includes('pointer: coarse') && coarsePointer),
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }))
  vi.stubGlobal('navigator', {
    connection: { saveData },
    deviceMemory,
    hardwareConcurrency,
  })
}
describe('scene runtime contracts', () => {
  it('keeps the assigned GLB compressed and holds unassigned models outside the active scene', () => {
    assertSceneAssetManifest()

    expect(modelAssetIds).toEqual(['dna', 'bacteriophage', 'hemoglobin-ribbon', 'brain-point-cloud', 'earth-animated', 'dna-alt'])
    expect(getModelAsset('dna')).toMatchObject({
      compression: 'draco',
      url: '/models/dna_for_site.glb',
    })
    expect(isSceneAssetAvailable('dna-alt', 'low')).toBe(false)
    expect(isSceneAssetAvailable('dna-alt', 'medium')).toBe(true)
    expect(isSceneAssetAvailable('bacteriophage', 'low')).toBe(true)
    expect(isSceneAssetAvailable('hemoglobin-ribbon', 'medium')).toBe(false)
    expect(isSceneAssetAvailable('hemoglobin-ribbon', 'high')).toBe(true)
    expect(isSceneAssetAvailable('brain-point-cloud', 'high')).toBe(true)
    expect(isSceneAssetAvailable('earth-animated', 'high')).toBe(true)
    expect(unassignedModelCandidates.some((candidate) => candidate.compression === 'draco')).toBe(
      true,
    )
  })

  it('changes tier only after sustained frame evidence', () => {
    const governor = new SceneQualityGovernor('high')

    for (let sample = 0; sample < 89; sample += 1) {
      expect(governor.sample(0.043)).toBeNull()
    }
    expect(governor.sample(0.043)).toBe('medium')

    for (let sample = 0; sample < 599; sample += 1) {
      expect(governor.sample(0.016)).toBeNull()
    }
    expect(governor.sample(0.016)).toBe('high')
  })

  it('selects profiles from browser capability signals and exposes every tier policy', () => {
    setRuntimeSignals({ coarsePointer: true })

    expect(getSceneRuntimeProfile().tier).toBe('low')
    expect(getSceneProfileForTier('static')).toMatchObject({
      particleCount: 0,
      postProcessing: false,
    })
    expect(getSceneProfileForTier('high')).toMatchObject({
      particleCount: 160,
      postProcessing: true,
    })
  })

  it('prioritizes reduced-data signals before progressively selecting each quality tier', () => {
    setRuntimeSignals({ reducedMotion: true })
    expect(getSceneRuntimeProfile().tier).toBe('static')

    setRuntimeSignals({ saveData: true })
    expect(getSceneRuntimeProfile().tier).toBe('static')

    setRuntimeSignals({ deviceMemory: 4 })
    expect(getSceneRuntimeProfile().tier).toBe('low')

    setRuntimeSignals({ hardwareConcurrency: 4 })
    expect(getSceneRuntimeProfile().tier).toBe('low')

    setRuntimeSignals({ deviceMemory: 6 })
    expect(getSceneRuntimeProfile().tier).toBe('medium')

    setRuntimeSignals({ hardwareConcurrency: 6 })
    expect(getSceneRuntimeProfile().tier).toBe('medium')

    setRuntimeSignals()
    expect(getSceneRuntimeProfile().tier).toBe('high')
  })
  it('detects WebGL capability without throwing when a browser context is unavailable', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => null,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext
    expect(supportsWebGL()).toBe(false)

    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ({}),
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext
    expect(supportsWebGL()).toBe(true)
  })
})
