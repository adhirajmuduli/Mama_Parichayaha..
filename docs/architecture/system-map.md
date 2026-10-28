# System map

The portfolio is a DOM-first immersive stage. One continuous "journey" value
drives seven chapter-specific, recurring multicolor ASCII artworks. Each
chapter uses its own palette and procedural glyph composition. Research
project links remain available in the chapter copy. The older project spiral
and lanyard components remain in the codebase but are not part of the current
chapter mapping.

```
server                          client (browser)
────────                        ────────────────
content/schemas (zod)   ──▶     boot script (pre-paint)
content/data            ──▶     JourneyRuntimeProvider
content/validate.ts             ├─ runtime/scheduler (THE rAF loop)
content/projection.ts   ──▶     ├─ runtime/journeyRuntime (spring + settle)
        │                       ├─ runtime/input/coordinator (wheel/key/touch)
        └─ ClientContent ──▶    ├─ runtime/stores/{narrative,exhibits}
                                ├─ ui/stage (deck, cards, rail, slots)
                                ├─ ui/background (palette cross-fade)
                                ├─ exhibits/ (AsciiPanel + player + registry)
                                ├─ ui/fx (RotatingText, BlobCursor)
                                └─ arts/ (seven lazy procedural art sources)
```

## Layers (import direction points down)

| Layer      | Module             | May import                                  | Notes                                      |
| ---------- | ------------------ | ------------------------------------------- | ------------------------------------------ |
| L0 config  | `config/`          | —                                           | flags, env, site identity                  |
| L1 content | `content/`         | zod (schemas only)                          | `projection.ts` is the only client surface |
| L2 journey | `journey/`         | `types/`                                    | pure math; count-parameterized (N=3..12)   |
| L3 types   | `types/`           | —                                           | shared vocabulary (JourneyFrame etc.)      |
| L4 runtime | `runtime/`         | journey, types, config                      | scheduler, spring, stores, input, quality  |
| L5 ui      | `ui/`, `exhibits/` | runtime, journey, types, content/projection | DOM stage; colored ASCII player; fx         |
| L6 arts    | `arts/`            | exhibit source contract                    | lazy, fixed-grid procedural art            |
| L7 legacy  | `ui/fx/lanyard/`   | three                                        | retained optional component; not chapter-wired |

Enforced by `scripts/quality/check-boundaries.mjs` (also bans
`@react-three/*` + `postprocessing` everywhere).

## The one-loop rule

`runtime/scheduler.ts` is the product's shared rAF loop. Active ASCII players
and the settle watcher subscribe to it; passive observers (quality governor,
diagnostics) never keep it alive. At rest the application scheduler executes
**zero** animation frames. Colored artwork glyphs are drawn to a canvas from a
fixed-grid source; the HTML text frame remains available to SSR and no-JS
visitors.

## Frame data discipline

Frame-level values (units, velocity, card transforms, ASCII frame indices)
never enter React state. Motion values drive the DOM card choreography; the
runtime's `subscribeFrame` fans out a reused record per listener. Discrete
state (settled chapter, visible window, playback) lives in the zustand stores
and publishes atomically.

## Journey semantics

- Slots of 50 units: 5 entry | 40 dwell | 5 exit. Chapter N's dwell center:
  `N*50 + 25`.
- Wheel events clamp to 80px = 8 units. Isolated clicks bounce back to the
  nearest center (magnetic); a burst inside one 100ms debounce window
  accumulates and flings to the next center past the input.
- Keyboard: arrows/PgUp/PgDn/Space/Home travel; digits 1-7 jump
  forward-semantics; Escape closes overlays. Reduced motion: instant jumps.
- Chapter count is data (`content/data/journey.ts`); every system derives
  from N. `journey/invariants.ts` sweeps N=3..12.

## Visual slots

| kind    | renders              | active when                    | fallback                        |
| ------- | -------------------- | ------------------------------ | ------------------------------- |
| ascii   | AsciiPanel + player  | chapter is visible              | deterministic text placeholder  |

All seven chapter entries currently use the ASCII slot. Research project
links are rendered in its semantic copy surface rather than the retired
full-bleed spiral. The optional lanyard and spiral components are retained but
not wired by the current scene data.

## Modes

`html[data-experience]`: `document` (SSR default, works with JS off — every
section readable, no aria-hidden) vs `immersive` (pre-paint boot script).
`StageDocument` flips `data-hydrated` after mount so CSS switches exactly
once; no flash, no hydration mismatch.

## Verification surfaces

- `npm run quality` — format, lint, typecheck, boundaries, content contract,
  frame-allocation guard, link audit, unit suite, knip, asset audit, bundle
  budget + three-confinement.
- `npm run e2e` — 4 Playwright projects: desktop, mobile, reduced-motion,
  no-js. Specs: boot, journey, exhibits, hygiene, performance, contact,
  accessibility, seo.
- `npm run content:check` — schema + cross-validation of all authored data.
