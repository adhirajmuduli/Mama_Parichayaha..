# Performance runbook

Budgets and invariants (all enforced by the e2e suite or build scripts):

| Invariant                                                        | Enforced by                     |
| ---------------------------------------------------------------- | ------------------------------- |
| Zero rAF ticks at rest                                           | scheduler design + perf spec    |
| One app-level loop (lanyard = sanctioned self-parking exception) | review + frame-alloc guard      |
| Zero per-tick allocations in tick paths                          | `npm run frame-alloc`           |
| ≤ 2 active ASCII panels                                          | exhibits e2e (window sampling)  |
| Exactly one settled card; ≤2 in-flight                           | journey e2e (window discipline) |
| Initial `/` route ≤ 180 KB gzip (currently ~60 KB)               | `npm run bundle`                |
| three.js confined to the lazy lanyard chunk                      | `npm run bundle`                |
| Heap growth ≤ 6 MiB across two journey cycles                    | performance e2e                 |
| Zero ≥ 50 ms long tasks after boot + 10 s grace                  | performance e2e                 |
| No model artifacts on any route                                  | hygiene e2e                     |

## The stable-root rule (P7 finding)

Slots never remount on chapter travel. The lanyard island mounts **once**
after capabilities are measured and stays for the session; per-visit
remounts re-compiled three.js (shader compile under software GL) and
produced 58 long tasks in one cycle. Any new slot component must follow the
same pattern: mount on eligibility, park on inactivity, dispose on page
teardown.

## Capability gates are measurement-based (P7 finding)

`useCapabilities` serves placeholder defaults until the first client
measurement; the first measurement ALWAYS publishes (even when the values
match the defaults). Consumers must not latch decisions on unmeasured
snapshots — the lanyard once mounted on touch devices because the effect
read the coarse-pointer default before measurement landed.

## When a perf e2e fails

1. Re-run in isolation against a warm server — cold-start contention is the
   dominant flake source (first-test pays the standalone server's route
   compile).
2. Check the boot grace window: the perf spec excludes the first 10 s
   (hydration + the one-time lanyard init). Cold CI machines may need more.
3. Long tasks appearing at steady state: capture the trace (Playwright
   retains on failure), open with `npx playwright show-trace`, and look for
   scheduler subscribers that never unsubscribe.
4. Heap growth: three suspects — player textContent churn (should be
   constant-size), the spiral (per-tile style strings are expected), the
   lanyard (must not re-initialize; see stable-root rule).

## Build artifacts

`npm run bundle` prints the initial-route and lanyard-chunk gzip sizes and
asserts that exactly one client chunk contains three.js markers. If a change
leaks three into the shared chunks, the boundaries script (`src/ui/fx/lanyard`
allowlist) usually names the culprit first.
