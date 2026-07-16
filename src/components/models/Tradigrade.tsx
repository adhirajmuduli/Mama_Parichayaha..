'use client'

import ChapterGLTFModel from '@/components/models/ChapterGLTFModel'
import { worldLayout } from '@/lib/worldLayout'

export default function Tardigrade() {
  return (
    <ChapterGLTFModel
      chapter="computation"
      displaySize={3.2}
      modelPath="/models/Tardigrade/water_bear_site.glb"
      position={[
        worldLayout.computation.center.x,
        worldLayout.computation.center.y,
        worldLayout.computation.center.z,
      ]}
      rotation={[0.16, 0.48, 0]}
      rotationSpeed={0.06}
    />
  )
}
