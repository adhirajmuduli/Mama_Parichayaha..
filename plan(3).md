# PP8.1 Performance, Architecture, and Refactor Recovery Plan

## 0. Purpose

This document is a repository-grounded recovery plan for `PP8.1-clean(1).zip`.

The immediate symptom is severe lag, but the codebase has a deeper problem: several architectural refactors have been represented in types, registries, tests, comments, or visual masks without being connected into the shipping runtime. Other subsystems are partially migrated and now contradict each other. As a result, performance work can easily optimize the wrong layer, re-enable a dormant expensive subsystem, or be blocked by tests that still enforce an obsolete architecture.

The correct objective is therefore not simply “make it faster.” It is:

1. establish one authoritative runtime architecture;
2. remove false masks and dead migration layers;
3. repair the cyclic journey contract before visual work;
4. make the fallback cheap rather than visually expensive;
5. rebuild the WebGL path so it is safe to re-enable;
6. reconnect the real model pipeline using stable model lifetimes and optimized derivatives;
7. implement the intended spatial clouds/halos rather than simulating them with full-screen filters;
8. rebuild tests and diagnostics around the actual immersive product;
9. prove that repeated loops do not accumulate work, objects, requests, or memory.

This plan deliberately separates **current shipping lag** from **dormant WebGL lag**. In the present snapshot, WebGL is explicitly disabled, so current stutter cannot be attributed to the large GLBs. The current lag is dominated by DOM/CSS/SVG/compositing and JS journey work. However, the disabled WebGL implementation contains its own substantial performance risks and must be repaired before it is restored.

---

## 1. Audit basis and architectural authority

### 1.1 Repository areas inspected

The audit covered the complete source-oriented repository surface, including:

- `src/app/**`
- `src/components/**`
- `src/content/**`
- `src/hooks/**`
- `src/lib/**`
- `src/stores/**`
- `src/styles/**`
- `tests/unit/**`
- `tests/e2e/**`
- `scripts/**`
- `docs/adr/**`
- phase records and restructuring documents
- `public/models/runtime/manifest.json`
- local GLB inventory and file sizes
- service-worker and cache behavior
- package/build/quality configuration

Binary GLBs were not visually rendered in this audit; their repository inspection metadata, declared runtime metadata, sizes, geometry counts, compression state, and animation metadata were used.

### 1.2 Verification limitation

The repository pins Node `22.17.0` and uses `engine-strict=true`. The audit environment is one patch below that requirement. A normal dependency installation therefore cannot be treated as a valid execution environment for the project's quality suite. A bypassed install did not complete cleanly, so this plan does **not** claim runtime benchmark results from an invalid installation.

All findings below that concern source relationships are static/code-level findings. Performance severity is ranked from the actual operations in the code, not from fabricated frame-time numbers. Patch 0 below establishes the required real measurements before implementation changes.

### 1.3 Decision hierarchy

Where documents and code conflict, use this order unless the project owner explicitly supersedes it:

1. current explicit product requirement;
2. `plan_restructuring.md`;
3. ADR 0007, ADR 0008, ADR 0009;
4. current source implementation;
5. tests that still match the current ADR contract;
6. historical phase reports / older plans / README descriptions.

This matters because multiple old tests and phase reports still describe a finite five-section document architecture that ADR 0007 explicitly retired, while a later source edit incorrectly expanded the cyclic runtime itself to seven chapters.

---

## 2. Executive diagnosis

The repository is currently in **three simultaneous states**.

### State A — what users actually run now

`/` renders:

```text
HomePage
  -> ImmersiveStage
      -> ScenePoster                <-- visually expensive fallback is always mounted
      -> JourneyRuntimeProvider
          -> SceneEnhancement
              -> SceneClient        <-- WebGL explicitly disabled
          -> CyclicJourneyController
              -> CyclicChapterStage
                  -> all chapter card roots
```

`SceneClient.tsx` contains:

```ts
// Temporarily disabled 3D scene rendering
```

and only sets `rendererAvailable(false)`.

Therefore the present site is not a heavy Three.js scene. The user currently pays primarily for:

- full-viewport SVG turbulence/displacement/blur filters;
- oversized blurred cloud layers extending outside the viewport;
- several simultaneous infinite CSS animations;
- blend modes and procedural noise overlays;
- twenty individually animated/glowing DOM particles;
- multiple full-screen liquid-glass card surfaces with backdrop filtering available;
- a JavaScript-driven wheel/touch journey using a spring and additional rest-loop scheduling;
- a large client component boundary that brings content validation/runtime code into the home bundle.

### State B — what the architecture claims should run

The ADR/restructuring contract is a **five-chapter persistent WebGL journey**:

```text
Origins -> Interests -> Research -> Computation -> Future -> Origins ...
```

with:

- one persistent Canvas;
- five canonical model roots;
- five canonical card roots;
- a radius-22 closed route;
- real GLBs;
- deterministic world-space route clouds;
- local model halos;
- travel-linked FOV/fog/cloud modulation;
- no duplicated chapters or models at the seam;
- no repeated GLB request when looping.

### State C — what the dormant WebGL code would currently do if re-enabled

It is not yet safe to restore as-is. It contains:

- a high-cost full-screen procedural FBM nebula shader;
- pointer-driven far-field warp contrary to ADR 0008;
- per-frame `new THREE.Color()` and `new THREE.Vector3()` allocations;
- DPR up to 2 plus bloom/postprocessing;
- active model mount/unmount behavior rather than stable model roots;
- runtime `<Center>` work on very heavy models;
- animation mixers started on mount instead of paused when far;
- ineffective preload policy;
- quality-tier changes that can change model availability/lifetime;
- no optimized low/medium derivatives for the large canonical assets;
- currently empty chapter exhibit mappings, so no models would actually mount;
- a controller overlay that can intercept pointer input above the Canvas.

The consequence is important:

> **Do not solve the present lag by merely re-enabling `Experience`. That would replace one expensive approximation with a second, more expensive and partially disconnected runtime.**

---

## 3. Critical architectural contradictions

## F01 — WebGL is not progressively degraded; it is hard-disabled

**Severity:** P0 — architecture blocker

**Files:**

- `src/components/scene/SceneClient.tsx`
- `src/components/scene/SceneEnhancement.tsx`
- `src/components/scene/Experience.tsx`
- `scripts/check-bundle-budget.mjs`
- `docs/phase11.md`

**Observed problem**

`SceneClient` no longer performs the behavior claimed by Phase 11. It does not:

- detect WebGL;
- calculate a scene runtime profile;
- dynamically import `Experience`;
- mount `SceneRendererBoundary`;
- distinguish renderer failure from static preference.

It simply forces `rendererAvailable=false`.

At the same time, `scripts/check-bundle-budget.mjs` still explicitly requires a dynamic chunk whose manifest key contains:

```text
components/scene/SceneClient.tsx -> ./Experience
```

Thus source, documentation, and quality tooling disagree.

**Why it matters**

This is a false completion state. The repository can contain sophisticated Three/R3F code while none of it participates in the product. It also means bundle/performance conclusions made from the current `/` route do not validate the intended experience.

**Refactor**

Do not immediately restore the old `SceneClient`. First complete Patches 1–10 below. Then rebuild `SceneClient` as the single progressive-enhancement boundary:

```text
capability/profile check
   |-- static/reduced/save-data -> cheap static fallback
   |-- supported -> dynamic Experience import
                       |-- renderer boundary
                       |-- context-loss fallback
                       `-- rendererAvailable=true only after creation
