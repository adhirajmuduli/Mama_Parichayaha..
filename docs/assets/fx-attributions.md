# FX attributions — ported / borrowed components

Every component under `src/ui/fx/` is **owned source**: an adaptation of an
MIT-licensed upstream, copied into this repository, re-tooled for this site's
tokens and bound to this site's runtime rules. This file is the provenance
record required by `new_plan.md` §7.7 ("record upstream commit SHAs … re-diff
on upgrade") and §20 (risk: "ported-fx drift from upstream bugfixes").

The public attribution lives on `/credits`
(`src/content/data/site.ts` → `credits.components`).

## Upstream pins

| Upstream   | Repository              | License | Pinned commit                              | Pinned on  |
| ---------- | ----------------------- | ------- | ------------------------------------------ | ---------- |
| React Bits | `DavidHDev/react-bits`  | MIT     | `e12c22192ac7b4b452c5e2feb9b586d74765d696` | 2026-10-28 |
| Magic UI   | `magicuidesign/magicui` | MIT     | `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c` | 2026-10-28 |

The SHAs are the upstream `HEAD` at the moment of this record. They are the
**re-diff anchors**, not the exact commits the ports were copied from: the
ports were authored from the upstream sources available at the time and then
edited locally. Before any upgrade, diff the local file against the upstream
file at the new SHA and re-apply the adaptations listed below — do not copy
the upstream file over the local one.

Upstream license text: React Bits ships `LICENSE.md` (MIT); Magic UI ships an
MIT `LICENSE` in the repository root.

## Port inventory

### `src/ui/fx/RotatingText.tsx` ← React Bits

- Upstream: `src/content/TextAnimations/RotatingText/RotatingText.jsx` and
  `RotatingText.css`
- Upstream SHA: `e12c22192ac7b4b452c5e2feb9b586d74765d696`
- License: MIT
- Ported semantics kept: `Intl.Segmenter` grapheme-aware splitting, per
  character spring transitions, `AnimatePresence` exit/enter choreography,
  the screen-reader mirror of the current phrase, `MotionConfig`
  `reducedMotion="user"`.
- Local adaptations (ours): trimmed to the verified `flip` effect; props
  reduced to `texts` / `effect` / `interval` / `stagger` / `mainClassName`;
  tokens replaced with the site's accent/radius/motion scale; the per-character
  blur filter was removed (it rendered as a row of blocks at small sizes and
  cost a compositor layer); SSR-safe markup (identical server and first client
  render).
- Used by: the interests chapter copy.

### `src/ui/fx/ProjectSpiral.tsx` ← React Bits

- Upstream: `src/content/Components/InfiniteSpiral/InfiniteSpiral.jsx` and
  `InfiniteSpiral.css`
- Upstream SHA: `e12c22192ac7b4b452c5e2feb9b586d74765d696`
- License: MIT
- Ported semantics kept: the helix math (radius, vertical spacing, turn size,
  perspective depth scale, centre scaling, edge fade) and the
  `translate3d`/`scale` per-tile composition.
- Local adaptations (ours): the tick comes from the shared scheduler
  (`src/runtime/scheduler.ts`) instead of a private rAF; the stage is a fixed
  full-bleed layer that owns the right half on wide screens and the lower band
  on narrow screens, so the cascade can never be painted over the chapter
  copy; the geometry adapts to the band it owns (responsive card size, radius
  clamped so the closest tile stays inside the band, vertical spread compressed
  to fit); tiles are text cards built from `ClientProject`; reduced motion
  renders a static fan; `fpsCap` skips whole ticks; the animated layer is
  `aria-hidden` with a visually-hidden list fallback beside it; per-tile blur
  and `backdrop-filter` were removed (eight animated blur layers were the most
  expensive paint on this chapter).
- Used by: the research chapter.

### `src/ui/fx/lanyard/Lanyard.tsx` ← React Bits

- Upstream: `src/content/Components/Lanyard/Lanyard.jsx` and `Lanyard.css`
- Upstream SHA: `e12c22192ac7b4b452c5e2feb9b586d74765d696`
- License: MIT
- Ported verbatim: the physics simulation (band + card impulse response), the
  band reconstruction, the foil shader injection and the renderer lifecycle,
  including the upstream cleanup of geometries, materials and the renderer.
- Local adaptations (ours): a bounded-access helper for this repo's
  `noUncheckedIndexedAccess` strictness; the props are mapped to site tokens
  (`frontImage` = the portrait, `backImage`, card and strap colours,
  gravity/damping/elasticity/breeze); the module is loaded through
  `next/dynamic` so `three` lives in exactly one lazy chunk; capability gates
  (`FEATURES.lanyard`, WebGL support, fine pointer, viewport ≥ md) with a
  static CSS-3D portrait fallback; the render loop is capped at 30 fps, the
  pixel ratio at 1.5, and antialiasing is enabled only at DPR ≤ 1.5; a
  stillness detector parks the loop after the card has been still for 8 s;
  the island mounts from `requestIdleCallback`; the canvas is `aria-hidden`.
- Used by: the origins chapter.

### `src/ui/fx/BlobCursor.tsx` — light custom (NOT a port)

- Upstream considered: React Bits
  `src/content/Animations/BlobCursor/BlobCursor.jsx` — **not vendored**.
  The upstream component is a WebGL metaball renderer (metaballs + PMREM +
  shadow maps); it was measured as too heavy for a cursor that follows the
  pointer on every frame.
- Local implementation: one fixed element, a spring follow, `mix-blend-mode`
  accent, transform/opacity writes only, no WebGL, no per-frame filters.
  Gates: `FEATURES.cursorBlob`, immersive mode, fine pointer, no reduced
  motion. If the upstream shader version is ever adopted, it belongs behind a
  separate flag (`FEATURES.cursorShader`) and must be attributed here first.

### Magic UI

- Reviewed as a source for the remaining fx candidates (border beam, dot/grid
  patterns, marquee, shiny text). **No Magic UI component is vendored at
  this point.** The `/credits` line names both upstreams because the site
  advertises the component policy, not a component-by-component ledger; this
  file is the ledger.

## Re-diff checklist (before any upstream upgrade)

1. Fetch the new upstream SHA and diff the upstream file against the local
   file — file-by-file, not file-by-upstream-release.
2. Re-apply the local adaptations listed above; they are load-bearing
   (scheduler binding, capability gates, performance trims, accessibility).
3. Re-run: `npm run typecheck`, `npm run lint`, `npm run boundaries`,
   `npm run frame-alloc`, `npm run bundle`, and the e2e matrix
   (`npm run e2e`). The lanyard is the only port that can change the bundle
   budget (`three` must stay confined to its own chunk).
4. Update the pinned SHA and the date in this file, and the adaptations list
   if it changed.

## Other borrowed work

- **JetBrains Mono** (SIL Open Font License 1.1) — self-hosted variable
  latin subset; the license file ships next to the woff2. Used for the ASCII
  grids, where metric stability is load-bearing.
- No other third-party code is vendored. Runtime dependencies are declared in
  `package.json` and inventoried by `npm run licenses:inventory`.
