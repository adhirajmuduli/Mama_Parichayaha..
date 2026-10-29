# Portfolio current-state assessment

Assessment date: 2026-10-28

This is a recovery baseline for the portfolio after recent in-progress work.
It records what was inspected and exercised in this workspace; it is not a
claim that every deployment or machine has the same state. This recovery pass
has since added the seven authored chapter artworks and their colored-canvas
player, in addition to the earlier unit-test timeout correction.

## Executive summary

The checked-out product is Adhiraj Muduli's biological-sciences portfolio.
Its current implementation is a Next.js app with a server-rendered, semantic
seven-chapter portfolio and a client-enhanced immersive journey. The current
architecture is DOM-first, with seven procedural multicolor ASCII scenes. The
older optional lanyard and project spiral remain in the codebase but are no
longer wired into the chapter visuals.

The home route is not wholly down in this workspace: the production server returned
HTTP 200, hydrated into immersive mode, rendered the Origins chapter, and
responded to keyboard and wheel navigation. TypeScript, lint, content
validation, import boundaries, the frame-allocation guard, and all 131 unit
tests passed after correcting a transition test's timeout. The production
build completed successfully, including lint/type checking and static page
generation.

All seven current artworks now use fixed-grid procedural glyph scenes with
distinct per-chapter palettes and a colored canvas after hydration; the
server-rendered ASCII text remains available as a fallback. Unit tests cover
their determinism, motion, color variation, density, and grid contract.
Desktop, mobile, and reduced-motion exhibit tests passed. Full quality passed
through the unit suite but stopped at Knip because exported art-grid constants
were unused; those exports have since been removed, so the aggregate check
needs a fresh run. The performance test result predates the new visual
implementation; rerun it before calling the visual version stable.

## Product and architecture baseline

- **Product intent:** an immersive, biologically themed personal portfolio
  presenting identity, interests, research focus, computation, future
  direction, publications, and contact.
- **Journey:** seven chapter IDs are authored in
  `src/content/data/journey.ts`. A signed, continuous unit value drives
  cyclic navigation; pure journey math is in `src/journey/`, runtime and input
  coordination in `src/runtime/`, and discrete arrival/visibility state in
  Zustand stores.
- **Rendering:** the stage is semantic DOM, not a persistent scene canvas.
  The HTML defaults to a readable document; a pre-paint boot script enables
  immersive mode, and hydration establishes the interactive chapter window.
- **Exhibits:** seven chapter-specific procedural ASCII artworks use a
  fixed grid, source-specific color palettes, continuous deterministic
  motion, and a hydrated glyph canvas. The text frame remains the SSR/no-JS
  fallback.
- **Visual continuity:** each chapter has a deliberately different palette
  and scene composition. Research project links are retained in its semantic
  copy surface; no publication claims or experimental results are invented
  in the art.
- **Supporting product surfaces:** contact, credits, privacy, discovery
  metadata, and API routes are present. Contact delivery depends on
  server-side configuration; secret values were not inspected as part of this
  assessment.

The best current design references are
`docs/architecture/system-map.md`,
`docs/architecture/ascii-contract.md`,
`docs/adr/0010-ascii-exhibit-medium.md`, and
`docs/adr/0011-dom-only-architecture.md`. The ADRs state the current medium
and rendering decisions; older 3D-era ADRs are explicitly superseded.

## What is grounded / observed working