```

`ScenePoster` must be mounted only for the fallback/loading/error state, never continuously underneath a healthy Canvas.

**Acceptance**

- the initial route has no Three/R3F bundle;
- the WebGL chunk loads exactly once on supported clients;
- `Experience` exists in the production dynamic manifest;
- unsupported/static users never create a Canvas;
- healthy WebGL users do not retain the animated poster underneath it.

---

## F02 — the fallback poster has become the primary renderer and is itself expensive

**Severity:** P0 — current lag source

**Files:**

- `src/components/scene/ScenePoster.tsx`
- `src/app/globals.css`
- `src/components/portfolio/ImmersiveStage.tsx`

**Observed problem**

The fallback contains two full-screen SVG filters with:

- `feTurbulence` at 3–4 octaves;
- `feDisplacementMap`;
- `feGaussianBlur`;
- oversized filtered regions (`x=-50%`, width/height `200%`);
- CSS elements at `inset:-15%`;
- additional CSS blur;
- `mix-blend-mode: screen`;
- multiple simultaneous background-position/opacity/transform animations;
- a full-screen SVG data-URI noise overlay;
- a grain layer with blend mode;
- twenty continuously animated DOM particles, each with glow/shadow/blur styling.

The poster is unconditionally mounted by `ImmersiveStage`.

**Why it matters**

Large animated blur/filter surfaces are raster/compositor heavy and can be worse than a restrained WebGL background on some browsers. They also make the fallback violate its role: a fallback should be the cheapest safe mode.

**Refactor**

Replace it with a deterministic **static** atmosphere poster:

- 2–3 ordinary radial gradients;
- one small pre-baked compressed noise image if needed;
- no SVG turbulence/displacement;
- no full-viewport animated blur;
- no DOM particle field;
- no blend-mode stack unless measured cheap;
- no `Math.random()` during render;
- chapter palette may cross-fade only when JS journey is active in static mode, using a single compositor-safe opacity/color transition.

For reduced motion/save-data/unsupported WebGL, the poster must be fully static.

**Acceptance**

- zero SVG filters on the home fallback;
- zero continuously animated full-screen filter/blur layers;
- zero poster DOM particles;
- deterministic markup across renders;
- poster unmounted or inert after a healthy Canvas is ready.

---

## F03 — the canonical five-chapter route was partially changed to seven chapters

**Severity:** P0 — correctness and migration blocker

**Files:**

- `src/content/portfolio.ts`
- `src/lib/chapterRegistry.ts`
- `src/lib/journeyTimeline.ts`
- `src/lib/closedRoute.ts`
- `src/lib/closedRouteCurves.ts`
- `src/components/journey/CyclicChapterStage.tsx`
- `src/components/motion/CyclicJourneyController.tsx`
- multiple unit/E2E tests
- ADR 0007

**Observed problem**

Current content/timeline uses:

```text
Origins, Interests, Research, Computation, Future, Publications, Contact
```

but route geometry remains mathematically fivefold:

```ts
positiveModulo(index, 5)
2 * Math.PI / 5
Math.sin(Math.PI / 5)
Y_OFFSETS.length === 5
```

Therefore:

```text
index 5 Publications -> same spatial center as Origins
index 6 Contact      -> same spatial center as Interests
```

The seven-point Catmull-Rom camera curve is constructed from five unique positions plus two duplicated positions. Forward travel after Future also becomes semantically incoherent: Future -> Publications uses the original seam to Origins; Publications -> Contact uses the Origins -> Interests chord; Contact -> Origins reverses the Interests -> Origins chord while logical direction is still forward.

ADR 0007 explicitly requires exactly five canonical cyclic chapters and moves Publications/Contact outside the cyclic route.

**Why it matters**

Every subsystem depending on chapter count is now suspect: camera route, preload adjacency, visible pair, keyboard shortcuts, loop count, card count, tests, and future clouds/halos.

**Refactor**

Restore the five canonical cyclic IDs as one lightweight topology constant. Publications and Contact remain secondary content via dedicated routes or overlays/dialogs.

Do not let the content schema define route cardinality. Use separate concepts:

```ts
type JourneyChapterId = 'origins' | 'interests' | 'research' | 'computation' | 'future'
type SecondaryContentId = 'publications' | 'contact'
```

The route math should derive `JOURNEY_CHAPTER_COUNT` from the canonical topology rather than retyping `5` throughout the code.

**Acceptance**

- exactly five unique spatial centers;
- exactly five route curve control points;
- `CYCLE_UNITS === 250` for 5/40/5 slots;
- Publications/Contact cannot enter `closedRoute` or `SceneContent`;
- forward Future -> Origins and reverse Origins -> Future are first-class seam transitions;
- uniqueness invariant rejects duplicate centers.

---

## F04 — registry validation validates the wrong invariant and lets duplicate centers pass

**Severity:** P0

**File:** `src/lib/chapterRegistry.ts`

**Observed problem**

`assertChapterRegistry` checks adjacent planar chord length. In the malformed seven-entry sequence, the repeated pentagon edges still happen to satisfy that chord test, so duplicate non-adjacent centers are not rejected.

**Refactor**

Add explicit invariants:

- registry length equals `JOURNEY_CHAPTER_COUNT`;
- each center is unique within epsilon;
- each chapter order maps one-to-one to one route index;
- every canonical route index appears exactly once;
- every center matches `getModelCenter(index)`;
- seam adjacency uses cyclic modulo;
- no secondary content ID can satisfy `JourneyChapterId`.

**Acceptance**

A registry containing `getModelCenter(0)` twice must fail even when all adjacent chord distances appear valid.

---

## F05 — all chapter exhibit mappings are empty

**Severity:** P0 — feature disconnected

**File:** `src/lib/chapterRegistry.ts`

**Observed problem**

Every current chapter contains:

```ts
exhibits: []
```

`SceneContent` therefore returns no model for every chapter.

The real asset manifest and specialized model components exist, but the runtime registry connection is severed.

**Refactor**

After restoring five chapters, define the testing-phase mapping required by ADR 0009:

```text
Origins      -> dna-alt (diagnostics-visible rollback to dna only while absent)
Interests    -> bacteriophage
Research     -> hemoglobin-ribbon
Computation  -> brain-point-cloud
Future       -> earth-animated
```

The final runtime should have one `ChapterExhibit` root per journey chapter rather than treating exhibits as optional decoration.

**Acceptance**

- five model roots after load;
- one real GLB mapping per canonical chapter;
- no procedural fallback;
- missing canonical asset produces a clear diagnostics state rather than silently changing identity.

---

## F06 — many registry parameters are decorative data with no runtime effect

**Severity:** P1 — false implementation / architecture drift

**File:** `src/lib/chapterRegistry.ts`

The following fields are populated and validated but have no meaningful runtime consumer in the current source:

- `modelRotation`
- `modelOffset`
- `targetDiameter`
- `cardRestYawDeg`
- `haloColor`
- `environmentColor`

`CyclicChapterStage` even recomputes card side from `entry.order % 2` instead of consuming `entry.scene.cardSide`.

`getTravelPulse()` is implemented and tested, but no scene component consumes it.

**Why it matters**

This is exactly the kind of “implemented on paper” layer that makes the refactor appear further along than it is. Tuning these values currently changes nothing.

**Refactor**

For every configuration field, choose exactly one of two states:

1. **runtime authority** — wire it into the actual consumer and test the effect; or
2. **delete it** — do not retain speculative configuration.

Recommended ownership:

- model transform/diameter -> `ChapterExhibit`;
- card side/yaw -> `ChapterCardShell` choreography;
- halo color -> `ModelHalo`;
- environment/atmosphere palette -> atmosphere interpolation;
- travel pulse -> camera, route clouds, fog, post FX.

**Acceptance**

A test changing each retained field must observe a deterministic derived runtime value. No “validated but unused” presentation fields remain.

---

## F07 — planned route clouds and model halos do not exist

**Severity:** P1 — major visual refactor absent

**Expected by:** ADR 0008 / `plan_restructuring.md`

**Missing components:**

- `RouteCloudField`
- `ModelHalo`
- `JourneyDiagnostics`

The current visual atmosphere is instead supplied by `ScenePoster`, `NebulaBackground`, and broad `Particles`.

**Refactor**

Implement the actual world-space architecture after the scene hot path is cleaned:

```text
AtmosphereController
  |-- restrained far-field background
  |-- RouteCloudField (one instanced provider)
  |-- Lighting (global readability only)
  |-- ChapterExhibit x 5
       `-- ModelHalo
```

Cloud behavior must derive from the same continuous `renderUnits`/`travelPulse` as the camera. No pointer-driven cloud system.

**Acceptance**

- one seeded cloud field;
- 60/40/25 high/medium/low cloud cluster policy or measured equivalent;
- one local halo sprite per model;
- max two live halo point lights in transition;
- clouds near-static at dwell;
- no full-screen cloud mask pretending to be route geometry.

---

## F08 — the journey controller calls an unavailable `nearestDwellCenter`

**Severity:** P0 — source correctness blocker

**File:** `src/components/motion/CyclicJourneyController.tsx`

`finishPointerDrag` calls:

```ts
nearestDwellCenter(units)
```

but `nearestDwellCenter` is private to `journeyTimeline.ts` and is neither exported nor imported.

This must be repaired before trusting the type/build state.

**Refactor**

Do not merely export the helper. Restore the intended public magnetic target API and use it consistently:

```ts
getMagneticTarget(units, releaseVelocity, lastDirection, restUnits)
```

All wheel/touch release paths should use the same public settle function.

---

## F09 — magnetic settling is implemented, tested, and then bypassed

**Severity:** P1 — false motion implementation

**Files:**

- `src/lib/journeyTimeline.ts`
- `src/components/motion/CyclicJourneyController.tsx`

**Observed problem**

`getMagneticTarget` contains velocity and hysteresis logic and has unit tests, but the controller comments:

```text
Disabled magnetic scroll - use simple nearest dwell center
```

and ignores the supplied velocity.

`restUnitsRef` is maintained but not used by the active settle algorithm.

**Refactor**

Use one settle decision function for wheel and touch. Inputs:

- current rendered units;
- measured release velocity;
- last direction;
- last rest center.

Delete the bypass code and redundant nearest-center calculation.

**Acceptance**

- small movement inside hysteresis returns to current dwell;
- fast deliberate movement advances in direction;
- touch and wheel have the same settle semantics;
- seam behavior is identical to ordinary adjacency.

---

## F10 — cyclic adjacency/presence logic is still linear

**Severity:** P0/P1 — preload and model-lifetime blocker

**File:** `src/lib/chapterSelectors.ts`

Current distance is:

```ts
Math.abs(indexA - indexB)
```

and adjacency uses `index - 1`, `index + 1` without modulo.

For a five-node loop, Origins and Future must be adjacent. The current tests incorrectly assert they are distance 4.

**Refactor**

Define cyclic distance:

```text
raw = abs(a-b)
distance = min(raw, count-raw)
```

and modulo previous/next selectors.

Better still, stop using settled `activeChapter` as the primary model-presence driver. Derive model visibility/activity directly from the current journey sample so the incoming chapter exists before settle.

**Acceptance**

