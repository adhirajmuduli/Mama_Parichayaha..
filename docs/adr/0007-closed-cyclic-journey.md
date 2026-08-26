# ADR 0007: Closed Cyclic Journey

- Status: Proposed
- Date: 2026-08-25
- Supersedes: the linear chapter-spacing and finite-document decisions recorded in ADR 0002 and the chrome-restoration direction previously recorded in `action_plan.md` (D6)

## Context

The home page currently drives a discrete `activeChapter` from document scroll via IntersectionObserver, places chapter centers on a line with 8-unit spacing, and terminates in finite publications/contact/credits sections with header and footer chrome. A supplied live recording confirmed that this reads as lateral slides between closely spaced models followed by a 2D document tail, with no continuation after the final chapter. The immersive restructuring plan (`plan_restructuring.md`) requires exactly five canonical chapters, cards, and model groups arranged on a closed radius-22 ring (25.86-unit planar chords), driven by one continuous logical journey value with a 5-entry / 40-dwell / 5-exit unit timeline that loops from Future back to Origins without duplication.

## Decision

1. Replace discrete chapter activation with an unwrapped continuous journey value (`inputUnits` → spring-smoothed `renderUnits`); discrete state (settled chapter, visible pair, direction, loop count, travel mode) is derived and published to the store only at low frequency.
2. Place model centers on a closed ring — `theta(i) = -π/2 + i·2π/5`, radius 22, with per-chapter Y undulation — and sample closed Catmull-Rom camera and target curves modulo one cycle. The unwrapped value is retained for direction and loop count only.
3. Adopt the exact cyclic timeline: `ENTRY_UNITS=5`, `DWELL_UNITS=40`, `EXIT_UNITS=5`, `SLOT_UNITS=50`, `CYCLE_UNITS=250`, with magnetic settling to dwell centers (`n·50+25`) and a 6-unit hysteresis.
4. Remove the site header, fixed progress rail, footer, and the finite publications/contact/credits tail from the home route; secondary content moves to dialogs and standalone routes.
5. Never duplicate the chapter array, sentinel cards/models, or GLB requests to simulate infinity; never reset a browser scroll position at the seam.

## Consequences

The IntersectionObserver document model, `ChapterSection` stacking, and post-journey sections are retired from `/`. Camera motion becomes continuous route sampling with zero-velocity easing at dwell ends (smootherstep), enabling acceleration into transitions and deceleration into arrivals. The Future→Origins seam is a first-class transition that must be visually indistinguishable from neighbor transitions. Existing visual snapshot tests of the stacked document are no longer evidence for the home experience and are replaced by the lightweight protocol in `plan_restructuring.md` §14.
