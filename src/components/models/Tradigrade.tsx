'use client'

import ChapterGLTFModel from '@/components/models/ChapterGLTFModel'
import { getChapterEntry } from '@/lib/chapterRegistry'

const tardigradeCenter = getChapterEntry('computation').scene.center

export default function Tardigrade() {
  return (
    <ChapterGLTFModel
      assetId="tardigrade"
      chapter="computation"
      position={[tardigradeCenter[0], tardigradeCenter[1], tardigradeCenter[2]]}
      rotationSpeed={0.06}
    />
  )
}