- Origins adjacent to Interests and Future;
- Future adjacent to Computation and Origins;
- seam preloading/lifetime behaves identically to all other transitions.

---

## F11 — scene atmosphere follows settled chapter, not continuous travel

**Severity:** P1

**Files:**

- `src/components/scene/AtmosphereController.tsx`
- `src/lib/atmosphere.ts`
- `src/lib/journeyTimeline.ts`

**Observed problem**

`AtmosphereController` reads `useChapter()`, which is based on low-frequency settled narrative state. During travel, camera motion advances continuously while the atmosphere still targets the old settled chapter. The implemented `getTravelPulse` is unused.

**Refactor**

Create one frame-level derived scene sample from `runtime.renderUnits`:

```ts
interface SceneJourneyFrame {
  sample: JourneySample
  travelPulse: number
  outgoing: ChapterSceneConfig
  incoming: ChapterSceneConfig
  blend: number
}
```

The camera, atmosphere, clouds, post FX and active halo states read this same sample. Zustand remains for discrete accessibility/UI state only.

**Acceptance**

- no atmosphere snap after settle;
- fog/palette/cloud/post behavior is continuous from outgoing to incoming;
- all travel-linked effects share one pulse.

---

## F12 — atmosphere transition allocates many Three.js objects every frame

**Severity:** P1 — dormant GC/jank source

**File:** `src/lib/atmosphere.ts`

Every frame currently constructs multiple:

```ts
new THREE.Color(...)
new THREE.Vector3(...)
```

for background, cloud colors, fog, lights, particles, center and offsets.

This directly violates the restructuring invariant prohibiting per-frame vectors/arrays/material allocations.

**Refactor**

Precompile each chapter atmosphere into immutable Three-friendly targets once:

```ts
interface CompiledAtmosphereTarget {
  background: THREE.Color
  ...
  center: THREE.Vector3
}
```

Then mutate existing runtime objects via `.lerp`, `.copy`, `.set`, or scalar interpolation. No hot-path construction.

**Acceptance**

A source-level hot-path check should show no `new Color`, `new Vector*`, `new Material`, array spread, or object literal allocation inside scene `useFrame` callbacks except explicitly documented unavoidable library calls.

---

## F13 — camera curve sampling allocates vectors per transition frame

**Severity:** P1

**File:** `src/components/motion/ChapterCameraRig.tsx`

Current transition path:

```ts
cameraCurve.current.getPoint(segmentT)
targetCurve.current.getPoint(segmentT)
```

without target arguments creates vectors repeatedly.

**Refactor**

Use existing scratch refs:

```ts
cameraCurve.current.getPoint(segmentT, desiredPosition.current)
targetCurve.current.getPoint(segmentT, desiredTarget.current)
```

Retain one tangent scratch vector.

Also remove the unused `lookYOffset` argument from `getDwellCameraAnchor`, or use it intentionally. Do not keep an API parameter that suggests an effect it does not have.

---

## F14 — the far-field nebula shader is an unnecessarily expensive full-screen effect

**Severity:** P0/P1 when WebGL is restored

**File:** `src/components/scene/NebulaBackground.tsx`

At high tier, each fragment performs five FBM evaluations, each up to four octaves, and each noise sample calculates eight corner hashes. It runs over a camera-surrounding sphere every rendered frame. Pointer movement also changes the field.

This is incompatible with ADR 0008, which says the far field should be restrained and pointer-independent.

**Refactor**

Preferred order:

1. replace the procedural fragment field with a cheap gradient + precomputed tileable noise texture;
2. if procedural motion is retained, render it at reduced resolution into an FBO and upscale;
3. reduce octave count and total noise evaluations drastically;
4. remove pointer uniform/listener;
5. drive very slow motion from `travelPulse` / motion preference;
6. freeze or reduce update rate at dwell.

The detailed spatial depth should come from `RouteCloudField`, not from making the background shader more complicated.

**Acceptance**

- pointer coordinates never enter atmosphere uniforms;
- far field is visually subordinate to world-space clouds/models;
- high-tier GPU cost is measured separately from model rendering;
- reduced-motion mode has no time-varying far-field shader.

---

## F15 — Canvas quality policy is too aggressive before the scene has been optimized

**Severity:** P1

**Files:**

- `src/lib/sceneRuntime.ts`
- `src/components/scene/Experience.tsx`

Current high profile allows DPR 2 with postprocessing; medium allows 1.5. The restructuring target is lower (roughly 1.75 / 1.35 / 1.0).

Initial tier selection relies mainly on coarse-pointer, viewport, RAM and CPU-core signals. Those do not reliably describe GPU capability.

The governor requires 90 consecutive frames slower than 42 ms before downgrading and 600 consecutive fast frames before upgrading. Tier changes can also change asset availability, creating lifetime churn.

**Refactor**

Separate three concerns:

```text
render tier     -> DPR / cloud count / FX quality
asset LOD tier  -> derivative selection
asset lifetime  -> stable canonical root; never destroyed by transient tier change
```

Use:

- conservative initial DPR;
- warm-up period;
- rolling median/p95 or bounded EWMA rather than consecutive-frame counters;
- quicker downgrade;
- much more conservative upgrade (or no automatic upgrade during the session);
- quality transition that never remounts canonical model roots.

**Acceptance**

- high DPR cap <= agreed target (ADR currently 1.75);
- quality downgrade never causes a new chapter/model identity;
- no repeated GLB load on tier oscillation;
- low tier remains a real-model scene.

---

## F16 — `frameloop="always"` keeps the entire scene hot even at dwell

**Severity:** P1

**File:** `src/components/scene/Experience.tsx`

The Canvas renders continuously whenever the document is visible. At the same time, the intended design says most expensive environmental motion should become nearly static at dwell and far animation mixers should pause.

**Refactor**

Do not switch blindly to `frameloop="demand"` while embedded model animation is active. Instead define an explicit activity budget:

- journey moving -> full frame rate;
- active embedded animation -> required update cadence;
- at dwell with no required animation -> demand/invalidated frames;
- slow far field -> optionally update at a reduced cadence;
- hidden document -> no frames;
- reduced motion -> demand frames only after interaction/state changes.

A small scene scheduler can decide whether a frame is necessary.

**Acceptance**

At a static reduced-motion dwell, renderer frame count should stop increasing except after explicit invalidation.

---

## F17 — postprocessing is not travel-scoped and compounds DPR cost

**Severity:** P1

**File:** `src/components/effects/PostProcessing.tsx`

High tier continuously runs bloom, chromatic aberration and vignette. Chromatic aberration is static even though ADR 0008 requires only a small transition pulse. Some registry bloom thresholds are below the ADR >= 0.92 target.

**Refactor**

- bloom only high/qualified medium if measured;
- threshold >= agreed floor;
- low intensity;
- half-resolution/downsample where supported;
- chromatic aberration amplitude = `travelPulse * smallMax`, exactly zero at dwell;
- keep vignette cheap/static;
- disable all post effects for low tier and reduced motion.

**Acceptance**

Dwell screenshot with postprocessing on/off should not depend on chromatic aberration for visual identity.

---

## F18 — model roots are not stable; nearby state mounts and unmounts GLTF instances

**Severity:** P0/P1 when models are connected

**Files:**

- `src/components/scene/exhibits/ChapterGLTFModel.tsx`
- duplicate `src/components/models/ChapterGLTFModel.tsx`
- `src/hooks/useChapterPresence.ts`

Current generic model returns `null` when `presence.nearby` is false. Re-entering range reconstructs component state, clones the cached scene, may clone materials, traverses meshes, binds animations, and runs `<Center>` again.

`useGLTF` may prevent another network request, but that does not make remounting free.

**Refactor**

Mount five `ChapterExhibit` groups once after their asset is available. Lifetime is independent of loop count and narrative recurrence.

Far exhibits should be cheap through:

- `visible=false` or controlled visibility;
- mixer `timeScale=0`;
- interaction disabled;
- halo/light off;
- optionally lower LOD material/geometry already resident.

Do not destroy/reclone the canonical group merely because it becomes far.

**Acceptance**

After all assets are loaded:

- model root count remains exactly five through three loops;
- clone/construction counters do not increase on chapter recurrence;
- loops 2–3 cause zero GLB requests.

---

## F19 — runtime centering/normalization is repeated despite known asset bounds

**Severity:** P1 for large assets

**Files:**

- model components using Drei `<Center>`
- `public/models/runtime/manifest.json`
- `src/content/assets.ts`

The runtime manifest already records geometry bounds. Yet every loader wraps the model in `<Center>`, which can require traversal/bounds computation at runtime. This is undesirable for the ~1.19M-vertex brain asset.

**Refactor**

Normalize assets offline during the derivative pipeline:

- center pivot/origin;
- normalize diameter to a known canonical unit;
- preserve animation transforms correctly;
- store the final scale/orientation/offset in generated runtime metadata.

At runtime, use a simple group transform; no `<Center>`.

**Acceptance**

No runtime bounding-box traversal is required to position canonical assets after load.

---

## F20 — all animation clips are started on mount and far mixers are not paused

**Severity:** P1

**Files:** generic and specialized model components

Current code calls:

```ts
Object.values(actions).forEach(action => action?.reset().play())
```

and does not pause far/non-active mixers according to the ADR runtime budget.

**Refactor**

Create one animation policy per canonical exhibit:

