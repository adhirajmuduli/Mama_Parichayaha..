'use client'

import { chapterCount } from '@/lib/chapterRegistry'

export default function NarrativeScroll() {
  return <div aria-hidden="true" style={{ height: `${chapterCount * 100}vh` }} />
}
