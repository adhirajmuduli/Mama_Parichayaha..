import * as THREE from 'three'

import { worldLayout } from '@/lib/worldLayout'

export const cameraPoses = Object.fromEntries(
  Object.entries(worldLayout).map(([chapter, data]) => {
    const center = data.center

    return [
      chapter,

      {
        target: center,

        position: center.clone().add(new THREE.Vector3(0, 2, 8)),
      },
    ]
  }),
)