```text
active dwell          -> intended clip/update
incoming/outgoing     -> active as needed
far                   -> timeScale = 0
reduced motion        -> paused unless user explicitly enables
hidden document       -> paused
```

Do not restart a clip because the chapter recurs unless that behavior is explicitly desired.

---

## F21 — model shadow flags are applied universally without a coherent shadow strategy

**Severity:** P2

Multiple loaders traverse every mesh and set:

```ts
castShadow = true
receiveShadow = true
```

but current scene lights do not establish a deliberate shadow system. If shadows are later enabled globally, the brain/complex models would become extremely expensive.

**Refactor**

Use no real-time mesh shadows by default for this scene. Use:

- ambient/key/rim/fill lighting;
- local halo;
- optional cheap contact/blob/decal solution if grounding is needed.

Only enable cast/receive on specifically justified small meshes.

---

## F22 — two generic model loaders plus six specialized loaders implement overlapping systems

**Severity:** P1 — migration debris and bundle complexity

**Files:**

- `src/components/scene/exhibits/ChapterGLTFModel.tsx`
- `src/components/models/ChapterGLTFModel.tsx`
- `src/components/models/DNA.tsx`
- `DnaAlt.tsx`
- `Bacteriophage.tsx`
- `HemoglobinRibbon.tsx`
- `BrainPointCloud.tsx`
- `EarthAnimated.tsx`
- `InteractiveModel.tsx`
- `src/components/scene/exhibitLoaders.ts`

`SceneContent` renders the generic scene/exhibits loader directly. It also imports and calls `assertExhibitLoaders()`, whose loader table points to the specialized components, but those loaders are not used to mount models.

This creates two architectures at once.

**Refactor**

Adopt one config-driven `ChapterExhibit` / `ChapterGLTFModel` implementation. Asset-specific behavior belongs in declarative hooks/configuration, for example:

```ts
runtimeAsset.animationPolicy
runtimeAsset.materialPolicy
runtimeAsset.autoRotateSpeed
runtimeAsset.normalizedTransform
```

Delete specialized component duplication unless a model genuinely requires a unique renderer.

Remove dead Knip ignores after cleanup instead of suppressing detection.

**Acceptance**

One canonical model rendering path; no dynamic loader table that is only asserted but never consumed.

---

## F23 — the asset preload policy is sophisticated in syntax but ineffective in practice

**Severity:** P1

**Files:**

- `src/components/scene/SceneContent.tsx`
- `src/content/assets.ts`
- `src/lib/chapterSelectors.ts`

`SceneContent` preloads Origins if policy is `current`, then preloads adjacent assets only if they declare `adjacent`, and remaining assets only if they declare `none`.

The actual canonical asset entries largely declare `preload: 'current'`. Consequently the adjacency/remaining loops do not provide the intended staged coverage.

The preload logic is also based on settled Origins adjacency and old linear selectors.

**Refactor**

Replace string policy with an explicit scheduler:

1. load Origins canonical asset first;
2. load both cyclic neighbors at idle priority (Future + Interests);
3. idle-load remaining optimized derivatives with concurrency 1;
4. during travel, promote incoming asset request immediately;
5. never restart preload due to loop count;
6. respect save-data/static mode;
7. cache promise/state by immutable asset URL.

**Acceptance**

Before the user can reach a chapter under ordinary navigation, its optimized asset is either already loaded or visibly represented by a deliberate lightweight loading state without blocking journey input.

---

## F24 — the real asset optimization pipeline described by the ADR does not exist

**Severity:** P0 before WebGL release

**Files:**

- `scripts/optimize-scene-asset.mjs`
- `public/models/runtime/manifest.json`
- ADR 0009
- `plan_restructuring.md`

The runtime manifest says optimized derivatives will be added by `scripts/optimize-glb.mjs`. That script does not exist.

The existing `optimize-scene-asset.mjs`:

- supports only DNA, bacteriophage, A2A receptor, and ibuprofen;
- does not cover hemoglobin, brain, or Earth;
- writes candidates into `artifacts/phase5/meshopt/`;
- explicitly does not replace runtime paths.

Current canonical sources include approximately:

| Asset | Source size | Geometry / animation note |
|---|---:|---|
| bacteriophage | 0.86 MB | ~180k vertices, Draco |
| hemoglobin | 10.89 MB | ~222k vertices, uncompressed |
| brain | 33.41 MB | ~1.19M vertices, uncompressed |
| animated Earth | 23.34 MB | textures + embedded animation |
| rollback DNA | 2.66 MB | manifest ~504k vertices, Draco |

**Refactor**

Implement the promised `scripts/optimize-glb.mjs` as a deterministic production pipeline for all five canonical real assets.

It should:

- inspect source;
- deduplicate/prune;
- simplify where visually acceptable;
- apply Meshopt/Draco based on measured decoder/size tradeoff;
- resize/transcode textures (KTX2/Basis if adopted and measured);
- preserve animation channels, morph targets and node names required by clips;
- normalize center/scale offline;
- emit high/medium/low derivatives under `public/models/runtime/`;
- generate content-hashed filenames;
- write one generated manifest with source and derivative metadata;
- fail if animation/geometry invariants change unexpectedly.

**Acceptance**

Medium and low tiers use derivatives of the same real assets, not missing models or procedural substitutes.

---

## F25 — asset metadata has two sources of truth and has already drifted

**Severity:** P1

**Files:**

- `src/content/assets.ts`
- `public/models/runtime/manifest.json`

Example: rollback DNA is declared with `animationCount: 1` in `assets.ts`, while the inspected runtime manifest says `animationCount: 0`.

The runtime manifest is imported mainly to answer whether an intake exists, while sizes, hashes, geometry, animation metadata and paths are duplicated manually in TypeScript.

**Refactor**

Generate one runtime manifest from inspection/optimization and consume it directly. Keep only human-authored policy in TypeScript, keyed by asset ID:

```text
generated facts: bytes/hash/bounds/clips/mesh counts/URLs
human policy: chapter/LOD policy/material policy/credit status
```

CI validates that every policy ID has one generated runtime record.

**Acceptance**

No byte/hash/animation/geometry fact is manually duplicated in two runtime files.

---

## F26 — asset verification gives false confidence because it verifies only rollback DNA

**Severity:** P1

**File:** `scripts/verify-model-assets.mjs`

The verification script contains only `dna_for_site.glb`.

`asset:audit` therefore does not prove the integrity of the other canonical real models.

**Refactor**

Make verification consume the generated runtime manifest and verify every canonical source and derivative:

- path exists;
- hash matches;
- byte size matches;
- required decoder extension is supported;
- expected animation count/name/duration constraints hold;
- derivative retains required structural invariants.

---

## F27 — low/medium tiers currently remove canonical models instead of providing cheaper real versions

**Severity:** P0/P1

**File:** `src/content/assets.ts`

Hemoglobin, brain and Earth are declared high-tier only. If exhibits are reconnected, low/medium users would receive no canonical model for those chapters.

This contradicts ADR 0009.

**Refactor**

Runtime identity must stay constant across tiers. Resolve asset ID -> best derivative URL for current tier, not asset ID -> available/unavailable.

**Acceptance**

Every journey chapter has a real model at low, medium and high tiers.

---

## F28 — alternate DNA fallback is silent and the rollback asset is not animated as currently inspected

**Severity:** P1

**Files:**

- `src/content/assets.ts`
- `public/models/runtime/manifest.json`

`resolveRuntimeExhibitId('dna-alt')` silently returns `dna` when the alternate is absent.

ADR 0009 requires this to be an explicit diagnostics-flagged rollback. The inspected rollback DNA has zero embedded animations, so it cannot fulfill the intended animated alternate behavior.

**Refactor**

Return a structured resolution:

```ts
{ requestedId, resolvedId, reason, isRollback }
```

Surface rollback state in development diagnostics and QA. Do not label the rollback as the intended alternate.

---

## F29 — service worker cache-first behavior can make refactors appear not to work

**Severity:** P0/P1 — deployment/debugging blocker

**Files:**

- `public/sw.js`
- `src/components/RegisterSW.tsx`
- `src/app/layout.tsx`
- `next.config.js`

All same-origin non-Next static resources are cache-first in a cache named `bio-portfolio-v1`. Model files are therefore eligible to remain cached by URL until the cache version changes. Model HTTP headers also permit multi-day CDN caching.

During an asset/performance refactor, replacing bytes at the same `/models/foo.glb` URL can leave clients running old assets. This can make correct changes look ineffective and invalidate profiling.

**Refactor**

Preferred: remove the custom service worker until offline/PWA behavior is an explicit requirement.

If retained:

- use build/revision-aware caches;
- never use unversioned cache-first semantics for mutable model filenames;
- use content-hashed model derivative URLs;
- provide update/activation behavior;
- clear legacy `bio-portfolio-v1` caches during migration;
- add a test that deployment N+1 receives new asset bytes.

**Acceptance**

A changed model always produces a changed immutable URL; stale SW state cannot hide a deployment.

---

## F30 — the controller overlay can block Canvas/model pointer interaction

**Severity:** P0 when WebGL is restored

**Files:**

- `src/components/motion/CyclicJourneyController.tsx`
- `src/components/portfolio/ImmersiveStage.tsx`
- `src/components/scene/Experience.tsx`
- `src/hooks/useModelInteraction.ts`

