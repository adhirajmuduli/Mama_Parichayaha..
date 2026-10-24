# Diagnostics runbook

The dev overlay and the `window.__JOURNEY__` surface are feature-gated
(`NEXT_PUBLIC_FEATURE_DIAGNOSTICS`; on by default in development, off in
production unless the env var is set).

## In the browser (development)

The overlay renders bottom-left, samples at 2 Hz:

- `runtime` — units, input, moving, paused (the live journey value),
- `narrative` — settled chapter, travel mode, loop count, visible window,
  focusable chapter,
- `scheduler` — running flag, tick subscribers, activity tokens, frame
  counter,
- `quality` — current tier + fps cap,
- `metrics` — long-task count and worst duration (PerformanceObserver),
- `exhibit-errors` — registry validation failures, keyed by exhibit id.

`window.__JOURNEY__.snapshot()` returns the same merged record for ad-hoc
inspection; `registerDiagnostics(source, read)` adds sources.

## What to look for

| Symptom                        | Check                                                    |
| ------------------------------ | -------------------------------------------------------- |
| Jank at rest                   | `scheduler.running` must be `false`; ticks frozen        |
| Journey feels stuck            | `runtime.paused` (overlay open?), `input` vs `units` gap |
| Exhibit won't play             | `exhibit-errors`; availability in the exhibits store     |
| Tier never recovers            | `quality` frame deltas via `scheduler` frameCounter rate |
| Frame drift warnings (console) | source grid rows differ — see ascii-contract.md rule 2   |

## Instrumented debugging

For e2e-level mysteries, build with diagnostics on
(`$env:NEXT_PUBLIC_FEATURE_DIAGNOSTICS='true'; npm run build`), serve the
standalone build, and probe `window.__JOURNEY__` from a script — this is how
the P7 wheel-timing discrepancy was isolated. **Never leave the flag set in
a shipped build** — rebuild without it before committing.
