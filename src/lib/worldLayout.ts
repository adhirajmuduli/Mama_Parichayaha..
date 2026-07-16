import * as THREE from 'three'

import type { Chapter } from '@/lib/chapters'

const chapterOrder: Chapter[] = ['origins', 'interests', 'research', 'computation', 'future']

const STEP = 18

export const worldLayout = chapterOrder.reduce(
  (acc, chapter, index) => {
    acc[chapter] = {
      center: new THREE.Vector3(
        index * STEP,

        Math.sin(index * 0.8) * 3,

        Math.cos(index * 0.6) * 4,
      ),
    }

    return acc
  },
  {} as Record<
    Chapter,
    {
      center: THREE.Vector3
    }
  >,
)