The journey controller renders a full-screen fixed `z-10` element with normal pointer behavior. The Canvas is a sibling beneath it. A transparent DOM overlay still receives pointer events, so model interactions in the Canvas can be unreachable even though the interaction hook is implemented.

**Refactor**

Replace the full-screen event-capturing overlay with an explicit `JourneyInputCoordinator`.

Recommended model:

- Canvas remains pointer-receiving;
- card surfaces receive normal DOM pointer/wheel events;
- global wheel/keyboard navigation listens at window/document level and guards targets;
- touch arbitration distinguishes vertical journey intent from horizontal model rotation;
- model interaction state can temporarily claim a pointer;
- no invisible element exists solely to cover the Canvas.

**Acceptance**

- horizontal model drag works over the model;
- vertical touch journey works outside a scrollable card and after model gesture rejection;
- active cards remain clickable/scrollable;
- no z-index trick is required to make one input system work by disabling another.

---

## F31 — wheel/touch navigation can steal scrolling from card content

**Severity:** P1 — UX/perceived lag blocker

**Files:**

- `CyclicJourneyController.tsx`
- `ChapterCardShell.tsx`

Cards use `max-h-[62svh] overflow-y-auto`, but the full-stage wheel handler calls `preventDefault()` without checking whether the event originated in a scrollable card that can still scroll. Touch handling has the same architectural conflict.

Users can experience this as sticky/laggy input even when frame rate is acceptable.

**Refactor**

Implement scroll arbitration:

```text
if target is inside scrollable card and card can consume delta -> let card scroll
else -> journey consumes delta
```

For touch, retain a gesture threshold and yield to the card until it reaches an edge in the intended direction.

**Acceptance**

Long chapter content scrolls normally without changing chapters until the scrollable panel reaches its boundary.

---

## F32 — production wheel events mutate DOM instrumentation on every input event

**Severity:** P2

**File:** `CyclicJourneyController.tsx`

Every wheel event updates:

```ts
stage.dataset.wheelCount = ...
```

This is test instrumentation in the production hot path.

**Refactor**

Move counters to development diagnostics or an in-memory ref. Tests should inspect diagnostics/state rather than force production DOM attribute writes.

---

## F33 — reduced-motion logic is incomplete across the journey

**Severity:** P1 / accessibility

Static scene tier respects `prefers-reduced-motion`, but the journey still uses spring motion, camera-style transition semantics, and card opacity transitions. The ADR requires instant dwell-to-dwell navigation and no cloud/FOV/bank/card-flight motion.

**Refactor**

Introduce one shared reduced-motion capability state used by:

- `JourneyRuntime`;
- controller settle/navigation;
- card transitions;
- scene profile;
- model mixers;
- clouds/post FX.

`navigateTo()` should use `jumpTo()` under reduced motion.

**Acceptance**

Previous/Next still wraps cyclically, but no interpolated journey frames are required.

---

## F34 — hidden liquid-glass cards are not explicitly paint-suppressed

**Severity:** P1 — current compositor risk

**Files:**

- `CyclicChapterStage.tsx`
- `ChapterCardShell.tsx`
- `liquid-glass.module.css`

All current chapter cards are permanently mounted. Non-visible cards are hidden mainly via child `opacity:0` and pointer/inert flags. The liquid-glass surface can use backdrop blur, multiple shadows, gradients, pseudo-elements and masking.

Browsers may optimize fully transparent layers, but the code does not explicitly ensure that expensive backdrop/pseudo treatment is removed for inactive cards. Seven such surfaces are currently created due the topology drift.

**Refactor**

Keep five stable outer card roots, but make expensive presentation state-aware:

```text
inactive root -> visibility hidden / no backdrop / no pseudos / no shadow
outgoing+incoming -> only two expensive surfaces enabled
settled -> one active surface
```

Use `data-card-visible` to disable the expensive CSS layer, not merely opacity.

**Acceptance**

At dwell, only one card has a live backdrop-filter layer. During transition, at most two.

---

## F35 — the liquid-glass pointer implementation is not mounted on the home route

**Severity:** P1 — false visual feature

`LiquidGlassPointerTracker` is mounted only in the liquid-glass lab/tests. Home card surfaces still render the radial reflection using default CSS variables, so the “interactive” material is effectively a permanent centered highlight.

The current reflection opacity (0.5 / 0.75 hover) also conflicts with the ADR 0008 cap of roughly 0.12 for subtle pointer response.

**Refactor**

The premium material must look three-dimensional without pointer movement.

Then choose one:

- remove pointer reflection entirely from journey cards; or
- mount one delegated tracker and cap it at <= 0.12, only on active card, disabled for coarse/reduced motion.

Do not create per-card listeners.

---

## F36 — intended card entry/depth choreography is mostly an opacity fade

**Severity:** P2 — false refactor / product fidelity

The restructuring plan requires the card to enter/exit from depth with restrained 3D orientation. Current `ChapterCardShell` only toggles `opacity` over 200 ms. `cardRestYawDeg` exists but is unused.

**Refactor**

Drive card transform from the same journey sample using CSS custom properties or MotionValues without React rerenders:

- translate X according to side;
- small Z/depth proxy via scale/perspective;
- small yaw capped by registry value;
- opacity;
- no large blur;
- reduced motion -> instant visibility.

Only outgoing and incoming cards update.

---

## F37 — content validation pulls Zod into the client/runtime dependency graph

**Severity:** P1/P2 — bundle/startup cost

**Files:**

- `src/content/portfolio.ts`
- `src/lib/chapterRegistry.ts`
- client journey/scene components

`portfolio.ts` imports Zod and performs `PortfolioContentSchema.parse(...)` at module initialization. `chapterRegistry` imports actual content records. Because the registry is consumed by client journey and dormant scene code, the home dependency graph reaches Zod.

The scene registry also becomes coupled to all portfolio copy.

**Refactor**

Separate:

```text
content authoring/validation (build/server)
journey topology (tiny shared module)
scene registry (tiny client/Three config)
serialized validated chapter content (data passed to client)
```

Possible implementation:

- keep Zod schemas in a build/server module;
- validate content in tests/build or server component;
- export a typed plain-data artifact for client consumption;
- do not let scene code import the content validation module.

**Acceptance**

Zod is absent from the initial immersive client chunk and the WebGL scene chunk unless another genuine client feature needs it.

---

## F38 — the entire immersive composition is a client component even where content could be server-rendered

**Severity:** P2

`ImmersiveStage` and all card composition are client components. Some client state is necessary, but static chapter copy does not need to be authored/validated in the browser.

**Refactor**

Keep `page.tsx` server-side and pass prevalidated lightweight content into a client `ImmersiveRuntime`. Preserve semantic text in initial HTML where possible while keeping the movement controller client-only.

Do not over-engineer this before compositor/scene issues are fixed; measure bundle impact first.

---

## F39 — Motion is used for one core scalar while a second RAF loop is layered on top

**Severity:** P2, measure before changing

`JourneyRuntimeProvider` uses Motion `useSpring` and separately runs a `requestAnimationFrame` rest detector while movement is active.

`setPaused` prevents new input but does not explicitly stop an already-moving spring/rest loop.

**Refactor**

First simplify the state machine so there is one authoritative movement scheduler. Options:

1. keep Motion and subscribe to its motion/rest events without a parallel polling loop; or
2. replace the single scalar spring with a small custom critically damped integrator if bundle/runtime measurements justify removing Motion.

Do not rewrite this solely for theoretical micro-optimization.

**Acceptance**

- pausing an overlay freezes journey movement immediately;
- only one scheduler determines movement/rest;
- no extra React renders are introduced.

---

## F40 — narrative direction is computed twice with incompatible semantics

**Severity:** P2 correctness

`setActiveChapter` infers direction from numeric chapter index comparison, which is wrong at a cyclic seam. `publishSettledState` later receives actual journey direction separately.

**Refactor**

Remove direction inference from `setActiveChapter`. Direction belongs to the journey decoder/runtime, not to an index comparison in the narrative store.

The store should receive one atomic settled-state publication.

---

## F41 — interaction store commands have no current UI dispatch path

**Severity:** P2 — false feature

`useModelInteraction` subscribes to `sceneInteractionStore.request`, but repository search finds no production caller dispatching rotate/reset/exit commands. `rendererAvailable` and `availableExhibits` are also largely written rather than consumed in current UI.

**Refactor**

Either implement accessible in-card model controls for the active chapter or remove the dead command channel. If controls are retained:

- rotate left/right;
- reset;
- pause animation if applicable;
- keyboard-accessible buttons in active card;
- only shown when renderer/model is actually available.

---

## F42 — service/fallback messaging claims more resilience than the current home actually provides

**Severity:** P2

`SceneClient` states that “complete portfolio content remains available.” With JS entirely disabled, the current fixed client-driven journey does not provide the old full linear semantic document described in historical Phase 3; `src/app/loading.tsx` referenced by that phase is no longer present.

**Refactor**

Define the fallback contract explicitly:

- unsupported WebGL but JS available -> cyclic cards over cheap static poster;
- reduced motion -> instant cyclic navigation;
- JS disabled -> server-rendered semantic fallback or clearly accepted minimal route.

Do not retain historical claims/tests for a fallback no longer implemented.

---

## F43 — test suites enforce multiple obsolete architectures simultaneously

**Severity:** P0 — blocks correct refactoring

