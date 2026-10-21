/**
 * Wheel input math (new_plan.md §7.4) — pure, framework-free.
 *
 * Constants preserve the verified legacy feel (50 units per 500px of wheel
 * travel, per-event clamp of 80px) that the old controller shipped with;
 * the stale tests expecting 50/720 were simply wrong about shipped behavior.
 */

import { SLOT_UNITS } from '@/journey/timeline'

/** Pixels of wheel travel that equal one full chapter slot (50 units). */
export const WHEEL_PIXELS_PER_SLOT = 500
/** Per-event clamp: fast trackpad bursts must not teleport the journey. */
export const WHEEL_EVENT_CLAMP_PX = 80
/** Legacy line-mode multiplier (Firefox deltaMode 1). */
export const LINE_MODE_PIXELS = 16

/** Units traveled per pixel of (clamped) wheel delta. */
export const UNITS_PER_WHEEL_PX = SLOT_UNITS / WHEEL_PIXELS_PER_SLOT

/**
 * Normalizes a wheel event to pixel space across delta modes:
 * 0 = pixels, 1 = lines (×16), 2 = pages (× viewport height).
 */
export function normalizeWheelDelta(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
): number {
  if (deltaMode === 1) {
    return deltaY * LINE_MODE_PIXELS
  }

  if (deltaMode === 2) {
    return deltaY * viewportHeight
  }

  return deltaY
}

/** Clamps a normalized pixel delta to the per-event budget. */
export function clampWheelDelta(deltaPx: number): number {
  return Math.max(-WHEEL_EVENT_CLAMP_PX, Math.min(WHEEL_EVENT_CLAMP_PX, deltaPx))
}

/** Full wheel pipeline: normalize → clamp → units. Zero for no-ops. */
export function wheelDeltaToUnits(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
): number {
  return (
    clampWheelDelta(normalizeWheelDelta(deltaY, deltaMode, viewportHeight)) * UNITS_PER_WHEEL_PX
  )
}

/**
 * Whether a scrollable region can still consume the wheel direction.
 * `deltaPx > 0` means scrolling down (content moves up).
 */
export function scrollRegionCanConsume(element: HTMLElement, deltaPx: number): boolean {
  if (deltaPx > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1
  }

  return element.scrollTop > 0
}
