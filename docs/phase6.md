# Phase 6 — Reliable, Accessible Model Interaction

**Status:** Complete locally on 2026-07-17.  
**Base commit:** `1814e78272e0528e40fed48018a0a84ddbc344a0` (`feat: rebuild scene runtime and asset pipeline`).  
**Commit status:** Phase 6 changes are intentionally uncommitted pending review.

## Delivered

- Replaced protein-specific drag state with `src/lib/modelInteraction.ts` and `src/hooks/useModelInteraction.ts`.
- The shared hook uses typed R3F pointer events, bounded deltas, delta-time inertia, pointer capture, and cleanup on pointer up, cancel, lost capture, window blur, and document visibility changes.
- Reduced-motion/static rendering disables Canvas enhancement; loaded interactive models also suppress inertia and autorotation when reduced motion is detected.
- Normal touch behavior remains vertical scrolling (`canvas { touch-action: pan-y; }`); a horizontal threshold begins model dragging without a React state update loop.
- DNA, the procedural bacteriophage system, GFP protein, and tardigrade now use the same interaction contract. GLTF instances retain the Phase 5 explicit clone/material-ownership policy.
- Added server-rendered, keyboard-accessible DOM controls for each retained exhibit. Arrow keys rotate, Home resets, Escape exits, and disabled controls explain the semantic fallback when an exhibit or renderer is unavailable.
- Scene runtime availability is propagated to the controls, including per-exhibit error handling. The static/no-WebGL and reduced-motion paths retain the full semantic portfolio with disabled 3D controls.

## Verification

| Command                      | Result                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `npm run quality`            | Passed: format, lint, typecheck, 29 unit tests, coverage, Knip, GLB hash/policy verification, and bundle budgets.      |
| `npm run e2e`                | Passed: 20 tests; 8 intentional project-specific skips. Covers desktop, mobile, reduced-motion, and no-WebGL projects. |
| `npm run test:visual`        | Passed: 10 tests; 6 intentional project-specific skips.                                                                |
| `npm run test:visual:update` | Regenerated only the four full-page baselines after the reviewed addition of the server-rendered control surfaces.     |

### Coverage mapping

- `tests/unit/model-interaction.test.ts`: mouse-drag deltas, release, touch threshold/vertical scroll coexistence, inertia, reset.
- `tests/unit/use-model-interaction.test.tsx`: typed handler wiring, pointer capture, pointer cancellation release, inactive-chapter rejection, and vertical-touch non-claiming.
- `tests/unit/model-interaction-controls.test.tsx`: keyboard rotate/reset/exit commands, fallback state, and the shared control contract for all four retained exhibits.
- `tests/e2e/model-interaction.spec.ts`: semantic controls in all browser modes, keyboard surface, and reduced-motion/no-WebGL fallbacks.

## Visual evidence

The intentional baseline files are:

- `tests/e2e/visual.spec.ts-snapshots/portfolio-desktop.png`
- `tests/e2e/visual.spec.ts-snapshots/portfolio-mobile.png`
- `tests/e2e/visual.spec.ts-snapshots/portfolio-reduced-motion.png`
- `tests/e2e/visual.spec.ts-snapshots/portfolio-no-webgl.png`

The liquid-glass visual references were unchanged. Phase 6 has no open local implementation gate.
