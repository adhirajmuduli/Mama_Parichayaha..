# Refactor Plan — Root-Cause Audit of Lag, Masks, and False Implementations

**Scope:** `PP8_1-clean.zip` (bio-portfolio — Next.js 15 / React 19 / React Three Fiber / Zustand / Framer Motion)
**Method:** Static reachability tracing from `src/app/page.tsx` outward through every import, cross-referenced against `knip.json`, the test suite, and CI workflows. Nothing here is inferred from the existing `plan.md` / `action_plan.md` / `plan_restructuring.md` docs already in the repo — those describe the *intended* architecture. This document describes what the code **actually does**, with file/line citations, and treats any mismatch between the two as the object of investigation.

---

## 0. The one-sentence diagnosis

**The site's headline feature — the persistent 3D world — is hard-disabled at a single choke point, and nobody updated anything downstream.** The tests still assert it exists, the quality-governor system still exists to throttle it, the asset manifests still exist to feed it, an entire *second, duplicate* component tree exists to render it — but none of it runs. In its place is a hand-rolled CSS "poster" that is animated, unthrottled, and *more* expensive than a WebGL canvas would be at low tier. Meanwhile, several real features (velocity-based scroll snapping, glass-panel pointer tracking) are fully coded and then routed around with one-line workarounds. This is a codebase where the pattern is consistently **"stub it, comment it, ship it, suppress the linter"** rather than **"fix it or delete it."**

Quantified: **~2,678 of 7,526 lines in `src/` (≈35.6%) are unreachable from the page that ships.**

---

## 1. How I verified this (so the findings are falsifiable, not vibes)