| Area                   | Evidence from this assessment                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript             | `npm run typecheck` passed.                                                                                                                                                                                     |
| Lint                   | `npm run lint` passed.                                                                                                                                                                                          |
| Content data           | `npm run content:check` passed: 13 tests. Journey/chapter/scene/exhibit/project/site data are schema-validated and cross-checked.                                                                               |
| Import boundaries      | `npm run boundaries` passed; 89 source files audited.                                                                                                                                                           |
| Frame allocation guard | `npm run frame-alloc` passed; 3 tick-path modules audited.                                                                                                                                                      |
| Production build       | `npm run build` passed; lint/type checks and static page generation completed.                                                                                                                                  |
| Bundle budget          | `node scripts/check-bundle-budget.mjs` passed: initial route JS 61,724 B gzip; lanyard lazy chunk 140,968 B gzip; Three.js markers in one client chunk.                                                         |
| Production HTTP routes | Standalone server returned HTTP 200 for `/`, `/contact`, `/credits`, `/privacy`, and `/api/health`. Health returned `{"contact":"configured","status":"ok"}`. This does not verify submitting contact messages. |
| Home route             | Portfolio dev server served `/` with HTTP 200. Browser showed SSR content, then immersive hydration with Origins settled and no page or console errors in the observed pass.                                    |
| Journey interaction    | Keyboard and wheel navigation moved through the chapter sequence, including cyclic seam travel. The URL hash and settled chapter updated.                                                                       |
| Focused desktop E2E    | Boot, journey, exhibit, accessibility, contact, hygiene, and SEO checks passed in focused runs; 5 cases were skipped by project/test conditions.                                                                |
| Chapter artwork E2E    | Desktop: 5 passed / 2 skipped, including all seven colored canvases; mobile: 3 passed / 4 skipped; reduced motion: 3 passed / 4 skipped.                                                                        |
| No-JS approach         | The semantic markup and explicit no-JS Playwright project are present. This assessment did not rerun that browser project.                                                                                      |

These are component- and workspace-level observations, not proof that all
production routes, devices, deployments, or contact integrations work.

## Remaining failures and unverified runtime

### Unit-test timeout corrected

The latest `npm run unit` run passed **131 tests in 14 files**. The previous
full-suite timeout was in `tests/unit/journey-runtime.test.tsx`: its transition
test polled for up to six seconds while Vitest's default per-test timeout was
five seconds. Giving that test a ten-second timeout brought the test contract
in line with its existing polling window. The scheduler suite also passed when
run in isolation; its earlier zero-delta observation did not reproduce.

### Desktop performance gate remains red

`tests/e2e/performance.spec.ts` completes the tested chapter cycle but fails
its assertion that there be zero post-boot long tasks. The isolated desktop
run produced more than 1,100 such entries with all optional effects enabled.
Diagnostic builds with the lanyard, animated exhibits, and cursor effect
disabled still produced 11 entries, ranging from about 62 ms to 1.9 seconds.
The integrated-browser sample was idle without long tasks, but recorded two
tasks (243 ms and 72 ms) while entering Research. These results identify a
performance-gate problem but do not yet prove whether the remaining stalls are
caused by the project spiral/transitions or by this software-rendered test
environment. Do not treat the performance gate as passed or weaken its
threshold without further diagnosis.

### Startup and route verification

- An initial dev command with `--hostname` and `--port` passed arguments
  incorrectly through npm and failed to start. Starting with plain
  `npm run dev` then worked on port 3001.
- The server was unusually slow to become ready and compile the home route.
  The `/contact` and `/credits` development smoke requests timed out while
  compiling, so those development-mode results are **inconclusive**, not proof
  the routes are broken. All five important routes did return HTTP 200 when
  served from the successful production build via the standalone server.
- Another app was already bound to port 3000. The portfolio was exercised on
  separate ports instead; avoid using port 3000 as evidence for this workspace.
- `npm run build` completed successfully: optimized compilation passed,
  Next.js lint/type checking passed, all 11 static pages generated, and the
  route table included `/`, `/contact`, `/credits`, `/privacy`, and the
  health/contact API routes.
- `node scripts/check-bundle-budget.mjs` passed: the initial route measured
  61,724 B gzip; the lazy lanyard chunk measured 140,968 B gzip; the checker
  found Three.js markers in one client chunk.
- The standalone server (`node .next/standalone/server.js`) started on port
  3102 and returned HTTP 200 for `/`, `/contact`, `/credits`, `/privacy`, and
  `/api/health`. The health route reports contact as configured, but no
  contact form submission was sent.

