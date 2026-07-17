import { describe, expect, it } from 'vitest'

import {
  assertSceneAssetManifest,
  getModelAsset,
  isSceneAssetAvailable,
  modelAssetIds,
} from '@/content/assets'
import { SceneQualityGovernor } from '@/lib/sceneRuntime'

describe('scene runtime contracts', () => {
  it('keeps each retained GLB in the verified manifest with a bounded tier policy', () => {
    assertSceneAssetManifest()

    expect(modelAssetIds).toEqual(['dna', 'protein', 'tardigrade'])
    expect(getModelAsset('dna').url).toBe('/models/DNA/dna.glb')
    expect(isSceneAssetAvailable('protein', 'low')).toBe(false)
    expect(isSceneAssetAvailable('tardigrade', 'low')).toBe(false)
    expect(isSceneAssetAvailable('tardigrade', 'medium')).toBe(true)
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
})
