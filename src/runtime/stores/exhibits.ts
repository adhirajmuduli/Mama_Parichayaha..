'use client'

/**
 * Exhibits store (new_plan.md §7.4, §10.4) — availability, playback and the
 * control-command channel for ASCII exhibit slots.
 *
 * Replaces `stores/sceneInteractionStore.ts`: renderer availability becomes
 * per-exhibit availability ('placeholder' | 'ready' | 'error'), and rotate
 * commands become playback commands ('toggle' | 'restart') consumed by the
 * ASCII player with sequence dedupe.
 */

import { create } from 'zustand'

import type { ExhibitAvailability, ExhibitPlayback } from '@/types/experience'

export type ExhibitCommandKind = 'toggle' | 'restart'

export interface ExhibitCommand {
  exhibitId: string
  kind: ExhibitCommandKind
  /** Monotonic sequence; consumers drop stale/replayed commands. */
  sequence: number
}

interface ExhibitsState {
  availability: Record<string, ExhibitAvailability>
  playback: Record<string, ExhibitPlayback>
  command: ExhibitCommand | null
  lastConsumedSequence: number

  applyAvailability: (exhibitId: string, availability: ExhibitAvailability) => void
  applyPlayback: (exhibitId: string, playback: ExhibitPlayback) => void
  dispatchCommand: (exhibitId: string, kind: ExhibitCommandKind) => void
  /** Player-side: mark a command as handled. */
  consumeCommand: () => ExhibitCommand | null
}

function changed<T>(record: Record<string, T>, key: string, value: T): boolean {
  return record[key] !== value
}

export const useExhibitsStore = create<ExhibitsState>((set, get) => ({
  availability: {},
  playback: {},
  command: null,
  lastConsumedSequence: 0,

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

  dispatchCommand: (exhibitId, kind) => {
    set((state) => ({
      command: {
        exhibitId,
        kind,
        sequence: (state.command?.sequence ?? state.lastConsumedSequence) + 1,
      },
    }))
  },

  consumeCommand: () => {
    const { command, lastConsumedSequence } = get()

    if (!command || command.sequence <= lastConsumedSequence) {
      return null
    }

    set({ lastConsumedSequence: command.sequence })

    return command
  },
}))
