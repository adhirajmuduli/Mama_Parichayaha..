# Plan 2 — Verification of Round 1 Fixes + New Deep Bugs Found

**Scope:** Second pass over the same project, comparing the newly-uploaded zip against the exact snapshot audited in `plan.md`. This round is diff-based: every file that changed was read in full and checked against what it was supposed to become, not just whether it changed.
**Headline:** Four of the twelve original findings were fixed correctly. Three were left completely untouched. Two were "fixed" in a way that only moved the problem sideways. And the single most severe fix in the batch — reconnecting the 3D scene — introduced a brand-new, more severe performance regression than the one it solved, because it dropped a code-splitting boundary the project's own tooling explicitly requires. Net effect on "the site lags": likely **worse** in its current state for most desktop visitors, better for reduced-motion/mobile visitors.

---

## 1. Method

`diff -rq` between the two snapshots surfaced 24 changed files (plus a few new ones: `plan_refactor.md`, `plan(3).md`, `src/types/styles.d.ts`, `.vscode/settings.json`). Every changed file was read with `diff -u` against its prior version and evaluated on three axes: (1) does it correctly resolve the finding it was clearly aimed at, (2) does it interact badly with any *other* finding or with code that wasn't touched, (3) does it trip anything the repo's own tooling (`knip`, `prettier`, the bundle-budget script, existing tests) already checks for. Findings below are cited by file/line exactly as before.

---

## 2. Status of every Round 1 finding

