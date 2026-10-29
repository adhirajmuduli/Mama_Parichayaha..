# ASCII exhibit contract

The single interface owner-supplied animation code must implement
(`src/exhibits/types.ts`):

```ts
export interface AsciiExhibitSource {
  id: string
  fps: number // authored rate; capped by tier
  palette?: readonly string[] // source-specific glyph colors
  frames?: readonly string[] // precomputed set (optional)
  render?: (index: number, elapsedMs: number) => string // generative (optional)
  renderColored?: (
    index: number,
    elapsedMs: number,
  ) => {
    text: string
    colorIndices: ArrayLike<number>
  } // colored generative grid (optional)
  grid?: { rows: number; cols: number } // stable grid (recommended)
  meta?: { label?: string; description?: string }
}
```

One of `frames`, `render`, or `renderColored` is required. Colored sources
provide one palette index per fixed-grid cell. The server and no-JavaScript
experience use the fixed-grid `text` frame, including Unicode block elements;
after hydration the player draws those glyphs in the source palette on a
canvas. Register adapters in
`src/exhibits/sources/index.ts` under the authored `sourceKey`
(`content/data/exhibits.ts`), and set `animated: true` there.

## Rules (validated by the registry; violations degrade, never throw)

1. **Deterministic**: same `(index, elapsedMs)` → same frame. No
   `Math.random()`, no `Date.now()`. Seeded noise only (see `noise2` in
   `mockModels.ts`).
2. **Stable grid**: every frame is exactly `grid.rows` lines. The player
   warns once in dev on drift and clips in production. Pad lines to the
   declared column count.
3. **Budget**: ≤ 80 cols × 40 rows; fps 1..30 (the quality tier caps further:
   low 12 / medium 18 / high 24).
4. **Single-cell glyphs** only. Use printable ASCII and Unicode block
   elements (U+2580-U+259F); every glyph must occupy one fixed-grid cell. The
   panel renders with ligatures/kerning disabled and `white-space: pre`;
   color is metadata, not terminal escape sequences.
5. **Pure**: no side effects; may be dynamically imported.

## Reference implementations

- `src/arts/origins.ts` — rippling cellular membrane, organelles, transport
  gate, and fluorescent tracer.
- `src/arts/interests.ts` — ligand/receptor interaction and branching signal
  cascade.
- `src/arts/research.ts` — moving protein conformational ensemble and
  transient contacts; explicitly not a claim about a specific structure.
- `src/arts/computation.ts` — sequence-like input, confidence field, and
  abstract model reconstruction.
- `src/arts/future.ts` — pulsing systems network and emergent attractor.
- `src/arts/publications.ts` — abstract evidence panels without invented
  titles, citations, or publication claims.
- `src/arts/contact.ts` — signal traveling through a network to an open
  endpoint.
- `src/arts/shared.ts` — fixed-grid raster primitives and the common source
  adapter. Each chapter selects its own palette.

The visual direction takes general inspiration from the scene density and
continuous motion demonstrated by [ascii.rest](https://ascii.rest/#scenes).
These portfolio compositions and their source code are original; no reference
scene, video, or pre-rendered frames are included.

## Runtime behavior (what your source plugs into)

- The player (`AsciiFramePlayer`) subscribes to the shared scheduler; frame
  skipping when behind; restart resets the clock. Colored glyphs draw to a
  canvas, while a text frame remains available for SSR and no-JavaScript use.
- Playback state machine: `idle` (chapter outside visible window) →
  `playing` ⇄ `paused` (user) → `static` (reduced motion, fpsCap 0, or
  feature off). Published to the exhibits store; the controls render the
  availability message when unavailable.
- Availability: `placeholder` (baseline source) / `ready` (owner source) /
  `error` (validation failure → placeholder art + disabled controls).
- The synchronous placeholder baseline ships in the SSR HTML: no-JS and
  pre-hydration visitors always see a real frame, never an empty slot.
- Panels are labeled figures (`role="img"`, aria description); the `<pre>`
  is aria-hidden. Mock-era sources set `data-mock="true"` for the swap.

## Contract tests

`tests/unit/artworks.test.ts` pins the authored artwork grid, determinism,
color richness, block-element output, and animation. `tests/unit/mock-sources.test.ts`
retains compatibility coverage for the retired interim previews.
(exact-grid on 40 consecutive frames, determinism, printable output, motion
over time, ink density).