Examples:

- `journey-timeline.test.ts` expects `CHAPTER_COUNT === 5` while source says 7;
- controller tests expect five card roots;
- route tests correctly encode five geometry points;
- `portfolio.spec.ts` still expects a `header`, `footer`, progress navigation, and old `#chapter` document sections;
- `performance.spec.ts` scrolls `#origins`...`#future` into view instead of driving the cyclic controller;
- `scene-resilience.spec.ts` expects a Canvas even though `SceneClient` is disabled;
- visual tests still use old section scrolling assumptions.

**Why it matters**

CI can punish architecture-correct changes while stale tests can also give false performance confidence by measuring a route that is no longer the product.

**Refactor**

Before large visual patches, rebuild test contracts from ADR 0007–0009.

Keep tests for:

- pure cyclic timeline mathematics;
- five unique route anchors;
- seam in both directions;
- stable five card/model roots;
- input and magnetic settle;
- fallback behavior;
- real asset mapping;
- cache/network invariants;
- reduced motion;
- contact/credits standalone flows.

Delete tests whose only purpose is the retired finite document shell.

---

## F44 — the existing “performance” E2E does not measure the actual immersive interaction

**Severity:** P0/P1 — observability gap

`tests/e2e/performance.spec.ts` uses old DOM section scrolling. It does not prove:

- cyclic wheel/touch travel;
- three-loop scene stability;
- renderer draw calls;
- triangle counts;
- renderer texture/geometry memory;
- GLB request repetition;
- quality tier changes;
- cloud/halo budgets;
- model root stability.

**Refactor**

Replace it with a real journey performance protocol (see Patch 16).

---

## F45 — required `JourneyDiagnostics` was never implemented

**Severity:** P1

The restructuring plan explicitly requires a development diagnostics overlay with:

- logical/render units;
- decoded phase;
- loop count;
- active pair;
- model/card root count;
- cloud draw calls;
- total draw calls;
- triangles;
- renderer memory.

Without this, repeated-loop leaks are hard to distinguish from visual stutter.

**Refactor**

Implement diagnostics only in development and expose a machine-readable diagnostics object for Playwright. Do not update React state every frame; sample diagnostics at a low rate (e.g. 2–4 Hz) or on demand.

---

## F46 — route cloud texture required by ADR 0008 is absent

**Severity:** P2 / implementation blocker for planned clouds

The plan specifies local `/textures/cloud-soft.png`; the current public tree contains no such route-cloud texture.

**Refactor**

Create/commit an optimized local texture or revise the ADR to a different local deterministic representation. Do not silently substitute remote imagery or another full-screen mask.

---

## F47 — production asset provenance/policy and runtime identity are still mixed

**Severity:** P2

`assets.ts` embeds runtime loading facts and credit information. The bacteriophage entry even labels the real GLB as a “Procedural bacteriophage study / Original implementation,” which is inconsistent with the actual real-asset testing policy.

**Refactor**

Separate:

- runtime asset identity/performance metadata;
- publication credit/provenance status.

ADR 0009 already specifies this separation. Runtime availability must never disappear solely because publication credit is incomplete.

---

## F48 — oversized auto-route icon is unnecessary load weight

**Severity:** P3

`src/app/icon.png` is 1254×1254 and materially larger than the dedicated 192/512 icons already declared in metadata.

**Refactor**

Remove the duplicate automatic app icon if it is not needed, or replace it with an appropriately sized optimized file. This is not a frame-rate fix, but it reduces avoidable startup/network/decode work.

---

## 4. Refactor strategy: dependency order

The repository should **not** be rewritten in one patch. Each patch below has a narrow responsibility and a verification gate. The disabled Canvas is useful temporarily because dormant scene internals can be repaired without exposing users to the unfinished path.

---

# Patch 0 — Establish reproducible baselines and diagnostics harness

### Goal

Measure the current problem before changing architecture and establish a trustworthy comparison environment.

### Work

1. Use exact Node/npm versions from `.node-version` / `package.json`.
2. Produce a clean install and run existing quality commands only to inventory failures; do not “fix tests” by changing product code yet.
3. Capture current `/` on:
   - desktop Chromium 1440×900;
   - mobile emulation 390×844;
   - reduced motion;
   - no WebGL.
4. Record current:
   - main-thread long tasks;
   - FPS/frame cadence if available;
   - Chrome Rendering/Paint profiler screenshots;
   - layer/compositor count;
   - JS heap after 5 minutes of cyclic input;
   - React commit count during a 5-second journey;
   - network request list.
5. Add a temporary `perf-baseline.md/json` under test artifacts, not production UI.
6. Disable service worker in the profiling profile or clear it before every run so stale assets cannot contaminate results.

### Do not change

- scene architecture;
- assets;
- chapter count.

### Done when

There is a reproducible before-state and every later patch can compare against it.

---

# Patch 1 — Restore the canonical five-chapter topology

### Goal

Remove the fundamental 5-vs-7 contradiction.

### Files

- split/update `src/content/portfolio.ts`
- `src/lib/chapterRegistry.ts`
- `src/lib/closedRoute.ts`
- `src/lib/closedRouteCurves.ts`
- `src/lib/journeyTimeline.ts`
- `src/lib/chapterSelectors.ts`
- `src/stores/narrativeStore.ts`
- chapter/timeline/route tests

### Work

1. Define one lightweight `journeyChapterIds` with exactly five IDs.
2. Keep Publications/Contact as secondary content IDs, not route IDs.
3. Derive `JOURNEY_CHAPTER_COUNT` from the canonical tuple.
4. Make route angle/chord/Y offsets use that canonical count where mathematically valid.
5. Restore `CYCLE_UNITS=250`.
6. Add center-uniqueness and one-to-one topology invariants.
7. Make adjacency cyclic.
8. Remove numeric-index direction inference from narrative store.
9. Change keyboard numeric shortcuts to `1–5`.
10. Restore offscreen instruction text to “five looping chapters.”

### Done when

All pure route/timeline tests describe exactly one architecture and the seam works both directions.

---

# Patch 2 — Repair journey settling, input arbitration, and reduced motion

### Goal

Make input correct before coupling it to a live Canvas.

### Files

- `CyclicJourneyController.tsx`
- `journeyRuntime.tsx`
- `journeyTimeline.ts`
- `ChapterCardShell.tsx`
- new small input helper(s) if needed

### Work

1. Remove undefined `nearestDwellCenter` call.
2. Use `getMagneticTarget` for all release paths.
3. Restore velocity+hysteresis semantics.
4. Use `restUnitsRef` only if it is part of the actual algorithm; otherwise remove it.
5. Move wheel-count instrumentation to development only.
6. Add scrollable-card target arbitration.
7. Add touch arbitration for card scroll vs vertical journey vs horizontal model drag.
8. Make reduced-motion navigation call `jumpTo`.
9. Ensure `setPaused(true)` freezes any in-progress movement and settle scheduler.
10. Consolidate Motion/rest scheduling where practical.

### Done when

Wheel, keyboard, touch, card scroll and reduced-motion behavior are deterministic without WebGL.

---

# Patch 3 — Replace the heavy animated poster with a genuinely cheap fallback

### Goal

Remove the largest current non-WebGL compositor suspect.

### Files

- `ScenePoster.tsx`
- `globals.css`
- `ImmersiveStage.tsx`

### Work

Delete:

- SVG turbulence filters;
- displacement filters;
- huge animated blur clouds;
- DOM particle system;
- animated noise/grain stack;
- render-time randomness.

Replace with one deterministic, static, palette-aware fallback.

Make poster mount state explicit:

```text
loading WebGL -> poster visible
WebGL ready   -> poster fades once then unmounts/inerts
static mode   -> poster remains static
renderer fail -> poster visible static
```

### Done when

Current non-WebGL site becomes materially smoother before any Three.js code is restored.

---

# Patch 4 — Make liquid-glass cost proportional to visible cards

### Goal

Keep the premium material but stop paying for hidden surfaces.

### Files

- `ChapterCardShell.tsx`
- `CyclicChapterStage.tsx`
- liquid-glass CSS/components

### Work

1. Keep five stable outer roots.
2. Explicitly disable backdrop/pseudo/shadow work on non-visible roots.
3. At dwell, one expensive card surface maximum.
4. During transition, two maximum.
5. Reduce pointer reflection opacity to <= 0.12 if retained.
6. Either mount one delegated pointer tracker or remove pointer response from journey cards.
7. Wire `entry.scene.cardSide` rather than recomputing parity.
8. Implement restrained transform entry/exit using the existing card-yaw configuration.
9. Remove transform/opacity transitions in reduced-motion mode.

### Done when

DevTools Layers/Paint confirms hidden cards are not maintaining expensive effects.

---

# Patch 5 — Split content validation from runtime topology/scene bundles

### Goal

Remove unnecessary client dependencies and make architecture boundaries real.

### Work

Create separate modules along these responsibilities:

```text
content schemas + Zod validation    -> server/build/test only
validated content data              -> serializable plain data
journey topology                    -> tiny shared constants/types
scene registry                      -> tiny scene-only configuration
publication/provenance records      -> secondary route concern
```

`SceneContent` and camera math must not import the full Zod/content module.

### Done when

Bundle analyzer confirms Zod/content-schema code is absent from scene runtime and preferably absent from initial home JS.

---

