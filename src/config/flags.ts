/**
 * The single feature-flag surface for the product (new_plan.md §7.1).
 *
 * Semantics:
 * - `exhibits`   — animated ASCII playback. ON in the mock era: the five
 *                  exhibit chapters run owner-sanctioned interim preview
 *                  animations through the full pipeline until the real
 *                  models land (P9b).
 * - `dust`       — optional canvas2D background dust. Off by default.
 * - `cursorBlob` — light spring cursor blob (immersive mode, fine pointers).
 * - `lanyard`    — the Lanyard island in the origins slot (lazy three.js
 *                  chunk; the ONLY sanctioned three import, R11).
 * - `diagnostics`— dev overlay + `window.__JOURNEY__` snapshot hook.
 *
 * Overrides: NEXT_PUBLIC_FEATURE_<NAME> ('true'|'false'; also '1'/'0'/'on'/'off').
 * Invalid values fall back to the documented default. Flags are frozen at
 * module scope and must never be mutated at runtime.
 */

import { parseBooleanEnv } from './env'

const diagnosticsDefault = process.env.NODE_ENV !== 'production'

function resolve(override: string | undefined, fallback: boolean): boolean {
  return parseBooleanEnv(override) ?? fallback
}

export interface FeatureFlags {
  /** Animated ASCII playback (mock-era preview animations; P9b swaps the art). */
  readonly exhibits: boolean
  /** Optional canvas2D dust background (default off; measure before enabling). */
  readonly dust: boolean
  /** Light spring cursor blob (immersive mode, fine pointer, not reduced motion). */
  readonly cursorBlob: boolean
  /** Lanyard island in the origins slot (lazy chunk, desktop-class devices). */
  readonly lanyard: boolean
  /** Diagnostics overlay + window snapshot hook (default: development only). */
  readonly diagnostics: boolean
}

export const FEATURES: FeatureFlags = Object.freeze({
  exhibits: resolve(process.env.NEXT_PUBLIC_FEATURE_EXHIBITS, true),
  dust: resolve(process.env.NEXT_PUBLIC_FEATURE_DUST, false),
  cursorBlob: resolve(process.env.NEXT_PUBLIC_FEATURE_CURSOR_BLOB, true),
  lanyard: resolve(process.env.NEXT_PUBLIC_FEATURE_LANYARD, true),
  diagnostics: resolve(process.env.NEXT_PUBLIC_FEATURE_DIAGNOSTICS, diagnosticsDefault),
})
