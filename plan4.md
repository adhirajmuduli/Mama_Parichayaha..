# Plan 3 — CI Failure Root Cause, Round 2 Verification, and the Missing Semantic Backbone

**Scope:** Third pass. Diffed the newly uploaded zip against the exact snapshot audited in `plan2.md` (`work2`), then read every failing test in the two attached CI logs against the actual current source to root-cause each one precisely rather than guess.

**Headline, up front:** The two attached CI failures are two different problems, and neither is subtle once you look:

1. **`npm run quality` fails at the very first step (`format:check`)** because the CRLF line-ending issue flagged in `plan2.md` (H8) wasn't fixed — it more than quintupled (4 files → 21 files), and the two new files added specifically to prevent it (`.editorconfig`, `.gitattributes`) are *themselves* saved with CRLF, which is direct proof the editing environment is still producing them.
2. **`npm run test:visual` fails outright ("Missing script")** because this round deleted the entire `liquid-glass` system (correctly resolving H2/H3 from `plan2.md`) and removed the now-unneeded `test:visual`/`test:glass*` scripts from `package.json` — but nobody removed or updated `.github/workflows/visual.yml`, which unconditionally still runs `npm run test:visual` on every PR and push to `main`. This is a guaranteed, permanent CI failure until someone touches the workflow file.

Underneath both of those, the `npm run e2e` log reveals something much bigger than either: **16 of 44 e2e tests fail, across almost every spec file, because the home page has no server-rendered semantic backbone at all** — no `<header>`, no `<footer>`, no skip-link, no `id="origins"`-style anchor sections, no home-page "Get in touch"/"Credits" regions, and (new to this pass) an entire accessible model-control interface (`role="group"`, "Rotate model left" buttons, keyboard support) that the test suite fully specifies and that has never been built. This isn't a regression from this round's changes — it predates all three rounds — but it's the single largest, most consequential finding of this entire audit, and it was hiding behind the fact that nobody had run the actual test suite until now.

---

## 1. Direct account of the two attached CI jobs

### Job 1 — `npm run e2e`: 16 failing, 17 passing, 11 skipped

Every failure traces to one of two root causes:

**(a) The home page has no semantic/anchor backbone.** `tests/e2e/portfolio.spec.ts` expects, on the home route: a `<header>` (count 1), a `<footer>` (count 1), a skip-link (`getByRole('link', {name: 'Skip to portfolio content'})` with `href="#origins"`), a `<nav aria-label="Chapter progress">` (desktop only), five real `<section>` elements addressable at `#origins`/`#interests`/`#research`/`#computation`/`#future`, a `getByRole('region', {name: 'No publications or talks listed'})`, a `getByRole('region', {name: 'Get in touch'})` with email/GitHub/ORCID links, and a `getByRole('region', {name: 'Model and scientific-source attribution'})` with a credits link. **None of this exists on the home page.** `ImmersiveStage.tsx` renders exactly one `<main>` containing `ScenePoster` + the JS-driven `CyclicJourneyController`/`CyclicChapterStage` tree — no header, no footer, no anchor sections, no publications/contact/credits regions. This single gap fails: `portfolio.spec.ts` (both the main test and the no-JS test), `seo.spec.ts`'s first test, and `scene-resilience.spec.ts` (which checks `#origins` and the "Get in touch" region after a simulated context loss).

**(b) There is no accessible control surface for the 3D exhibits.** `tests/e2e/model-interaction.spec.ts` expects `getByRole('group', {name: 'DNA model controls'})` and `'Bacteriophage model controls'` (each count 1), explicitly *no* group for "Protein"/"Tardigrade", a `getByRole('button', {name: 'Rotate model left'})` inside the DNA group that's keyboard-operable (`ArrowRight`, `Home`) on desktop and correctly `disabled` (with a `role="status"` explanation) on `no-webgl`/`reduced-motion`. A full-text search of `src/` for `"model controls"`, `"Rotate model"`, or any component implementing this confirms **it doesn't exist anywhere in the codebase.** `useModelInteraction.ts` implements real pointer-drag-with-inertia physics, but there is no button, no ARIA group, no keyboard handler, no status announcement — the entire accessible interaction layer this test specifies was apparently never built, at any point across all three rounds of this audit.

