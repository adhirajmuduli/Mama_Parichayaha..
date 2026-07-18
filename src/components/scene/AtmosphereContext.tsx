'use client'

import { createContext, useContext } from 'react'

import type { AtmosphereRuntimeState } from '@/lib/atmosphere'

const AtmosphereContext = createContext<AtmosphereRuntimeState | null>(null)

export const AtmosphereRuntimeProvider = AtmosphereContext.Provider

export function useAtmosphereRuntime() {
  const runtime = useContext(AtmosphereContext)

  if (!runtime) {
    throw new Error('Atmosphere runtime is only available inside AtmosphereController.')
  }

  return runtime
}
