/**
 * Journey domain vocabulary (new_plan.md §7.3).
 *
 * Re-exports the shared direction/travel types from the cross-cutting type
 * module and defines the decoded timeline sample union. This module is the
 * ONLY thing journey code may import besides pure siblings.
 */

import type { JourneyDirection, TravelMode } from '@/types/experience'

export type { JourneyDirection, TravelMode }

export interface JourneySampleCommon {
  /** Units relative to the destination chapter's slot origin (may be negative
   * inside the entry wedge of a transition). */
  localUnits: number
  /** Completed ring cycles (signed). */
  loopCount: number
  /** Direction of the last intentional input. */
  direction: JourneyDirection
}

export interface DwellJourneySample extends JourneySampleCommon {
  mode: 'dwell'
  /** Absolute (non-cyclic) chapter ordinal for this dwell. */
  currentOrdinal: number
  /** Cyclic chapter index (0..count-1). */
  currentIndex: number
  /** 0..1 progress through the dwell window. */
  dwellT: number
}

export interface TransitionJourneySample extends JourneySampleCommon {
  mode: 'transition'
  /** Slot the transition leaves (increasing-units frame of reference). */
  segmentFromOrdinal: number
  /** Slot the transition enters (increasing-units frame of reference). */
  segmentToOrdinal: number
  /** Cyclic index of the visually outgoing chapter (respects direction). */
  outgoingIndex: number
  /** Cyclic index of the visually incoming chapter (respects direction). */
  incomingIndex: number
  /** Undirected 0..1 progress across the segment seam. */
  routeCanonicalT: number
  /** Directed 0..1 progress (forward = increasing units). */
  transitionT: number
  /** Smootherstep of `transitionT`. */
  easedTransitionT: number
}

export type JourneySample = DwellJourneySample | TransitionJourneySample