Historical `e2e-p11*.log` files contain test failures from earlier runs, but
they are stale evidence and are not treated as a current E2E result.

## Groundwork already laid

- A documented client/server boundary: server-side validation and projection
  produce serializable client content; client journey/runtime layers are
  separated from pure journey math.
- A data-driven chapter roster and reusable topology/timeline algorithms,
  including cyclic seam handling and invariant sweeps over supported counts.
- A shared animation scheduler, input coordinator, reduced-motion/capability
  detection, quality profile, and discrete narrative/exhibit stores.
- An ASCII exhibit source contract, registry, deterministic placeholder,
  five interim animated previews, and source-contract tests.
- Semantic stage cards, document-mode fallback, immersive chapter window,
  keyboard and wheel interaction, progress chip, plasma background, project
  spiral, and gated lanyard/fallback surfaces.
- Server routes/components for contact, credits, privacy, metadata, health,
  plus contact validation/delivery/abuse-control modules.
- Automated quality surfaces for type safety, lint, content integrity,
  boundaries, hot-path allocations, unit tests, Playwright, links, dependency
  reachability, and bundle budgets.

## Known gaps / refactor candidates

1. **Resolve the scheduler failure first.** Make the positive-delta observer
   test is no longer a confirmed failure; retain its isolated and full-suite
   coverage while diagnosing any recurrence.
2. **Resolve the desktop performance gate.** Profile the Research transition
   and project spiral with the software-rendered desktop browser, then rerun
   the unchanged zero-long-task and memory thresholds.
3. **Complete the E2E matrix.** The focused desktop checks are useful but do
   not substitute for desktop/mobile, reduced-motion, no-JS, contact,
   accessibility, and SEO coverage across all projects.
4. **Review the rendered artwork.** The seven scenes are original procedural
   compositions, not representations of measured datasets or specific
   experimental structures. Refine them against the owner’s visual feedback
   and keep that scientific boundary explicit.
5. **Review current uncommitted work before extending it.** At assessment
   time, the worktree already contained broad uncommitted documentation
   archival/rewrites and a smaller group of UI/test edits, including mobile
   stage layout, spiral sizing/placement, and changed E2E wheel-event targets.
   These changes were not authored by this assessment and must not be reset
   or assumed to be a clean baseline. The E2E target changes appear intended
   to dispatch at the stage host rather than within a chapter scroll region;
   verify them in the current browser suite.

## Suggested recovery order

1. Preserve and review the existing dirty worktree; agree which pending edits
   are intended to remain.
2. Keep the unit suite green and investigate any reappearance of the
   scheduler timing failure.
3. Diagnose the long tasks in the performance test without weakening its
   current thresholds.
4. Complete the device and reduced-motion E2E matrix.
5. Only then choose broader refactors, using the current source plus ADR 0010
   and ADR 0011 as the baseline.

## Verification commands and results

| Command                                | Result                                                     |
| -------------------------------------- | ---------------------------------------------------------- |
| `npm run typecheck`                    | Passed                                                     |
| `npm run lint`                         | Passed                                                     |
| `npm run boundaries`                   | Passed                                                     |
| `npm run content:check`                | Passed, 13 tests                                           |
| `npm run frame-alloc`                  | Passed                                                     |
| `npm run unit`                         | Passed, 139 tests across 15 files                          |
| `npm run build`                        | Passed; all 11 routes generated                            |
| `node scripts/check-bundle-budget.mjs` | Passed                                                     |
| Standalone HTTP route smoke            | Passed, five routes returned HTTP 200                      |
| Focused desktop Playwright             | Core journeys and supporting checks passed                 |
| Artwork Playwright                     | Desktop 5 passed; mobile 3 passed; reduced motion 3 passed |
| Desktop performance Playwright         | Re-run required after art renderer change                  |
