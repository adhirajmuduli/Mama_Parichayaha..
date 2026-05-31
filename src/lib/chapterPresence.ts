import type { Chapter } from "./chapters"

export interface PresenceState {
  scale: number
  opacity: number
}

export const presenceMap: Record<
  Chapter,
  {
    dna: PresenceState
    phages: PresenceState
    proteins: PresenceState
  }
> = {
  origins: {
    dna: {
      scale: 1,
      opacity: 1,
    },

    phages: {
      scale: 0.4,
      opacity: 0.1,
    },

    proteins: {
      scale: 0.4,
      opacity: 0.05,
    },
  },

  interests: {
    dna: {
      scale: 0.7,
      opacity: 0.4,
    },

    phages: {
      scale: 1,
      opacity: 1,
    },

    proteins: {
      scale: 0.5,
      opacity: 0.15,
    },
  },

  research: {
    dna: {
      scale: 0.5,
      opacity: 0.2,
    },

    phages: {
      scale: 0.5,
      opacity: 0.2,
    },

    proteins: {
      scale: 1,
      opacity: 1,
    },
  },

  computation: {
    dna: {
      scale: 0.4,
      opacity: 0.1,
    },

    phages: {
      scale: 0.4,
      opacity: 0.1,
    },

    proteins: {
      scale: 0.6,
      opacity: 0.3,
    },
  },

  future: {
    dna: {
      scale: 0.5,
      opacity: 0.2,
    },

    phages: {
      scale: 0.3,
      opacity: 0.05,
    },

    proteins: {
      scale: 0.5,
      opacity: 0.15,
    },
  },
}