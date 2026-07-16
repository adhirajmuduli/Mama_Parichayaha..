'use client'

import DNA from '@/components/models/DNA'
import PhageSystem from '@/components/models/PhageSystem'
import ProteinShowcase from '@/components/models/ProteinShowcase'
import Tardigrade from '@/components/models/Tradigrade'

import SceneErrorBoundary from './SceneErrorBoundary'

export default function SceneContent() {
  return (
    <>
      <SceneErrorBoundary name="DNA">
        <DNA />
      </SceneErrorBoundary>

      <PhageSystem />

      <SceneErrorBoundary name="protein">
        <ProteinShowcase />
      </SceneErrorBoundary>

      <SceneErrorBoundary name="tardigrade">
        <Tardigrade />
      </SceneErrorBoundary>
    </>
  )
}
