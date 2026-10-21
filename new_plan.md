# new_plan.md — PP8.1 Rewrite Plan (boilerplate → deployment grade)

Status: living document. Not immutable. Any module, file, helper, surface, or decision listed here may be added/removed/re-scoped when implementation reveals a better shape. When that happens, append to §20 Changelog and continue; do not silently diverge and do not treat this file as the source of truth over `docs/adr/*` — this file is the _execution_ plan, ADRs remain the _decision log_ (update them as decisions harden).

**Direction change (2026-10-18):** exhibits are **ASCII text-based animations**, not GLB/GLTF 3D models. The 3D/WebGL pipeline is removed from the target architecture (no `three`, no R3F, no model pipeline, no Draco, no served GLBs). Exact ASCII animations + code are supplied later by the owner; the boilerplate ships **placeholder animation slots** with the real player/integration contract (§10). See R11/R12 in §2.

---

## 0. How to use this document

1. Read §1–§4 first (current state, retained decisions, principles).
2. Build against §5 (target tree) + §7 (file ledger) + §8 (shared surfaces). Those are the contracts.
3. Execute phases in §13 order. Never start a phase whose upstream contracts are not frozen; never leave a phase half-wired.
4. Anything that would introduce a "mock surface" (a component/data shape that exists only as placeholder and would need refactor later) is forbidden (§13 rules). The only permitted temporaries are typed flags with a named delete-phase, and the ASCII **placeholder source**, which is the real integration surface by design (§10).
5. Update §20 as you learn. Add new files freely if they follow the dependency rules in §4. Re-check §17 (DoD) at the end of every phase.

---

## 1. What this repo currently is (verified understanding)

**Product:** an immersive single-page portfolio for Adhiraj Muduli (biological sciences). One `/` route renders a chrome-free (no header/footer) "_immersive journey_" of 7 chapters — `origins, interests, research, computation, future, publications, contact` — arranged on a closed 3D ring. A single unwrapped numeric "journey" value (`inputUnits` → spring-smoothed `renderUnits`) is driven by wheel/touch/keyboard; DOM cards alternate sides; a R3F `<Canvas>` renders atmosphere + one GLB exhibit per chapter. Secondary routes: `/contact`, `/credits`, `/privacy`; contact POST API with Turnstile/Resend/Upstash abuse controls; health endpoint; standalone Docker + Netlify profiles; heavy CI/quality tooling (vitest, Playwright, Lighthouse, knip, bundle budget, asset audit).

**Factual current state (this snapshot, verified by reading every source file):**

- `src/app/page.tsx` → `ImmersiveStage` (`'use client'`) → `ScenePoster` + `JourneyRuntimeProvider` → `CyclicJourneyController` → `SceneEnhancement` (= `SceneClient`) + `CyclicChapterStage`.
- `SceneClient` computes a WebGL/runtime profile and dynamically imports `Experience`; WebGL is enabled in code.
- `chapterRegistry.ts` = 7 chapters, ring geometry derived from `CHAPTER_COUNT` (7), per-chapter atmosphere + `exhibits` (5 of 7 chapters have 1 GLB exhibit, publications/contact have none).
- Two parallel model-render architectures exist: `src/components/scene/exhibits/ChapterGLTFModel.tsx` (rendered) and `src/components/models/{DNA,DnaAlt,Bacteriophage,HemoglobinRibbon,BrainPointCloud,EarthAnimated}.tsx` (per-model duplicates, hardcoded per chapter, reachable only through `exhibitLoaders.ts` which is `assert`-ed but never used to render). `src/components/models/ChapterGLTFModel.tsx` is a one-line re-export shim.
- `public/models/` = 13 GLBs, ~142 MB total (brain 33.4 MB, earth_animated 23.3 MB, diatom 16.1 MB, tropical plants 16.1 MB, hemoglobin 10.9 MB, forest 12.5 MB, mitochondrion 7.7 MB, earth 8.5 MB, dna 2.7 MB, bacteriophage 0.86 MB, a2a 0.45 MB, ibuprofen 0.25 MB). Git LFS-managed. `dna_animated_alt_for_site.glb` is absent (ADR 0009 intake blocked) and `resolveRuntimeExhibitId` silently falls back to `dna`.
- Known verified defects/perf debt (from code reading, not vibes):
  - `transitionAtmosphereRuntime` allocates ~13 `new THREE.Color/Vector3` **per frame** (`src/lib/atmosphere.ts:82-94`).
  - `SceneContent` mounts every chapter's GLTF for `presence.nearby` (distance ≤ 1) → mount/unmount churn; `<Center>` bbox traversal per mount; all clips `play()` on mount; `castShadow/receiveShadow=true` on every mesh; `useGLTF.preload` set never cleared; preloads continue regardless of chapter/visibility — this is the "artifacts still streaming after models are taken down" class of bug (no cancellation anywhere).
  - `BoundaryBackground` + `Particles` + `Lighting` + post FX update every frame even at dwell; `frameloop="always"`; DPR cap 2 + bloom/CA/vignette on `high`.
  - All 7 chapter cards are permanently mounted; hidden state is `aria-hidden` + `opacity:0` only; each card carries `backdrop-filter: blur(16px) saturate(160%)` + sheen + glow shadows (`glass-card.css`) → compositor cost for 6 invisible surfaces.
  - `ScenePoster` (fallback) renders a boundary gradient + **20 always-animating DOM particles**; `Array.from` per render.
  - Journey input: wheel listener on the fixed controller layer calls `preventDefault()` after a partial scroll-region check; writes `stage.dataset.wheelCount` (test instrumentation) on every wheel event; `finishPointerDrag` references `nearestDwellCenter` which is **not exported** (broken path); magnetic settling exists in `journeyTimeline.getMagneticTarget` but the controller uses a simplified path; wheel constant diverges from tests (tests expect `50/720`, source uses `50/500`).
  - `narrativeStore.setActiveChapter` infers direction from numeric index comparison (wrong across the cyclic seam).
  - Dead code: `SceneRendererBoundary.tsx`, `CursorGlow.tsx`, `getChapterAtProgress`, `setTravelMode`, `getTravelPulse` unused in src, `exhibitLoaders.ts` asserted-only, 6 specialized model components unused, `models/ChapterGLTFModel.tsx` shim.
  - Content/validation coupling: `portfolio.ts` (zod) is imported by client journey/scene code; zod reaches the home graph.
  - `public/sw.js` registers a cache-first service worker (`bio-portfolio-v1`) for all same-origin non-`_next` GETs, incl. `/models/*` — stale-asset ghost behavior; `next.config.js` gives `/models/*` multi-day CDN caching with **unhashed filenames**.
  - Stale tests enforce 5-chapter semantics + old wheel constants + old document chrome → not green (74 passed / 14 failed per `plan4-progress.md`).
  - Tailwind v4 CSS-first in use (`styles/theme.css` `@theme inline`) but `tailwind.config.ts` still holds an obsolete light theme (dead config); `components.json` (shadcn) points to it; error/not-found/global-error/OG/manifest still use light `#FDFCF8` values.
  - `src/app/icon.png` is a 1254² duplicate of the sized icons.

**Superseded by the ASCII direction (kept only for history / archive):** everything GLB — `public/models/*`, Draco decoders, `sceneRuntime` tiers, `gltfRuntime`, material policies, the model budget ADRs, `scripts/*asset*`, `post-deploy-smoke` model check, bundle scene-chunk budget, `no-webgl` Playwright project.

**What must not be lost in the rewrite:** the _feel_ — one continuous journey value, cyclic travel, cards that read like a premium scientific instrument, per-chapter atmosphere shifts, complete content without JS, robust contact pipeline, SEO/PWA metadata, deployment scripts.

---

## 2. Retained product decisions (defaults; flag as re-confirmable)

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                       | Rationale / source                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `/` stays an immersive, chrome-free journey (no header/footer)                                                                                                                                                                                                                                                                                                                                                                                 | latest user direction (`plan4-progress.md`)                                                                                         |
| R2  | 7 chapters incl. `publications` + `contact` remain ring chapters — but **chapter count is data, never a literal**; any N must work (timeline, rail, shortcuts, windows, layout all derive from count)                                                                                                                                                                                                                                          | latest direction + future chapter additions                                                                                         |
| R3  | Semantic content stays real DOM: `#origins`… anchors, `<section>` per chapter, skip-link, `<nav aria-label="Chapter progress">`, publications/contact/credits regions present in the document tree; immersive mode restyles/repositions the same tree                                                                                                                                                                                          | SEO, a11y, no-JS baseline, existing e2e contract                                                                                    |
| R4  | Secondary routes `/contact`, `/credits`, `/privacy` + `/api/contact`, `/api/health` retained with existing security posture and env names                                                                                                                                                                                                                                                                                                      | deployment docs, ADR 0004                                                                                                           |
| R5  | **Exhibits are ASCII text animations** rendered in the DOM. No GLB/GLTF/WebGL in the product                                                                                                                                                                                                                                                                                                                                                   | user direction 2026-10-18                                                                                                           |
| R6  | Boilerplate ships **placeholder ASCII slots** with the real player + source-adapter contract; owner-supplied animation code plugs in later without refactoring the player or layout (§10)                                                                                                                                                                                                                                                      | user direction 2026-10-18                                                                                                           |
| R7  | Keep `motion` for the journey scalar + DOM choreography; keep `zustand` for discrete state; keep `zod` **server/build-only**; remove `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`; **`three` stays only for the Lanyard island** (R11/R15)                                                                                                                                                       | light architecture; lanyard needs three core only                                                                                   |
| R8  | Remove the custom service worker (`public/sw.js` + `RegisterSW`) for the boilerplate; document a revisioned PWA path for later                                                                                                                                                                                                                                                                                                                 | stale-cache class of bugs; offline is not a requirement                                                                             |
| R9  | Chapter count, order, copy, layout side, accents and exhibit metadata are all data (`content/data/*`); code derives everything                                                                                                                                                                                                                                                                                                                 | "hard-coded rather than dynamic" complaint                                                                                          |
| R10 | Content provenance metadata (claim `source` fields) is preserved but stays **authoring-side**; it never ships to the client bundle                                                                                                                                                                                                                                                                                                             | retains audit trail, fixes bundle bloat                                                                                             |
| R11 | App-level WebGL is **gone** (no canvas scene, no route/camera, no postprocessing). The **single sanctioned 3D island** is the ported react-bits Lanyard in the origins slot: lazily imported, self-parking (its own rAF stops when the card rests — verified in upstream source), visibility/reduced-motion gated, and the _only_ module allowed to import `three`                                                                             | owner explicitly requested the lanyard; its source is three-core-only (hand-rolled physics, no fiber/rapier) and already calm-stops |
| R12 | GLB files stay in the repository as **archived sources** under `assets/models/source/` (not served, LFS-tracked); nothing in `public/` and nothing in the runtime references them                                                                                                                                                                                                                                                              | keep provenance, stop paying 142 MB of deploy weight                                                                                |
| R13 | Mono typography is load-bearing (ASCII grids): self-host a metric-stable mono font; sizes/spacing in `ch` units; grid stability is an invariant (§11)                                                                                                                                                                                                                                                                                          | ASCII rendering quality                                                                                                             |
| R14 | **FX / borrowed-component layer** (`ui/fx/`): ports from react-bits & magicui are _owned source_ (MIT, attributed in `/credits` + `docs/assets`), trimmed to our tokens, bound to the shared scheduler, capability-gated. Core set: `Lanyard` (origins slot), `RotatingText` (interests copy), `ProjectSpiral` (research slot), `BlobCursor` (light custom, global). Candidates for later: border beam, dot/grid patterns, marquee, shiny text | owner request 2026-10-18; these libraries distribute source you own                                                                 |
| R15 | **Chapter visual slot** is data-driven per chapter: `visual.kind ∈ {ascii, spiral, lanyard}` rendered into one slot contract. ASCII remains the primary animated medium the owner will supply; spiral/lanyard are fixed component visuals with their own data; every kind falls back to the ASCII placeholder when unavailable                                                                                                                 | avoids parallel visual architectures; one slot, one contract                                                                        |
| R16 | BlobCursor is the **light** version (spring-followed CSS blob, `mix-blend-mode`, transform-only, no WebGL); the react-bits shader blob (WebGL metaballs + RoomEnvironment + shadow maps) is an optional later upgrade behind a flag                                                                                                                                                                                                            | "non-heavy" requirement; the shader cursor is the heaviest cursor possible                                                          |

Open items to re-confirm during P0 are collected in §18.

---

## 3. Problems this rewrite must actually solve (mapped)

### 3.1 Lag / jank (current, verified)

| Cause                                                                                         | Fix (phase)                                                                                                                 |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 7 permanently mounted glass cards with backdrop-filter + shadows for hidden surfaces          | P5: expense gated by `data-card-state`; `content-visibility`; blur only for the visible window; blur off on coarse pointers |
| ScenePoster DOM particles + gradient pulses always animating                                  | P5: static cheap background layer; no DOM particle field; single compositor-safe cross-fade                                 |
| Spring + parallel rAF rest loop + wheel instrumentation writes                                | P3/P4: one settle scheduler driven by the MotionValue change event; remove dataset writes; pure input math                  |
| Per-frame allocations in atmosphere/camera code (all deleted, but the pattern must not recur) | P6: ASCII player + background must have zero per-frame allocations (rule §11.2); no rAF per component                       |
| WebGL canvas + postprocessing + DPR 2 + always-on frame loop                                  | P6/P8: canvas deleted; dependencies removed; nothing renders frames when idle                                               |
| zod + full content in the client graph                                                        | P1: projection module; build/server validation; bundle boundary check script                                                |

