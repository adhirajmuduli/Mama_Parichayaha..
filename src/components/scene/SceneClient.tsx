'use client'

import dynamic from 'next/dynamic'

const Experience = dynamic(() => import('./Experience'), {
  ssr: false,
  loading: () => null,
})

export default function SceneClient() {
  return (
    <div className="fixed inset-0 z-0" data-scene-enhancement="webgl">
      <Experience />
    </div>
  )
}
