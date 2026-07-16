import * as THREE from 'three'

import type { Chapter } from '@/lib/chapters'
import { chapters } from '@/lib/chapters'
import { worldLayout } from '@/lib/worldLayout'

type CameraPose = {
  position: THREE.Vector3
  target: THREE.Vector3
}

export const cameraPoses = Object.fromEntries(
  chapters.map((chapter) => {
    const center = worldLayout[chapter].center

    return [
      chapter,
      {
        target: center,
        position: center.clone().add(new THREE.Vector3(0, 2, 8)),
      },
    ]
  }),
) as Record<Chapter, CameraPose>