The one flaky-looking result — `scene-resilience.spec.ts`'s retry #1 failing on a *different* assertion (`[data-scene-enhancement="webgl"]` count 0 vs 1) than the initial/retry #2 attempts (`#origins` visible) — is not a separate bug; it's the same root cause (a) surfacing at a different point in the same test, depending on exactly when the missing `#origins` element's absence gets hit relative to the WebGL-context-loss simulation.

`performance.spec.ts` times out entirely (2 minutes, hard timeout) trying to `scrollIntoViewIfNeeded()` on `locator('#origins')` — same root cause (a), just manifesting as a hang instead of a quick failure, because `scrollIntoViewIfNeeded` polls indefinitely for an element that will never appear rather than failing fast.

**What's notable about this list:** these are not new regressions from Round 2 or Round 3's changes. I confirmed by grepping the Round 1 and Round 2 snapshots (`work`, `work2`) for the same markers (`<header>`, `<footer>`, `Skip to portfolio`, `id="origins"`, `"model controls"`) — **none of it existed in either prior snapshot either.** This means this e2e suite has likely never passed, at any point covered by this audit, and — combined with `plan.md`'s F10 finding that `npm run e2e` isn't part of the `quality` gate — nobody had actually run it end-to-end until the log attached to this message. That log is the first real evidence, across three rounds, of what the test suite has been trying to say the whole time.

### Job 2 — `npm run test:visual`: missing script

This round (correctly) deleted the entire `liquid-glass` component tree, its CSS module, its pointer tracker, the `/lab/liquid-glass` harness page, and the associated test files (`liquid-glass.spec.ts`, `liquid-glass.visual.spec.ts`, `visual.spec.ts`, `liquid-glass.test.tsx`) — see §2 below, this is real progress on `plan2.md`'s H2/H3. As part of that cleanup, `package.json` lost the now-pointless scripts: `test:visual`, `test:visual:update`, `test:glass`, `test:glass:visual`, `test:glass:visual:update`.

Nobody updated `.github/workflows/visual.yml`, which has this unconditional step:

```yaml
- run: corepack npm run test:visual
  env:
    CI: 'true'
```

`npm run test:visual` no longer exists, so this fails immediately with `npm error Missing script: "test:visual"` on every PR and every push to `main`, forever, until someone fixes it.