### 3.2 ASCII exhibit risks to design against (before animations arrive)

| Risk                                                   | Design answer (phase)                                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Frame strings causing layout thrash / reflow per frame | Fixed-size `<pre>` grid, `contain: strict`, fixed line count + column count validated on first frame; mismatch → dev warning + clip (P6) |
| Per-frame React renders                                | Player writes `textContent` imperatively from one shared rAF scheduler; React renders only on state changes (P6)                         |
| N players each running rAF                             | One scheduler (`runtime/scheduler.ts`), max 2 active players (settled + transitioning) (P6)                                              |
| Long frames / heavy ASCII art budget                   | fps cap per quality tier (24/18/12/0); frame skip if behind; pause when offscreen, hidden tab, reduced motion, user pause (P6)           |
| Monospace metric drift across fonts/zoom               | Self-hosted mono font + `ch`-based sizing + `font-variant-ligatures: none`; grid assert on resize (P5/P6)                                |
| Screen-reader noise from animated text                 | Panel is `role="img"` with a stable label; `aria-live` never; controls in a named group; reduced motion static (P6)                      |
| Placeholder becoming a throwaway scaffold              | Placeholder implements the real `AsciiExhibitSource` interface; user code swaps in via registry only (P6, §10)                           |

### 3.3 Robustness / correctness

- Broken settle path (`nearestDwellCenter` undefined) → P3/P4.
- Direction inferred from index compare → P3 (single atomic publication from decoder).
- `setPaused` doesn't freeze in-flight spring → P3 (pause = `renderUnits.stop()` + snap).
- Wheel/touch stealing card scroll → P4 scroll-region arbitration (`data-scroll-region`).
- `aria-hidden` on hidden cards (a11y) → use `inert` + `visibility` (P5).
- Stale tests → replace with small contract suite (P11, §14).
- Silent fallback behaviors (old DNA-alt fallback class) → structured status publishing for exhibits (§10.6).

### 3.4 Deployment-grade gaps

- ~142 MB of GLBs inside `public/` (served/deployed) → P8: move to `assets/models/source/` (not served); delete `public/draco`; remove model scripts + smoke/bundle references.
- Unhashed asset caching policy assumptions → moot once nothing model-like is served; keep text asset policy clean.
- Light-theme leftovers in error/OG/manifest → P10.
- Tailwind config drift (`tailwind.config.ts`, `components.json`) → P0/P10.
- No frame/network/memory diagnostics → P3 skeleton, P11 invariants.

---

## 4. Architecture principles & the separation of concerns (SoC)

### 4.1 Layers and dependency direction (imports only point downward)

```
L0 config/            flags, env, site constants           (no deps)                 client+server
L1 content/           schemas (zod, server/build)          (zod)                     server/build only
   content/projection serializable client payload          (no zod)                  shared
L2 journey/           pure timeline + topology math        (no react, no DOM)        shared
L3 types/             cross-cutting types (status, frames) (no deps)                  shared
L4 runtime/           capabilities, quality, scheduler, journey runtime, input, stores, diagnostics
                                                           (react, motion, zustand)  client only
L5 ui/                DOM stage, cards, surfaces, sections (react, runtime, journey)  client (server-renderable)
L6 exhibits/          ASCII player, sources, panels, controls (react, runtime)        client only
L6b ui/fx/            borrowed/ported fx: RotatingText, BlobCursor, ProjectSpiral, lanyard/  client only
L7 app/               routes, metadata, api                (everything above)        mixed
```

Hard rules:

- `journey/` never imports `react`, `zustand`, `motion`, DOM APIs, or `content/schemas`.
- `content/schemas` never imported by anything under `ui/`, `runtime/`, `exhibits/`.
- `exhibits/` may import `runtime/`, `journey/`, `types/`, `content/projection`; `ui/` may import `exhibits/` and `ui/fx/`; **`three` may be imported only inside `ui/fx/lanyard/`** (lazy chunk, R11/R15); `@react-three/*` and `postprocessing` are never imported anywhere.
- No `'use client'` in `journey/`, `types/`, `content/projection`.
- Cycle-free: cross-talk goes through `types/` + runtime-owned store instances.

### 4.2 Runtime data vs frame data (the core discipline)

- **Frame data** (units, velocity, card transforms, ASCII frame indices, background cross-fade progress) never enters React state or zustand. Two mechanisms only:
  1. `MotionValue`s for DOM writes (card transform CSS vars).
  2. One shared rAF scheduler (`runtime/scheduler.ts`) with registered tick subscribers (ASCII players; optional future effects). Subscribers mutate DOM directly and allocate nothing per frame.
- **Discrete state** (settled chapter, visible window, direction, travelMode, loopCount, focus token, exhibit availability/error, playback paused flag) lives in zustand with atomic, low-frequency publications.

### 4.3 Config over code (kill the hard-coding)

Every per-chapter/per-device number moves into one of three places, each with a single consumer:

| Data kind                                                                               | Home                                                | Consumer                           |
| --------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| narrative copy                                                                          | `content/data/chapters.ts`                          | UI                                 |
| journey topology (order, ids, count)                                                    | `content/data/journey.ts`                           | everything (via projection/domain) |
| scene/layout per chapter (cardSide, accent, atmosphere, exhibit metadata, panel aspect) | `content/data/scene.ts` (validated)                 | UI + background + exhibits         |
| exhibit sources (labels, descriptions, adapter refs, fps defaults)                      | `content/data/exhibits.ts` + `exhibits/registry.ts` | exhibits                           |
| device budgets                                                                          | `runtime/quality.ts` tables                         | runtime + exhibits                 |

Acceptance for any config field kept: **a changing-field test observes a derived runtime value**; else delete the field.

---

## 5. Target repository structure

```
PP8.1/
├─ assets/
│  ├─ models/source/*.glb               # archived GLBs (LFS, never served, §10.7)
│  └─ fonts/*.woff2                    # source fonts for next/font/local (subset)
├─ docs/
│  ├─ adr/                              # keep; update 0001-0009 as decisions harden
│  ├─ architecture/                     # NEW: system map, layer rules, frame-data contract, ascii contract
│  ├─ assets/                           # provenance, generated inventory
│  └─ ops/                              # deployment, contact runbook, diagnostics guide
├─ public/
│  ├─ fonts/                            # emitted font files if not served by next/font
│  ├─ icons/
│  └─ (no models/, no draco/)
├─ scripts/
│  ├─ quality/                          # check-boundaries, check-frame-allocations, bundle-budget, links, knip wrapper
│  └─ (models/ removed in P8)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx | page.tsx | providers.tsx
│  │  ├─ contact/page.tsx | credits/page.tsx | privacy/page.tsx
│  │  ├─ api/contact/route.ts | api/health/route.ts
│  │  ├─ error.tsx | global-error.tsx | not-found.tsx
│  │  ├─ manifest.ts | robots.ts | sitemap.ts | opengraph-image.tsx
│  │  └─ globals.css
│  ├─ config/
│  │  ├─ flags.ts                       # FEATURES (exhibits, dust, diagnostics)
│  │  ├─ env.ts                         # client-safe env reads + server-only env gate
│  │  └─ site.ts                        # siteUrl/name/description (env-driven)
│  ├─ content/
│  │  ├─ schemas/{common,chapters,journey,scene,exhibits,site}.schema.ts
│  │  ├─ data/{chapters,journey,scene,exhibits,site}.ts
│  │  ├─ validate.ts                    # runs all schemas once; validated content (server)
│  │  ├─ projection.ts                  # buildClientContent() → ClientContent (plain JSON)
│  │  └─ index.ts                       # server-facing re-exports
│  ├─ journey/
│  │  ├─ types.ts                       # JourneySample, JourneyDirection, TravelMode
│  │  ├─ timeline.ts                    # units model, decodeJourney, magnetic target, smootherstep
│  │  ├─ topology.ts                    # ordered ids, count, index maps, cyclic adjacency/window
│  │  └─ invariants.ts                  # dev/test assertions
│  ├─ runtime/
│  │  ├─ capabilities.ts                # snapshot + subscriptions (motion/pointer/save-data/cores)
│  │  ├─ quality.ts                     # tier tables + fps governor for exhibits
│  │  ├─ scheduler.ts                   # one rAF loop + activity tokens + tick subscribers
│  │  ├─ journeyRuntime.tsx             # provider: units, settle, pause, subscriptions
│  │  ├─ input/{coordinator,wheel,touch,keyboard,velocity}.ts
│  │  ├─ stores/{narrative,exhibits}.ts
│  │  └─ diagnostics/{index,overlay,metrics}.tsx
│  ├─ exhibits/                         # ASCII exhibit layer (no three)
│  │  ├─ types.ts                       # AsciiExhibitSource, metadata, playback state
│  │  ├─ registry.ts                    # chapterId → adapter loader; placeholder fallback
│  │  ├─ sources/placeholder.ts         # deterministic placeholder frames
│  │  ├─ sources/index.ts               # (later) owner-provided adapters live here
│  │  ├─ AsciiFramePlayer.tsx           # imperative text writer bound to scheduler
│  │  ├─ AsciiPanel.tsx                 # layout shell, a11y, grid validation, contain
│  │  ├─ AnimationControls.tsx          # play/pause/restart group
│  │  └─ useExhibitPlayback.ts          # active-window + visibility gating logic
│  ├─ ui/
│  │  ├─ stage/{ImmersiveStage,StageDocument,ChapterDeck,ChapterCard,ProgressRail,VisualSlot}.tsx
│  │  ├─ fx/                              # borrowed/ported fx (owned source, MIT-attributed)
│  │  │  ├─ RotatingText.tsx              # react-bits port (motion-only)
│  │  │  ├─ BlobCursor.tsx                # light custom blob (motion), flag/capability-gated
│  │  │  ├─ ProjectSpiral.tsx             # react-bits InfiniteSpiral port: scheduler-bound, text tiles + links
│  │  │  └─ lanyard/Lanyard.tsx           # react-bits Lanyard port (three; the ONLY three import; lazy chunk)
│  │  ├─ background/{StageBackground.tsx, BackgroundDust.tsx}   # CSS gradients (+ optional canvas2D dust)
│  │  ├─ surfaces/{GlassCard,Button,Dialog}.tsx + surfaces.css
│  │  ├─ sections/{ContactSection,ContactForm,TurnstileWidget,PublicationPanel,CreditsPanel}.tsx
│  │  └─ shared/{Icon,SkipLink,VisuallyHidden}.tsx
│  ├─ styles/{tokens,base,typography,ascii,motion,utilities}.css
│  ├─ lib/{cn,damp,invariant,log,events}.ts
│  └─ types/{experience,status}.ts
├─ tests/{unit,e2e}                     # small contract suites (§14)
└─ configs: next.config.js, tsconfig.json, vitest.config.ts, playwright.config.ts, eslint, prettier, knip
```

§8 disposition ledger maps every current file into keep/rewrite/delete/archive.

---

## 6. Shared surfaces (freeze these early; everything else may evolve)

```ts
// types/experience.ts
export type JourneyDirection = -1 | 0 | 1
export type TravelMode = 'dwell' | 'transition'

export interface JourneyFrame {
  units: number                 // renderUnits sample for this frame
  velocity: number
  direction: JourneyDirection
  mode: TravelMode
  currentIndex: number          // dwell: current; transition: incoming
  outgoingIndex: number         // valid during transition, else currentIndex
  incomingIndex: number         // valid during transition, else currentIndex
  travelPulse: number           // sin²(π·transitionT); 0 at dwell
  loopCount: number
  indexFloat: number            // continuous chapter position (card/background choreography)
}

export type ExhibitAvailability = 'placeholder' | 'ready' | 'error'
export type ExhibitPlayback = 'idle' | 'playing' | 'paused' | 'static'   // §10.4

export interface ClientExhibit {
  id: string
  chapterId: string
  label: string                 // control group name, e.g. "DNA"
  description: string           // a11y label for the panel
  fps: number                   // default authored rate
  animated: boolean             // false → placeholder/static only
}
export interface ClientProject {
  title: string
  description: string
  href: string
  external: boolean
}
export interface ClientChapterVisual {
  kind: 'ascii' | 'spiral' | 'lanyard'
}
export interface ClientChapter {
  id: string
  navLabel: string
  eyebrow: string
  title: string
  description: string
  detail: { eyebrow: string; title: string; items: { title: string; description: string; status?: 'active'|'completed'|'experimental' }[] }
  actions: { label: string; href: string; external: boolean }[]
  rotating?: { prefix: string; items: string[] }        // interests copy: "Exploring …" word cycle
  cardSide: 'left' | 'right'
  accent: string                // css color for rail/card glow/ascii tint
  visual: ClientChapterVisual   // which slot component renders opposite the card
  exhibit: ClientExhibit | null  // ascii metadata (present when kind='ascii'; slot may still fall back)
}
export interface ClientContent {
  profile: { name: string; discipline: string; positioning: string }
  chapters: ClientChapter[]     // ordered; count = N
  publications: { eyebrow: string; title: string; description: string }
  contact: { eyebrow: string; title: string; description: string; privacyNotice: string }
  profiles: { label: string; href: string; external: boolean }[]
  projects: ClientProject[]     // spiral tiles in the research slot
  credits: { title: string; description: string; models: {...}[] }   // copy kept; model list → keepsake archive note in P8
}

// exhibits/types.ts — the integration surface the owner's code implements (§10)
export interface AsciiExhibitSource {
  id: string
  /** Nominal authored rate, frames/sec (player caps per quality tier). */
  fps: number
  /** Optional fixed frame set; when present the player indexes it directly. */
  frames?: readonly string[]
  /** Required when `frames` is absent: pure renderer. `index` advances at fps; `elapsedMs` is wall-clock since start. */
  render?: (index: number, elapsedMs: number) => string
  /** Optional row/column count when stable (enables fast validation); inferred from frame 0 otherwise. */
  grid?: { rows: number; cols: number }
  meta?: { label?: string; description?: string }
}

// runtime/journeyRuntime.tsx
export interface JourneyRuntimeApi {
  getUnits(): number
  getVelocity(): number
  getLastInputDirection(): JourneyDirection
  isMoving(): boolean
  isPaused(): boolean
  nudge(deltaUnits: number): void
  navigateToIndex(index: number, opts?: { nearest?: boolean }): void
  navigateToUnits(units: number): void
  jumpToIndex(index: number): void                                      // reduced motion
  setPaused(paused: boolean): void
  subscribeSettle(listener: (info: { index: number; loopCount: number; direction: JourneyDirection }) => void): () => void
  subscribeFrame(listener: (frame: JourneyFrame) => void): () => void   // fires on renderUnits change while moving
  unitsValue: MotionValue<number>                                       // DOM writes only
}

// runtime/quality.ts
export interface QualityProfile {
  tier: 'low' | 'medium' | 'high'
  /** ASCII playback rate cap (0 = static frame only). */
  fpsCap: number                // 12 / 18 / 24 / (0 for static mode)
  dust: number                  // background dust particles (0 = off)
}
```