# Patch 6 — Rebuild the scene hot path before re-enabling it

### Goal

Ensure the dormant Canvas is not a GC/compositor regression.

### Files

- `Experience.tsx`
- `AtmosphereController.tsx`
- `atmosphere.ts`
- `ChapterCameraRig.tsx`
- `Lighting.tsx`
- `Particles.tsx`
- `PostProcessing.tsx`
- `sceneRuntime.ts`

### Work

1. Create one continuous `SceneJourneyFrame` derived from `renderUnits`.
2. Precompile atmosphere targets.
3. Remove per-frame object allocations.
4. Use target vectors in Catmull-Rom sampling.
5. Make fog/palette/exposure interpolate outgoing -> incoming.
6. Use one `travelPulse` for travel-linked effects.
7. Lower DPR targets to the ADR budget.
8. Rework quality governor with faster safe downgrade and no model-lifetime coupling.
9. Pause hidden-document work.
10. Define dwell frame scheduling strategy.
11. Keep global lighting restrained; no shadows by default.
12. Reduce broad particles to sparse depth dust or remove after RouteCloudField exists.

### Done when

A model-free Canvas with the new atmosphere can run smoothly in isolation and has no known hot-path allocations.

---

# Patch 7 — Replace the far-field nebula cost and remove pointer-reactive atmosphere

### Goal

Turn the far field into a cheap background, not the scene's primary effect.

### Work

1. Remove `uPointer` and global pointer listener.
2. Replace or heavily simplify FBM.
3. If shader remains, render/update it at an independently bounded resolution/cadence.
4. Drive motion from `travelPulse` and motion preference.
5. Freeze in reduced-motion mode.
6. Keep opacity/contrast low enough that route clouds provide depth.

### Done when

The far field is visibly secondary and profiling no longer shows it dominating GPU time.

---

# Patch 8 — Implement the real spatial route cloud field

### Goal

Replace CSS/background cloud masks with deterministic world-space depth.

### Add

- `src/components/scene/RouteCloudField.tsx`
- local optimized cloud texture/material resource
- seeded cloud layout helper and tests

### Work

1. Seed `0x4d414d41` or update the ADR deliberately.
2. Generate clusters once, not during render/frame loops.
3. One instanced provider/geometry/material system.
4. Place corridors around all five route segments including seam.
5. High/medium/low counts based on measured target, initially 60/40/25.
6. Modulate modest drift/elongation/opacity via travel pulse.
7. No React state changes per frame.
8. No pointer input.

### Done when

Future -> Origins has the same spatial corridor quality as every ordinary transition.

---

# Patch 9 — Implement local model halos instead of broad glow

### Goal

Give models local presence without returning to cursor/glow dominance.

### Add

- `ModelHalo.tsx`

### Work

- one camera-facing halo sprite per exhibit;
- diameter derived from normalized model size;
- low center opacity;
- high/medium light policy per ADR;
- max two active halo lights;
- low tier sprite only;
- no full-screen effect;
- route clouds respond locally where lit material permits.

### Done when

Halo extends only slightly beyond model silhouette and cannot become a screen-sized glow.

---

# Patch 10 — Consolidate the canonical model renderer and mount five stable roots

### Goal

Remove duplicated loader systems and make lifetime loop-independent.

### Work

1. Introduce one `ChapterExhibit` component.
2. Keep exactly five group roots.
3. Delete one of the duplicate `ChapterGLTFModel` implementations.
4. Remove unused `exhibitLoaders` dynamic architecture or make it the sole renderer—not both.
5. Remove specialized wrappers unless their unique behavior cannot be expressed declaratively.
6. Remove runtime `<Center>` dependency after offline normalization.
7. Pause far mixers.
8. Consolidate per-model `useFrame` work where possible.
9. Disable interaction for far/inactive models without destroying them.
10. Consume actual registry transform/diameter/halo fields.

### Done when

Three loops do not create additional GLTF instances, model roots, animation bindings, or material clones.

---

# Patch 11 — Build the production GLB derivative pipeline

### Goal

Make real assets usable on actual hardware.

### Add/replace

- `scripts/optimize-glb.mjs`
- generated derivative manifest
- high/medium/low optimized real assets under `public/models/runtime/`

### Work

For each canonical model:

1. inspect source;
2. normalize origin/diameter offline;
3. prune/deduplicate;
4. simplify under visual error budget;
5. compress geometry;
6. optimize/transcode textures where applicable;
7. preserve embedded animation;
8. emit content-hashed filenames;
9. record source->derivative mapping;
10. perform side-by-side visual signoff.

Special attention:

- brain: geometry reduction is mandatory for low/medium;
- Earth: texture/animation preservation and transfer size;
- hemoglobin: uncompressed source;
- DNA: rollback semantics and actual animation metadata;
- bacteriophage: preserve visual fidelity while avoiding unnecessary material clones.

### Done when

Every tier has a real model for every canonical chapter.

---

# Patch 12 — Make runtime asset manifest the single factual source of truth

### Goal

Eliminate metadata drift.

### Work

1. Generate bytes/hash/bounds/animation/compression/derivative URLs.
2. Keep human policy separate.
3. Rewrite `verify-model-assets.mjs` to verify all canonical sources/derivatives.
4. Remove manually duplicated factual metadata from `assets.ts`.
5. Make alternate DNA rollback explicit and diagnostics-visible.

### Done when

Changing a GLB without regenerating its manifest causes CI failure.

---

# Patch 13 — Implement real preload/LOD scheduling

### Goal

Eliminate arrival hitches without eagerly loading all heavy sources.

### Work

- cache by immutable derivative URL;
- initial Origins request;
- idle cyclic-neighbor requests;
- concurrency one for remaining idle model work;
- promote incoming model during travel;
- no loop-triggered request;
- no tier-triggered identity recreation;
- save-data/static path loads no WebGL models;
- expose loader state to diagnostics.

### Done when

Network panel shows zero model requests during loops 2 and 3 after warm-up.

---

# Patch 14 — Restore SceneClient and fix layer/input ownership

### Goal

Re-enable the actual product only after the scene is safe.

### Work

Rebuild `SceneClient` with:

- WebGL capability check;
- runtime profile calculation;
- dynamic `Experience` import;
- renderer boundary;
- context loss handling;
- explicit loading/static/error state;
- correct `rendererAvailable` lifecycle.

Rebuild layer ownership:

```text
z0  fallback poster (only while needed)
z1  Canvas / models / clouds
z2  active cards, but not a full transparent input blocker
z3  dialogs
```

Use `JourneyInputCoordinator` rather than a covering controller layer.

### Done when

Canvas receives model pointer events and cards receive ordinary DOM interaction simultaneously.

---

# Patch 15 — Complete model interaction and accessible controls

### Goal

Make existing interaction architecture real rather than dormant.

### Work

- expose rotate-left/right/reset controls only for active available model;
- keyboard-accessible real buttons;
- model horizontal drag coexists with vertical journey;
- reduced motion pauses auto-rotation/inertia;
- pointer capture releases on blur/context loss;
- remove dead store fields/commands if no product control requires them.

### Done when

Pointer, touch and keyboard paths all operate the same canonical model root.

---

# Patch 16 — Remove stale service-worker/cache behavior

### Goal

Make deployment/profiling deterministic.

### Preferred path

Remove custom SW registration and `public/sw.js` unless offline support is an explicit shipping requirement.

### If PWA/offline is retained

- version by build/revision;
- migrate/delete `bio-portfolio-v1`;
- content-hash all runtime models;
- immutable cache headers only on hashed artifacts;
- network/revalidation policy for mutable documents;
- update lifecycle test.

### Done when

A new deployment cannot continue serving an old GLB at the same logical asset ID.

---

# Patch 17 — Add `JourneyDiagnostics` and real performance invariants

### Goal

Make regressions observable instead of subjective.

### Diagnostics fields

At minimum:

- input units;
- render units;
- journey mode;
- outgoing/incoming/settled IDs;
- loop count;
- direction;
- current quality tier;
- DPR;
- model root count;
- active mixers;
- card root count;
- visible expensive card surfaces;
- cloud instance/provider count;
- active halo light count;
- renderer draw calls;
- triangles;
- geometries;
- textures;
- programs if useful;
- asset load/request state.

Sample at low frequency, not every frame into React state.

### Done when

The same diagnostics object can be inspected manually and asserted by Playwright.

---

# Patch 18 — Replace stale E2E/performance tests with immersive tests

### Goal

Make CI protect the product that actually ships.

### Remove/rewrite assumptions

Remove home-route expectations for:

- header/footer;
- finite document tail;
- old `#origins` section scrolling;
- old progress navigation;
- DOM scroll as the primary performance action.

### Required journey tests

1. Origins -> Interests -> Research -> Computation -> Future -> Origins.
2. Reverse Origins -> Future seam.
3. Three complete loops.
4. Exactly five card roots throughout.
5. Exactly five model roots after loading.
6. No new GLB requests loops 2–3.
7. Renderer memory does not monotonically rise after warm-up.
8. Cloud provider exactly one.
9. Halo lights <= 2.
10. Reduced motion performs instant wrap.
11. Card panel scroll does not navigate until boundary.
12. Model horizontal drag does not trigger journey.
13. Context loss falls back cleanly.
14. Static/no-WebGL path never imports/mounts Canvas.

### Performance observations

Use browser trace plus diagnostics. Track:

