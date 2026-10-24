# ASCII exhibit contract

The single interface owner-supplied animation code must implement
(`src/exhibits/types.ts`):

```ts
export interface AsciiExhibitSource {
  id: string
  fps: number // authored rate; capped by tier
  frames?: readonly string[] // precomputed set (optional)
  render?: (index: number, elapsedMs: number) => string // generative (optional)
  grid?: { rows: number; cols: number } // stable grid (recommended)
  meta?: { label?: string; description?: string }
}
```

One of `frames` or `render` is required. Register adapters in
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
4. **Printable ASCII** + box-drawing characters only. The panel renders with
   ligatures/kerning disabled and `white-space: pre`.
5. **Pure**: no side effects; may be dynamically imported.

## Reference implementations

- `sources/placeholder.ts` — deterministic single-frame placeholder art
  (boxed title + seeded dot field).
- `sources/mockModels.ts` — five animated previews (owner-sanctioned interim
  models): rotating double helix (depth-sorted strands + rungs),
  bacteriophage (pulsing capsid, breathing sheath, swaying fibers),
  hemoglobin (four waving shaded ribbons), brain (rotating 3D point cloud
  via the published perspective/ramp technique), earth (rotating wireframe
  globe with drifting clouds). Each is allocation-conscious: module-scope
  scratch buffers, one string join per frame.

## Runtime behavior (what your source plugs into)

- The player (`AsciiFramePlayer`) subscribes to the shared scheduler; at most
  one `textContent` write per tick; frame skipping when behind; restart
  resets the clock.
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

`tests/unit/mock-sources.test.ts` pins every rule above per source
(exact-grid on 40 consecutive frames, determinism, printable output, motion
over time, ink density). Owner sources should satisfy the same suite — copy
it and point it at the new adapters.
