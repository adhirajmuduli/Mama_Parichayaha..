# ADR 0011: DOM-Only Architecture

- Status: Accepted
- Date: 2026-10-18
- Supersedes: ADR 0001 (one persistent WebGL canvas)

## Context

ADR 0001 recorded the original decision to render the whole experience on a
single persistent WebGL canvas: one canvas, one render loop, camera moves
between chapter stations, and the DOM reduced to a thin shell.

That decision bought a continuous 3D journey and cost a lot of surface area:
the canvas had to be sized, cleared, re-composed and kept alive across
chapters; every chapter needed geometry and materials; and the page could not
fall back to a readable document without a second implementation. It also
conflicted with the ASCII direction (ADR 0010), where the primary visual is
text.

The rewrite already had the pieces to invert the decision: chapters are DOM
cards, the journey is a scalar sampled by a shared scheduler, and the only
remaining WebGL surface is the lanyard island.

## Decision

1. **The stage is DOM.** Chapters are semantic `<section>` cards inside a
   fixed stage. Immersive mode shows one chapter at a time (others are
   `visibility: hidden` + `content-visibility: hidden` + `inert`); document
   mode stacks every chapter as a readable article. The mode is chosen
   pre-paint by the boot script in `app/layout.tsx`, so a no-JS visitor gets
   the document without a flash.
2. **Exactly one app-level rAF.** `runtime/scheduler.ts` owns the loop and
   publishes ticks to subscribers (ASCII player, spiral, optional dust). It
   runs only while a subscriber is active and the document is visible; at rest
   there are zero ticks.
3. **No persistent canvas.** There is no app-level WebGL surface, no scene
   graph and no postprocessing. `three` appears in exactly one lazy chunk
   (the lanyard island) and nowhere else — checked by the boundaries script
   and the bundle budget.
4. **The lanyard is a documented exception.** Its own loop is sanctioned
   because it is a physical simulation with its own calm-stop; it must fully
   stop when the card rests, is offscreen, or the tab is hidden. This was
   measured, not assumed: with the island blocked, the page issues no rAF
   calls at rest.
5. **Layout is CSS-owned.** Motion between chapters uses opacity and
   transform on the card's children only. A transformed ancestor would become
   the containing block for `position: fixed` descendants, which is how the
   full-bleed spiral layer once collapsed into the text column — the split
   therefore never carries a transform.
6. **Performance invariants are enforced, not hoped for.**
   `scripts/quality/check-frame-allocations.mjs` audits per-frame allocations,
   `scripts/check-bundle-budget.mjs` caps the initial JS payload and asserts
   that `three` is confined to the lanyard chunk, and the e2e performance spec
   asserts zero long tasks and flat heap across two journey cycles.

## Consequences

The page renders without WebGL, degrades to a readable document without
JavaScript, and costs nothing at rest. Chapter transitions are DOM transitions
rather than camera moves, so the "journey" is expressed by copy, panels and
composition instead of by a 3D camera. The one visible concession is the
lanyard: it is a real 3D island inside a DOM card, and it therefore carries
its own performance budget (self-parking, 30 fps cap, DPR and antialias
tuning, deferred mount).
