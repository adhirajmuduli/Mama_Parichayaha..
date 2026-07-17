'use client'

import ChapterGLTFModel from '@/components/models/ChapterGLTFModel'
import { getChapterEntry } from '@/lib/chapterRegistry'

const tardigradeCenter = getChapterEntry('computation').scene.center

export default function Tardigrade() {
  return (
    <ChapterGLTFModel
      chapter="computation"
      displaySize={3.2}
      modelPath="/models/Tardigrade/water_bear_site.glb"
      position={[tardigradeCenter[0], tardigradeCenter[1], tardigradeCenter[2]]}
      rotation={[0.16, 0.48, 0]}
      rotationSpeed={0.06}
    />
  )
}
