'use client'

/**
 * Exhibits store (new_plan.md §7.4, §10.4) — availability and playback state
 * for ASCII exhibit slots. P11: the command channel is gone with the user
 * controls (playback is automatic); the store is pure published state.
 */

import { create } from 'zustand'

import type { ExhibitAvailability, ExhibitPlayback } from '@/types/experience'

interface ExhibitsState {
  availability: Record<string, ExhibitAvailability>
  playback: Record<string, ExhibitPlayback>

  applyAvailability: (exhibitId: string, availability: ExhibitAvailability) => void
  applyPlayback: (exhibitId: string, playback: ExhibitPlayback) => void
}

function changed<T>(record: Record<string, T>, key: string, value: T): boolean {
  return record[key] !== value
}

export const useExhibitsStore = create<ExhibitsState>((set, get) => ({
  availability: {},
  playback: {},

  applyAvailability: (exhibitId, availability) => {
    if (!changed(get().availability, exhibitId, availability)) return

    set((state) => ({
      availability: { ...state.availability, [exhibitId]: availability },
    }))
  },

  applyPlayback: (exhibitId, playback) => {
    if (!changed(get().playback, exhibitId, playback)) return

    set((state) => ({
      playback: { ...state.playback, [exhibitId]: playback },
    }))
  },
}))