- long tasks;
- event latency around wheel/touch;
- frame-time distribution during transitions;
- heap growth after warm-up loops;
- draw calls/triangles by tier;
- network request count.

Do not create a pass condition based only on one synthetic software-WebGL FPS number.

---

# Patch 19 — Clean dead migration code and restore Knip as a real guard

### Goal

Remove architecture that can mislead future work.

### Candidates to remove after the canonical renderer is established

- duplicate `ChapterGLTFModel`;
- unused specialized model wrappers;
- `InteractiveModel` if superseded;
- dead `CursorGlow`;
- unused loader map;
- obsolete selector helpers such as finite `getChapterAtProgress` if no consumer remains;
- obsolete Knip ignore entries;
- old visual snapshots/tests that hide or model the retired document route;
- stale comments describing seven cyclic chapters;
- duplicated `'use client'` directive in `CyclicChapterStage.tsx`;
- historical source claims that contradict accepted ADRs.

### Done when

`knip` passes without using ignore rules to hide files that are only retained as migration debris.

---

# Patch 20 — Final visual/performance tuning and signoff

### Goal

Tune only after architecture and lifetimes are correct.

### Final tuning order

1. model normalized scale and offset;
2. camera dwell framing;
3. card/model composition;
4. cloud corridor density;
5. local halo strength;
6. fog and exposure;
7. far-field contrast;
8. bloom/post FX;
9. tiny card pointer reflection last.

This order prevents glow/blur from being used to hide incorrect composition.

### Required visual captures

- desktop forward full loop;
- desktop reverse seam;
- mobile full loop;
- reduced motion;
- no WebGL;
- context-loss recovery;
- low/medium/high tier comparison;
- three-loop diagnostics before/after.

---

## 5. Performance acceptance contract

These are architecture-level release gates. Hardware-specific FPS thresholds should be finalized from Patch 0/reference hardware, but these invariants do not depend on device.

### 5.1 Object/lifetime invariants

- exactly one Canvas when WebGL is active;
- exactly five canonical model roots after load;
- exactly five canonical card roots;
- exactly one route-cloud provider;
- <= 2 active halo point lights;
- no scene-graph growth per loop;
- no GLB request caused by a loop boundary;
- no model clone/rebinding caused by chapter recurrence;
- no monotonic renderer geometry/texture growth after warm-up.

### 5.2 Hot-path invariants

- no per-frame React/Zustand scene-state publication;
- no per-frame `new THREE.Color`, `new THREE.Vector*`, material, geometry or array allocations in project-owned frame loops;
- no DOM dataset/test instrumentation writes on every wheel frame/event;
- no pointer listener driving far-field atmosphere;
- no hidden card maintaining an unnecessary expensive glass effect;
- far animation mixers paused;
- reduced-motion dwell does not maintain a continuous frame loop without a genuine animated requirement.

### 5.3 Asset invariants

- every canonical chapter maps to a real GLB on low/medium/high tiers;
- all runtime GLBs use generated immutable derivative URLs;
- generated manifest facts match bytes on disk;
- no source-size 33 MB brain is shipped to low-tier clients merely because the source exists;
- missing alternate DNA is an explicit rollback state, not silent identity substitution.

### 5.4 Current fallback invariants

- no SVG turbulence/displacement on home fallback;
- no continuously animated full-screen blur field;
- no 20-node DOM particle effect;
- no WebGL model request in static/save-data mode;
- fallback remains readable with JS motion disabled.

### 5.5 Interaction invariants

- ctrl-wheel browser zoom is preserved;
- card internal scroll wins while it can consume scroll;
- journey gets scroll at the card boundary/outside card;
- horizontal model drag and vertical journey are distinguishable;
- overlays pause journey immediately;
- reduced motion wraps instantly;
- no invisible high-z layer blocks Canvas interaction.

---

## 6. Prioritized root-cause map

### Current shipping lag — fix first

1. **ScenePoster full-screen SVG/CSS filter stack** — highest-confidence current visual cost.
2. **Permanent/hidden liquid-glass surfaces without explicit paint suppression** — likely compositor cost; verify in DevTools.
3. **JS wheel/touch journey + spring/rest scheduler and event ownership** — input latency/stickiness source, especially with scrollable cards.
4. **All-client content/runtime coupling and unnecessary client dependencies** — startup/hydration cost.
5. **Service worker stale-cache behavior** — can make profiling/refactors appear ineffective.

### Dormant lag — fix before Canvas is restored

1. **full-screen multi-FBM nebula shader**;
2. **DPR 2 + full postprocessing high tier**;
3. **per-frame Three object allocations**;
4. **model mount/unmount/cloning and runtime centering**;
5. **unoptimized 10–33 MB real assets**;
6. **ineffective preload scheduling**;
7. **all animation actions kept running**;
8. **quality tier coupled to model availability/lifetime**;
9. **always-on frame loop at dwell**;
10. **controller overlay blocking model interaction, encouraging further workaround layers.**

### Refactor blockers — fix before visual polish

1. five-vs-seven topology contradiction;
2. empty exhibit registry;
3. undefined/bypassed settle code;
4. linear selectors in a cyclic system;
5. unused configuration fields;
6. missing cloud/halo/diagnostics components;
7. duplicated model renderer architectures;
8. missing production asset optimizer;
9. stale tests enforcing retired document architecture;
10. documentation/phase reports claiming functionality no longer present.

---

## 7. What should *not* be done

Do not:

1. re-enable `Experience` unchanged and then attempt to optimize symptoms;
2. keep seven journey chapters while retaining five-point geometry;
3. solve large GLBs by substituting procedural mocks;
4. hide slow models with another CSS glow/poster layer;
5. duplicate chapter/model arrays to create infinity;
6. use loop count as a React key;
7. remount models at every recurrence;
8. add more full-screen blur/backdrop layers;
9. add another state store for frame-level animation;
10. tune bloom before route/model/cloud composition is correct;
11. retain stale E2E assertions merely to keep historical CI green;
12. trust a service-worker-cached model URL while profiling a new derivative;
13. perform the entire recovery as one giant patch.

---

## 8. Suggested commit sequence

A safe implementation sequence is:

```text
P0  baseline instrumentation
P1  five-chapter topology
P2  controller/input/reduced-motion correctness
P3  cheap fallback poster
P4  liquid-glass compositor containment
P5  content/runtime bundle boundaries
P6  scene hot-path allocation + quality cleanup
P7  cheap restrained far field
P8  RouteCloudField
P9  ModelHalo
P10 stable canonical model renderer
P11 GLB derivative pipeline
P12 generated asset manifest + verification
P13 preload/LOD scheduler
P14 restore SceneClient + layer/input ownership
P15 accessible model interaction
P16 service-worker/cache cleanup
P17 JourneyDiagnostics
P18 immersive E2E/performance suite
P19 dead-code/document/test cleanup
P20 final visual/performance tuning
```

Do not collapse P1/P2 with the visual scene patches. The current repository already demonstrates why mixing topology changes and visual implementation creates difficult-to-detect cross-layer breakage.

---

## 9. Final definition of done

The recovery is complete only when all of the following are simultaneously true:

1. `/` is one chrome-free immersive viewport with exactly five canonical cyclic chapters.
2. Publications and Contact are reachable secondary flows but are not extra ring nodes.
3. The route has five unique centers and a mathematically coherent closed camera path.
4. The journey uses one continuous unwrapped scalar and one authoritative settle algorithm.
5. Future -> Origins and Origins -> Future behave identically in continuity to ordinary neighboring transitions.
6. Static/no-WebGL mode is genuinely cheap and does not run animated full-screen filter masks.
7. Supported clients dynamically load one Canvas; fallback layers are not left animating underneath it.
8. Every chapter displays its assigned real GLB at every renderable quality tier.
9. Heavy source assets have optimized real-model derivatives with generated immutable metadata.
10. Five canonical model roots remain stable across repeated loops.
11. Far mixers are paused and recurrence causes no GLB request or model clone.
12. Atmosphere, camera, clouds, fog, post FX and halos derive from the same continuous journey sample/travel pulse.
13. Route clouds are deterministic world-space instances, not a full-screen CSS/SVG approximation.
14. Model halos are local and restrained; no cursor/global glow dominates the composition.
15. No project-owned scene frame loop allocates Colors/Vectors/materials/geometries each frame.
16. At dwell, render work is reduced to only genuinely active animation.
17. Card rendering cost is limited to the active/outgoing/incoming surfaces.
18. Card internal scrolling, model interaction and journey gestures coexist without invisible overlay conflicts.
19. Reduced-motion mode performs instant cyclic navigation and pauses nonessential animation.
20. The service worker/cache layer cannot cause old assets to masquerade as the current implementation.
21. Development diagnostics prove stable model/card/cloud counts and renderer memory after three loops.
22. E2E/performance tests drive the actual cyclic journey rather than obsolete document scrolling.
23. Stale duplicate model systems, dead feature masks and obsolete tests are removed rather than hidden in Knip ignores.
24. ADRs, runtime source, tests, asset manifests, and documentation all describe the same architecture.

The dominant engineering principle for the remainder of this project should be:

> **A feature is not considered implemented because a component, config field, test, or visual approximation exists. It is implemented only when its runtime consumer is connected, its lifecycle is correct, its cost is bounded, and the acceptance test exercises the same path a user actually runs.**
