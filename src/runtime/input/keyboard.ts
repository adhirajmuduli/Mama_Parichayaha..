/**
 * Keyboard intent mapping (new_plan.md §7.4) — pure.
 *
 * Guards replicate the legacy contract (editable targets, dialogs, model
 * controls never navigate) with the new attribute names; the space key
 * ignores activation targets so buttons still receive their activation.
 */

export type KeyIntent =
  | { kind: 'next' }
  | { kind: 'prev' }
  | { kind: 'home' }
  | { kind: 'digit'; index: number }
  | { kind: 'overlay-dismiss' }
  | null

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]'
const DIALOG_SELECTOR = '[role="dialog"], dialog, [data-dialog]'
const CONTROL_SURFACE_SELECTOR = '[data-animation-controls], [data-model-controls]'
const ACTIVATION_SELECTOR = 'button, a, [role="button"]'

export function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null
}

export function isGuardedSurface(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false

  return (
    target.closest(DIALOG_SELECTOR) !== null || target.closest(CONTROL_SURFACE_SELECTOR) !== null
  )
}

export function isActivationTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(ACTIVATION_SELECTOR) !== null
}

/**
 * Maps a keydown to a journey intent. `maxChapterCount` caps digit shortcuts;
 * modifiers (meta/alt) are the caller's concern, matching legacy behavior.
 */
export function resolveKeyIntent(event: KeyboardEvent, maxChapterCount: number): KeyIntent {
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
    case 'PageDown':
      return { kind: 'next' }

    case 'ArrowUp':
    case 'ArrowLeft':
    case 'PageUp':
      return { kind: 'prev' }

    case ' ': {
      // Space activates focused buttons — never steal it from them.
      if (isActivationTarget(event.target)) return null

      return event.shiftKey ? { kind: 'prev' } : { kind: 'next' }
    }

    case 'Home':
      return { kind: 'home' }

    case 'Escape':
      return { kind: 'overlay-dismiss' }

    default: {
      if (/^[1-9]$/.test(event.key)) {
        const digit = Number(event.key)

        return digit <= maxChapterCount ? { kind: 'digit', index: digit - 1 } : null
      }

      return null
    }
  }
}
