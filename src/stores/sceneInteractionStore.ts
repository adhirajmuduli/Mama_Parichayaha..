'use client'

import { create } from 'zustand'

import type { ExhibitId } from '@/lib/chapterRegistry'

export type SceneInteractionCommand = 'exit' | 'reset' | 'rotate-left' | 'rotate-right'

interface SceneInteractionRequest {
  command: SceneInteractionCommand
  exhibitId: ExhibitId
  sequence: number
}

interface SceneInteractionStore {
  availableExhibits: readonly ExhibitId[]
  rendererAvailable: boolean
  request: SceneInteractionRequest | null
  dispatch: (exhibitId: ExhibitId, command: SceneInteractionCommand) => void
  markExhibitUnavailable: (exhibitId: ExhibitId) => void
  setAvailableExhibits: (exhibitIds: readonly ExhibitId[]) => void
  setRendererAvailable: (available: boolean) => void
}

export const useSceneInteractionStore = create<SceneInteractionStore>((set) => ({
  availableExhibits: [],
  rendererAvailable: false,
  request: null,
  dispatch: (exhibitId, command) =>
    set((state) => ({
      request: { exhibitId, command, sequence: (state.request?.sequence ?? 0) + 1 },
    })),
  markExhibitUnavailable: (exhibitId) =>
    set((state) => ({
      availableExhibits: state.availableExhibits.filter((availableId) => availableId !== exhibitId),
    })),
  setAvailableExhibits: (availableExhibits) => set({ availableExhibits }),
  setRendererAvailable: (rendererAvailable) => set({ rendererAvailable }),
}))