Frozen interface rules:

- Anything in `JourneyRuntimeApi` may not change shape without bumping every consumer in the same commit.
- `ClientContent` is the _only_ payload crossing server → client stage. If a new client need appears, extend `projection.ts` + schema — never import `content/data` directly into `ui/`.
- `AsciiExhibitSource` may gain optional fields, but existing fields never change meaning; owner-provided code targets exactly this interface (§10).
- Exhibit availability/playback state transitions are published once per change from the player/registry to the `exhibits` store.

---

## 7. File-by-file plan (new tree)

Notation: **P**urpose · **X** exports · **D**eps · **I**nvariants · **↺** revisit-while-coding notes. Files already existing with the same path are marked (keep/rewrite).

### 7.1 config/

- `config/flags.ts` — P: single feature switch surface. X: `FEATURES: { exhibits, dust, diagnostics }` (defaults: `exhibits:false` until owner code lands, `dust:false`, `diagnostics: dev-only`) read from `process.env.NEXT_PUBLIC_FEATURE_*`. D: none. I: frozen object; SSR-safe. ↺ keep names stable; never read flags in `journey/`; delete the legacy `webgl` flag in P6 (it exists only P0–P6 as the old-scene gate).
- `config/env.ts` — P: typed client env (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`) + server env helpers re-exported from old contact `config.ts` logic. D: none. I: `import 'server-only'` in the server half; keep existing env names (R4); contact stays fail-closed. ↺ do not introduce new secret names.
- `config/site.ts` — P: `siteUrl` (env-driven, default stays `https://adhirajmudili.netlify.app` until the owner sets `NEXT_PUBLIC_SITE_URL`), name/description, `siteUrlFor`, `getStructuredData`. D: none. ↺ existing seo e2e asserts the default domain; keep default until deliberately changed everywhere.

### 7.2 content/

- `schemas/common.schema.ts` — claim-source schema (`file`,`location`) retained for provenance.
- `schemas/journey.schema.ts` — `journeyChapterIds` ordered tuple (min 3), unique; no count literal.
- `schemas/chapters.schema.ts` — chapter copy (current shape, trimmed limits); `actions` href rules unchanged; statuses; `cardSide` optional (derived default alternating); optional `rotating: { prefix, items[] }` copy block (interests word cycle; schema enforces ≥2 items when present).
- `schemas/scene.schema.ts` — per-chapter presentation config: `cardSide`, `accent`, `background` palette (3 hex), `visual: { kind: 'ascii'|'spiral'|'lanyard' }`, `panelAspect` (`wide|square|tall`). Validation: finite, palette hex valid, aspect/kind enums. ↺ `kind` selects the slot component (R15); defaults: origins→`lanyard`, research→`spiral`, all others→`ascii`.
- `schemas/exhibits.schema.ts` — per-chapter exhibit metadata: `id, chapter, label, description, fps, animated, sourceKey` (adapter key resolved in `exhibits/registry.ts`). **No credit/attribution fields here** (R10): credits live only in `schemas/site.schema.ts` keyed by asset id; `validate.ts` cross-checks coverage as a _warning_, never an error — runtime availability must not depend on publication credit.
- `schemas/site.schema.ts` — site content (contact/publications/profiles/credits) — current shape preserved; `credits.models` list becomes an **archive/credits note** in P8 (copied text retained for provenance; still rendered on `/credits`).
- `data/journey.ts` — ordered chapter ids: `['origins','interests','research','computation','future','publications','contact']`. Single source for N.
- `data/chapters.ts` — migrate `portfolio.ts` chapter array verbatim (copy is authored/approved; do not rewrite copy unless asked).
- `data/scene.ts` — per-chapter presentation values migrated from `chapterRegistry.ts` (accents, card side, background palette) + new `panelAspect`; per-chapter objects, not index-coupled arrays.
- `data/exhibits.ts` — one entry per chapter that has an exhibit (today: origins, interests, research, computation, future; publications/contact `null`). Placeholder-era values: `label`, `description`, `fps` (12), `animated:false`, `sourceKey:'placeholder'`. ↺ owner code later flips `animated` + `sourceKey`.
- `data/projects.ts` — spiral tiles for the research slot: `{ title, description, href, external }[]`; seed with the owner's real public links (GitHub profile, ORCID record) so the slot is never fake; owner extends with real project repos. Schema: unique hrefs, trimmed strings, min 1 entry.
- `data/site.ts` — migrate `site.ts` content (contact/publications/profiles/credits; credits copy kept) + `portrait` (image path for the lanyard face; placeholder silhouette at `public/images/portrait.svg` until the owner drops a real photo; lanyard front/back use it).
- `validate.ts` — P: run all schemas once at module load; cross-validate: every journey id has chapter content; every scene entry has chapter; exhibit chapters exist; unique ids; N≥3; a chapter with `visual.kind='spiral'` has ≥1 project; `kind='lanyard'` has a portrait; exhibit metadata is allowed for **any** visual kind because lanyard/spiral slots fall back to the ascii panel (§10.8). X: `validatedContent`. I: throws at import time in dev/build; **never imported by client**. ↺ `content:check` runs as a vitest contract test (`tests/unit/content-contract.test.ts`) — no extra dev dependency.
- `projection.ts` — P: `buildClientContent(): ClientContent`; strips provenance/server fields; keeps order; maps exhibits to `ClientExhibit`. I: pure, JSON-safe, no zod import. ↺ the server page passes this into `ImmersiveStage`.

### 7.3 journey/ (pure)

- `timeline.ts` — X: `ENTRY_UNITS=5, DWELL_UNITS=40, EXIT_UNITS=5, SLOT_UNITS=50`, `transitionUnits()`, `cycleUnits(count)`, `positiveModulo`, `smootherstep01`, `decodeJourney(units, count, direction)`, `getDwellCenter(ordinal)`, `getNearestOrdinalForUnits`, `getIndexOrdinal`, `getMagneticTarget(units, velocity, lastDirection, restUnits)`, `getTravelPulse`. D: none. I: pure, allocation-free; unit semantics identical to today (`localUnits ∈ [-5,45)`, dwell center `n*50+25`); count is a parameter (testable for N=3..12). ↺ keep the existing seam math (it was verified good) but parameterized.
- `topology.ts` — X: `journeyChapters` (ordered ids, injected), `chapterCount`, `indexById`, `idByIndex`, `cyclicDistance(a,b)`, `adjacentIndices(i)`, `windowIndices(i, radius)`, `indexForIdOrThrow`. D: `journey/types` only. I: input is a readonly ordered id array; module stays content-free. ↺ replaces `chapterSelectors.getChapterPresence` (fix the linear-distance bug: cyclic min).
- `types.ts` — `JourneySample` (dwell/transition union). Aligned with §6 `JourneyFrame`.
- `invariants.ts` — X: `assertTimelineInvariants(count)` (seam at N, reverse mirror, phase repeat at ±cycle, magnetic hysteresis table), `assertTopology(idList)`. I: dev/test only. ↺ keep existing assertions, parameterize.

### 7.4 runtime/

- `capabilities.ts` — P: one snapshot (`reducedMotion, coarsePointer, saveData, deviceMemory, cores, viewportClass`) computed lazily on client; subscriptions mark dirty and notify. X: `readCapabilities()`, `subscribeCapabilities(cb)`, `useCapabilities()`. I: SSR returns conservative defaults; no rendering/browser probes with side effects. ↺ expose raw values in diagnostics.
- `quality.ts` — P: tier tables per §6 (`fpsCap` 12/18/24; `dust` 0/24/48); `initialTier(capabilities)`; `QualityGovernor` sampling frame durations of the **scheduler** (EWMA + p95 over ~120 frames; downgrade after 45 slow frames with cooldown; upgrade only after 900 stable fast frames). X: `QUALITY_TIERS`, `initialTier`, `createGovernor`, `useQualityTier()`. I: tier changes only alter `fpsCap`/`dust`; never component identity. Hidden document = no sampling. ↺ governor consumes the shared scheduler's frame deltas, not its own loop.
- `scheduler.ts` — P: the single rAF loop for the product: register tick subscribers (`subscribeTick(cb: (deltaMs, nowMs) => void)`), activity tokens (`acquireActivity(kind)`/release), auto-stop when no tokens/listeners, auto-pause on `document.hidden`. X: `subscribeTick`, `acquireActivity`, `isRunning()`, `getFrameCounter()` (diagnostics). I: no allocations per tick in the loop body; tokens idempotent; exactly one rAF while running. ↺ ASCII players + (optional) dust subscribe here; card choreography uses MotionValue change events, not this loop.
- `journeyRuntime.tsx` — P: provider implementing `JourneyRuntimeApi`. Internal: `inputUnits` MotionValue + `renderUnits = useSpring(inputUnits, SPRING)`. **Single tick source for settle: `renderUnits.on('change')`.** No rAF loop: while `moving`, each change compares `|render - input|` and `|renderUnits.getVelocity()|` against `SETTLE_*` epsilons (2 consecutive passes ⇒ settle, publish once). `setPaused(true)` ⇒ `renderUnits.stop()` + `inputUnits.jump(current render value)`. X: context + `useJourneyRuntime()`. I: zero React renders from movement; `subscribeSettle` fires exactly once per arrival; `subscribeFrame` fan-out reuses one record object. ↺ `jumpToIndex` (reduced motion) = `inputUnits.jump(v); renderUnits.jump(v)` + publish settle synchronously. Keep Motion; rewrite only if the pause/settle acceptance test fails.
- `input/wheel.ts` — P: `normalizeWheelDelta(event, viewportH)` + `clampWheelPx` + `UNITS_PER_WHEEL_PX (50/500)`. Pure. ↺ constants live here only; tests assert them (replaces stale `50/720`).
- `input/velocity.ts` — P: sample-window velocity helper. Pure.
- `input/touch.ts` — P: vertical-intent detection + drag units mapping + release velocity. Pure.
- `input/keyboard.ts` — P: key → intent (`next|prev|home|index:n`), editable/dialog guards. Pure.
- `input/coordinator.ts` — P: the only place that attaches listeners. Scope: `wheel` on the stage root (`{passive:false}`; `ctrlKey` bypass; `data-scroll-region` arbitration); `pointerdown/move/up/cancel` for touch/pen with capture; `keydown` on window with guards; `visibilitychange` release. No `dataset` writes in production. Exposes `claimPointerGesture(pointerId, {onMove,onRelease})` (reserved; no current consumer — delete if still unused at P11). I: every listener removed on unmount; disabled when `FEATURES` stage off; all calls go through `JourneyRuntimeApi`. ↺ arbitration must consider `[data-dialog]`/`role=dialog`, `[data-animation-controls]`, `[data-scroll-region]`.
- `stores/narrative.ts` — Fields: `settledChapterId`, `visibleChapterIds`, `focusableChapterId`, `direction`, `travelMode`, `loopCount`, `overlay`, `keyboardFocusToken` + `applySettled(info)`, `applyWindow(indices)`, `setOverlay`, `requestFocus`. I: direction/loop/settled arrive **only** via `applySettled`; window derived from settled + direction; single writer (coordinator). ↺ focus follows incoming after `easedT ≥ .5` (fix the current inversion).
- `stores/exhibits.ts` — Fields: `availability: Record<exhibitId, ExhibitAvailability>`, `playback: Record<exhibitId, ExhibitPlayback>`, `command: { exhibitId; kind: 'toggle'|'restart'; seq } | null`, `dispatchCommand`. I: commands consumed by the player with seq dedupe; availability published once per change. ↺ replaces `sceneInteractionStore`; keeps `data-animation-controls` contract.
- `diagnostics/index.ts` — P: registry + `snapshot()`; `window.__JOURNEY__` only when `FEATURES.diagnostics`. Sources: runtime (units/velocity/mode/loop), exhibits (availability, playback, active count, measured fps), scheduler (running, frame counter), quality (tier/fpsCap). 2 Hz sampling. `metrics.ts`: long-task observer (dev only). ↺ zero production cost; never per-frame React state.
- `diagnostics/overlay.tsx` — dev overlay (fixed corner, mono, dismissible, `data-diagnostics`).

### 7.5 exhibits/ (the ASCII layer; full contract in §10)

- `types.ts` — `AsciiExhibitSource` (§6) + `AsciiGrid` + playback/availability enums.
- `registry.ts` — P: `resolveExhibit(chapterId)` → `{ source, meta }`; resolves `sourceKey` via dynamic import table (`sources/index.ts`); falls back to `placeholder` when the key is missing/`FEATURES.exhibits=false`; publishes availability to the store. I: **never throws**; unknown key → placeholder + diagnostics note. ↺ this is the only file that changes when owner code arrives (add adapter to `sources/index.ts` + set `sourceKey` in data).
- `sources/placeholder.ts` — P: deterministic placeholder generator: boxed chapter title + seeded dot field, fixed grid (e.g., 12 rows × 48 cols), `animated:false`, one static frame; optionally a very slow 2-frame "blink" only when `FEATURES.exhibits=true`. X: `createPlaceholderSource(exhibitMeta)`. I: deterministic across SSR/CSR; no randomness at render time (seeded); stable grid. ↺ keep art minimal; it is a slot, not a design statement.
- `sources/index.ts` — P: adapter table `Record<string, () => Promise<AsciiExhibitSource>>`; empty in boilerplate except `placeholder`. ↺ owner code lands here per chapter.
- `AsciiFramePlayer.tsx` — P: binds a source to the shared scheduler; computes frame index from `fpsCap` (quality) and elapsed; writes `preRef.current.textContent` (no React render); skips frames when behind; freezes on pause/static/dimmed conditions; exposes measured fps to diagnostics. I: ≤1 text write per rAF per player; zero allocations in tick; frames must match `grid` (dev warning + clip on mismatch).
- `AsciiPanel.tsx` — P: layout shell: `<figure role="img" aria-label={description}>` + `<pre>` grid + optional caption; applies `data-ascii-state`, `data-aspect`; `contain: strict`; `content-visibility` when idle; tint via `currentColor`; SSR renders frame 0 (or placeholder frame) so no-JS/SEO show content. I: fixed grid; no `aria-live`; never focusable.
- `AnimationControls.tsx` — P: `role="group"` + `aria-label="<label> animation controls"`; buttons "Play animation"/"Pause animation" (single toggle label swap) + "Restart animation"; keyboard operable; `role="status"` line: available → "Animation playing." / paused → "Animation paused."; unavailable → `Animation controls are unavailable; <chapterId> content remains fully available.` I: real buttons; hidden entirely when the chapter has no exhibit; disabled + explanation when `FEATURES.exhibits=false` or reduced motion. ↺ P11 spec rebuilt from this contract.
- `useExhibitPlayback.ts` — P: derives per-chapter playback: active if `chapterId ∈ visibleChapterIds` and settled/incoming; static if reduced motion or `!FEATURES.exhibits`; paused if user pause; suspended when `document.hidden` or panel offscreen (IntersectionObserver, one observer per active panel). I: max 2 playing players; everything released on chapter change.

### 7.6 ui/

- `stage/ImmersiveStage.tsx` (rewrite) — P: client root consuming `ClientContent`. Providers: `JourneyRuntimeProvider`. Renders `StageBackground` (behind), `StageDocument` → `ChapterDeck` → `ChapterCard` (+ `AsciiPanel` in the exhibit slot), `ProgressRail`, skip-link. Mode from `document.documentElement.dataset.experience` (set pre-paint by the boot script) with React fallback; `data-experience="document|immersive"` on `<html>`, mirrored on `<main>`. I: SSR HTML always the complete document; never two parallel trees. ↺ keep `aria-label` semantics and skip-link (`#origins`).
- `stage/StageDocument.tsx` — P: semantic container; publications/contact are simply their chapter `<section>`s (R2); no chrome (R1). I: identical DOM in both modes (mode only changes CSS + inert/visibility); keep accessible names the tests expect ("Get in touch", "No publications or talks listed", "Model and scientific-source attribution"). ↺ credits region name retained even though models are archived (P8 copy).
- `stage/ChapterDeck.tsx` — P: maps `ClientContent.chapters` → `ChapterCard` (N sections); per-card `data-card-state` from the narrative window (`settled|outgoing|incoming|idle`); per-frame transform vars on the deck root via `subscribeFrame` when immersive. I: card count = N always; expensive CSS only for non-idle states; idle cards `visibility:hidden; content-visibility:hidden; inert`; only the visible card's scroller carries `data-scroll-region`. ↺ mobile: bottom sheet over the panel; desktop: two-column split (card ↔ panel).
- `stage/ChapterCard.tsx` — P: card content (eyebrow/title/description/detail/actions/AnimationControls; contact extras — profiles + privacy/credits links + credits summary — fold in as plain JSX). Renders `GlassCard`. I: `tabIndex=-1` root for focus token; heading `h1` for origins, else `h2`; anchor actions handled by runtime with `pushState`. ↺ keep "Privacy details"/"Credits" link labels (seo contract).
- `stage/ProgressRail.tsx` — P: `<nav aria-label="Chapter progress">`; real anchors; click enhance → `navigateToIndex` + `pushState`; count-agnostic; desktop dots+labels right; mobile compact pill (index/count + label); `aria-keyshortcuts` documents `1..N`. I: works without JS; `aria-current="step"` on active.
- `stage/VisualSlot.tsx` — P: the per-chapter visual dispatcher (R15): reads `visual.kind` + capability/feature gates and renders `AsciiPanel`, `ProjectSpiral`, or the lazy `Lanyard` slot; **every failure path falls back to the ASCII placeholder panel** (e.g., lanyard unsupported on mobile/no-WebGL, spiral with zero projects). I: one slot element per chapter section (inside the section, positioned opposite the card); SSR-safe for all kinds (placeholder text or static spiral fan or static portrait card markup); `data-visual-kind` attribute for CSS/diagnostics. ↺ keep the dispatch table flat and data-driven — no per-kind if-chains outside this file.
- `stage/Poster.tsx` — P: static fallback background (CSS only): 2–3 radial gradients from the chapter palette; **no DOM particles, no SVG filters, no infinite keyframes**; one optional 400 ms opacity cross-fade on chapter change (immersive only). I: deterministic; hidden when the immersive background is active (it is the same layer family — `StageBackground` supersedes it; keep Poster only for document mode/print if needed; otherwise delete in P5).
- `stage/ModelControls.tsx` → **`exhibits/AnimationControls.tsx`** (do not keep the old name/component; old spec dies in P11).
- `background/StageBackground.tsx` — P: per-chapter background: two layered gradient divs cross-faded by the journey frame (`--bg-fade`), plus optional dust canvas. I: compositor-safe (opacity/transform only); no filters on large surfaces; static in reduced motion; no animation when idle (`travelPulse=0` → frozen).
- `background/BackgroundDust.tsx` — P: **optional** single `<canvas>` particle field (≤48 points, 30 fps cap, paused hidden/reduced, no per-frame allocations). Gated by `FEATURES.dust`. ↺ default off; only enable after measuring; canvas2D here is cheap, and it is not WebGL.
- `surfaces/GlassCard.tsx` (rewrite of `glass-card/GlassCard.tsx`) — P: one glass primitive (`div`, padding tokens, `data-glass="on|off"`, optional accent). CSS: single backdrop-filter (cap 14px) gated by `[data-glass="on"]`; `@supports not` fallback; blur disabled for coarse pointer/reduced transparency; no pointer tracking by default. ↺ keep `GlassButton`/`GlassLink`.
- `surfaces/Button.tsx` + `Dialog.tsx` — later polish; `Dialog` only if overlay flows land in P10.
- `sections/*` — keep `ContactForm`/`TurnstileWidget` logic (solid); restyle to tokens; replace inline `bg-[url(svg)]` select arrow with a CSS class. `PublicationPanel`/`CreditsPanel` wrap current content.
- `shared/SkipLink.tsx`, `shared/Icon.tsx`, `shared/VisuallyHidden.tsx` — trivial.

### 7.7 ui/fx/ (borrowed / ported components — owned source, MIT-attributed)

Ports are trimmed to our tokens (`accent`, motion durations, radii), converted to our `cn`, and bound to runtime rules (scheduler, capabilities, flags). Attribution lives in `/credits` ("Open-source component adaptations: React Bits, Magic UI — MIT") and `docs/assets/fx-attributions.md`.

- `fx/RotatingText.tsx` — P: near-verbatim react-bits port (motion-only: `AnimatePresence` + per-char springs; effects slide/flip/blur/scale/drop; `Intl.Segmenter` grapheme split; `sr-only` current text + `MotionConfig reducedMotion="user"`). Used in the interests card: "Exploring → {items}". I: honors reduced motion upstream; no scheduler cost (motion drives it); words from `chapter.rotating`. ↺ trim to the `flip` effect + minimal props to cut dead API surface (keep `texts`, `effect`, `interval`, `stagger`, `mainClassName`); keep the accessible `sr-only` mirror.
- `fx/BlobCursor.tsx` — P: **light custom** blob (R16): one fixed overlay blob, motion-value spring follow, `mix-blend-mode: plus-lighter|difference`, subtle border-radius morph at rest, scale-up on `INTERACTIVE` hover (delegate `pointerover`), hidden until first pointer move; transform/opacity writes only. Gates: fine pointer, no reduced motion, `FEATURES.cursorBlob`, immersive mode only, never on `no-js`. I: zero WebGL, zero filters per frame, one element; removes itself entirely when gated off. ↺ the react-bits shader BlobCursor (WebGL metaballs + PMREM + shadow maps — verified heavy) is a _later optional_ upgrade behind `FEATURES.cursorShader`, not the default.
- `fx/ProjectSpiral.tsx` — P: react-bits InfiniteSpiral port (verified pure DOM/CSS-3D, no three): endless helix of tiles around `translate3d/rotate/scale` computed per tick. Adaptations: (a) tick via `runtime/scheduler.ts` subscription instead of its own rAF; (b) chapter-visibility gating — zero ticks when the research chapter is outside the visible window; (c) tiles are text cards (`ClientProject`: title, description, link) in our mono styling with optional images later; (d) reduced motion → static three-tile fan (no loop); (e) `fpsCap` honored (skip ticks behind schedule); (f) a11y: `role="list"` of real `<a>` tiles + visually-hidden plain list fallback rendered alongside (the animated layer is `aria-hidden`); (g) no per-tick allocations beyond style strings. I: `pauseOnHover` kept; drag intent uses `claimPointerGesture` semantics (pointer events contained to the slot); max tiles rendered = projects count (small, data-driven).
- `fx/lanyard/Lanyard.tsx` — P: react-bits Lanyard port (verified: `three` core only — hand-rolled band+card impulse physics, PMREM environment, foil shader injection, `calm`-based rAF self-park, reduced-motion breeze-off). Adaptations: (a) loaded via `next/dynamic` in `VisualSlot` so `three` lives in its own lazy chunk (the only three import in the codebase, R11); (b) props trimmed: `frontImage` (portrait), `backImage`, `cardColor`, `strapColor`, `gravity/damping/elasticity/breeze` mapped to our tokens; (c) gates: `FEATURES.lanyard` + WebGL support + fine pointer + viewport ≥ md; otherwise `VisualSlot` falls back to a static tilted portrait card (CSS-3D tilt, reduced-motion safe); (d) the island keeps its own self-parking loop (documented exception, §11.1) but must fully stop when offscreen/hidden (IntersectionObserver + visibilitychange retained from upstream); (e) `aria-hidden` canvas + the section's real heading/text carry the semantics. I: never renders during SSR (dynamic ssr:false); disposes all geometries/materials/renderer on unmount (upstream cleanup retained). ↺ upstream source is ~1000 lines — port fully, do not paraphrase; keep its internal scratch-vector discipline (it is allocation-free in its tick).
- `fx/fx.css` — shared fx styling: blob cursor element, spiral tile skin, static portrait fallback card, rotating-text sizing. No filters on large surfaces; `will-change` only on the small cursor element.

### 7.8 app/ + styles/ + lib/

- `app/page.tsx` — server component: `const content = buildClientContent(); return <ImmersiveStage content={content} />`. I: zod stays server (R7).
- `app/layout.tsx` — keep structure; move JSON-LD + metadata to `config/site`; remove `RegisterSW`; add the inline pre-paint boot script (mode attribute); load the self-hosted mono font via `next/font/local` (P5). CSP already allows inline scripts; if tightened later, move the boot script to a hashed file.
- `app/contact|credits|privacy/page.tsx` — keep route paths; restyle + reuse `sections/`.
- `app/api/contact/route.ts` — keep contract; memoize `getContactRuntimeConfig`; centralize outcome logging in `lib/log`.
- `styles/tokens.css` — color/space/radius/shadow/motion tokens (dark biotech; current OKLCH palette as base). `base.css` — resets, mode attributes, skip-link, focus-visible. `typography.css` — type scale + mono font vars. `ascii.css` — the ASCII grid rules: `font-variant-ligatures: none; letter-spacing: 0; line-height: 1.15; white-space: pre; tab-size: 4;` fixed `ch/em` sizing, `contain`. `motion.css` — durations/easings + reduced-motion overrides.
- `lib/cn.ts` (move), `lib/damp.ts`, `lib/invariant.ts`, `lib/log.ts`.

---

## 8. Current-file disposition ledger

**Keep (lightly touched):** `src/lib/contact/*` (add memoization only), `app/api/*`, `app/manifest|robots|sitemap|opengraph-image` (colors fixed P10), `app/privacy|credits|contact` pages (restyle), `src/lib/utils.ts` → `src/lib/cn.ts`, Dockerfile, `.gitattributes` (keep LFS; add `assets/models/source/**` when moving in P8), workflows (verify script references in P0).

**Rewrite in place (same responsibility, new internals):** `ImmersiveStage`, `CyclicJourneyController` → `runtime/input/coordinator.ts`, `ChapterCardShell` → `ui/stage/ChapterCard.tsx`, `CyclicChapterStage` → `ui/stage/ChapterDeck.tsx`, `ChapterProgress` (keep, port), `ModelControls` → `exhibits/AnimationControls.tsx` (new contract), `narrativeStore`/`sceneInteractionStore` → `runtime/stores/*`, `journeyTimeline`/`chapterSelectors`/`chapters`/`chapterRegistry` → `journey/*` + `content/data/*`, `useChapter|useChapterPresence` → runtime hooks, `glass-card/*` → `ui/surfaces/*`, `globals.css`+`styles/*` → new style files, `ChapterDetail`/`ChapterSupplement` → folded into `ChapterCard`.

**Delete at end-of-P6 wave (all 3D/legacy):** `components/scene/**` (all files: Experience, SceneClient, SceneContent, SceneEnhancement, ScenePoster, AtmosphereContext/Controller, BoundaryBackground, Lighting, exhibitLoaders, modelPreload, SceneErrorBoundary, SceneRendererBoundary, exhibits/ChapterGLTFModel), `components/models/**` (all 8), `components/effects/**`, `components/motion/*` (controller/rig), `components/narrative/ChapterDetail`, `components/journey/*` old files, `components/ui/CursorGlow`, `RegisterSW`, `hooks/*` old files, `lib/{atmosphere,chapterRegistry,chapters,chapterSelectors,closedRoute,closedRouteCurves,gltfRuntime,materials,modelInteraction,sceneRuntime,journeyTimeline,journeyRuntime→new}.ts`, `lib/siteMetadata.ts` (→ config/site), `stores/*` old, `public/sw.js`.

**Archive/move in P8:** `public/models/*.glb` → `assets/models/source/`; `public/draco/*` deleted; `docs/assets/*` regenerated as archive inventory; credits copy retained on `/credits`; `scripts/{audit-scene-assets,optimize-scene-asset,verify-model-assets,inspect-glb}.mjs` deleted; `next.config.js` `/models` cache rule deleted; `scripts/post-deploy-smoke.mjs` model check deleted; `check-bundle-budget.mjs` scene chunk requirement deleted (replaced by "no three bytes + initial route ≤ budget").

**Config cleanup:** delete `tailwind.config.ts` + `components.json` after Tailwind v4 CSS-first verification (P0/P10), `src/app/icon.png` duplicate (P0), stale logs (P0); move old plans/trees to `docs/history/` (P11).

---

## 9. Cross-cutting conventions, script surface, and future files

### 9.1 Naming & code conventions

- Files: `camelCase.ts` modules, `PascalCase.tsx` components, `*.schema.ts`/`*.data.ts` suffixes. One default export per component; named exports for utilities.
- Props typed as `XProps`; no `any`; no non-null assertions in frame/tick paths.
- State: zustand selectors select primitives or use `useShallow`; never inline object literals.
- CSS: global stylesheet + BEM-ish classes; state via `data-*`; no inline `style` except CSS-variable writes (frame-driven).
- Errors: fallible boundaries publish a status + human message; never throw inside a tick/`useFrame`; boundaries wrap stage and routes.
- Server/client: `import 'server-only'` with zod/server env; `'use client'` only at boundary files; never in `journey/` or `content/`.
- Logging: `lib/log.ts` `logEvent(event, fields)` — one JSON line server; dev-only console client; no personal data.
- Comments: invariants/why only; do not port stale comments.

### 9.2 npm script surface (target)

| Script                                     | Command                                                                                                                                      | Phase |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `dev/build/start`                          | unchanged (+ `start:standalone`, `prepare:standalone`, `deploy:smoke`)                                                                       | —     |
| `lint` `format` `format:check` `typecheck` | unchanged                                                                                                                                    | —     |
| `content:check`                            | `tsx src/content/check.ts` (add `tsx` devDep)                                                                                                | P1    |
| `unit`                                     | `vitest run`                                                                                                                                 | —     |
| `boundaries`                               | `node scripts/quality/check-boundaries.mjs` (replaces old)                                                                                   | P0/P1 |
| `frame-alloc`                              | `node scripts/quality/check-frame-allocations.mjs` (tick bodies, exhibits/runtime)                                                           | P6    |
| `links:check`                              | moved under `scripts/quality/`                                                                                                               | P1    |
| `bundle`                                   | `npm run build && node scripts/quality/check-bundle-budget.mjs` (budget + "three only in lanyard chunk; zero @react-three/*/postprocessing") | P6/P8 |
| `knip` `security` `licenses:inventory`     | unchanged                                                                                                                                    | —     |
| `e2e`                                      | trimmed specs per §14                                                                                                                        | P11   |
| `quality`                                  | `format:check && lint && typecheck && boundaries && content:check && links:check && unit && knip && frame-alloc && bundle`                   | P11   |
| `lighthouse:ci`                            | unchanged (budgets re-tuned P10)                                                                                                             | —     |

### 9.3 Tooling decisions

- Add `tsx` (devDep) for TS-invoking node scripts.
- Optional (P0): `husky` + `lint-staged` → `prettier --write` on staged files (CRLF contamination must not recur; CI `format:check` is the backstop).
- Keep warnings-as-errors; knip stays suppression-free after P11; `knip.json` ignores are temporary debt.
- Playwright projects: `desktop`, `mobile`, `reduced-motion`, **`no-js`** (replaces `no-webgl`; JS disabled via context). Drop visual snapshot projects.
- Vitest: forks + jsdom; coverage scope narrows to `journey/`, `runtime/input`, `runtime/scheduler`, `content/projection`, `exhibits/player` logic.

### 9.4 Potential future files (not yet planned, add if needed)

- `exhibits/sources/<chapter>.ts` — owner-provided animation adapters (P9).
- `exhibits/sources/README.md` — adapter authoring notes (grid rules, fps, determinism).
- `ui/surfaces/Dialog.tsx` if secondary content moves into dialogs.
- `scripts/quality/check-a11y-tree.mjs` if axe e2e proves flaky.
- `src/app/loading.tsx` only if a real async route boundary appears.
- `docs/architecture/frame-data.md` once §4.2 grows.
- `ui/fx/ShaderBlobCursor.tsx` — optional react-bits WebGL cursor upgrade (flag-gated, off).
- `docs/assets/fx-attributions.md` — upstream sources + commit SHAs for every ported fx component.

---

## 10. ASCII exhibit layer (the integration contract)

### 10.1 What exists now vs later

- **Now (boilerplate):** per-chapter exhibit _slots_ render the placeholder source (deterministic static ASCII art, fixed grid) inside the real player + real controls + real a11y semantics. The layout, goldens, and state machine are final; only the art is provisional.
- **Later (owner code):** each chapter's adapter is added to `exhibits/sources/index.ts`, `sourceKey`/`animated` are set in `content/data/exhibits.ts`, and `FEATURES.exhibits` flips on. No player/layout/spec changes — only data + adapter files (§13 P9).

### 10.2 `AsciiExhibitSource` (the only thing owner code must implement)

```ts
export interface AsciiExhibitSource {
  id: string
  fps: number
  frames?: readonly string[] // static/precomputed sets
  render?: (index: number, elapsedMs: number) => string // generative
  grid?: { rows: number; cols: number }
  meta?: { label?: string; description?: string }
}
```

Rules for sources (validate at integration; dev warnings otherwise):

1. Deterministic: same `index` ⇒ same frame; no `Math.random()`/`Date.now()` inside frame composition (seeded noise allowed).
2. Stable grid: every frame must have `grid.rows` lines and `grid.cols` columns (pad with spaces). Player validates frame 0 → `grid`, then asserts on each new frame in dev; mismatch clips to grid and logs once.
3. Printable ASCII + spaces only (plus box-drawing if the owner wants; the font must cover it — check in P6).
4. Reasonable size: hard cap 80 cols × 40 rows per frame (player enforces via CSS clip + dev warning).
5. No side effects; pure functions; may be dynamically imported.

### 10.3 Player contract

- `AsciiFramePlayer` subscribes to `runtime/scheduler.ts` (one rAF for the whole app).
- Effective rate = `min(source.fps, qualityProfile.fpsCap)`; `fpsCap=0` (static mode) ⇒ render frame 0 once, never tick.
- If a tick arrives late, drop frames (advance index by elapsed × fps, not +1).
- Writes `pre.textContent` at most once per rAF; never touches React state; measured fps exposed to diagnostics.
- Suspension rules (all imply "no tick work, no text writes"): chapter not in the visible window; `document.hidden`; panel offscreen (IntersectionObserver); user paused; reduced motion; `FEATURES.exhibits=false`.
- On chapter change: outgoing player freezes at its current frame; incoming starts at frame 0 (deterministic).

### 10.4 Playback state machine (per exhibit)

```
disabled  (no exhibit / FEATURES.exhibits=false / reduced motion)
   │ enable
   ▼
idle ──visible window──▶ playing ⇄ paused ──chapter leaves window──▶ idle (frozen frame kept)
   └── error (source failed to load/validate) ──▶ placeholder frame + status
```

- `ExhibitPlayback` (published to store): `idle | playing | paused | static`.
- `ExhibitAvailability`: `placeholder | ready | error`.
- Transitions published once per change; diagnostics reads snapshot at 2 Hz.

### 10.5 Accessibility

- Panel: `<figure role="img" aria-label={description}>`; the `<pre>` is `aria-hidden` (avoid SR reading art); description comes from `ClientExhibit.description` (authored) with a fallback "ASCII animation for <chapter title>".
- No `aria-live` on frames. Controls group: `<label> animation controls` with real buttons; status line pattern per §7.5. Reduced motion: static frame + controls disabled with explanation.
- Keyboard: controls are in tab order only when the chapter is visible (others `inert`).

### 10.6 Failure handling

| Condition                          | Behavior                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `FEATURES.exhibits=false`          | placeholder art, controls disabled, status explains                            |
| source import fails / invalid grid | `error` availability; placeholder frame shown; dev log once; controls disabled |
| reduced motion                     | static frame 0; controls disabled with explanation                             |
| no JS                              | SSR renders frame 0 / placeholder art (server-renderable, deterministic)       |

### 10.7 Asset archive (GLBs)

- `assets/models/source/*.glb` (LFS) + `docs/assets/model-inventory.generated.json` + existing provenance docs remain as history.
- `/credits` keeps the attribution copy (rewritten as "archived assets / prior exploration" in P10 copy pass — do not silently delete credits).
- Nothing under `public/` references them; no runtime code imports them; `next.config.js` model cache rule and smoke/bundle references removed in P8.

### 10.8 Chapter visual slot (kinds + fallbacks, R15)

One slot per chapter section (`ui/stage/VisualSlot.tsx`), driven by `content/data/scene.ts`:

| kind      | Renders                                    | Active when                                        | Fallback (always ASCII placeholder) when                 |
| --------- | ------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------- |
| `ascii`   | `AsciiPanel` + player/controls (§10)       | always (default medium)                            | n/a — it _is_ the fallback                               |
| `spiral`  | `ProjectSpiral` tiles over `ClientProject` | research chapter in visible window; scheduler tick | reduced motion → static fan; zero projects → placeholder |
| `lanyard` | lazy `Lanyard` island (three chunk)        | `FEATURES.lanyard` + WebGL + fine pointer + ≥md    | any gate fails → static tilted portrait card (CSS 3D)    |

Slot contract (all kinds): render inside the section opposite the card; SSR-safe static representation; respect `active/reduced/tier` inputs; publish nothing to stores except exhibit availability for the ascii kind; never block the journey input; never mount more than the visible-window slots' heavy parts (lanyard/spiral mount only when their chapter is settled or transitioning).

---

## 11. Performance invariants

### 11.1 Scheduling & idle behavior

- Exactly **one app-level** rAF loop (`runtime/scheduler.ts`); it runs only while at least one tick subscriber is active (playing ASCII player, spiral, optional dust) and the document is visible. The lanyard island (R11) is the single sanctioned exception: its own self-parking loop stops when the card is at rest, offscreen, or the tab is hidden — verified in the upstream source.
- Rest state (dwell, paused, reduced motion, no dust): zero rAF ticks; no CSS infinite animations on full-screen layers.
- Quality governor samples only while the scheduler runs.

### 11.2 Zero-allocation rule (tick paths)

- No object/array literals, spreads, or `new` inside `subscribeTick` callbacks and the scheduler loop (allowlist comment `// tick-alloc-ok: <reason>`).
- Players precompute their frame index math from scalars; frame strings come from the source (owner code) or are cached.
- `scripts/quality/check-frame-allocations.mjs` enforces this in `exhibits/` + `runtime/scheduler.ts`; wired into `quality` at P6.

### 11.3 DOM/text invariants

1. Card roots = N always; exactly one `data-card-state="settled"`, ≤2 in `{outgoing,incoming}`.
2. Expensive glass CSS only for non-idle cards (verified via computed style / DevTools paint check).
3. ≤2 playing ASCII players at any time; every player releases its tick subscription when it stops.
4. ASCII grid stable per exhibit (rows/cols constant; no reflow between frames — verified by a layout-shift check in dev overlay).
5. `document.hidden` ⇒ scheduler stops; no background work.
6. No infinite CSS animations on full-screen layers; background cross-fade is a finite transition.
7. Total initial-route JS stays within the §9.2 budget; `@react-three/*` and `postprocessing` appear in **zero** chunks; `three` appears **only** inside the lazy lanyard chunk (asserted by the bundle check after P6/P8).
8. FX components subscribe to the shared scheduler (spiral) or motion springs (rotating text, cursor blob); none runs while its chapter is outside the visible window; the cursor blob writes transforms/opacity only (no per-frame filters).

### 11.4 Network policy

- No model/asset fetches at runtime beyond code chunks, fonts, icons.
- Keep `no-store` APIs, security headers, immutable `_next` caching.
- Fonts self-hosted (no external origins) — keeps CSP tight and removes third-party font loading.

---

## 12. UI/UX plan (boilerplate now; refine in P10)

### 12.1 Experience model

- **Document mode (default, SSR, no JS):** readable vertical document — all chapters as sections (each with its ASCII panel slot + static placeholder), publications/contact regions, anchors. Fully styled.
- **Immersive mode (JS):** same DOM; stage fixed; cards become overlays; the ASCII panel sits on the half opposite the card; background cross-fades per chapter; rail on the right. Mode switch = `data-experience` attribute + CSS, set **before first paint** by a tiny inline boot script (cheap signals only: reduced-motion, save-data, pointer); React initializes from it (no flash, no hydration mismatch).

### 12.2 Layout

```
z-0   StageBackground (gradients; optional dust)
z-10  ASCII panel layer (per-chapter panels, only visible window shown)
z-20  Card layers (deck)
z-30  Progress rail / hint chip
z-40  Animation controls (inside card flow)
z-50  Dialogs / skip link
```

- Desktop: two-column stage split — card on one side (alternating per chapter `cardSide`), ASCII panel on the other (`panelAspect` aware), both vertically centered with a shared accent glow.
- Mobile: ASCII panel occupies the upper ~45% as backdrop; card is a bottom sheet (scrollable, `data-scroll-region`); rail collapses to the compact pill.
- Placeholder panel design: boxed chapter title + seeded dot field, tinted by `accent`, with a small `data-placeholder` caption "animation pending" only in dev (production shows the art without apologizing).

### 12.3 Card choreography (frame-driven, no React renders)

`subscribeFrame` writes CSS vars on the deck root (`--card-in-x`, `--card-out-x`, `--card-fade`, `--bg-fade`) from `indexFloat`/`travelPulse`; cards/background consume them in CSS. Reduced motion: vars snap (no transitions). Only outgoing/incoming cards receive non-zero transforms.

### 12.4 Component states (must exist for every surface)

`placeholder`, `playing`, `paused`, `static`, `error` (exhibit); `loading`, `ready`, `offline` (contact); each with visible text, never silent.

### 12.5 A11y & input UX

- Focus: skip-link; rail links tabbable; hidden cards `inert` + `visibility:hidden`; focus token only on explicit keyboard nav.
- Announcements: rail mobile pill `aria-live=polite`; controls status line.
- Input: ctrl+wheel = browser zoom; card scroll wins until boundary; keymap arrows/PgUp/PgDn/Space/Home + `1..N`; Esc closes dialogs.
- Reduced motion: instant `jumpToIndex`, static ASCII frame, no background motion, no card flight.

### 12.6 Design tokens direction (P10 detail)

Dark biological-instrument language: near-black base (`#05070D`), per-chapter accent (existing palettes), warm neutrals, the mono font for everything (ASCII identity), 1px glass borders, restrained glow, ASCII tinting via `currentColor` + subtle text-shadow only on the active panel. Re-tone OG/manifest/error art to match.

### 12.7 FX placement map (R14)

| Surface             | Component                                     | Placement                                         | Gates                                                                 |
| ------------------- | --------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| origins slot        | Lanyard island                                | slot opposite the card; portrait + name + role    | `FEATURES.lanyard`, WebGL, fine pointer, ≥md; else static tilted card |
| interests card copy | RotatingText                                  | inline line: "Exploring → {word cycle}"           | data presence; motion's own reduced-motion handling                   |
| research slot       | ProjectSpiral                                 | helix of project tiles (title/description/links)  | visible window; reduced motion → static fan                           |
| global (immersive)  | BlobCursor                                    | fixed overlay, spring-followed, blend-mode accent | `FEATURES.cursorBlob`, fine pointer, not reduced motion               |
| later candidates    | border beam / patterns / marquee / shiny text | polish phase only, one at a time, measured        | each gated individually                                               |

---

## 13. Phase-by-phase execution plan

Rules for every phase: the app must build and run at the end of the phase; **no mock surfaces** — the only permitted temporaries are typed flags with a named delete-phase and the placeholder source (which is the real integration surface, §10); delete only what the phase replaced (tsc typechecks every file under `src/`, so deletions must be consistent across importers); append phase notes to §20.

### P0 — Guardrails, flags, and immediate hygiene (small, mechanical)

Deliverables: `config/flags.ts`, `config/env.ts`, `config/site.ts`; remove SW registration + `public/sw.js`; delete `src/app/icon.png`; delete stale logs (`lighthouse-server*.log`, `artifacts-format.log`); update `.env.example` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_FEATURE_EXHIBITS=false`); run Prettier once (LF normalization); verify the four workflows (`e2e`, `lighthouse`, `quality`, `security` — `visual.yml` already deleted) invoke only existing scripts; delete `tailwind.config.ts`+`components.json` after Tailwind v4 CSS-first verification (else defer P10); add `scripts/quality/check-boundaries.mjs` v2 (layer rules §4.1, plus the "no three imports anywhere" rule as a forward guard); add the temporary legacy gate in the **current** `ImmersiveStage` (`FEATURES.webgl`-style boolean, renamed `legacyScene`, default false) so the old 3D scene is frozen during P1–P6 and deleted in P6; optional `husky`+`lint-staged` (§9.3).
Verify: build green; lint/typecheck/format green; no SW in devtools; legacy scene off.
Out of scope: any component rewrite.

### P1 — Content & projection

Deliverables: `content/schemas/*`, `content/data/*` (copy + presentation config + exhibit metadata), `content/validate.ts`, `content/projection.ts`, `content/check.ts`; `app/page.tsx` builds `ClientContent` and passes it to the (still-current) `ImmersiveStage`; redirect `app/contact|credits|privacy` + `sections/*` imports to `content/index.ts` (import-path change only); update `scripts/quality/check-public-links.mjs` roots.
Verify: `content:check` green; projection unit test; zod absent from client chunks.
Out of scope: UI/behavior; old content files stay until the end-of-P5 wave.

### P2 — Journey domain rewrite (pure)

Deliverables: `journey/timeline.ts`, `topology.ts`, `invariants.ts`, `types.ts`; port + parameterize tests (seam N, reverse, magnetic, phase).
Verify: unit green; invariants N=3..12; boundary script (no react/three/DOM imports).
Out of scope: runtime/UI. ⚠ Do not delete old lib modules yet — old scene/controller still import them; single deletion wave after P6.

### P3 — Runtime kernel

Deliverables: `runtime/capabilities.ts`, `quality.ts`, `scheduler.ts`, `journeyRuntime.tsx`, `stores/narrative.ts`, `stores/exhibits.ts`, `diagnostics/*` skeleton; switch the old controller internals to the new runtime without changing its surface; keep the old controller file until P4.
Verify: settle semantics per spec; pause freezes movement; atomic publications; scheduler stops when idle (diagnostics frame counter).
Out of scope: input listener rewrite, UI.

### P4 — Input coordinator

Deliverables: `runtime/input/*`; replace `CyclicJourneyController.tsx` wiring with `coordinator.ts`; remove `nearestDwellCenter` bug; remove `dataset.wheelCount`; scroll arbitration + touch intent + keyboard guards; pure-helper unit tests; reduced motion → `jumpToIndex`.
Verify: wheel/touch/keyboard/card-scroll/reduced-motion contract tests; manual browser pass on the current UI.
Out of scope: DOM layout.

### P5 — DOM stage on the new data (the visible rewrite)

Deliverables: `ui/stage/*` (ImmersiveStage, StageDocument, ChapterDeck, ChapterCard, ProgressRail, VisualSlot), `ui/surfaces/*`, `ui/fx/RotatingText.tsx` + `ui/fx/BlobCursor.tsx` (light version), `ui/background/StageBackground.tsx`, `exhibits/AsciiPanel.tsx` **placeholder-only shell** (grid + a11y + caption; player arrives P6 — panel renders the placeholder frame statically, no engine), font setup (`next/font/local` mono + fallback metrics), pre-paint mode boot script, `styles/*` incl. `ascii.css` + `fx.css`; wire `ClientContent` end-to-end (incl. `rotating` copy + `projects`); card state/expense gating; `data-scroll-region`.
Delete (this phase only): old stage files (`ChapterCardShell`, `CyclicChapterStage`, `ChapterDetail`, `ChapterSupplement`, `glass-card/*`, old `ScenePoster`, `narrative`/`sceneInteraction` stores if fully replaced, old stage hooks), old `content/portfolio.ts` + `content/site.ts` (importers redirected).
Verify: document mode with JS disabled (placeholder panels visible, deterministic); immersive mode; anchors; rail; card windows; reduced motion; axe on `/`; card-root count = N; blur only on non-idle cards; no flash on reload (throttled CPU).
Out of scope: the player (P6). Legacy scene stays gated off (files still compilable).

### P6 — ASCII player, controls, and background motion

Deliverables: `exhibits/types.ts`, `registry.ts`, `sources/placeholder.ts`, `sources/index.ts`, `AsciiFramePlayer.tsx`, `AnimationControls.tsx`, `useExhibitPlayback.ts`; player binds to `runtime/scheduler.ts`; quality `fpsCap` wiring; `ui/fx/ProjectSpiral.tsx` (scheduler-bound port) + `ui/fx/lanyard/Lanyard.tsx` (full react-bits port, `next/dynamic` chunk) wired through `VisualSlot`; `ui/background/BackgroundDust.tsx` (flag-gated, default off); `scripts/quality/check-frame-allocations.mjs` + `bundle` update; **delete the legacy 3D wave** (list in §8) + the P0 `legacyScene` gate; update `check-bundle-budget.mjs` (remove the scene-chunk requirement; budgets: initial route + "`three` only in the lazy lanyard chunk" + zero `@react-three/*`/`postprocessing` bytes).
Verify: placeholder animates at capped fps when `FEATURES.exhibits=true` (flip locally), static when false/reduced; ≤2 players running; zero ticks when idle; no per-frame allocations (script); controls contract (labels/status/disabled); a11y (panel `role="img"`, controls group); no three in any chunk; card/glass invariants hold.
Out of scope: owner animation content; dust tuning.

### P7 — Placeholder mode hardening (boilerplate completion gate)

Deliverables: fix everything found while verifying P5/P6 across the 4 Playwright projects; write `docs/architecture/system-map.md` + `docs/architecture/ascii-contract.md` (grid rules, adapter authoring, states); rebuild trimmed e2e (`boot`, `journey`, `exhibits`, `contact`, `a11y`, `seo`); update diagnostics overlay fields for exhibits/scheduler; measure Lighthouse and tune (fonts, LCP element = card title or panel).
Verify: full `quality` chain green; e2e green; Lighthouse ≥ target on desktop; heap Δ ≤ 6 MiB across two journey cycles; zero long tasks ≥ 50 ms in the test window (adapted from the old performance spec).
Out of scope: owner code; UI polish.

### P8 — Archive GLB assets & remove 3D tooling

Deliverables: move `public/models/*.glb` → `assets/models/source/`; delete `public/draco/`; regenerate `docs/assets/*` inventory (archive note); delete `scripts/*asset*.mjs` + `inspect-glb.mjs`; remove `/models` cache rule from `next.config.js`; remove model check from `post-deploy-smoke.mjs`; remove `@gltf-transform/cli` devDep; delete unused model-related knip ignores; `.gitattributes` LFS path update; `/credits` copy pass scheduled for P10 (content there is copy, not runtime).
Verify: `asset` scripts gone from `package.json`; no `/models` references in `src/` or scripts (grep gate); `npm ci` install size down / no three in lockfile (after P9-ish dep removal below).
Out of scope: removing three deps (do it in P9 with the final code sweep once nothing imports them).

### P9 — 3D dependency removal + ASCII integration (owner-triggered)

Phase split:

- **P9a (code sweep):** after the deletion wave has proven stable for a pass, remove `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing` from `package.json` + lockfile; **keep `three`** (lanyard island only, R11); run full quality; bundle check asserts no `@react-three/*`/`postprocessing` anywhere and `three` confined to the lanyard chunk.
- **P9b (owner animations):** add `exhibits/sources/<chapter>.ts` adapters implementing `AsciiExhibitSource`; set `sourceKey`/`animated`/`fps` in `content/data/exhibits.ts`; flip `FEATURES.exhibits`; validate grid/determinism/size; tune per-chapter tint/aspect; capture final states; update `/credits` (ASCII authorship note if the owner wants one).
  Verify (P9b): every chapter's real animation plays within caps; static frame under reduced motion; no layout shift between frames; ≤2 players; screenshots per chapter; heap/heap-delta stable across loops.

### P10 — UI/UX polish & secondary surfaces

Deliverables: card depth choreography, rail polish, background cross-fade tuning, panel typography/glow refinement, contact/credits/privacy restyle, error/not-found/OG/manifest re-tone, dialog/overlay decisions, mobile pass, forced-colors/reduced-transparency audit, OG image using ASCII motif.
Verify: visual walkthrough desktop/mobile/reduced-motion/no-JS; axe all routes; Lighthouse target.

### P11 — Hardening, diagnostics invariants, docs, historical cleanup

Deliverables: enforce `frame-alloc` in `quality`; diagnostics invariant e2e (card/exhibit/scheduler counts); budgets finalized (initial JS, zero three bytes, heap, long tasks); delete remaining dead files; move old plans/trees to `docs/history/`; rewrite ADRs (0001 → superseded: no persistent canvas; 0005/0006/0009 → superseded by ASCII direction; new ADR 0010 "ASCII exhibit medium", ADR 0011 "DOM-only architecture"); update `docs/ops/deployment.md`; ensure `npm run quality` + e2e green; run smoke.
Verify: full `quality` + e2e + bundle + smoke on a local standalone build; install with `npm ci` from lockfile.

---

## 14. Testing strategy (minimal, contract-focused)

- **Unit (vitest):** `journey/timeline` (seam N, reverse, magnetic table, ranges), `topology` (cyclic adjacency/window), capability/quality tables, wheel/touch/keyboard helpers, projection schema match, **ASCII grid validator** (rows/cols/determinism), scheduler token logic.
- **Component (RTL, sparing):** coordinator arbitration (card scroll vs journey), narrative store atomicity, `AnimationControls` states, `AsciiFramePlayer` frame cadence with a fake clock.
- **E2E (Playwright: desktop, mobile, reduced-motion, no-js):**
  - `boot.spec.ts`: no-JS project — all N sections + anchors + skip-link + placeholder panel frame present; immersive boots without console errors.
  - `journey.spec.ts`: wheel → settle next; reverse; rail click; keyboard; reduced-motion instant wrap; card scroll doesn't navigate until boundary.
  - `exhibits.spec.ts`: placeholder panel `role="img"` present per chapter; controls group names; disabled states when `FEATURES.exhibits=false`; reduced-motion static; (later) fps cap honored, ≤2 playing.
  - `contact.spec.ts`, `a11y.spec.ts`, `seo.spec.ts`: keep/update.
  - `hygiene.spec.ts`: zero `.glb`/`/models/` requests on any route; no `three` chunk (via bundle check, not e2e).
- Delete at P7/P11: `visual.spec.ts`, `liquid-glass*.spec.ts` + snapshots, old `portfolio.spec.ts`, `model-interaction.spec.ts`, `scene-resilience.spec.ts`, `performance.spec.ts` (replace with the heap/long-task assertions in `journey.spec.ts`/P7 gate).
- **CI:** quality chain (§9.2) + e2e + security + lighthouse. Fix stale workflow references in P0.

---

## 15. Deployment & ops

- Keep `output:'standalone'`, Dockerfile, CSP/security headers, `deploy:smoke`, Netlify profile.
- Cache policy: HTML/api `no-store`; `_next` immutable; no SW; fonts long-cached (content-hashed by `next/font`).
- Health endpoint unchanged (`contact: configured|unavailable|disabled`).
- Contact runbook unchanged (fail-closed, env-gated, no message retention).
- Add `docs/ops/diagnostics.md` (dev overlay + `window.__JOURNEY__`) and `docs/ops/performance.md` (invariants + how to trace).
- Budgets: initial route JS gzip ≤ 180 KB (re-measure, likely lower after dep removal); zero `three` bytes; heap Δ ≤ 6 MiB over 2 cycles; zero long tasks ≥ 50 ms in the test window.

---

## 16. Risks & mitigations

| Risk                                                      | Mitigation                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Motion `useSpring` semantics vs settle/pause requirements | Keep acceptance tests for pause/settle; fall back to a tiny integrator only if they fail; decide in P3 |
| ASCII frame strings causing layout thrash                 | Fixed grid + `contain` + textContent-only writes + dev layout-shift check (P6)                         |
| Owner code grid/rate mismatch                             | `AsciiExhibitSource` contract + validator with dev warnings + clip; README for authors (§9.4)          |
| Placeholder becoming throwaway                            | Placeholder implements the real interface; swap is data+adapter only (P9b)                             |
| Mono font metric drift (zoom/font fallback)               | Self-hosted font, `ch` sizing, grid assert on resize, no alternate fallback in the ASCII layer         |
| Reduced-motion/static regressions                         | `fpsCap=0` path covered by unit + e2e projects                                                         |
| Chapter count changes repeating history                   | N is data; invariants parameterized; tests loop N=3..12; no literal anywhere                           |
| Zod/copy leaking back into client bundle                  | `check-boundaries` import rules + bundle check                                                         |
| Scope creep from old plans                                | This file is the only execution plan; old plans move to `docs/history/` in P11                         |
| Deletion wave breaking typecheck                          | Single deletion wave after P6 + `tsc` sweep gate; no partial file removals                             |
| `three` leaking beyond the lanyard chunk                  | boundaries script forbids `three` imports outside `ui/fx/lanyard/`; bundle check asserts chunk map     |
| Spiral ticks on non-visible chapters                      | slot contract: heavy parts mount only for settled/transitioning chapters; e2e asserts idle=0 ticks     |
| Cursor blob hurting focus rings/legibility                | blend-mode tuned per theme; disabled on coarse pointers; never hides the native cursor                 |
| Ported-fx drift from upstream bugfixes                    | record upstream commit SHAs in `docs/assets/fx-attributions.md`; re-diff on upgrade                    |

---

## 17. Definition of done

**Boilerplate (must be true before P9b):**

1. `/` is one chrome-free immersive viewport with N (currently 7) data-driven cyclic chapters; changing `content/data/journey.ts` to 3 or 9 works end-to-end.
2. Every exhibit chapter renders an ASCII panel slot with the placeholder source: deterministic SSR frame, stable grid, `role="img"` + label; controls present but disabled with explanation while `FEATURES.exhibits=false`.
3. Document mode fully readable with JS disabled; anchors work; axe critical/serious clean on `/`.
4. Input contract: wheel/touch/keyboard/rail/card-scroll arbitration and reduced-motion instant wrap verified by tests.
5. Zero rAF ticks when idle; ≤2 players; no per-frame allocations (script); no infinite full-screen CSS animations; blur only on non-idle cards.
6. No `three`/`@react-three`/`postprocessing` in any chunk, and (after P9a) not in the dependency set; no `.glb` requests or `/models/` references anywhere; GLBs archived under `assets/models/source/`.
7. Build, `quality`, trimmed e2e, bundle budgets green; standalone + Docker smoke green.
8. Single content source: copy edit in `content/data/chapters.ts` + `content:check` + rebuild is the whole workflow.
9. No dead code from the old architecture remains (knip clean without suppressions); docs tell the truth.

**Deployment grade (after P9b–P11):**

10. Owner ASCII animations play per chapter within quality caps, with static reduced-motion frames and no layout shift.
11. Diagnostics prove invariants in CI (card/exhibit/scheduler counts, fps, heap, long tasks).
12. Ops docs current; security headers verified; no stale-cache path possible; rollback documented.

---

## 18. Open questions / defaults if unanswered

1. **Confirm dropping WebGL entirely (R11).** Default: yes — deleted; a 3D background would be a new feature.
2. ASCII panel placement: side-by-side split (default) vs full-bleed backdrop; mobile default = upper backdrop + bottom-sheet card.
3. Placeholder art style: boxed title + dot field (default) vs minimal empty grid; caption shown only in dev (default).
4. Controls surface: play/pause + restart only (default) vs speed control (skip until asked).
5. Mono font choice (default: a metric-stable mono like JetBrains Mono / IBM Plex Mono, subset to Latin + box-drawing).
6. Should placeholder panels animate at all while `FEATURES.exhibits=true`? Default: no (static art); animation is reserved for real sources.
7. `/credits` framing for archived GLBs (default: keep attribution copy, add "archived exploration" note).
8. Dust background feature (default: implemented but off; enable only if measurements show it's free).
9. Blob cursor: light spring version (default) vs react-bits WebGL shader version as an optional upgrade (`FEATURES.cursorShader`, off).
10. Portrait asset for the lanyard: placeholder silhouette (`public/images/portrait.svg`) until the owner supplies a real photo; card copy (name/role) is real either way.
11. Project tiles: seeded with the owner's real public links (GitHub, ORCID); owner extends `content/data/projects.ts` with actual repos — never fake entries.

---

## 19. Known-defect → fix mapping (quick index)

| Defect                                                | Where                                | Fixed in                    |
| ----------------------------------------------------- | ------------------------------------ | --------------------------- |
| `nearestDwellCenter` undefined call                   | `CyclicJourneyController.tsx`        | P4                          |
| wheel constant vs tests; dataset writes; scroll steal | same                                 | P4                          |
| direction inferred by index compare                   | `narrativeStore.ts`                  | P3                          |
| linear presence/adjacency in cyclic system            | `chapterSelectors.ts`                | P2/P5                       |
| 7 glass cards always painted with blur                | `ChapterCardShell`, `glass-card.css` | P5                          |
| poster DOM particles/filters                          | `ScenePoster.tsx`, `globals.css`     | P5                          |
| spring + parallel rAF loop + instrumentation          | `journeyRuntime.tsx`                 | P3                          |
| zod + content in client graph                         | `content/portfolio.ts`               | P1                          |
| SW cache-first stale assets                           | `public/sw.js`                       | P0                          |
| 142 MB GLBs served/deployed                           | `public/models/`                     | P8                          |
| per-frame allocations in atmosphere/camera (pattern)  | `lib/atmosphere.ts`, rig             | P6 (deleted; rule enforced) |
| dead components/exports                               | §8                                   | per phase                   |
| stale tests (5-chapter, model interaction, scene)     | `tests/*`                            | P7/P11                      |
| light-theme leftovers (error/OG/manifest)             | `app/*`                              | P10                         |
| 1254px duplicate icon                                 | `app/icon.png`                       | P0                          |

---

## 20. Changelog (append-only)

- 2026-10-16 — initial plan written after full-repo read (all `src/**`, tests, scripts, workflows, ADRs, phase docs, plan(3)/plan4 histories) and targeted doc checks (R3F scaling/frameloop, bundle boundaries). Decisions R1–R10 recorded; phases P0–P11 defined; model layer staged but off.
- 2026-10-17 — refinement pass (self-review): (a) `journeyRuntime` settle detection now has a true single tick source (`renderUnits.on('change')`, no parallel rAF); (b) exhibit schema no longer carries credit data — credits only in site schema with warning-level cross-check; (c) deletion sequencing corrected — one deletion wave at end of P6, P5 deletes only what it replaced, because `tsc` covers unrendered files; (d) pre-paint mode boot script added to remove the document→immersive flash; (e) StageDocument/ChapterDeck roles clarified; (f) §9 filled in with conventions, npm script surface, tooling decisions and potential future files; (g) P0 gained the legacy-scene gate + `.env.example` update; P1 gained import redirect + links-check path update; (h) pointer ownership renamed `claimPointerGesture`; (i) e2e plan de-garbled and stale-spec deletion made explicit; (j) verified workflow set (`visual.yml` already gone), `check-bundle-budget` needle, and `post-deploy-smoke` model check — each scheduled for update in its phase.
- 2026-10-18 — **direction change:** exhibits are ASCII text animations (R5/R6/R11/R12/R13). Full rewrite of the plan: 3D/WebGL pipeline removed from the target architecture (scene layer → exhibits layer; no three deps; GLBs archived to `assets/models/source/`); new §10 defines the `AsciiExhibitSource` integration contract, placeholder strategy, player/scheduler contract, playback state machine, a11y, failure handling; §11 now enforces DOM/text performance invariants (one rAF, zero-alloc ticks, ≤2 players, grid stability); phases reworked (P5 placeholder panel shell, P6 ASCII player + legacy-wave deletion, P8 archive GLBs, P9a dep removal / P9b owner integration); Playwright `no-webgl` project replaced by `no-js`; deployment/DoD/risks/open questions updated.
- 2026-10-18 (later) — **FX layer added** (owner request): researched reactbits.dev + magicui catalogs and upstream sources (RotatingText = motion-only; InfiniteSpiral = pure CSS-3D + rAF, no three; Lanyard = three-core-only with hand-rolled physics and calm-stop; BlobCursor = WebGL metaballs → heavy). New R14–R16, `ui/fx/` layer (§7.7), chapter visual slot kinds (§10.8), fx placement map (§12.7), phase updates (P5/P6/P9a), bundle rule amended ("three only in lanyard chunk"), risks/open-questions updated. Lanyard becomes the single sanctioned 3D island; blob cursor ships as the light custom version.

**Implementation log (P0 + P1, 2026-10-20):**

- P0 done: `config/{flags,env,site}.ts` (env-driven siteUrl; `lib/siteMetadata.ts` now a shim); SW + RegisterSW + duplicate icon + stale logs + `tailwind.config.ts` + `components.json` deleted; legacy scene frozen behind `FEATURES.legacyScene` in the current ImmersiveStage; `scripts/quality/check-boundaries.mjs` v2 live (86→103 files audited, layer matrix + legacy rules + three-allowlist); `.env.example` documents all feature switches; smoke icon path re-pointed. Deviation discovered: Tailwind v4 falls back to _automatic_ content detection without the JS config, which scanned repo-root plan files and emitted `bg-[url(svg)]` from this plan's own prose → build failure. Fix: `@import 'tailwindcss' source(none)` + explicit `@source` globs in globals.css (deterministic scanning — better than the legacy config).
- P1 done: `types/experience.ts` (ClientContent + JourneyFrame + exhibit/visual surfaces); `content/schemas/*` (common, journey, chapters, scene, exhibits, projects, site); `content/data/*` (journey, chapters — copy migrated verbatim with provenance + navLabels + interests rotating block, scene — accents/backgrounds/visual kinds, exhibits — 5 placeholder-era entries, projects — real GitHub/ORCID seeds, site + portrait + components attribution); `content/validate.ts` (schemas + cross-validation at module load); `content/projection.ts` (pure, source-stripping); `content/index.ts`; `page.tsx` builds ClientContent server-side and passes it to the stage; credits page + ContactSection + PublicationStatusSection + config/site redirected to `@/content`; `check-public-links` roots updated; `content:check` = `vitest run tests/unit/content-contract.test.ts` (13 assertions, green). Gates: typecheck/lint/boundaries/build all green. Known accepted leak: the /page client chunk still embeds the OLD zod-validated content via the legacy `CyclicChapterStage` (plan(3) F09) — dies with the P5/P6 legacy wave; the new projection surface is clean.
- P1 rule deviation recorded: exhibit metadata is valid for ANY visual kind (lanyard/spiral slots fall back to the ascii panel, §10.8) — validate.ts relaxed accordingly and the §7.2 bullet corrected.

**Implementation log (P2, 2026-10-20):**

- P2 done: `journey/{types,timeline,topology,invariants}.ts` — the verified legacy timeline ported count-parameterized (`decodeJourney(units, count, direction)`, `getMagneticTarget(…, count, restUnits?)`, `cycleUnits/initialUnits/getCanonicalRouteT` parameterized; new `getIndexFloat` for DOM choreography); `createTopology(ids)` factory (id maps, `cyclicDistance` — fixes the legacy linear-distance bug, `adjacentIndices`, duplicate-free `windowIndices` safe on 3- and 4-rings); invariants sweep fully derived from N (seam/midpoint/arrival/pre/post positions, reverse seam, phase repeat at ±cycle, magnetic table) with `assertJourneyDomainForAllCounts()` covering N=3..12. `tests/unit/journey-domain.test.ts`: 19 assertions green (one self-correction: units 25 is the dwell CENTER → dwellT 0.5, and nearestDwellCenter(38)=25). Old `lib/journeyTimeline.ts`/`chapterSelectors.ts`/`chapters.ts` remain untouched for the legacy tree (single deletion wave after P6).

**Implementation log (P3, 2026-10-21):**

- P3 done: `runtime/stores/{narrative,exhibits}.ts` (id-agnostic, direction never inferred — seam bug killed; exhibits store: availability/playback + single-slot command channel with sequence dedupe); `runtime/scheduler.ts` (the ONE app-level rAF: tick subscribers keep it alive, passive `observeFrameDelta` never does, visibility-gated, zero per-tick allocations, `__resetSchedulerForTests` seam); `runtime/capabilities.ts` (measured snapshot + matchMedia subscriptions + `useSyncExternalStore` hook, SSR-defaulted); `runtime/quality.ts` (fpsCap/dust tiers only — no identity coupling; EWMA governor via passive frame observer, fast-downgrade/slow-upgrade); `runtime/journeyRuntime.tsx` (topology-injected provider; settle detection through the shared scheduler with the legacy 2-frame epsilon logic; ONE decode per spring change feeding reused per-subscription `JourneyFrame` records; atomic settle/pair/window publications; pause snaps input to render — the in-flight-spring resume bug is fixed; forward-only digit shortcut resolution); `runtime/diagnostics/{index,metrics,overlay}` (registry + `window.__JOURNEY__` + dev overlay, all flag-gated).
- P3 tests: 20 green across `scheduler.test.ts` (lifecycle/token/observer contracts; an early assertion bug in my own activity-token test — counting a removed callback — leaked a token and cascaded; fixed + reset seam), `runtime-stores.test.ts` (settle/pair/window dedupe, seam direction, command sequencing), `journey-runtime.test.tsx` (initial publication, settle at target, seam wrap both ways, transition pair + focus handoff, pause freeze without spring resume, synchronous jumps, frame records). Four expectation fixes were the domain being _right_: backward-to-contact resolves to ordinal −1 (loop −1), settle windows are three-wide, and nudges that land in seams legitimately publish transition state.
- Sequencing refinement: the new runtime (and the P4 input layer) stay **dormant but fully tested** until P5 swaps the stage tree wholesale. Rewiring the legacy controller alone would orphan its card components (hard-wired to the old runtime context) — the adoption point moves to the P5 rewrite, keeping every phase runnable with no double wiring.

**Implementation log (P4, 2026-10-21):**

- P4 done: `runtime/input/{wheel,velocity,touch,keyboard}.ts` (pure; legacy-verified feel preserved — 80px wheel clamp, 50u/500px, 100ms magnetic debounce, 12px touch intent lock, viewport-adaptive touch scale; new `[data-scroll-region]` arbitration, `[data-animation-controls]`/`[data-dialog]` guards, digit shortcuts capped at count) and `runtime/input/coordinator.ts` — the only listener attacher: wheel/pointer on the stage host, keyboard/hash on window, overlay→pause subscription, visibility pause with settle-timer cleanup, hash-sync navigation, reduced-motion instant jumps, runtime injected for testability, zero dataset writes. Two real bugs found by tests and fixed: (a) velocity ring treated timestamp 0 as an unwritten slot (legitimate performance.now() origin); (b) Escape was gated behind the paused check — but the open overlay itself causes the pause, so dismissal was dead code; Escape now short-circuits before the pause guard. `tests/unit/input-helpers.test.ts` (13) + `tests/unit/input-coordinator.test.tsx` (8) green; typecheck/lint/boundaries/format green (121 files). Old controller untouched; adoption happens in P5.

**Implementation log (P5, 2026-10-21):**

- P5 done — **the new DOM stage is live on `/`**: `ui/stage/{ImmersiveStage,StageDocument,ChapterDeck,ChapterCard,ProgressRail,VisualSlot}.tsx`, `ui/background/StageBackground.tsx` (two cross-fading palette layers, zero re-renders after mount, one naming-inversion bug caught on review), `ui/fx/{RotatingText,BlobCursor}.tsx` (react-bits flip port with per-char delay stagger — motion v12 has no `stagger` transition property — and the light spring blob with capability gating + MutationObserver mode tracking), `exhibits/{AsciiPanel.tsx,sources/placeholder.ts}` (deterministic seeded placeholder frames, SSR-identical), pre-paint boot script in `layout.tsx` (`data-experience` + capability hints on `<html>`, no flash, no hydration mismatch via StageDocument's one-time `data-hydrated` flip + CSS guard), `styles/{stage,ascii,fx}.css` (expense-gated glass, document/immersive modes, coarse-pointer/reduced-transparency fallbacks), page.tsx swaps to the new stage with the runtime + coordinator adopted.
- Deletions this phase: old ImmersiveStage, CyclicJourneyController, CyclicChapterStage, ChapterCardShell, ChapterProgress, ChapterSupplement, ModelControls, ChapterDetail, ScenePoster + the stale controller e2e spec + empty component dirs (cards/debug/liquid-glass/world — empty on disk, untracked). glass-card/** and sections stay (ContactSection/CreditsPanel consume them until the P10 restyle) — glass-card deletion moves to P10.
- Contact pipeline zod-boundary fix: ContactSection + PublicationStatusSection are now props-driven from the server page via `buildClientContent` (they previously imported `@/content` → validate → zod in the client chunk). Accepted documented exception: `/contact`'s own `ContactForm` still ships zod for inline field validation (`lib/contact/contract` dual-validation design, pre-existing and deliberate; the server re-validates authoritatively). The **home route is clean**: zero zod, zero provenance, zero three in any client chunk.
- Data-driven fixes during P5: `contact.id` + `portrait` + per-chapter `background` added to ClientContent/projection (the card slot and skip link derive from data, never literals — R9).
- Gates: 80 tests green across 8 suites (`stage-contract.test.tsx` pins sections/headings/rail/panels/settled-card/scroll-region contract); typecheck/lint/boundaries/format green; production build green. Budget: `/` = 55.6 kB route JS, 158 kB First Load (< 180 kB target); legacy scene tree orphaned out of the client graph ahead of the P6 deletion wave. A killed build run left an orphaned node worker (~500s CPU) that made the next build appear hung — cleared and documented; if a build stalls again, check zombie node processes first.
- Fonts deferred to P10 as planned (system mono stack serves the ASCII grid; self-hosting lands with the polish pass).

**Implementation log (P6, part 1 — ASCII engine, 2026-10-21):**

- Exhibit engine live: `exhibits/types.ts` (`AsciiExhibitSource` contract + frame/grid helpers), `sources/{index,placeholder-source}.ts` (adapter table with unknown-key→placeholder fallback; placeholder source = real interface implementation, single deterministic frame), `registry.ts` (**synchronous placeholder baseline** — SSR/no-JS/pre-hydration always carry a real frame in the slot; async adapter upgrade only on the animated path; never throws: failures degrade to placeholder + error availability), `useExhibitPlayback.ts` (static/playing/paused/idle state machine: capability + quality-cap + visibility + user-pause inputs, published to the store), `AsciiFramePlayer.tsx` (scheduler-bound; ≤1 textContent write/tick; elapsed-time frame skipping; restart token; dev grid-drift warning), `AnimationControls.tsx` (group/toggle/restart/status contract with the "content remains fully available" copy), `useExhibitCommands.ts` (sequence-deduped command bridge). AsciiPanel upgraded to the full engine behind the same markup contract; first frame ships as SSR children.
- Bugs caught by tests during this stretch: my test harness captured a fake ref during render (React hasn't committed — the player read null and never wrote); `useRef` copy-pasted from vitest instead of react; decorative no-exhibit panels mislabeled `data-placeholder="false"` though placeholder art is exactly what they show.
- Gates: 85 tests green across 9 suites (new: `ascii-frame-player.test.tsx` cadence/static/restart/render-function contracts; stage-contract extended with the controls contract); typecheck/lint/boundaries (131 files)/format green; production build green. Placeholder era verified end-to-end: `FEATURES.exhibits=false` → every panel static, controls disabled with explanation, zero scheduler ticks at rest.
- Still pending in P6: ProjectSpiral port (scheduler-bound), Lanyard port (three chunk), `check-frame-allocations.mjs`, bundle-budget needle update, legacy 3D deletion wave (scene/**, models/**, effects/**, ChapterCameraRig, CursorGlow, old hooks/stores/libs/content).

(placeholder: future entries go here — date, what changed, why, which phases affected)

---

## 21. Appendix — old → new migration map (compact)

| Current file(s)                                                                                                                                                 | Target home                                                      | Phase |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----- |
| `content/portfolio.ts`, `content/site.ts`                                                                                                                       | `content/data/*` + `content/schemas/*` + `content/projection.ts` | P1    |
| `lib/journeyTimeline.ts`                                                                                                                                        | `journey/timeline.ts` (count-parameterized)                      | P2    |
| `lib/chapterSelectors.ts`, `lib/chapters.ts`                                                                                                                    | `journey/topology.ts`                                            | P2    |
| `lib/chapterRegistry.ts` (scene parts)                                                                                                                          | `content/data/scene.ts` + `content/data/exhibits.ts`             | P1    |
| `lib/chapterRegistry.ts` (topology parts)                                                                                                                       | `content/data/journey.ts` + `journey/topology.ts`                | P1/P2 |
| `lib/journeyRuntime.tsx`                                                                                                                                        | `runtime/journeyRuntime.tsx`                                     | P3    |
| `components/motion/CyclicJourneyController.tsx`                                                                                                                 | `runtime/input/*` + `runtime/scheduler.ts`                       | P4    |
| `stores/narrativeStore.ts`                                                                                                                                      | `runtime/stores/narrative.ts`                                    | P3    |
| `stores/sceneInteractionStore.ts`                                                                                                                               | `runtime/stores/exhibits.ts`                                     | P3/P6 |
| `components/portfolio/ImmersiveStage.tsx`                                                                                                                       | `ui/stage/ImmersiveStage.tsx`                                    | P5    |
| `components/journey/CyclicChapterStage.tsx`                                                                                                                     | `ui/stage/ChapterDeck.tsx`                                       | P5    |
| `components/journey/ChapterCardShell.tsx`                                                                                                                       | `ui/stage/ChapterCard.tsx`                                       | P5    |
| `components/journey/ChapterProgress.tsx`                                                                                                                        | `ui/stage/ProgressRail.tsx`                                      | P5    |
| `components/narrative/ChapterDetail.tsx` + `ChapterSupplement.tsx`                                                                                              | folded into `ChapterCard.tsx`                                    | P5    |
| `components/journey/ModelControls.tsx`                                                                                                                          | `exhibits/AnimationControls.tsx`                                 | P6    |
| `components/scene/**`, `components/models/**`                                                                                                                   | deleted (archive note in §8; GLBs → `assets/models/source/`)     | P6/P8 |
| `components/effects/**`, `lib/atmosphere.ts`, `lib/closedRoute*.ts`, `lib/sceneRuntime.ts`, `lib/gltfRuntime.ts`, `lib/materials.ts`, `lib/modelInteraction.ts` | deleted                                                          | P6    |
| `glass-card/*`                                                                                                                                                  | `ui/surfaces/*` + `styles/*`                                     | P5    |
| `lib/siteMetadata.ts`                                                                                                                                           | `config/site.ts`                                                 | P0    |
| `lib/utils.ts`                                                                                                                                                  | `lib/cn.ts`                                                      | P0    |
| `hooks/useChapter.ts`, `useChapterPresence.ts`                                                                                                                  | runtime selectors/hooks                                          | P3/P5 |
| `hooks/useModelInteraction.ts`                                                                                                                                  | deleted (ASCII has no drag physics)                              | P6    |
| `public/models/**`, `public/draco/**`                                                                                                                           | `assets/models/source/**` (archive) / deleted                    | P8    |
| `scripts/*asset*.mjs`, `inspect-glb.mjs`                                                                                                                        | deleted                                                          | P8    |
| `src/app/icon.png`, `tailwind.config.ts`, `components.json`, logs                                                                                               | deleted                                                          | P0    |
| `plan*.md`, `action_plan.md`, trees                                                                                                                             | `docs/history/`                                                  | P11   |