1. Traced the render tree by hand: `src/app/page.tsx` → `ImmersiveStage.tsx` → `{ScenePoster, JourneyRuntimeProvider → SceneEnhancement → SceneClient, CyclicJourneyController → CyclicChapterStage → ChapterCardShell → ChapterDetail}`. That's the *entire* live component graph for the home page.
2. For every other component under `src/components/`, `src/lib/`, `src/hooks/`, ran `grep -rl` for its name across `src/` and manually confirmed whether any importer is itself on the live graph.
3. Cross-checked against `knip.json` (the repo's own configured dead-code detector) — its `ignoreFiles` list is itself evidence: it name-checks specific orphaned files instead of deleting them, and it references two files (`ProteinShowcase.tsx`, `Tradigrade.tsx`) that don't exist in this snapshot at all, meaning it's stale and nobody has looked at a knip report in a while.
4. Cross-checked against `tests/e2e/*.spec.ts` and `.github/workflows/e2e.yml` to see whether CI *should* be catching these issues, and if not, why not.
5. Read the CSS actually shipped to the browser (`globals.css`, `liquid-glass.module.css`) rather than assuming class names imply behavior.

---

## 2. Findings

Findings are ordered by severity/impact, not by file location. Each includes: what's there, why it's a mask/bug/perf problem, and the specific refactor.

---

### F1 — The 3D scene is unconditionally hard-disabled, and the fallback message lies about why

**Where:** `src/components/scene/SceneClient.tsx`

```tsx
export default function SceneClient() {
  // Temporarily disabled 3D scene rendering
  const setRendererAvailable = useSceneInteractionStore((state) => state.setRendererAvailable)

  useEffect(() => {
    setRendererAvailable(false)
  }, [setRendererAvailable])

  return (
    <p className="sr-only" role="status" aria-live="polite">
      {fallbackMessages.static_preference}
    </p>
  )
}
```

`fallbackMessages.static_preference` reads: *"The interactive 3D scene is paused to respect this device or motion preference."* This is false for essentially every visitor — it's not evaluating device tier, `prefers-reduced-motion`, or WebGL support (all of that logic exists, fully written, in `src/lib/sceneRuntime.ts`, and is simply never called). The component never mounts `<Experience />`, never checks `getSceneRuntimeProfile()`, never checks `supportsWebGL()`. It always reports the same reason, to every user, on every device.

**Why this matters:** This one component is the choke point that severs the entire 3D pipeline from the shipping app. Everything in Finding F2 exists *because of* this single line.

**Refactor:**
1. Restore the real branch logic in `SceneClient`: call `supportsWebGL()` and `getSceneRuntimeProfile()` on mount (client-only), pick a real fallback reason (`unsupported`, `static_preference`, `context_lost`, `renderer_error`) based on the actual signal that fired, and only fall back to the `<p role="status">` message when that signal is genuinely true.
2. When supported, mount `<Experience initialProfile={profile} onContextLost={...} />` (see F2) inside a boundary that can flip back to the fallback message on `webglcontextlost` or a caught render error.
3. Add a regression test that fails loudly if this file ever again returns a static fallback unconditionally — see F10's proposed integration test.
4. Before doing any of this, make the *product* decision in §4 (Option A vs B) — don't re-wire this until you know whether you're shipping the 3D scene or formally retiring it.

---

### F2 — An entire second, duplicate model-rendering system exists and is *also* dead, plus the wiring for the first system is disconnected

**Where:** `src/components/models/*` (`DNA.tsx`, `DnaAlt.tsx`, `Bacteriophage.tsx`, `HemoglobinRibbon.tsx`, `BrainPointCloud.tsx`, `EarthAnimated.tsx`, `InteractiveModel.tsx`, `ChapterGLTFModel.tsx`) vs. `src/components/scene/exhibits/ChapterGLTFModel.tsx` + `src/components/scene/{exhibitLoaders.ts, modelPreload.ts, SceneErrorBoundary.tsx}`

Both trees implement "load a GLTF exhibit for the active chapter, react to hover/selection." Both use `src/lib/gltfRuntime.ts` and `src/hooks/useModelInteraction.ts` / `useChapterPresence.ts`. Neither is imported by anything reachable from `page.tsx`. Only `SceneContent.tsx` (also dead, see F1) imports the `scene/exhibits/` version; the `models/` version imports itself and nothing outside its own folder imports it at all.

**Why this matters:** Even setting F1 aside, if a future engineer tries to "turn the 3D scene back on," they will find two parallel implementations of the same thing with no comment explaining which one is canonical, doubling the surface area to re-verify and doubling bundle risk if both get imported by mistake.

**Refactor:**
1. Once the product decision in §4 is made: if reviving the 3D scene, delete `src/components/models/*` entirely and keep `scene/exhibits/ChapterGLTFModel.tsx` (it's the one actually wired into `SceneContent`). If retiring the 3D scene, delete both trees.
2. Either way, delete one of the two `ChapterGLTFModel.tsx` files today — there is no version of the future where you need both.
3. Fold `src/lib/materials.ts` (`applyDnaMaterial`) into whichever model file survives; it's a 21-line single-purpose helper only used by the DNA mesh and doesn't need its own module.

---

### F3 — A fully-implemented velocity-based "magnetic scroll" snap exists and is explicitly bypassed

**Where:** `src/lib/journeyTimeline.ts` (`getMagneticTarget`, exported, complete) vs. `src/components/motion/CyclicJourneyController.tsx:157` and `:264`

```ts
// journeyTimeline.ts — fully implemented, exported, unit-testable
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

```ts
// CyclicJourneyController.tsx — the caller
const navigateToMagneticTarget = (velocity: number) => {
  const units = runtime.renderUnits.get()
  // Disabled magnetic scroll - use simple nearest dwell center
  const target = Math.round((units - DWELL_CENTER_OFFSET) / SLOT_UNITS) * SLOT_UNITS + DWELL_CENTER_OFFSET
  runtime.navigateTo(target)
}
```

`velocity` is a parameter of `navigateToMagneticTarget` that is **never read in the function body**. `getMagneticTarget` — which does exactly what the comment says should happen — is never called from application code (only from its own unit test, `journey-timeline.test.ts`, if present).

**Why this matters:** This is the clearest example of "applied as a mask" in the codebase: a real, tested, working feature was swapped for a placeholder mid-development and the placeholder shipped. The UX consequence is that fast scroll flicks and slow scroll flicks settle identically — the "cinematic, physical" feel the README explicitly claims (*"inertial motion systems"*) doesn't exist in the live build.

**Refactor:**
1. In `navigateToMagneticTarget`, replace the body with `runtime.navigateTo(getMagneticTarget(units, velocity, runtime.getLastInputDirection()))`.
2. In `finishPointerDrag` (see F4 — same function has a separate bug), do the equivalent for the touch-release path using the measured release velocity.
3. Delete the two `// Disabled magnetic scroll` comments once the call sites are restored; a stale comment next to working code is its own future footgun.
4. Add an assertion-level test (not just a pure-function test of `getMagneticTarget` in isolation) that drives `CyclicJourneyController` with a synthetic high-velocity wheel sequence and asserts it lands on a *non-adjacent* slot — this is the behavior the current test suite does not verify, which is exactly how the bypass shipped unnoticed.

---

### F4 — Runtime `ReferenceError` on every touch-drag release: mobile navigation is broken

**Where:** `src/components/motion/CyclicJourneyController.tsx:266`

```ts
const finishPointerDrag = (event: PointerEvent) => {
  ...
  if (first && last && last.time > first.time) {
    const releaseVelocity = ((last.units - first.units) / (last.time - first.time)) * 1000
    // Disabled magnetic scroll - use simple nearest dwell center
    const units = runtime.renderUnits.get()
    runtime.navigateTo(nearestDwellCenter(units))   // <-- not imported, not exported
    return
  }
  scheduleMagneticSettle()
}
```

`nearestDwellCenter` is declared as a **module-private, non-exported** `function` in `journeyTimeline.ts:70`. The only names imported from `journeyTimeline` at the top of `CyclicJourneyController.tsx` are `DWELL_CENTER_OFFSET, decodeJourney, getDwellCenter, getNearestOrdinalForIndex, SLOT_UNITS`. There is no local declaration of `nearestDwellCenter` anywhere in the file. This is a plain `ReferenceError: nearestDwellCenter is not defined`, thrown synchronously inside a `pointerup`/`pointercancel` handler, on **every** touch-drag release that produces two or more velocity samples — i.e., almost every real swipe on a touchscreen.

**Why this matters:** This is the single highest-impact live bug in the codebase. It doesn't just skip magnetic settling — it throws inside the event handler, which means:
- the `finishPointerDrag` cleanup (`activePointerId = null` had already run, so state isn't fully corrupted, but the intended `navigateTo` call never happens) — the view is left wherever the raw drag left it, un-snapped to any chapter.
- on browsers/devtools with "pause on exceptions" or strict error overlays (Next.js dev mode), this surfaces as a visible crash overlay on the very first swipe.
- no test exercises this path — `tests/unit/cyclic-journey-controller.test.tsx` does not simulate a `pointerup` with recorded touch samples (confirmed: no `pointerup`/`Pointer` matches in that file).

**Refactor:**
1. Export `nearestDwellCenter` from `journeyTimeline.ts` (it's already the correct, tested primitive — no new logic needed).
2. Import it in `CyclicJourneyController.tsx`, or — better, given F3 — replace this call site with `getMagneticTarget(units, releaseVelocity, runtime.getLastInputDirection())` so touch-release gets real velocity-aware snapping instead of a second "disabled" shortcut.
3. Add a unit test in `tests/unit/cyclic-journey-controller.test.tsx` that dispatches a synthetic `pointerdown` → `pointermove` (×2+) → `pointerup` sequence on the controller's ref element and asserts `runtime.navigateTo` was called with a finite number (this alone would have caught the bug before merge).
4. Audit the rest of the file for the same class of mistake: search every identifier used-but-not-declared-or-imported. This function is not the only place a `// Disabled ...` comment sits next to broken code (see F3) — treat every such comment in the file as a signal to re-check the call site, not just these two.

---

### F5 — The interactive glass-panel effect is wired up on a hidden dev page and nowhere else

**Where:** `src/components/liquid-glass/LiquidGlassPointerTracker.tsx` is only imported by `src/app/lab/liquid-glass/page.tsx`.

`LiquidGlassPointerTracker` is the component that listens for `pointermove`, finds the hovered `[data-liquid-glass="true"]` surface, and sets the `--glass-pointer-x` / `--glass-pointer-y` CSS custom properties that drive the radial highlight (`.surface::before` in `liquid-glass.module.css`) and the `[data-glass-hovered]` opacity boost. Every chapter card on the live site (`ChapterCardShell` → `LiquidGlassPanel` → `LiquidGlass`) renders `data-liquid-glass="true" data-glass-interactive="true"`, styled to react to a pointer that is never tracked, because the one component that tracks it is mounted **only** on `/lab/liquid-glass` — a `robots: { index: false }` internal test harness, not `layout.tsx`, not `providers.tsx`, not `ImmersiveStage.tsx`.

**Why this matters:** This is a second, cleaner example of "applied as a mask": all the CSS machinery for a signature interaction (the pointer-following glass highlight the README calls out under "Premium Interaction Design" → "cursor glow field") ships to every visitor, fully styled, permanently inert, because its one JS dependency lives on a page nobody but the developer will ever visit.

**Refactor:**
1. Mount `<LiquidGlassPointerTracker />` once, near the root — `src/app/layout.tsx` (as a client child, e.g. alongside `RegisterSW`) or inside `ImmersiveStage.tsx` if you want it scoped to the immersive route only. Given `/contact`, `/credits`, `/privacy` also presumably use `LiquidGlassPanel`/`LiquidGlassButton` (verify), root-level mounting in `layout.tsx` is the safer choice so the effect works consistently everywhere the component is used.
2. Delete the harness-local mount in `lab/liquid-glass/page.tsx` afterward, or leave it (mounting twice is harmless — `LiquidGlassPointerTracker` returns `null` and only attaches global listeners once per instance, so double-mounting on the lab page specifically would mean two listener sets; scope it out if you keep the lab page).
3. Add an e2e assertion (`tests/e2e/liquid-glass.spec.ts` already exists) that hovers a real chapter card on the **home route**, not just the harness route, and asserts `--glass-pointer-x` actually changes. Check first whether this test currently only exercises `/lab/liquid-glass` — if so, that's exactly how this shipped unnoticed.

---

### F6 — All 7 chapter panels are permanently mounted with `backdrop-filter`, "hidden" only by opacity — this is the literal mask pattern

**Where:** `src/components/journey/CyclicChapterStage.tsx` maps over the full `chapterRegistry` (7 entries) unconditionally on every render; `ChapterCardShell.tsx` wraps each in `<LiquidGlassPanel>` and toggles visibility via `aria-hidden`, `opacity-0`/`opacity-100`, and `pointer-events-none`/`auto` — never via conditional rendering (`{visible && <...>}`) or unmounting.

`liquid-glass.module.css`'s `.surface` rule applies `backdrop-filter: blur(16px) saturate(115%) contrast(102%)` (behind an `@supports` check) unconditionally to every `.surface` element, regardless of its `opacity`. Browsers still composite `backdrop-filter` for `opacity: 0` elements — they're not `display: none`, so the blur is still evaluated against the layer stack every frame it's eligible for compositing.

**Why this matters:** At any moment, the "invisible" 6 of 7 chapter cards are: `position: fixed`, full-viewport, running a GPU `backdrop-filter` blur, with two pseudo-element gradient layers (`::before`, `::after`) and their own box-shadow stacks — for content the user cannot see and (per F5) can't even interact with anyway. This is CSS-level "masking": the visibility is faked with opacity while the compositing cost of all 7 layers is paid regardless. On mid/low-tier devices, this is a very plausible direct contributor to "the site lags."

**Refactor:**
1. Change `CyclicChapterStage` to render only `visibleChapterIds` (already computed in `narrativeStore` — max 2 entries during a transition, 1 at rest) instead of mapping the full `chapterRegistry`. Keep the non-visible chapter content out of the DOM entirely; there's no accessibility or SEO reason to keep 5 more fully-styled glass panels mounted (screen readers already get `aria-hidden`+`inert` treatment, so nothing is lost by unmounting instead).
2. If you need the crossfade to remain smooth during the 2-card transition window, keep exactly the transitioning pair mounted (which is already what `visibleChapterIds` tracks) and mount/unmount the rest on chapter settle — i.e., render conditionally based on `visible || isAdjacentToVisible`, not "all of them, forever."
3. Re-measure with Chrome DevTools' Layers/Rendering panel (Paint flashing, Layer borders) before/after — this is the kind of change that's easy to verify empirically.
4. This pairs naturally with F10's performance-budget test: once fixed, assert DOM query `[data-liquid-glass="true"]` count stays ≤ 2 outside of a transition window, so a future regression can't silently re-introduce "render everything, hide with CSS."

---

### F7 — The "temporary" fallback poster is heavier than the 3D scene it's standing in for, with zero adaptive quality control

**Where:** `src/components/scene/ScenePoster.tsx` + `src/app/globals.css` (`.scene-poster*` rules)

This is the component that actually renders full-time on every device (since F1 disables the real scene). It ships:
- Two full-viewport `.scene-poster__cloud` layers with `filter: blur(48px)` and a 24s `infinite alternate` transform animation.
- A `.scene-poster__texture-overlay` — an inline `data:image/svg+xml` containing an `feTurbulence`/`feColorMatrix`/`feComponentTransfer` noise filter, `mix-blend-mode: multiply`, animated on a 60s loop.
- A `.scene-poster__grain` layer with `mix-blend-mode: overlay` and its own animation.
- 20 `.scene-poster__particle` divs, each with a `box-shadow` stack (three shadows) and its own 7s `infinite` animation, whose positions are computed via:
  ```tsx
  {Array.from({ length: 20 }).map((_, i) => (
    <div key={i} className="scene-poster__particle" style={{
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`, animationDuration: `${10 + Math.random() * 15}s`,
      width: `${6 + Math.random() * 8}px`, height: `${6 + Math.random() * 8}px`,
    }} />
  ))}
  ```
  computed **inline in the render body**, not memoized. `ScenePoster` calls `useChapter()`, which subscribes to `narrativeStore.activeChapter` — every chapter change (every scroll settle) re-renders `ScenePoster`, and because the random values aren't memoized (no `useMemo`, no `useRef`), all 20 particles get **new random positions and new inline `style` objects** on every single chapter transition, causing a visible "jump" and a full style/layout recompute for 20 elements on every settle.

There is no equivalent of `sceneRuntime.ts`'s `SceneQualityGovernor` for this component — no `prefers-reduced-motion` gating beyond `animation: none` (the layers and their blur filters still exist and paint, just without the keyframe animation — `filter: blur(48px)` alone is still a real compositing cost), no device-memory/CPU-count downgrade path, no way to turn any of this off short of `display:none`, which only happens under `@media (forced-colors: active), (prefers-contrast: more), (prefers-reduced-transparency: reduce), (update: slow)`.

**Why this matters:** This is very likely the primary explanation for "the site lags to a fault." A sophisticated, testable quality-tiering system exists in the codebase (`sceneRuntime.ts`) and is applied to nothing, while the thing that actually renders to every visitor has no tiering at all.

**Refactor:**
1. Memoize particle positions: `useMemo(() => Array.from({ length: 20 }, () => ({ left: ..., top: ..., ... })), [])` — compute once per mount, not once per chapter change. If you want particles to *react* to chapter changes intentionally, drive that with a CSS transition on existing elements, not fresh randoms.
2. Route `ScenePoster` through a lightweight version of the same signal `sceneRuntime.getSceneRuntimeProfile()` already computes (`prefersReducedMotion`, `isCompactViewport`, `deviceMemory`, `hardwareConcurrency`) and reduce particle count / drop the blur layers / drop the turbulence overlay on low-tier signals — reuse `getSceneRuntimeProfile()` directly rather than writing a parallel implementation (this collapses F7 and part of F1's dead governor code into one shared code path).
3. Reconsider `blur(48px)` at full-viewport scale — this is one of the most expensive things you can ask a compositor to do continuously. Test whether a much smaller pre-rendered/pre-blurred gradient image (or a lower blur radius) achieves the same visual with materially less per-frame cost. A static (non-animated) base layer with a much smaller, cheap animated accent is a reasonable middle ground.
4. Cap the SVG `feTurbulence` texture-overlay to a single static generation (it already uses a fixed `seed`, so it's deterministic) rendered once as a real cached image asset instead of a live inline data-URI filter recomputed by the browser's filter pipeline every animation frame it's visible.

---

### F8 — `chapterRegistry.ts` / `content/assets.ts` carry a full unused 3D-scene description graph

**Where:** `src/lib/chapterRegistry.ts` (476 lines) computes real camera poses (`getDwellCameraAnchor`, `getDwellLookTarget`, via `src/lib/closedRoute.ts`), bloom/fog/lighting `AtmosphereDefinition` objects, and exhibit/asset metadata for every chapter. `src/content/assets.ts` (415 lines) defines the GLTF asset manifest, preload policies (`current`/`adjacent`/`none`), and per-tier availability. Of all this, the *only* thing consumed by live code is `entry.scene.atmosphere.palette[0..2]` and `entry.scene.atmosphere.keyLight` (read by `ScenePoster.tsx` and `CyclicChapterStage.tsx` respectively, for a few CSS custom properties and one inline color).

**Why this matters:** This isn't "dead code" in the unreachable sense (the module does execute — `chapterRegistry` is imported by live files), but it's doing roughly 20x more work per chapter entry than what's actually consumed, and it silently depends on `closedRoute.ts`'s camera math being correct even though nothing renders a camera. This is exactly the kind of "deeply nested" problem the audit was asked to find: the file *looks* load-bearing and *is* imported by live code, so a cursory dead-code scan (or `knip`, which only flags fully-unreferenced files/exports) won't catch that 90% of its output is unused.

**Refactor:**
1. Once the §4 product decision is made: if retiring 3D, strip `AtmosphereDefinition` down to just the fields `ScenePoster`/`CyclicChapterStage` actually read (`palette`, `keyLight`, maybe `fogColor`) and delete `closedRoute.ts`/`closedRouteCurves.ts` and the camera-pose fields entirely — this alone removes ~130 lines of trigonometry nothing calls.
2. If reviving 3D, no change needed here — but add a compile-time or test-time check (e.g., a unit test that imports every field of `AtmosphereDefinition` and asserts each is read somewhere via `grep`/AST) so this doesn't silently rot again if the scene gets disabled a second time.

---

### F9 — Dead-code tooling is configured to hide the problem, not report it

**Where:** `knip.json`

```json
{
  "ignoreFiles": [
    "public/draco/**",
    "src/components/models/ChapterGLTFModel.tsx",
    "src/components/models/InteractiveModel.tsx",
    "src/components/models/ProteinShowcase.tsx",
    "src/components/models/Tradigrade.tsx"
  ]
}
```

`knip` is a static analysis tool whose entire purpose is to catch exactly F2/F1-style orphaned files. Someone ran it, saw it correctly flag `ChapterGLTFModel.tsx` and `InteractiveModel.tsx` as unused, and **suppressed the warning instead of deleting the files or wiring them up**. Two of the four ignored filenames (`ProteinShowcase.tsx`, `Tradigrade.tsx`) don't exist anywhere in this codebase snapshot — remnants of files deleted at some point without also cleaning up the ignore list, meaning nobody has looked at a fresh `knip` report since at least that deletion. `knip` is part of `npm run quality` (`"quality": "... && npm run knip && ..."`), i.e., it's a supposed CI gate that has been actively defanged for this exact category of problem.

**Why this matters:** This is process evidence for the whole audit's thesis. It's not that dead code and masked features are hard to find — the repo's own tooling found them and someone chose to silence the tool.

**Refactor:**
1. Delete the `ignoreFiles` entries for files that no longer exist immediately (`ProteinShowcase.tsx`, `Tradigrade.tsx`) — this is a one-line, zero-risk cleanup that also functions as a canary for whether anyone reads `knip.json` before editing it.
2. Once F1/F2 are resolved (files either wired up or deleted), remove the remaining two ignores — there should be no unused-file suppressions left for anything under active development.
3. Run `npm run knip` fresh (see §5, Verification) and treat every new finding as a decision point: wire it up or delete it, not a third ignore entry.
4. Consider making `knip` fail CI on *any* `ignoreFiles` entry older than N days without a linked tracking issue — or simpler, just review `knip.json` diffs in code review as seriously as any other config change; it's currently being used as a "silence the alarm" switch rather than a "snooze with a plan" mechanism.

---

### F10 — The E2E/CI suite is internally contradictory about whether the WebGL canvas exists, and it's wired into required CI

**Where:** `tests/e2e/performance.spec.ts:39` and `tests/e2e/scene-resilience.spec.ts:12` both assert `await expect(page.locator('canvas')).toHaveCount(1)` on the default (`desktop`, WebGL-capable) project. Given F1, this must currently be `0`, not `1`. `tests/e2e/portfolio.spec.ts` separately (and correctly) asserts `canvas` count `0` — but only inside `if (testInfo.project.name === 'no-webgl')` and inside a `javaScriptEnabled: false` context, i.e., it's *not* making a blanket claim about the default project — so there's no way to read `portfolio.spec.ts` as "someone updated the suite to match the new disabled state." Nobody touched `performance.spec.ts` or `scene-resilience.spec.ts` to match.

`package.json`'s `"e2e"` script explicitly includes both `tests/e2e/performance.spec.ts` and `tests/e2e/scene-resilience.spec.ts`, and `.github/workflows/e2e.yml` runs `npm run e2e` on every `pull_request` and every push to `main`. Separately, `"quality"` (the script most likely to be treated as "the" gate) does **not** include `e2e` at all — it's a different script, run by a different workflow.

**Why this matters, and what it implies:** Either (a) CI has been red on this workflow for a while and merges have been happening anyway (a process problem worth raising independently of this codebase audit), or (b) `SceneClient`'s disable is very recent and hasn't hit CI yet. Either way, this is concrete, reproducible proof (not speculation) that the current state is a regression relative to the codebase's own stated expectations — it's not "always been like this," it's "diverged from tests that still assert the old behavior."

**Refactor:**
1. Run `npm run e2e` (or at minimum `npx playwright test tests/e2e/performance.spec.ts tests/e2e/scene-resilience.spec.ts --project=desktop`) locally against the current `main` build and confirm the failure. This turns "I traced this statically" into "here is the failing CI run" — do this before reporting the finding upward if you want a paper trail.
2. Fix in the direction chosen in §4, not by loosening the assertion to match the broken state — do not "fix" this by changing `toHaveCount(1)` to `toHaveCount(0)` in `performance.spec.ts` without first deciding whether the 3D scene should exist. Weakening the test to match the bug is the same anti-pattern documented in F1–F9.
3. Once resolved, add `e2e` (or at least a fast smoke subset: `portfolio.spec.ts` + `performance.spec.ts`) to the `quality` script, or make the `browser` GitHub Actions job a required status check on the branch protection rule for `main`, so this class of drift can't merge silently again.
4. Add one new, cheap integration test that is specifically about the *wiring*, not the pieces: render the home route and assert that `SceneClient`'s reported fallback reason matches the actual `getSceneRuntimeProfile()`/`supportsWebGL()` result for the test environment, rather than being hardcoded. This is the test that would have caught F1 at the source rather than three tests downstream discovering the symptom.

---

### F11 — Orphaned root-level files and empty leftover directories from an incomplete cleanup pass

**Where:**
- `GlassCard.tsx`, `glass-card.css`, `demo.html` sit at the **repository root** (outside `src/`), are not imported by anything, and are not part of the Next.js build in any way. They duplicate — under a different, competing implementation — what `src/components/liquid-glass/*` already does properly (with `prefers-reduced-motion`, `forced-colors`, and `backdrop-filter` feature-detection fallbacks that the root-level `glass-card.css` doesn't have).
- `src/components/world/`, `src/components/debug/`, `src/shaders/particles`, `src/shaders/fresnel`, `src/shaders/biological`, `src/shaders/holographic` all exist as directories with **zero files in them**.
- The zip filename itself (`PP8_1-clean.zip`) and a `clean_tree.txt` file at the root suggest an in-progress cleanup pass that stopped partway.

**Why this matters:** Low runtime impact, but real cost to whoever next opens this repo: a new contributor grepping for "GlassCard" or looking at `src/shaders/` will reasonably assume there's a canonical implementation there and waste time before discovering it's empty/orphaned. This is the same "mask" pattern as F1/F2/F9 at the file-system level — evidence of things half-started and left in a state that looks more finished than it is.

**Refactor:**
1. Delete `GlassCard.tsx`, `glass-card.css`, `demo.html` from the repo root — confirm zero references first (already confirmed in this audit), then remove.
2. Delete the empty directories (`src/components/world`, `src/components/debug`, `src/shaders/*`), or, if they represent genuinely planned future work, replace them with a single `docs/roadmap.md` note instead of empty scaffolding that looks like missing/broken code.
3. Reconcile or retire `clean_tree.txt`, `action_plan.md`, `plan_restructuring.md`, `portfolio_completion_and_deployment_plan.md`, and the pre-existing `plan.md` at the repo root — five overlapping planning documents (now six, counting this one) is itself a symptom of the same "start, don't finish, start over" pattern. Recommend keeping exactly one living plan document and archiving/deleting the rest once their action items are triaged into this one.

---

### F12 — Minor / lower-priority items worth batching into cleanup

- **`next.config.js`**: `experimental.optimizePackageImports: ['@react-three/drei', '@react-three/fiber']` optimizes imports for libraries that (per F1/F2) are currently imported by zero live routes. Harmless today, but a config drift signal — revisit once §4 is decided.
- **CSP** (`next.config.js`): `script-src 'self' 'unsafe-inline' 'unsafe-eval'` is a broad allowance. Worth a follow-up audit of whether `'unsafe-eval'` is actually required (Turnstile, Next dev-mode HMR, etc.) or is a leftover — not a "lag" issue, flagging because it was noticed during the pass and is a legitimate hardening item, separate from this audit's main thrust.
- **`public/sw.js`**: `CACHE_NAME = 'bio-portfolio-v1'` is a static string that never changes across deploys. Static assets under `/_next/` are correctly bypassed (they're content-hashed, so this is fine), but the navigation/document cache-first-fallback path means returning visitors on a flaky connection could be served a stale HTML shell after a deploy until the cache key strategy is revisited. Low priority; note for a future PWA-hardening pass.
- **`CursorGlow.tsx`**: implemented correctly (motion values, not React state, so no re-render cost; properly gated behind `(hover: hover) and (pointer: fine)` and `prefers-reduced-motion`) — flagged here only to confirm it was checked and is **not** a contributor to the lag; no action needed.

---

## 3. Dead-code inventory (confirmed unreachable from `src/app/page.tsx`)

| File | Lines | Only referenced by |
|---|---:|---|
| `src/components/scene/Experience.tsx` | 123 | nothing (orphan) |
| `src/components/scene/SceneContent.tsx` | 141 | `Experience.tsx` (dead) |
| `src/components/scene/AtmosphereController.tsx` | 79 | `Experience.tsx` (dead) |
| `src/components/scene/AtmosphereContext.tsx` | 19 | `AtmosphereController.tsx` (dead) |
| `src/components/scene/NebulaBackground.tsx` | 188 | `AtmosphereController.tsx` (dead) |
| `src/components/scene/SceneErrorBoundary.tsx` | 29 | `SceneContent.tsx` (dead) |
| `src/components/scene/SceneRendererBoundary.tsx` | 31 | nothing (orphan) |
| `src/components/scene/Lighting.tsx` | 45 | `AtmosphereController.tsx` (dead) |
| `src/components/scene/exhibitLoaders.ts` | 35 | `SceneContent.tsx` (dead) |
| `src/components/scene/exhibits/ChapterGLTFModel.tsx` | 96 | `SceneContent.tsx` (dead) |
| `src/components/scene/modelPreload.ts` | 19 | `SceneContent.tsx` (dead) |
| `src/components/motion/ChapterCameraRig.tsx` | 115 | `Experience.tsx` (dead) |
| `src/components/effects/Particles.tsx` | 72 | `AtmosphereController.tsx` (dead) |
| `src/components/effects/PostProcessing.tsx` | 42 | `AtmosphereController.tsx` (dead) |
| `src/components/models/*` (8 files) | ~575 | each other only (self-contained dead tree) |
| `src/hooks/useModelInteraction.ts` | 205 | `models/*`, `scene/exhibits/*` (dead) |
| `src/hooks/useChapterPresence.ts` | 12 | `models/*`, `scene/exhibits/*` (dead) |
| `src/lib/modelInteraction.ts` | 119 | `useModelInteraction.ts` (dead) |
| `src/lib/gltfRuntime.ts` | 46 | `models/*`, `scene/exhibits/*` (dead) |
| `src/lib/materials.ts` | 21 | `models/DNA.tsx` (dead) |
| `src/lib/atmosphere.ts` | 150 | `AtmosphereController.tsx`, `AtmosphereContext.tsx` (dead) |
| `src/content/assets.ts` | 415 | `SceneContent.tsx`, `models/*`, `scene/exhibits/*` (dead) |
| **Total confirmed dead** | **≈2,678** | **35.6% of `src/`** |

*(`src/lib/closedRoute.ts` / `closedRouteCurves.ts` and the bulk of `src/lib/chapterRegistry.ts`'s `AtmosphereDefinition` are not in this table because they are technically executed by live code — see F8 for that nuance; they're a "computed but unconsumed" problem, not a reachability problem.)*

---

## 4. The decision this plan can't make for you

Everything above is fixable either way, but F1/F2/F8 all fork on one product question: **is the persistent 3D world coming back, or is the CSS poster the permanent home page?**

**Option A — Revive the 3D scene.** The groundwork is substantial and mostly sound: `sceneRuntime.ts`'s quality governor, `journeyRuntime.tsx`'s spring physics, `chapterRegistry.ts`'s camera-pose math, and `scene/exhibits/ChapterGLTFModel.tsx`'s loader all look like real, considered engineering, not stubs. The work is re-wiring `SceneClient` → `Experience` (F1), deleting the duplicate `models/` tree (F2), and doing real device testing to confirm the quality tiers actually hold 60fps on the low tier before shipping it live again. This is the higher-effort, higher-payoff path and matches the product vision in `README.md`.

**Option B — Formally retire the 3D scene and commit to the poster.** Delete everything in §3's table, delete `closedRoute.ts`/`closedRouteCurves.ts`, drastically simplify `chapterRegistry.ts`'s `AtmosphereDefinition` (F8), and put all remaining effort into making `ScenePoster` (F7) fast and adaptive. This is the lower-effort, lower-risk path, and — given the presenting complaint is "the site lags to a fault" — is the faster route to a *fast* site, at the cost of the site's originally-intended identity.

**Recommendation:** Do the zero-regret items first regardless of which way this goes (F3, F4, F5, F6, F7, F9, F10, F11 — none of these depend on the Option A/B decision), then make the call on Option A vs. B with a fast, un-laggy baseline already in hand rather than under pressure to hit a deadline. If Option A is chosen, budget real device-lab time — the existing quality-governor code assumes tier detection is trustworthy, and that assumption has apparently never been exercised in production.

---

## 5. Phased roadmap

### Phase 0 — Stop the bleeding (½–1 day)
- F4: export `nearestDwellCenter`, fix the touch-release crash. This is a live crash bug affecting mobile users today; fix it before anything else.
- F9 (partial): delete the two stale `knip.json` entries referencing files that no longer exist.
- F10 (partial): run `npm run e2e` locally, confirm and document the actual current CI failure state.

### Phase 1 — Fix live-path masks that don't require the Option A/B decision (2–4 days)
- F3: restore `getMagneticTarget` call sites.
- F5: mount `LiquidGlassPointerTracker` at the app root.
- F6: switch `CyclicChapterStage` to render only visible/adjacent chapters instead of all 7.
- F7: memoize `ScenePoster` particle data; route it through `getSceneRuntimeProfile()` for adaptive quality; reassess the `blur(48px)` cost.
- Add the regression tests called out in each finding (F3, F4, F5, F6, F10) as you go — write the test that would have caught the bug alongside the fix, not after.

### Phase 2 — Make the Option A/B decision (§4) (owner input required)
- Time-box a spike: try re-enabling `SceneClient` → `Experience` behind a feature flag on a staging deploy, run it through `sceneRuntime.ts`'s tiers on real low/mid-tier hardware, and measure actual frame times against the `SceneQualityGovernor`'s thresholds (42ms slow / 20ms fast). Use that data, not intuition, to decide.

### Phase 3 — Execute the chosen direction (effort varies by A vs. B; see §4)
- Option A: re-wire F1 for real, delete F2's duplicate tree, keep F8 as-is (it's finally consumed for real).
- Option B: delete everything in §3's inventory, simplify F8's `AtmosphereDefinition`, delete `closedRoute.ts`/`closedRouteCurves.ts`.

### Phase 4 — Repo hygiene and process (parallelizable with Phase 1–3)
- F11: delete root-level orphan files and empty directories; consolidate the six overlapping planning docs into one.
- F9 (remaining): make `knip` clean and keep it clean — no more silent `ignoreFiles` entries as a substitute for a decision.
- F12: revisit CSP `unsafe-eval`, SW cache versioning, and `optimizePackageImports` once Phase 3 settles the dependency set.

### Phase 5 — Verification
- Re-run `npm run quality` and `npm run e2e` clean.
- Re-measure real-world performance: Lighthouse (`lighthouserc.json` already exists — use it), and manually verify with Chrome DevTools Performance/Rendering panels that F6's fixed panel count and F7's adaptive poster actually reduced main-thread and compositor time, not just that the code looks lighter.
- Confirm F10's new wiring-level integration test passes and would fail if `SceneClient` regressed to a hardcoded disable again.

---

## 6. Why this happened (for the retro, not the backlog)

Every finding above shares one shape: a real feature was built, something about it didn't work or wasn't finished in time, and instead of finishing it or removing it, someone wrote a one-line workaround with a comment (`// Temporarily disabled...`, `// Disabled magnetic scroll...`) or a suppression (`knip.json`'s `ignoreFiles`) and moved on. Individually each of these was probably the right short-term call under deadline pressure. Compounded across a whole codebase and left un-revisited, they add up to a site where roughly a third of the code doesn't run, the part that does run is slower than the part that doesn't, and several of the features visible in the UI don't actually do anything. The fix isn't just the items above — it's treating `// Temporarily disabled` and linter-suppression comments as tracked debt (an issue, a `TODO(owner, date)`, something with a paper trail) rather than a silent permanent state.