| # | Finding | Status | Notes |
|---|---|---|---|
| F1 | 3D scene hard-disabled in `SceneClient.tsx` | **Reconnected, but with a new severe regression** | See H1. The branch logic is now real (`supportsWebGL()`, `getSceneRuntimeProfile()`, per-reason fallback), which is correct. But `Experience` is now a static top-of-file import instead of a `next/dynamic()` lazy import, so the entire three.js/@react-three/fiber/drei dependency graph ships in the initial bundle to every visitor, including the ones who immediately get the fallback message. See H1 for the concrete tooling evidence. |
| F2 | Duplicate model tree (`models/*` vs `scene/exhibits/*`) | **Partially fixed** | `models/ChapterGLTFModel.tsx` was correctly turned into a one-line re-export shim pointing at `scene/exhibits/ChapterGLTFModel`. `models/InteractiveModel.tsx` was **not** touched (still a full standalone duplicate implementation, still zero importers) — see H6. |
| F3 | Magnetic-scroll snap bypassed | **Fixed** | Both call sites (`navigateToMagneticTarget`, `finishPointerDrag`) now call the real `getMagneticTarget(units, velocity, runtime.getLastInputDirection())`. Correct, and `runtime.getLastInputDirection()` genuinely exists on the shared runtime (it was already implemented, just previously unused). See H5 for a residual issue *inside* the function this now correctly calls. |
| F4 | `nearestDwellCenter` ReferenceError on touch release | **Fixed, with a real regression test** | Exported from `journeyTimeline.ts`, correctly used at both call sites. A new test (`tests/unit/cyclic-journey-controller.test.tsx`) dispatches synthetic `pointerdown`/`pointermove`/`pointerup` and asserts the exact settled position (`125`). This is the single cleanest fix in the batch. |
| F5 | `LiquidGlassPointerTracker` never mounted outside `/lab` | **Not fixed** | Still only imported by `src/app/lab/liquid-glass/page.tsx` and itself. See H3 — this is now a *more* confusing bug than before, because the codebase now contains a live, tested-as-intentional `GlassCard` system for panels *and* a still-live `LiquidGlassButton` in two places that depends on the tracker that still isn't mounted. |
| F6 | All 7 chapter panels always mounted, hidden via opacity | **Fixed for chapter cards, via a swap that recreates the same class of problem elsewhere** | `CyclicChapterStage.tsx` now filters to `visibleChapterIds` before mapping — genuinely fixed, confirmed by an updated unit test. But see H2/H3: the panel implementation was swapped to a previously-flagged-as-orphaned root-level component, and see H4 for a copy/test-coverage side effect of the same change. |
| F7 | `ScenePoster` heavy, unthrottled, non-memoized particles | **Fixed well** | Particles are now `useMemo`'d once. CSS is now gated by a new `data-quality-tier` attribute with real tier-specific rules in `globals.css` (static tier drops the blur/turbulence/grain layers entirely). `ScenePoster` also now correctly checks `rendererAvailable` and returns `null` when the real Canvas is showing, so poster and canvas can't double-render. Well executed. See H7 for a narrower note: the adaptive particle-count math is real but, by construction, almost never exercises anything above the cheapest tier. |
| F8 | `chapterRegistry`/`content/assets.ts` carry a mostly-unconsumed 3D scene graph | **Not addressed** | Both files are byte-identical to Round 1. Given F1 now actually reconnects the 3D pipeline for a meaningful share of visitors, this data is *less* wasted than it was — worth re-scoping rather than trimming, now that H1 is resolved. |
| F9 | `knip.json` suppressing known-dead files instead of fixing them | **Fixed (the suppression), not fixed (the underlying files)** | The two stale entries referencing files that no longer exist, plus the suppression for `ChapterGLTFModel.tsx`/`InteractiveModel.tsx`, were removed. Good — the tool no longer lies. But `InteractiveModel.tsx` is still a genuine orphan (see F2/H6), so the next `npm run knip` run will flag it again, correctly this time, and it still needs a real resolution. |
| F10 | E2E suite contradicts itself on whether `<canvas>` exists; not run as part of `quality` | **Not verified — status has changed underneath it and needs a fresh run** | Given F1's reconnection, `performance.spec.ts`'s `canvas count === 1` assertion may now genuinely pass in the CI environment (or may not, depending on how Playwright's headless Chromium reports `deviceMemory`/`hardwareConcurrency` and whether that trips the `'static'` tier branch). This needs to actually be run, not reasoned about — see §5, Verification. Separately, **H1 means a different, new script (`npm run bundle`) will now fail for a new reason** — see below. |
| F11 | Orphaned root-level `GlassCard.tsx`/`glass-card.css`/`demo.html` | **Actively wired in, not fixed** | `GlassCard.tsx` and `glass-card.css` are no longer orphaned — they were deliberately imported into three live files via a new `@root/*` tsconfig path alias and a new global CSS import in `layout.tsx`. This resolves the "orphan" framing but replaces it with a bigger issue: production code and CSS now live and are imported from **outside `src/`**, and per H3, the choice of *which* of the two competing glass systems got kept live is the less-capable one for two of the three swapped sites' siblings. `demo.html` is untouched, still fully orphaned. |
| F12 | Minor items (CSP, SW cache versioning, `optimizePackageImports`) | **Not addressed** | Unchanged. No action expected this round; still valid for a later pass. |

---

## 3. New findings from this pass

Ordered by severity. These are either genuinely new (introduced by this round's edits) or newly-relevant (code that was dead in Round 1 and is now live, so bugs inside it now matter for the first time).

---

### H1 — The F1 reconnection dropped the code-splitting boundary the project's own tooling requires; the entire 3D dependency graph now loads for every visitor

**Where:** `scripts/check-bundle-budget.mjs` (unchanged, pre-existing) vs. `src/components/scene/SceneClient.tsx` (this round's fix)

The bundle-budget script — part of the required `npm run quality` chain (`"bundle": "npm run build && node scripts/check-bundle-budget.mjs"`) — does this:

```js
const sceneManifestEntry = Object.entries(loadableManifest).find(([entry]) =>
  entry.replaceAll('\\', '/').includes('components/scene/SceneClient.tsx -> ./Experience'),
)

if (!sceneManifestEntry) {
  throw new Error('The production build does not expose the dynamically imported Experience chunk.')
}
```

This string (`'components/scene/SceneClient.tsx -> ./Experience'`) is the exact signature Next.js writes into `react-loadable-manifest.json` when a component calls `next/dynamic(() => import('./Experience'))`. The script is written on the explicit assumption that `Experience` is lazy-loaded, and it separately checks that chunk's own gzip size against a 350 KB budget (`sceneChunkBudget`), while checking everything *else* on the route against a much tighter 180 KB budget (`initialRouteBudget`). This is the project's stated architecture: **the 3D engine (three.js + @react-three/fiber + @react-three/drei + postprocessing) is supposed to be a separately-loaded chunk, not part of the initial page bundle.**

The actual fix does:

```tsx
import Experience from './Experience'
import SceneErrorBoundary from './SceneErrorBoundary'
```

A static, eager, top-of-file import. There is no `next/dynamic` anywhere in the codebase (confirmed via a full-tree search) — this boundary was never implemented, in either the before or after state. The practical effect now that `SceneClient` actually renders `Experience`:

1. **`npm run bundle` will hard-fail** with the exact error message quoted above, because no such manifest entry will exist. This isn't a budget-exceeded warning, it's a thrown error — the script can't even measure a chunk that doesn't exist as a chunk.
2. Independent of the script: every visitor to the home page — including the ones who will be shown the `static_preference`/`unsupported` fallback message a moment later — now downloads and parses the full three.js/r3f/drei/postprocessing graph as part of the initial route JS. This is a very large, very common category of web-perf regression (shipping a 3D engine to users who will never see 3D), and it's a direct, plausible contributor to "the site lags" for the majority of desktop visitors who now *do* get the real scene.

**Why this is worse than F1's original state:** before this round, `SceneClient` never imported `Experience` at all, so at least the dependency graph was excluded from every bundle (dead code that doesn't ship is at least not slow). The reconnection fix restored the *feature* without restoring the *loading strategy*, so the fix trades "the 3D world doesn't work" for "the 3D world works, but costs every visitor a large, blocking download regardless of whether they'll ever see it."

**Refactor:**
1. Change the import to a lazy boundary:
   ```tsx
   import dynamic from 'next/dynamic'
   const Experience = dynamic(() => import('./Experience'), { ssr: false })
   ```
   `ssr: false` is required here regardless — `Experience` touches `window`/`navigator`/WebGL context and can't render server-side anyway.
2. Keep the `supportsWebGL()`/`getSceneRuntimeProfile()` gating exactly as it is now — it should run *before* the dynamic import is even triggered, so unsupported/static-tier visitors never request the chunk at all. Structure it so the `<Experience .../>` JSX (and therefore the dynamic import trigger) is only reached inside the `if (profile) { ... }` branch, which is already the case in the current code — you just need `Experience` itself to be the lazy-loaded reference.
3. Re-run `npm run build && npm run bundle` locally and confirm both the manifest entry appears and the two budgets (180 KB initial / 350 KB scene chunk) are actually met — don't assume; three.js graphs blow past naive budgets easily, and this may require checking what's actually being pulled into that chunk (drei's `useGLTF`/`Center`/`useAnimations` plus `postprocessing` add up fast).
4. This is the single highest-priority item in this document. Do it before anything else in this file's roadmap.

---

### H2 — `ChapterCardShell` (and two other live sections) were swapped from `LiquidGlassPanel` to a root-level `GlassCard`, wired in via a new `@root/*` path alias

**Where:** `src/components/journey/ChapterCardShell.tsx`, `src/components/sections/ContactSection.tsx`, `src/components/sections/PublicationStatusSection.tsx`; enabled by a new `tsconfig.json` entry (`"@root/*": ["./*"]`) and a new global CSS import in `src/app/layout.tsx` (`import '../../glass-card.css'`).

This is a deliberate, sweeping change (three separate files, plus a new e2e test explicitly titled *"uses the restored GlassCard visual system for live portfolio cards"*), not an accident. `GlassCard.tsx`'s own header comment states its design brief plainly: *"no heavy GPU cost, no light-following interactivity... Nothing animates continuously; motion only happens in response to user interaction."* This is a real, reasonable performance trade-off for the always-mounted, highest-multiplicity surface (the 7 chapter cards) — I'd call this part correctly targeted.

The problem is **where it stopped**:

- `ContactSection.tsx` was converted for its outer panel, but **kept `LiquidGlassButton`** for the submit button inside that same section (`import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'` survives the diff, just reordered).
- `src/components/narrative/ChapterDetail.tsx` — rendered inside every one of the now-`GlassCard`-wrapped chapter cards — **also still uses `LiquidGlassButton`**, untouched.
- `LiquidGlassPanel` itself is now referenced **nowhere** in the live app — only by `src/app/lab/liquid-glass/page.tsx` and by its own file. It didn't get deleted, it got orphaned, the same shape of problem as F2's model-tree duplication, just recreated in the glass-card domain.

So the "restore performance by using the cheap card" fix produced a codebase with two glass systems live simultaneously: `GlassCard` (no JS tracking, by design) wrapping the outside of a card, and `LiquidGlassButton` (which depends on JS pointer tracking to do anything) sitting inside that same card. That's an internally inconsistent visual/interaction system, and worse — see H3 — the JS half of it doesn't even work.

**Refactor:**
1. Decide, explicitly, in one place: which UI elements are "always-mounted, high-multiplicity, must be cheap" (chapter cards, likely `ContactSection`'s outer wrapper, `PublicationStatusSection`) vs. "singular, low-multiplicity, can afford the real interactive glow" (a single submit button, a single hero panel). Document that split once, rather than letting it be implied by which files happened to get touched.
2. Given the decision, either convert `LiquidGlassButton`'s usages in `ContactSection.tsx` and `ChapterDetail.tsx` to a `GlassCard`-family button (add a `GlassButton`-equivalent if one doesn't exist in `GlassCard.tsx` — skim the file again, it may already export one per its own usage docstring), or explicitly keep them on `LiquidGlassButton` and fix H3 so they actually work.
3. Either delete `LiquidGlassPanel.tsx` (if the decision is "GlassCard everywhere except a hypothetical future single-button use") or keep it and use it somewhere real — an implementation that only exists for a hidden `/lab` harness page is exactly the kind of dead-weight this whole audit started by flagging.
4. Move `GlassCard.tsx`/`glass-card.css` into `src/components/` (e.g. `src/components/glass-card/`) and drop the `@root/*` alias. There's no technical reason production UI needs to live outside `src/`; the alias exists only because the file was never moved, and it invites the next person to wonder whether there's a reason for the split (there isn't).

---

### H3 — F5 remains unfixed, and now it silently breaks a component the team explicitly chose to keep

**Where:** `src/components/liquid-glass/LiquidGlassPointerTracker.tsx` (still only mounted in `src/app/lab/liquid-glass/page.tsx`)

This was flagged in Round 1 and nothing changed: the pointer tracker that makes `[data-liquid-glass="true"][data-glass-interactive="true"]` surfaces respond to the mouse is still mounted nowhere in the shipping app. In Round 1, this made every chapter card's glow inert. Now, after H2's swap, the chapter cards no longer even use the tracked system (by design) — so the *practical* blast radius shrank. But it didn't go to zero: `LiquidGlassButton` is still live in `ContactSection.tsx` and `ChapterDetail.tsx` (rendered inside every chapter card, so — ironically — still present at high multiplicity even after the panel swap). Both of those buttons render all the CSS machinery for a pointer-tracked glow and will never receive a single pointer-tracked update on the real site, exactly as before.

**Why this is worth calling out on its own, separate from F5's original writeup:** this round proves the team is actively touching this exact area of the codebase (three files edited, a new e2e test written, a new component wired in) and *still* didn't notice the tracker isn't mounted — which means it's not simply "hasn't gotten to it yet," it's invisible in normal review because nothing fails loudly when it's missing (no error, no warning, just a hover effect that silently does nothing). That's a strong signal this needs a test that fails, not just a mention in a doc.

**Refactor:**
1. Mount `<LiquidGlassPointerTracker />` once at the root (`layout.tsx`) as originally recommended — this is now lower-stakes than in Round 1 (fewer elements depend on it) but the fix is identical and still one line.
2. Add the missing e2e assertion: hover the real, live `LiquidGlassButton` in `ContactSection` on the home route (not the `/lab` harness) and assert `--glass-pointer-x` changes. The new test added this round (`liquid-glass.spec.ts`) proves *the opposite* — that the GlassCard swap correctly has zero `[data-liquid-glass="true"]` elements on the chapter card — but nothing checks that the remaining live `LiquidGlassButton` instances actually work. Add that test so this can't silently recur a third time.

---

### H4 — The chapter-count copy was "fixed" to match a number that's still wrong, and the test that would have caught it was narrowed instead of corrected

**Where:** `src/components/journey/CyclicChapterStage.tsx`, `tests/unit/cyclic-journey-controller.test.tsx`

The screen-reader instruction text changed from *"seven looping chapters"* to *"five looping chapters."* But `chapterRegistry` (and `chapterIds`) both still have exactly seven entries (`origins, interests, research, computation, future, publications, contact`), and `CyclicChapterStage` still does `chapterRegistry.filter(...).map(...)` over the full registry — all seven IDs are still part of the cyclic ring; there's a genuinely separate, additional static `/contact` route (`src/app/contact/page.tsx`) that duplicates the `publications`/`contact` content for SEO/no-JS purposes, but that doesn't remove those two chapters from the cyclic stage — they still render as `ChapterCardShell` entries in the loop like any other chapter. So "five" is not correct; the accurate count, both before and after this round, is seven.

This isn't a new mistake, either — the *pre-existing* unit test (before any of this round's changes) already asserted `expect(cards.length).toBe(5)`, which was already wrong relative to a 7-entry registry, and had presumably been failing quietly for a while (consistent with Round 1's F10 finding that CI has likely been red and unheeded). This round had the chance to notice and fix the actual mismatch — instead, the sr-only copy was edited to match the test's wrong number, and the test itself was rewritten to stop checking total pool size at all:

```diff
-  it('keeps exactly five card roots across three loops...
+  it('keeps only visible card roots across three loops...
-  expect(cards.length).toBe(5)
+  expect(cards.length).toBe(1)
```

The new assertion (`cards.length === 1`) is true by construction of the `visibleChapterIds` pattern regardless of whether the registry has 5, 7, or 20 chapters — it no longer verifies that all the chapters that are *supposed* to exist actually do. Test coverage for "did we accidentally drop a chapter from the registry" was traded away in the same edit that fixed F6.

**Refactor:**
1. Fix the copy to say "seven" (matching the actual registry), not "five." If the real intent is that `publications`/`contact` should **not** be part of the cyclic ring (plausible, given they now have their own dedicated static route) — that's a legitimate design call, but it requires an actual code change to `CyclicChapterStage` (e.g., render from a `chapterRegistry.slice(0, 5)` or a dedicated `cyclicChapterIds` subset) — not a copy edit that quietly leaves the code cycling all 7 while the text claims 5.
2. Either way, add back a pool-size assertion alongside the new visibility-focused one — e.g., assert `chapterRegistry.length` (or however many chapters are meant to loop) matches the number of distinct `chapterId`s ever seen across a full navigation cycle, so a future accidental drop is caught even though only one card is visible at a time.

---

### H5 — `getMagneticTarget`'s direction-tie-break parameter is still unused; the fix restored the call sites but not the function's own completeness

**Where:** `src/lib/journeyTimeline.ts`

```ts
export function getMagneticTarget(
  units: number,
  velocity: number,
  lastDirection: JourneyDirection,
  restUnits = nearestDwellCenter(units),
): number {
  const speed = Math.abs(velocity)
  const restCenter = nearestDwellCenter(restUnits)
  const displacedBeyondHalo = Math.abs(units - restCenter) >= MAGNETIC_HYSTERESIS_UNITS
  if (speed >= MAGNETIC_VELOCITY_THRESHOLD && displacedBeyondHalo) {
    return velocity > 0 ? nextDwellCenterAbove(units) : nextDwellCenterBelow(units)
  }
  void lastDirection
  return nearestDwellCenter(units)
}
```

F3's fix correctly restored both call sites to pass a real `lastDirection` value (`runtime.getLastInputDirection()`), which genuinely exists and is genuinely correct to pass. But the function they now correctly call still does `void lastDirection` and never uses it — the parameter exists (presumably for tie-breaking when a release lands exactly between two dwell centers below the velocity threshold, so the snap direction matches the user's most recent motion instead of `Math.round`'s arbitrary tie rule) but that branch was apparently never written. This is unrelated to the F3/F4 fix itself — it's the same "stub it and move on" pattern from Round 1, just one layer deeper: the caller-side bypass is gone, but the callee has its own incomplete branch, masked by a `void` statement instead of a `TODO` or an implementation.

**Refactor:**
1. Either implement the tie-break (when `!displacedBeyondHalo`, use `lastDirection` to pick between the two nearest centers when `units` is closer to the midpoint than to either center — i.e., break exact or near-ties in the direction of travel instead of via `Math.round`'s fixed rounding rule), or remove the parameter and the `void` statement and accept that ties always round the same way.
2. Whichever you choose, this is a two-line fix — do it now while `journeyTimeline.ts` is fresh in mind, rather than letting `void lastDirection` sit as a second, quieter version of the same masking pattern this whole audit is about.

---

### H6 — `InteractiveModel.tsx` is still a live orphan; `knip` will now correctly (re-)flag it

**Where:** `src/components/models/InteractiveModel.tsx`

Confirmed zero importers, before and after this round — this file was touched (CRLF only, see H8) but not converted to a shim (unlike its sibling `ChapterGLTFModel.tsx`, which now correctly re-exports from `scene/exhibits/`) and not deleted. Since F9 removed the `knip.json` suppression for this exact file, the next `npm run knip` run will surface it again — correctly, this time, since nothing is hiding it. This is genuinely fine as an interim state (better to have the tool tell the truth) but it isn't done.

**Refactor:** apply the same treatment as `ChapterGLTFModel.tsx` — check whether anything in `scene/exhibits/` already covers what `InteractiveModel` does (a generic, color/emissive-configurable GLTF wrapper, distinct from the chapter-bound `ChapterGLTFModel`); if so, shim or delete it; if it represents a genuinely different, still-needed capability, wire it into `SceneContent.tsx` for real.

---

### H7 — `ScenePoster`'s new adaptive particle/CSS-tier logic is real but, by construction, almost never leaves the cheapest branch

**Where:** `src/components/scene/ScenePoster.tsx`, `src/app/globals.css`

Not a bug so much as a "this doesn't do quite what it looks like it does" note, worth having on record given how much other adaptive-tiering logic in this codebase has turned out to be dead in practice. `ScenePoster` now computes `particleCount = Math.min(20, Math.ceil(profile.particleCount / 16))` and applies `data-quality-tier` for CSS gating — genuinely good, adaptive-looking code. But `ScenePoster` only ever renders at all when `rendererAvailable` is `false`, and per `SceneClient`'s logic (H1's neighborhood), that happens in exactly two cases: WebGL is unsupported, or `getSceneRuntimeProfile().tier === 'static'`. In the second case — the overwhelmingly common one (reduced-motion or save-data users) — `ScenePoster`'s own independent call to `getSceneRuntimeProfile()` will, by the same deterministic device/motion signals, *also* return `'static'` (`particleCount: 0`), so the `'low'`/`'medium'`/`'high'` CSS branches and the particle-count scaling are only ever reached in the narrow edge case of a capable device with WebGL specifically unavailable. That's a small, real audience, not a bug — but it means most of this new logic's apparent range is theoretical. Worth knowing before anyone spends time tuning the 48/96/160 particle-count constants expecting them to matter for the common case.

**Refactor:** no urgent change needed — the `'static'`-tier behavior (0 particles, flat gradient, no blur) is arguably correct for a reduced-motion visitor anyway. If you want the tiered branches to matter for more real visitors, that requires rethinking what triggers `rendererAvailable: false` in the first place (e.g., a separate "render the poster instead of the canvas" tier for genuinely low-end-but-WebGL-capable devices, distinct from "true static/reduced-motion"), which is a bigger design conversation than a quick fix — flag it for the Option A/B conversation in the original plan's §4 rather than doing it ad hoc.

---

### H8 — CRLF line endings were introduced into several files this round, and the project's own format gate should catch it

**Where:** `src/components/models/InteractiveModel.tsx`, `src/components/scene/SceneRendererBoundary.tsx`, root `GlassCard.tsx`, root `glass-card.css` (all now CRLF; everything else in the diff is LF)

`.vscode/settings.json` — also newly added this round — is itself saved with CRLF line endings, which is a strong tell that the editor/environment used for this round of edits is configured for Windows-style line endings. `prettier.config.mjs` explicitly sets `endOfLine: 'lf'`, and `format:check` (`prettier . --check`) is the *first* step of `npm run quality`. None of the four affected files are excluded by `.prettierignore`. `.gitattributes` only configures Git LFS for `.glb` files — it has no `* text=auto` / `eol=lf` normalization rule, so Git won't fix this on commit either.

**Why this matters beyond nitpicking:** it means `npm run quality` should currently fail at its very first step, for a reason that has nothing to do with any of the substantive fixes in this round — a purely mechanical editor-config mismatch that will keep recurring for anyone on the team using a CRLF-default editor until it's fixed at the repo level.

**Refactor:**
1. Add a `.gitattributes` rule: `* text=auto eol=lf` (keep the existing `.glb` LFS line as-is).
2. Run `npm run format` once repo-wide to normalize every file's line endings in one commit, separate from any functional change, so it's easy to review.
3. Consider adding `"endOfLine": "lf"` enforcement to the repo's editor config (`.editorconfig` with `end_of_line = lf`) so this is caught locally before it ever reaches a PR, regardless of what OS/editor someone is using.

---

## 4. What "live" now means, post-F1

This matters for anyone continuing this audit: in Round 1, ~35.6% of `src/` was unreachable, anchored by `SceneClient.tsx` never mounting `Experience`. That reconnection (however incompletely — see H1) means `Experience.tsx`, `SceneContent.tsx`, `AtmosphereController.tsx`, `AtmosphereContext.tsx`, `ChapterCameraRig.tsx`, `NebulaBackground.tsx`, `Lighting.tsx`, `exhibitLoaders.ts`, `modelPreload.ts`, `scene/exhibits/ChapterGLTFModel.tsx`, `Particles.tsx`, `PostProcessing.tsx`, `useModelInteraction.ts`, `useChapterPresence.ts`, `modelInteraction.ts`, `gltfRuntime.ts`, `materials.ts`, `atmosphere.ts`, and `content/assets.ts` are now genuinely reachable for any visitor whose device signals don't land on `'static'` tier and who has WebGL support — in practice, most desktop and many mobile visitors. I spot-checked `Experience.tsx` and `ChapterCameraRig.tsx` in this pass (confirmed the shared `JourneyRuntimeProvider` context correctly synchronizes the camera rig with the DOM-side scroll controller — that part is *not* broken) and found the `pointer-events-none` interaction bug noted under H1. I did not do a line-by-line pass of `AtmosphereController.tsx`, `NebulaBackground.tsx`, or the exhibit-loading/preload path with the same rigor — those deserve a dedicated look now that they actually execute in production, since (per the original audit's own observation) they were previously only ever exercised by isolated unit tests, never end-to-end.

---

## 5. Updated roadmap

### Phase 0 — Before anything else
- **H1**: convert `Experience` to a `next/dynamic()` import. This is now the single highest-priority item in either document — it's the difference between "the 3D scene is a nice-to-have that costs nothing when off" and "every visitor pays for it whether they see it or not."
- **H8**: add `.gitattributes` line-ending normalization and run `npm run format` once, repo-wide.
- Fix **H4**'s copy (or, if the design intent is genuinely 5, fix the code to match instead of the text).

### Phase 1 — Finish what Round 1 started but didn't complete
- **F5/H3**: mount `LiquidGlassPointerTracker` at the root, and add the missing live-route e2e assertion for `LiquidGlassButton`.
- **H2**: make the GlassCard-vs-LiquidGlass split an explicit decision, apply it consistently (`ContactForm` button, `ChapterDetail` button), move `GlassCard`/`glass-card.css` into `src/` and drop the `@root/*` alias.
- **F2/H6**: resolve `InteractiveModel.tsx` the same way `ChapterGLTFModel.tsx` was resolved.
- **H5**: implement or remove `getMagneticTarget`'s `lastDirection` tie-break.

### Phase 2 — Verify, don't assume
- Run `npm run quality` and `npm run e2e` fresh and record the actual failures — several items in this document (H1's bundle-budget failure, H8's format-check failure, F10's canvas-count assertions) are traced statically here but need a real run to confirm exact behavior, especially since the underlying code changed substantially between Round 1 and Round 2.
- Once H1 is fixed, re-run the bundle budget check specifically and confirm both the initial-route (180 KB) and scene-chunk (350 KB) gzip budgets are actually met — three.js dependency graphs are large enough that this may need real trimming (check exactly what `@react-three/drei` and `postprocessing` imports are pulling in), not just the code-splitting boundary alone.
- Give `AtmosphereController.tsx`, `NebulaBackground.tsx`, and the exhibit preload path (§4) the same close read `Experience.tsx`/`ChapterCameraRig.tsx` got in this pass, now that they're genuinely live.

### Phase 3 — Everything from the original plan.md that's still open
- F8 (re-scope `chapterRegistry`'s `AtmosphereDefinition` now that it's consumed for real, rather than trimming it as dead weight).
- F11's remaining item: `demo.html` is still fully orphaned at the repo root — delete it.
- F12's minor items, unchanged.

---

## 6. One-line takeaway

Every fix in this round did something real — nothing here was faked or purely cosmetic — but three of them (H1, H2/H3, H4) each solved the named problem while quietly reopening a version of it one layer over: disabled-3D became eager-3D instead of lazy-3D; one glass system became two glass systems again; a wrong "5" in a test became a wrong "5" in the shipped copy. That's the same pattern the first audit described — not stubbing-and-shipping this time, but fixing-in-a-hurry-and-shipping — and it's worth treating the verification step (does the fix actually cohere with the rest of the system?) as seriously as the fix itself going forward.