**Refactor — this is a two-minute fix, do it first:**
1. Either delete `.github/workflows/visual.yml` entirely (if visual regression testing is being retired along with the liquid-glass system it was built to snapshot), or
2. Replace its `test:visual` step with whatever the new visual-regression story is (if any of the deleted specs' coverage needs to live on for the new `GlassCard` system, write a new spec and point the workflow at it).
3. Whichever you choose, grep `.github/workflows/*.yml` for every `npm run <script>` invocation right now and confirm each one still exists in `package.json` — this exact class of break (delete a script, forget the workflow that calls it) is cheap to prevent with a 30-second check and expensive to notice otherwise (it fails identically and immediately on every single PR).

---

## 2. Status of Round 2 (`plan2.md`) findings

| # | Finding | Status |
|---|---|---|
| H1 (bundle: eager 3D import) | **Fixed** | `SceneClient.tsx` now does `const Experience = dynamic<ExperienceProps>(() => import('./Experience'), { ssr: false })` — exactly the recommended fix. `npm run bundle`'s manifest-entry check should now pass (budget sizes still worth confirming with a real run, but the structural fix is correct). |
| H1 (pointer-events-none blocking exhibit interaction) | **Not fixed** | `SceneClient.tsx` still wraps the scene in `<div data-scene-enhancement="webgl" className="pointer-events-none absolute inset-0 z-0">`. Combined with the newly-found §3 finding (no accessible control UI exists either), the exhibit-interaction feature remains fully non-functional for every input method. |
| H2/H3 (competing GlassCard/LiquidGlass systems, pointer tracker never mounted) | **Fixed, cleanly** | The entire `liquid-glass` tree (`LiquidGlass.tsx`, `LiquidGlassButton.tsx`, `LiquidGlassPanel.tsx`, `LiquidGlassPointerTracker.tsx`, `liquid-glass.module.css`), the `/lab/liquid-glass` harness page, and its tests were deleted outright. Every live usage (`ChapterCardShell`, `ContactSection`, `PublicationStatusSection`, `ChapterDetail`) now consistently uses the single `GlassCard`/`GlassCardHeader/Body/Footer`/`GlassButton`/`GlassLink` family from `src/components/glass-card/GlassCard.tsx`. The `@root/*` tsconfig alias was removed since the component moved into `src/components/glass-card/` — no more out-of-tree production code. This is a genuinely good, complete resolution — no half-migrated state left behind. Worth naming plainly: the trade-off (by the component's own design) is zero pointer-tracked glow anywhere in the app now, which is a legitimate, consistent choice, not a bug. |
| H4 (5 vs 7 chapters copy/test mismatch) | **Not fixed, and now much better understood** | See §3 — the real answer, now confirmed by `portfolio.spec.ts`'s own source, is that exactly **five** chapters (`origins, interests, research, computation, future`) are supposed to be real anchor-addressable `<section>`s, with `publications` and `contact` intended as separate, differently-shaped regions. `chapterRegistry` still has all 7 entries and `CyclicChapterStage`/the new `ChapterProgress` nav still treat all 7 identically. This is bigger than a copy fix now — see §3's refactor. |
| H5 (`getMagneticTarget`'s unused `lastDirection`) | **Not touched** | Unchanged; still a `void lastDirection` no-op. Low priority relative to §3, but still open. |
| H6 (`InteractiveModel.tsx` orphan) | **Fixed by deletion** | The file is gone. Clean resolution — simpler than the shim approach used for `ChapterGLTFModel.tsx`, and equally valid. |
| H7 (ScenePoster adaptive tiering mostly unreachable) | **Not touched, not urgent** | Unchanged from Round 2's state; still correct-but-narrow as previously described. |
| H8 (CRLF contamination) | **Attempted, and made worse** | See §1, Job 1 and §4 below — this is now the most acute, easiest-to-fix-yet-still-unfixed item in the whole audit. |
| F8 (unused 3D scene-graph fields in `chapterRegistry`) | **Not touched**; a large, unrelated color-palette rework landed in the same file this round (light theme → dark theme), confirmed to be cosmetic only, not a structural change (still 7 entries). |
| F11 remainder (`demo.html`) | **Not touched** | Still orphaned at the repo root. |

---

## 3. The core finding: the site has no real content or interaction layer underneath the motion layer

This generalizes and supersedes `plan2.md`'s H4 and deepens `plan.md`'s original framing. Reading `tests/e2e/portfolio.spec.ts`, `seo.spec.ts`, and `model-interaction.spec.ts` **as a specification** (which, absent any other design doc making the same claims this precisely, is the closest thing this project has to one) reveals the following intended architecture, none of which is currently built:

- A `<header>` with the site title and a skip-link (`href="#origins"`).
- A `<nav aria-label="Chapter progress">`, visible on desktop, hidden on mobile.
- A `<main>` containing five real `<section id="origins">` … `<section id="future">` elements — addressable by URL hash, present in the DOM and readable by a no-JS client or a crawler, not conjured by client-side scroll physics.
- Separately, a "No publications or talks listed" region, a "Get in touch" region (email/GitHub/ORCID links plus a link to `/privacy`), and a "Model and scientific-source attribution" region (with a link to `/credits`) — all **on the home page itself**, not only reachable via the standalone `/contact` and `/credits` routes.
- A `<footer>`.
- Inside the DNA and Bacteriophage exhibits specifically, an accessible `role="group"` control surface with a working, keyboard-operable "Rotate model left" button and a live-region status message for when 3D is unavailable.

What actually exists is a single `<main>` wrapping a purely client-side, JS-driven, spring-physics-animated stack of `position: fixed` cards (`CyclicChapterStage` → `ChapterCardShell` → `GlassCard`), toggled by `aria-hidden`/`opacity`, with no anchor IDs, no header, no footer, and a completely separate, non-overlapping set of standalone routes (`/contact`, `/credits`, `/privacy`) that hold the content the home page's tests expect to find inline. The `ChapterProgress.tsx` nav added this round is a genuine, correctly-wired step toward the missing `<nav>` — but its buttons have no `href`, only `onClick` handlers that call `runtime.navigateTo(...)`, so it does nothing at all without JavaScript, and it iterates all 7 `chapterRegistry` entries rather than the 5 the tests expect.

**Why this is the most important finding in the whole audit:** everything in `plan.md` and `plan2.md` was about features that exist but don't fully work, or that work but cost more than they should. This is different — it's the discovery that the site's baseline accessibility/SEO/no-JS contract (the thing `portfolio.spec.ts` was clearly written to guarantee) was either never built, or was built once and then removed when the project pivoted to the cyclic-journey motion design, and nothing since has reconciled the two. Every visitor without JavaScript, every crawler that doesn't execute JS, and every assistive-technology user relying on landmark navigation or in-page anchors currently gets a page with a heading and not much else that's reachable.

**Refactor — this is a real feature-build, not a quick patch, so treat it as its own project phase:**
1. Decide the content model first: are `publications`/`contact` two of "the five/seven looping chapters," or are they always-static regions that sit outside the cyclic ring (matching what the tests imply)? The tests are unambiguous that they're the latter — recommend committing to that and updating `chapterRegistry`/`chapterIds` to reflect it (e.g., split into a `cyclicChapterIds` (5) and separately-rendered `staticRegionIds` (`publications`, `contact`, `credits`), rather than one flat list of 7 treated uniformly everywhere).
2. Build the real semantic layer as server-rendered HTML: a `<header>` with the skip-link, a `<main>` with five real `<section id={chapterId}>` elements carrying the actual chapter copy (already fully authored in `content/portfolio.ts` — this is a rendering-layer gap, not a content gap), the publications/contact/credits regions inline, and a `<footer>`. This should render correctly with JavaScript fully disabled, before any enhancement layer touches it.
3. Layer the existing cyclic/motion/3D experience *on top of* that real markup as a progressive enhancement — exactly the pattern `SceneClient.tsx` already uses for the 3D scene specifically (real fallback content first, JS enhancement second) needs to be applied one level up, to the whole page, not just the canvas.
4. Build the accessible exhibit-control group (`role="group"`, named per exhibit, with real rotate buttons wired to `useModelInteraction`'s existing rotation logic, keyboard support, and a `role="status"` fallback message) — the physics/state layer this needs already exists in `useModelInteraction.ts`; what's missing is the UI and the wiring, not the underlying capability.
5. Once built, re-run the exact e2e suite in the attached log and confirm each of the 16 failures resolves — this is a rare case where the acceptance criteria are already written and just need to be satisfied.
6. This is a large enough change that it deserves its own design/estimation pass rather than being folded into the smaller fixes from `plan.md`/`plan2.md` — flag it to whoever owns scope/timeline before starting.

---

## 4. CRLF contamination (H8) has gotten worse, and the new safety nets don't work yet

`plan2.md` recommended adding `.gitattributes` normalization and running `npm run format` once. This round added both `.gitattributes` (`* text=auto eol=lf`, correct content) and a new `.editorconfig` (`end_of_line = lf`, also correct content) — but **both of those files are themselves saved with CRLF line endings**, and the number of CRLF-contaminated files in the repo grew from 4 (Round 2) to 21 (this round, per the attached `format:check` output): `.vscode/settings.json`, `demo.html`, `knip.json`, all four `plan*.md` files, `public/sw.js`, `globals.css`, `glass-card.css`, `ChapterCardShell.tsx`, `ChapterProgress.tsx`, `CyclicChapterStage.tsx`, `ChapterGLTFModel.tsx`, `RegisterSW.tsx`, `SceneContent.tsx`, `ScenePoster.tsx`, `SceneRendererBoundary.tsx`, `portfolio.ts`, `theme.css`, `tailwind.config.ts`.

This confirms definitively that the editing environment producing these commits defaults to CRLF, and that adding config files describing the desired behavior doesn't change what that environment writes to disk — config files are not self-enforcing without either (a) editor support that's actually active, or (b) a pre-commit hook that rewrites files before they're staged. Neither is present (confirmed no `.husky/` directory, no `lint-staged` config in `package.json`).

**Refactor:**
1. Run `npm run format` (which is `prettier . --write`, already configured with `endOfLine: 'lf'`) once, locally, in an environment that will actually save the result as LF, and commit that as its own single, mechanical, no-logic-change commit — this fixes all 21 files (and the 2 new config files) in one shot.
2. Add a pre-commit hook (`husky` + `lint-staged` running `prettier --write` on staged files) so this is enforced automatically rather than depending on every contributor's editor settings. This is the only reliable fix given the evidence that manual discipline isn't working across three rounds of edits.
3. Until #1 and #2 land, `npm run quality` will continue to fail at the first step on this repo regardless of how many of the deeper logic bugs in this document get fixed — it's worth fixing in isolation, immediately, precisely because it's blocking visibility into everything else `quality` checks (lint, typecheck, boundaries, knip, bundle all currently never run in CI because `format:check` exits the chain first).

---

## 5. Other integration issues found this pass

- **Duplicate/competing script surface, resolved but worth a final check:** with `test:visual` and friends removed, confirm no other `package.json` script or CI workflow still references any of the deleted files (`liquid-glass.spec.ts`, `liquid-glass.visual.spec.ts`, `visual.spec.ts`, `/lab/liquid-glass`). A quick `grep -r "liquid-glass" .github .lighthouserc.json package.json` is worth running as a follow-up to §1's fix, in case anything else was missed.
- **`chapterRegistry.ts`'s unrelated color-palette rework** (light `#FDFCF8`-based theme → dark `#05070D`-based theme) landed in the same file and same timeframe as the structural chapter-count question from §3. Worth flagging only so it isn't confused for part of the semantic-backbone fix — it's a pure visual reskin, doesn't touch chapter count or structure, and doesn't need to block or wait on §3's work.
- **`ChapterProgress.tsx` is a genuine, correctly-wired addition** (imported and rendered from `CyclicChapterStage.tsx`, not an orphan) but, per §3, doesn't yet satisfy what `portfolio.spec.ts` checks for it (no `href`s, wrong entry count if the 5-chapter model is adopted). Recommend revisiting it as part of §3's work rather than as a standalone patch, since its correct shape depends on the `cyclicChapterIds` vs `staticRegionIds` split decision.

---

## 6. Updated roadmap

### Phase 0 — Immediate, mechanical, unblocks everything else
1. Fix `.github/workflows/visual.yml` (§1, Job 2) — delete or repoint the `test:visual` step.
2. Run `npm run format` once and commit the line-ending normalization (§4) — this alone should turn `format:check` green.
3. Add a `husky`/`lint-staged` pre-commit hook running `prettier --write` so §4 can't recur.

### Phase 1 — The real work: build the missing semantic/accessible layer (§3)
This is the big one. Recommend scoping and estimating it as its own effort:
1. Decide the 5-vs-7 content model (cyclic chapters vs. static regions).
2. Build the server-rendered `<header>`/`<nav>`/five `<section>`s/publications+contact+credits regions/`<footer>` as real, always-present markup.
3. Layer the existing motion/3D experience on top as enhancement, following the same pattern `SceneClient.tsx` already uses.
4. Build the accessible exhibit-control UI (`role="group"`, rotate buttons, keyboard support, status fallback) on top of the existing `useModelInteraction.ts` physics.
5. Re-run the attached e2e suite and confirm all 16 failures are resolved.

### Phase 2 — Carry-forward items from `plan2.md`, still open
- H1's remaining half: remove or scope `pointer-events-none` correctly once Phase 1's accessible controls exist (the two should land together — building keyboard controls without also restoring pointer/touch drag would be an odd asymmetry).
- H5: implement or remove `getMagneticTarget`'s unused `lastDirection` parameter.
- F8: revisit `chapterRegistry`'s scene-graph fields now that F1/H1's dynamic-import fix means the 3D path is genuinely live for real users.
- F11 remainder: delete `demo.html`.

### Phase 3 — Verification
- Re-run `npm run quality` and `npm run e2e` fresh after Phase 0 and Phase 1 land, and confirm both attached logs' failures are gone rather than assuming it from the diffs.
- Re-check `npm run bundle`'s actual budget numbers now that H1's dynamic-import fix is in place — the structural fix is confirmed correct, but the 350 KB/180 KB budgets themselves haven't been verified against a real build in this audit.

---

## 7. One-line takeaway

Three rounds in, the pattern has shifted from "features that are stubbed or bypassed" to "fixes that are real but incomplete in a specific, findable way" — and this round's CI logs surfaced something underneath both: the test suite has been describing a more complete, more accessible site than the one that's actually been built, since before this audit started, and nobody had run it end-to-end to notice. That's worth treating as the top priority over any individual polish item in this or the prior two documents.
