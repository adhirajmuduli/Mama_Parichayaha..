'use client'

import { useGLTF } from '@react-three/drei'

import { getModelAsset, getModelDracoDecoderPath } from '@/content/assets'
import type { ExhibitId } from '@/lib/chapterRegistry'

const preloadedAssetIds = new Set<ExhibitId>()

export function preloadModelAsset(assetId: ExhibitId) {
  const asset = getModelAsset(assetId)

  if (preloadedAssetIds.has(assetId)) {
    return
  }

  preloadedAssetIds.add(assetId)
  useGLTF.preload(asset.url, getModelDracoDecoderPath(asset), true)
}
