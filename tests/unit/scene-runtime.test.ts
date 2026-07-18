import { describe, expect, it } from 'vitest'

import {
  assertSceneAssetManifest,
  getModelAsset,
  isSceneAssetAvailable,
  modelAssetIds,
  unassignedModelCandidates,
} from '@/content/assets'
import { SceneQualityGovernor } from '@/lib/sceneRuntime'

describe('scene runtime contracts', () => {
  it('keeps the assigned GLB compressed and holds unassigned models outside the active scene', () => {
    assertSceneAssetManifest()

    expect(modelAssetIds).toEqual(['dna'])
    expect(getModelAsset('dna')).toMatchObject({
      compression: 'draco',
      url: '/models/dna_for_site.glb',
    })
    expect(isSceneAssetAvailable('protein', 'low')).toBe(false)
    expect(isSceneAssetAvailable('tardigrade', 'high')).toBe(false)
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
})
