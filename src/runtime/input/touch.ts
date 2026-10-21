/**
 * Touch/pen gesture math (new_plan.md §7.4) — pure.
 *
 * Ports the legacy drag feel: dragging content upward moves the journey
 * forward; the pixel-to-unit scale adapts to the viewport so a full swipe
 * is roughly half a chapter slot on small screens.
 */

import { SLOT_UNITS } from '@/journey/timeline'

/** Reference drag length (px) that equals one full chapter slot. */
export const TOUCH_REFERENCE_PX = 350
/** On small viewports, one slot equals half the viewport height instead. */
export const TOUCH_VIEWPORT_FRACTION = 0.5
/** Vertical intent locks after this many pixels of travel. */
export const TOUCH_INTENT_THRESHOLD_PX = 12

export function touchUnitsPerPixel(viewportHeight: number): number {
  return SLOT_UNITS / Math.min(TOUCH_REFERENCE_PX, viewportHeight * TOUCH_VIEWPORT_FRACTION)
}

export type TouchIntent = 'vertical' | 'horizontal' | null

/**
 * Direction arbitration: once horizontal movement dominates there is no
 * journey drag; the caller keeps the gesture for its own use.
 */
export function resolveTouchIntent(deltaX: number, deltaY: number): TouchIntent {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return 'horizontal'
  }

  return Math.abs(deltaY) >= TOUCH_INTENT_THRESHOLD_PX ? 'vertical' : null
}

/**
 * Journey units for a vertical drag: upward drags (negative dy) travel
 * forward (positive units).
 */
export function touchDragUnits(
  dragStartUnits: number,
  deltaY: number,
  viewportHeight: number,
): number {
  return dragStartUnits - deltaY * touchUnitsPerPixel(viewportHeight)
}
