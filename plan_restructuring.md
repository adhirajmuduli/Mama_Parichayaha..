# Mama Parichayaha — immersive 3D restructuring plan

**Repository:** `adhirajmuduli/Mama_Parichayaha..`  
**Baseline:** `main` at `86ce2aa8f0505696cf170eaa972edf2e94a75b6b`  
**Prepared:** 2026-08-25  
**Inputs:** complete repository audit, supplied 43.7-second live-page recording, supplied pearlescent coin reference, and authoritative implementation research  
**Purpose:** definitive, agent-executable plan; this document directs implementation and is not a generic design report

## 1. Implementation directive

Rebuild the home page as one fixed, immersive, cyclic 3D journey with exactly five canonical chapter records, five canonical card nodes, and five canonical model groups. Drive every transition from one continuous logical journey value. Place the five chapter anchors on a closed, mildly bent 3D ring and sample that ring modulo one cycle, while retaining the unwrapped value for direction and loop count. Scrolling past Future must travel through a final cloud corridor and arrive at Origins with no jump, DOM clone, model clone, scene-graph duplication, or repeated GLB request.

The implementation must also:

- remove the site header, fixed progress rail, footer, and the finite publications/contact/credits tail from the immersive route;
- replace all four procedural exhibit substitutes with real GLB files already in the repository;
- replace the current DNA visual with the owner-supplied alternate animated DNA at the exact intake path defined below;
- choreograph cards into and out of depth at every chapter transition;
- increase chapter separation from the current 8-unit line to approximately 25.86-unit chords on a radius-22 ring;
- turn clouds into deterministic spatial volumes that the camera travels through;
- accelerate into each cloud corridor and decelerate into the next chapter;
- give each model a faint local halo that also lifts nearby lit clouds;
- rebuild the cards as thick, translucent, pearlescent slabs based on the supplied reference;
- delete the global cursor orb and cap the remaining card-local pointer reflection so it never becomes the focal point;
- keep asset provenance non-blocking during this test phase.

## 2. Evidence baseline

### 2.1 Repository facts that the implementation must change

| Area           | Current implementation                                                                                          | Consequence                                                              | Required replacement                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Page structure | `PortfolioDocument.tsx` mounts header, five `ChapterSection` blocks, publications, contact, credits, and footer | Finite 2D document framing around a 3D background                        | One `100svh` immersive stage; secondary information moves out of the cyclic route     |
| Chapter state  | `IntersectionObserver` converts document position to a discrete `activeChapter`                                 | No continuous transition phase or reliable acceleration profile          | Continuous logical journey units plus a derived discrete settled chapter              |
| Camera         | `ChapterCameraRig.tsx` lerps to hardcoded poses after chapter changes                                           | Uniform-feeling lateral slides and no controllable transition midpoint   | Closed route sampled from journey phase using a zero-velocity-at-ends easing curve    |
| Spatial layout | Centers are `[0,0,4]`, `[8,1.6,2.4]`, `[16,2.2,3.6]`, `[24,1.8,1.6]`, `[32,.6,3.2]`                             | Models appear close and sequential like slides                           | Radius-22 closed ring with 25.86-unit planar chords and controlled Y undulation       |
| Exhibits       | Only DNA is a GLB; phage, helix, lattice, and orbit are procedural substitutes                                  | Visual language looks mocked and inconsistent                            | Real bacteriophage, protein, brain, and animated Earth GLBs                           |
| DNA            | `dna_for_site.glb` is the sole current DNA runtime asset                                                        | It is the DNA already seen in the recording, not the requested alternate | Intake and render `dna_animated_alt_for_site.glb`; keep current file only as rollback |
| Atmosphere     | Camera-following shader sphere, random particles, independent drifting blobs                                    | Clouds read as a background plate                                        | Slow far-field nebula plus deterministic instanced cloud corridors in world space     |
| Halo           | Chapter lighting is broad; models do not own a localized aura                                                   | Models and clouds do not feel embedded together                          | Per-model additive halo sprite plus short-range light affecting lit clouds            |
| Card           | Mostly planar glass panel with a large 18 rem pointer radial highlight                                          | Card feels 2D and cursor glow dominates                                  | Layered CSS 3D slab, thick bevel, pearlescent edge color, tiny moving reflection      |
| Cursor         | Separate 224 px violet `CursorGlow` plus card highlight                                                         | Bright cursor treatment becomes a luminous stain                         | Remove global orb entirely; constrain reflection to the active card                   |
| Loop           | Normal document ends after credits/footer                                                                       | No future-to-origins continuation                                        | Cyclic controller and closed route with no content/model duplication                  |
| Visual tests   | Existing snapshots hide the canvas/poster                                                                       | They do not test the requested experience                                | Short human-reviewed desktop/mobile captures and runtime invariant counters           |

### 2.2 Supplied recording observations

The supplied 1910×1018, 30 fps, 43.733-second recording is the runtime baseline because the deployment could not be reached from the available network.

- Origins shows the current orange DNA while the fixed header and static glass card remain dominant.
- Interests shows the procedural purple/orange phage forms.
- Research shows a procedural helix and retains visible remnants from the preceding scene.
- Computation shows a procedural purple lattice.
- Future shows a procedural orbit.
- The camera mainly slides sideways through large empty regions; close exhibit spacing and limited depth cues prevent a sense of scale.
- Fog forms drift independently of chapter travel instead of forming planned transition corridors.
- Publications, contact, and credits continue after Future, breaking the 3D narrative.
- The card/cursor highlight becomes a large bright stain over the credits area near the end of the recording.

### 2.3 Supplied material reference

The reference coin communicates premium depth through thick rounded layers, semi-translucent cyan/teal material, a small yellow/lilac pearlescent shift, edge refraction, and soft reflections. It does not rely on a large pointer light. The card implementation must translate those cues into CSS layers while preserving readable, semantic DOM text.

## 3. Decisions that supersede the existing action plan

The following repository decisions are explicitly obsolete for this restructure:

1. The eight-unit linear chapter spacing is superseded by the closed radius-22 layout.
2. Re-enabling the fixed header, progress indicator, and footer is superseded by a chrome-free immersive stage.
3. Keeping procedural exhibits while provenance is incomplete is superseded for the testing phase; available real GLBs must render now.
4. Provenance completeness must not gate `assetPath`, preloading, or scene mounting. Credits remain a separate publication concern.
5. The finite chapter document plus post-narrative sections is superseded by a cyclic journey and separate secondary-content routes/dialogs.
6. Pointer-reactive atmosphere and a prominent cursor orb are superseded by travel-reactive atmosphere and a restrained card-local reflection.

Record these reversals in new ADRs instead of silently editing old rationale.

### 3.1 Audited current-component disposition

This table prevents an implementation agent from layering the new system on top of conflicting old behavior.

| Current repository unit                                                                      | Audited responsibility                                                                               | Required disposition                                                                        |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/components/portfolio/PortfolioDocument.tsx`                                             | Composes pointer tracker, skip/header/progress, chapters, publications, contact, credits, and footer | Rewrite as the immersive composition root; remove finite tail and global chrome imports     |
| `src/components/portfolio/ChapterSection.tsx`                                                | Creates `min-height:100svh` document chapters and IntersectionObserver activation                    | Retire from `/`; reuse only content helpers that have no observer/scroll-height behavior    |
| `SiteHeader.tsx`                                                                             | Fixed top navigation                                                                                 | Do not mount on `/`; retain only if another non-immersive route imports it                  |
| `ChapterProgressIndicator.tsx`                                                               | Fixed chapter progress chrome                                                                        | Do not mount on `/`; replace with optional tiny progress marks inside the active card       |
| `SiteFooter.tsx`                                                                             | Terminates the document                                                                              | Do not mount on `/`; retain only for separate document routes if required                   |
| `PublicationStatusSection.tsx`                                                               | Post-chapter publication block                                                                       | Fold meaningful status into Research content; remove from the cyclic route                  |
| `ContactSection.tsx`                                                                         | Post-chapter contact block                                                                           | Replace home usage with a modal that pauses journey input                                   |
| `CreditsSection.tsx`                                                                         | Post-chapter credits block                                                                           | Remove from home; keep a standalone `/credits` route                                        |
| `src/components/canvas/ExperienceCanvas.tsx`                                                 | Owns R3F canvas and scene composition                                                                | Retain one canvas; wire the journey runtime and tier values into it                         |
| `src/components/scene/ChapterCameraRig.tsx`                                                  | Lerp between discrete camera poses                                                                   | Rewrite to sample the closed route from continuous journey units                            |
| `src/components/scene/SceneContent.tsx`                                                      | Mount active and adjacent current/procedural exhibits                                                | Rewrite to mount five stable canonical model groups and change only visibility/activity     |
| `src/components/scene/NebulaBackground.tsx`                                                  | Camera-following far-field shader with pointer/motion response                                       | Keep only as restrained far field; remove pointer warp and bind motion to travel pulse      |
| `src/components/scene/Particles.tsx`                                                         | Random broad world particles                                                                         | Reduce to sparse depth dust or fold into the seeded route field; it must not imitate clouds |
| `src/components/scene/AtmosphereController.tsx`                                              | Damp palette/fog from discrete active chapter                                                        | Rewrite to blend outgoing/incoming palettes continuously and apply travel-pulse fog         |
| `src/components/scene/Lighting.tsx`                                                          | Broad ambient/key/rim/fill chapter lighting                                                          | Retain global readability lights; add local halo lights separately and cap their count      |
| Existing postprocessing component                                                            | Bloom/chromatic aberration/vignette by quality tier                                                  | Retune to low bloom and travel-only aberration; never use bloom to manufacture card depth   |
| `Phage.tsx`, `PhageSystem.tsx`, `HelixExhibit.tsx`, `LatticeExhibit.tsx`, `OrbitExhibit.tsx` | Procedural exhibit substitutes                                                                       | Delete after real GLBs pass Patch 4 signoff                                                 |
| `src/components/ui/LiquidGlass.tsx`                                                          | Planar glass styling and oversized cursor radial                                                     | Rewrite or retire in favor of the pearlescent `ChapterCardShell`                            |
| `src/components/motion/LiquidGlassPointerTracker.tsx`                                        | Writes broad pointer highlight variables                                                             | Constrain to active-card-local reflection coordinates and opacity                           |
| `src/components/motion/CursorGlow.tsx`                                                       | Fixed 224 px violet cursor orb                                                                       | Remove and delete                                                                           |
| `src/lib/chapterRegistry.ts`                                                                 | Linear centers and hardcoded chapter composition                                                     | Rewrite around derived closed-route centers and data-driven model/card settings             |
| `src/stores/narrativeStore.ts`                                                               | Discrete chapter activation                                                                          | Restrict to settled/discrete state; do not store per-frame units                            |
| `src/content/assets.ts`                                                                      | DNA GLB plus procedural exhibit assignments                                                          | Replace with the five real-GLB runtime manifest and separate credit records                 |
| `src/content/siteContent.ts`                                                                 | Narrative and DNA-only credit schema                                                                 | Preserve narrative; decouple runtime asset validity from publication credits                |
| Existing visual snapshot suite                                                               | Hides canvas/poster for deterministic DOM snapshots                                                  | Keep useful semantic checks, but do not treat it as evidence for 3D/cloud/loop quality      |

The current dependency set already includes Three.js, React Three Fiber, Drei, Motion, Zustand, and postprocessing. Implement the runtime with those libraries; do not add a second scroll-animation or 3D framework.

## 4. Requirement-to-acceptance matrix

| Demand                       | Mandatory implementation                              | Objective acceptance                                                                                                                            |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Cursor glow is too much      | Remove `CursorGlow`; card reflection only             | No free-floating glow follows the cursor. Card reflection opacity never exceeds `0.12` and never crosses outside the card mask                  |
| Use real models              | Replace four procedural exhibits with the mapped GLBs | Scene graph contains no procedural substitute component after the real loader patch                                                             |
| Use the other animated DNA   | Render the new canonical alternate-DNA path           | The displayed Origins URL is `/models/dna_animated_alt_for_site.glb`, `animations.length >= 1`, and the current DNA is not mounted              |
| Cards enter the scene        | Drive entry/exit transforms from transition progress  | Every direction and every seam shows outgoing and incoming depth choreography; no card simply appears at rest                                   |
| Make space expansive         | Closed radius-22 layout and depth travel              | Adjacent model-center planar chord is `25.86 ± 0.05` units; no adjacent anchor is less than 24 units apart in 3D                                |
| Remove header/footer         | Remove global chrome from home experience             | No `header` or `footer` node is mounted on `/`; viewport is occupied by one immersive `main`                                                    |
| Make cards premium and 3D    | Pearlescent translucent CSS slab                      | Bevel/edge remains visible at rest; color shift comes from card material layers, not pointer glow                                               |
| Planned cloud motion         | World-space cloud corridors tied to travel pulse      | Clouds are nearly still at dwell, thicken/speed toward transition midpoint, and settle before arrival                                           |
| Magnetic 5/40/5 scroll       | Exact cyclic timeline constants and idle settle       | Each chapter consumes 5 entry + 40 dwell + 5 exit units; transition to next consumes the adjacent 5+5 units; idle settles to dwell center       |
| Model halo affects clouds    | Local halo sprite and short-range light               | Halo extends only slightly beyond silhouette; nearby clouds brighten subtly while far clouds do not                                             |
| Clouds integrated in depth   | Deterministic corridor placement around route         | At least one foreground, one midground, and one background cloud layer is visible during every transition                                       |
| Endless loop                 | Unwrapped logical units + modulo route sampling       | Downward travel from Future arrives at Origins; upward travel from Origins arrives at Future; three loops do not increase card/model/GLB counts |
| No chapter/model duplication | One canonical instance per ID                         | Dev invariant reports exactly 5 card roots, 5 model roots, and one GLTF cache entry per asset path after repeated loops                         |

## 5. Target architecture

### 5.1 One source of continuous truth

Create `src/lib/journeyRuntime.ts` and expose a provider/hook around three values:

- `inputUnits`: unwrapped numeric target updated by wheel, touch, keyboard, and programmatic chapter navigation;
- `renderUnits`: spring-smoothed Motion value that follows `inputUnits`;
- `velocity`: derived from `renderUnits` for direction and atmosphere intensity.

Do not write continuous units, pointer coordinates, camera position, or cloud transforms into React state or Zustand on every frame. Motion values update DOM without React rerenders, and React Three Fiber frame work must read the current value imperatively and mutate Three.js objects using `delta`. This follows the official [Motion value](https://motion.dev/docs/react-motion-value) and [R3F frame-loop](https://r3f.docs.pmnd.rs/advanced/pitfalls) guidance.

Keep only discrete, low-frequency state in `src/stores/narrativeStore.ts`:

```ts
type JourneyDirection = -1 | 0 | 1
type TravelMode = 'dwell' | 'transition'

type NarrativeState = {
  settledChapterId: ChapterId
  visibleChapterIds: ChapterId[]
  direction: JourneyDirection
  travelMode: TravelMode
  loopCount: number
  overlay: null | 'contact' | 'information'
}
```

Update `settledChapterId` only after magnetic settling reaches a dwell center within `0.02` units. Update `visibleChapterIds` only when the derived outgoing/incoming pair changes. The canvas, cards, clouds, and halos all decode the same `renderUnits`; none maintains a parallel animation clock.

### 5.2 Exact cyclic timeline

Create `src/lib/journeyTimeline.ts` with these exported constants and no competing magic numbers:

```ts
export const CHAPTER_COUNT = 5
export const ENTRY_UNITS = 5
export const DWELL_UNITS = 40
export const EXIT_UNITS = 5
export const SLOT_UNITS = 50
export const TRANSITION_UNITS = EXIT_UNITS + ENTRY_UNITS // 10
export const CYCLE_UNITS = CHAPTER_COUNT * SLOT_UNITS // 250
export const INITIAL_UNITS = ENTRY_UNITS + DWELL_UNITS / 2 // 25
```

Define the logical layout around every integer chapter ordinal `n`:

- chapter index: `positiveModulo(n, 5)`;
- chapter entry interval: `[n*50 - 5, n*50 + 5]` is the transition from ordinal `n-1` to `n`;
- chapter dwell interval: `[n*50 + 5, n*50 + 45]`;
- dwell center and magnetic rest point: `n*50 + 25`;
- transition `n → n+1`: `[n*50 + 45, n*50 + 55]`.

This yields the requested repeating proportion:

```text
5 entry · 40 chapter · 5 exit · 5 entry · 40 chapter · 5 exit · …
```

Implement the decoder around a canonical increasing-direction segment, then derive the visual outgoing/incoming order from travel direction. This removes all ambiguity at the seam:

```ts
const destinationOrdinal = Math.floor((units + ENTRY_UNITS) / SLOT_UNITS)
const local = units - destinationOrdinal * SLOT_UNITS // always [-5, 45)

if (local < ENTRY_UNITS) {
  const segmentFromOrdinal = destinationOrdinal - 1
  const segmentToOrdinal = destinationOrdinal
  const canonicalT = (local + EXIT_UNITS) / TRANSITION_UNITS // 0..1
  const directedT = direction < 0 ? 1 - canonicalT : canonicalT

  return {
    mode: 'transition',
    segmentFromOrdinal,
    segmentToOrdinal,
    routeCanonicalT: canonicalT,
    transitionT: directedT,
    outgoingOrdinal: direction < 0 ? segmentToOrdinal : segmentFromOrdinal,
    incomingOrdinal: direction < 0 ? segmentFromOrdinal : segmentToOrdinal,
  }
}

return {
  mode: 'dwell',
  currentOrdinal: destinationOrdinal,
  dwellT: (local - ENTRY_UNITS) / DWELL_UNITS,
}
```

For route sampling, always use the direction-independent canonical segment:

```ts
routeT = (sample.segmentFromOrdinal + smootherstep01(sample.routeCanonicalT)) / CHAPTER_COUNT
routeT = positiveModulo(routeT, 1)
```

When the user travels backward, `units` and `routeCanonicalT` decrease naturally along the same curve. `transitionT` remains a directed `0→1` value for card choreography, so the reverse transition mirrors correctly without a second timeline.

The scalar must stay logically unwrapped. Example downward values are `225` (Future dwell), `245…255` (Future→Origins travel), and `275` (Origins dwell on loop 1). Route and content lookup use positive modulo; direction and loop count use the unwrapped value. Do not reset a browser scroll position and do not clone sentinel chapters.

Implement these pure exports:

```ts
positiveModulo(value: number, modulus: number): number;
decodeJourney(units: number, direction: -1 | 0 | 1): JourneySample;
getDwellCenter(ordinal: number): number;
getMagneticTarget(units: number, velocity: number, lastDirection: -1 | 0 | 1): number;
getCyclicChapterIndex(ordinal: number): number;
smootherstep01(t: number): number;
```

`JourneySample` must be a discriminated union so dwell-only and transition-only fields cannot be mixed:

```ts
type JourneyCommon = {
  localUnits: number
  loopCount: number
  direction: -1 | 0 | 1
}

type JourneySample = JourneyCommon &
  (
    | {
        mode: 'dwell'
        currentOrdinal: number
        currentIndex: number
        dwellT: number // 0..1 over the 40-unit dwell
      }
    | {
        mode: 'transition'
        segmentFromOrdinal: number
        segmentToOrdinal: number
        outgoingIndex: number
        incomingIndex: number
        routeCanonicalT: number // 0..1 as logical units increase
        transitionT: number // directed 0..1 from visible outgoing to incoming
        easedTransitionT: number // 6t^5 - 15t^4 + 10t^3
      }
  )
```

Use `smootherstep01` for route travel because its first derivative is zero at both ends. The camera and clouds therefore accelerate away from an exhibit, reach maximum speed at the corridor midpoint, and decelerate before the next exhibit.

### 5.3 Input and magnetic settling

Create `src/components/motion/CyclicJourneyController.tsx`. It owns input listeners only while the immersive stage is active and no modal is open.

#### Wheel/trackpad

1. Attach one `wheel` listener to the stage with `{ passive: false }` because the fixed stage consumes the gesture.
2. Return without consuming when `event.ctrlKey` is true so browser/trackpad pinch zoom remains available.
3. Normalize `deltaY` by `deltaMode`:
   - pixel mode: `deltaY`;
   - line mode: `deltaY * 16`;
   - page mode: `deltaY * window.innerHeight`.
4. Clamp a single normalized event to `[-120, 120]` px to suppress device spikes.
5. Convert using `50 units / 720 px` on pointer-precise desktop devices.
6. Accumulate sustained events; do not hard-lock one chapter per gesture.
7. Record the last nonzero direction and schedule magnetic settling 140 ms after the final input event.

Wheel events vary by device and are not the same thing as document scroll; normalization and non-wheel controls are mandatory. See [MDN's wheel-event guidance](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event).

#### Touch

- Use pointer capture on the stage for a single primary touch/pen pointer.
- Convert vertical drag using `50 units / min(420 px, 0.48*viewportHeight)`.
- Apply movement continuously while dragging.
- On release, pass measured release velocity into `getMagneticTarget`.
- Ignore horizontal gestures when `abs(dx) > abs(dy)` until vertical intent is established.
- Cancel capture when a modal opens or the page loses visibility.

#### Keyboard and explicit controls

- `ArrowDown`, `PageDown`, and `Space` target the next ordinal dwell center.
- `ArrowUp`, `PageUp`, and `Shift+Space` target the previous ordinal dwell center.
- `Home` targets the Origins dwell center in the current or nearest cycle without animating through multiple chapters.
- `1` through `5` target the nearest ordinal representing that chapter in the current direction.
- Ignore shortcuts originating in inputs, textareas, selects, contenteditable regions, or open dialogs.

#### Magnetic target rule

- If `abs(velocity) >= 18 units/s`, settle to the next dwell center in the velocity direction.
- Otherwise, settle to the nearest dwell center.
- Apply a 6-unit hysteresis around the previous rest point so small trackpad tremors do not switch chapters.
- Drive `renderUnits` with `useSpring(inputUnits, { stiffness: 115, damping: 24, mass: 0.9 })`.
- End settling when both `abs(position-target) < 0.02` and `abs(velocity) < 0.02` for two frames.

Do not use CSS Scroll Snap as the primary controller. Its specification intentionally leaves precise physics to the browser, so it cannot guarantee the required proportional timing or cyclic seam. [CSS Scroll Snap Level 1](https://www.w3.org/TR/css-scroll-snap-1/)

### 5.4 Closed 3D route and model placement

Create `src/lib/closedRoute.ts` and make `src/lib/chapterRegistry.ts` consume it.

Use this fixed geometric definition:

```ts
const ROUTE_RADIUS = 22
const START_ANGLE = -Math.PI / 2
const Y_OFFSETS = [0, 2.4, -1.3, 1.9, 0.5] as const

theta(i) = START_ANGLE + i * ((2 * Math.PI) / 5)
modelCenter(i) = [22 * cos(theta(i)), Y_OFFSETS[i], 22 * sin(theta(i))]
```

The planar chord is `2 * 22 * sin(π/5) = 25.86` world units. The centers are therefore:

| Chapter     | Index | Model center `[x,y,z]` rounded to 3 decimals |
| ----------- | ----: | -------------------------------------------- |
| Origins     |     0 | `[0.000, 0.000, -22.000]`                    |
| Interests   |     1 | `[20.923, 2.400, -6.798]`                    |
| Research    |     2 | `[12.931, -1.300, 17.799]`                   |
| Computation |     3 | `[-12.931, 1.900, 17.799]`                   |
| Future      |     4 | `[-20.923, 0.500, -6.798]`                   |

For each chapter, calculate a normalized radial vector in the XZ plane. Define:

- model orientation: face approximately toward the ring interior, with a per-model yaw correction stored in the registry;
- dwell camera position: `modelCenter + radial * 10.5 + [0, 2.6, 0]`;
- camera look target: `modelCenter + [0, modelLookYOffset, 0]`;
- card-safe model offset: per-chapter tangent shift so the model occupies the half opposite the DOM card.

Build a closed camera curve and closed look-target curve using `THREE.CatmullRomCurve3(points, true, "centripetal", 0.5)`. During any transition, sample the direction-independent canonical segment at:

```ts
const segmentT = positiveModulo(
  (sample.segmentFromOrdinal + smootherstep01(sample.routeCanonicalT)) / CHAPTER_COUNT,
  1,
)
```

Use `curve.getPoint(segmentT)` and `curve.getTangent(segmentT)`. At dwell, assign the exact stored camera and target anchors rather than an approximate sample. Add only these restrained travel effects:

- camera FOV: `42°` at dwell, up to `47°` at transition midpoint, back to `42°` at arrival;
- roll/bank: maximum `3.5° * direction` at midpoint, zero at both ends;
- target lead: tangent-aligned `1.4` units at midpoint, zero at both ends;
- model parallax: derived from camera movement only; do not add independent large model translations.

The closed spline, tangent APIs, and closed 3D frames are supported by [Three.js `CatmullRomCurve3`](https://threejs.org/docs/pages/CatmullRomCurve3.html) and [Three.js `Curve`](https://threejs.org/docs/pages/Curve.html).

Rewrite `src/components/scene/ChapterCameraRig.tsx` so it reads `renderUnits` in `useFrame`, decodes once per frame, mutates camera/target with `delta`, and publishes only discrete boundary changes to the store. Delete its current active-chapter pose lerp.

## 6. Real-model replacement

### 6.1 Canonical runtime manifest

Replace the procedural exhibit IDs with this exact runtime mapping in `src/content/assets.ts`:

| Chapter     | Exhibit ID          | Required runtime GLB                          |               Current repository size | Animation policy                                                                     |
| ----------- | ------------------- | --------------------------------------------- | ------------------------------------: | ------------------------------------------------------------------------------------ |
| Origins     | `dna-alt`           | `/models/dna_animated_alt_for_site.glb`       | external input; not currently present | Play all intended embedded clips; `animations.length >= 1` is required               |
| Interests   | `bacteriophage`     | `/models/bacteriophage_for_site.glb`          |                               ~858 KB | Use embedded clips if present; otherwise only a restrained group-level idle rotation |
| Research    | `hemoglobin-ribbon` | `/models/6HHB-ribbon-secondary-vis_NIH3D.glb` |                             ~10.89 MB | Preserve real geometry/materials; restrained group-level idle only if no clip exists |
| Computation | `brain-point-cloud` | `/models/brain_point_cloud_site.glb`          |                              ~33.4 MB | Use embedded clips if present; otherwise a subtle group-level reveal/rotation        |
| Future      | `earth-animated`    | `/models/earth_animated_for_site.glb`         |                             ~23.34 MB | Play the intended embedded Earth clips                                               |

These mappings are content-aligned and use real assets already in `public/models`, except the requested alternate DNA binary.

### 6.2 Alternate animated DNA intake contract

The current default branch contains only `public/models/dna_for_site.glb`. Historical paths refer to the same current visual lineage; no second DNA filename or source is recorded. Do not relabel that file as the alternate.

The asset owner must place the requested binary at:

```text
public/models/dna_animated_alt_for_site.glb
```

Patch 4 must reject completion until all of these checks pass:

- the file is a real binary or Git LFS-managed binary, not an LFS pointer served to the browser;
- `useGLTF` loads it without console warnings;
- `gltf.animations.length >= 1`;
- the intended clip visibly advances for five seconds;
- the normalized bounds fit the Origins composition without changing camera geometry;
- the network panel shows the alternate path and does not request `dna_for_site.glb` for the Origins exhibit.

Keep `dna_for_site.glb` in the repository only as a rollback asset. Do not mount or preload it in the new journey.

### 6.3 Loader and lifetime rules

Create `src/components/scene/exhibits/ChapterGLTFModel.tsx` as the single loader path for all five exhibits.

1. Call `useGLTF(assetPath, true)` once per canonical path.
2. Clone only when required to isolate an asset's skeleton/material mutation; there remains exactly one rendered clone for that chapter.
3. Compute bounds once after load, normalize to the registry's `targetDiameter`, and apply chapter-specific rotation/offset from data rather than component conditionals.
4. Use Drei `useAnimations` or one `THREE.AnimationMixer` scoped to the model root.
5. Start configured clips once. Set mixer `timeScale = 1` for current/adjacent exhibits and `0` for far exhibits. Three.js explicitly supports pausing a mixer by setting `timeScale` to zero. [Three.js `AnimationMixer`](https://threejs.org/docs/pages/AnimationMixer.html)
6. Keep every loaded exhibit group mounted for the remainder of the session. Set far groups to `visible=false`; never unload/remount at the Future→Origins seam.
7. Clean up actions/mixers only when the whole canvas unmounts, not on chapter changes.
8. Preserve model meshes and materials. Any group-level idle motion rotates the real loaded model; it must not replace or redraw it procedurally.

Rewrite `src/components/scene/SceneContent.tsx` to create exactly five stable `ChapterExhibit` children keyed by chapter ID. Stage network work in this order:

- preload Origins immediately;
- preload the next and previous chapters after Origins is interactive;
- preload the remaining two in `requestIdleCallback` or its timeout fallback;
- retain all resolved assets in the GLTF cache;
- never issue a new preload because `loopCount` changes.

After the real loaders are visually accepted, delete the obsolete procedural components and their imports:

- `Phage.tsx`;
- `PhageSystem.tsx`;
- `HelixExhibit.tsx`;
- `LatticeExhibit.tsx`;
- `OrbitExhibit.tsx`.

If exact filenames differ by folder in the branch at implementation time, remove the corresponding files identified by those exported component names. Do not retain dormant procedural fallbacks in the production scene.

### 6.4 Testing-phase asset policy

Split the current asset/credit coupling:

```ts
type RuntimeAssetSpec = {
  id: ExhibitId
  assetPath: string
  chapterId: ChapterId
  targetDiameter: number
  animationClips: 'all' | string[]
  testingOnly: boolean
}

type PublicationCredit = {
  assetId: ExhibitId
  sourceUrl?: string
  author?: string
  license?: string
  status: 'verified' | 'deferred'
}
```

`RuntimeAssetSpec` is the only input to model loading. A missing or deferred `PublicationCredit` must not remove `assetPath`, skip a preload, or substitute procedural geometry. Keep credit records in a separate non-runtime manifest and expose them only on `/credits`. Remove the `dna`-only schema restriction from runtime validation.

## 7. Card system: premium, dimensional, and restrained

### 7.1 DOM architecture

Keep narrative text in the DOM for selection, semantics, responsive typography, and keyboard access. Create:

- `src/components/narrative/CyclicChapterStage.tsx` — mounts the five stable card shells and derives outgoing/incoming state from `renderUnits`;
- `src/components/narrative/ChapterCardShell.tsx` — owns material layers, 3D transform, active/inert state, and pointer reflection;
- reuse `ChapterDetail.tsx` for chapter content after removing assumptions about a normal document section.

Mount exactly one `ChapterCardShell` per chapter. During dwell, only the settled card is visible. During transition, only the outgoing and incoming canonical nodes become visible. Do not clone cards for animation or for the loop seam.

### 7.2 Pearlescent slab specification

Implement the card with these material layers in `src/styles/globals.css` or a colocated CSS module:

1. **Slab base**
   - `position: relative; isolation: isolate;`
   - `border-radius: clamp(24px, 3vw, 38px);`
   - `perspective: 1200px; transform-style: preserve-3d;`
   - background alpha between `0.44` and `0.58`, not an opaque panel;
   - `backdrop-filter: blur(14px) saturate(130%);`
   - border `1px solid rgba(224, 255, 255, 0.24)`.
2. **Pearl layer (`::before`)**
   - combine a low-opacity conic gradient and a vertical transparent gradient;
   - use teal/cyan as the base, a narrow warm ivory/yellow band, and a narrow lilac band;
   - maximum layer opacity `0.22` at rest;
   - blend with `screen` or `soft-light`, clipped to the rounded card.
3. **Thickness/bevel (`::after`)**
   - inset highlights on top/left and darker cyan shadow on bottom/right;
   - `transform: translateZ(-12px) translateY(7px);`
   - visible edge depth `8–12px` depending on viewport;
   - no neon outer glow.
4. **Content plane**
   - `transform: translateZ(18px);`
   - text contrast remains WCAG-readable against every chapter palette;
   - buttons receive their own shallow `translateZ(6px)` and physical edge shadow.
5. **Resting orientation**
   - desktop: `rotateX(-1.5deg)` and chapter-dependent `rotateY(±2.5deg)`;
   - mobile: reduce both to at most `1deg`;
   - pointer parallax may add at most `±1.25deg`, never translate the whole card toward the cursor.

The supplied image is the visual authority for color proportion: predominantly translucent cyan/teal, with small pearly warm and lilac shifts. Do not introduce rainbow holographic noise.

### 7.3 Remove dominant cursor glow

1. Remove `<CursorGlow />` from `PortfolioDocument.tsx`/its replacement.
2. Delete `src/components/motion/CursorGlow.tsx` after confirming no imports remain.
3. Rewrite `LiquidGlassPointerTracker` so it only updates CSS custom properties on the currently active card:
   - `--reflection-x` and `--reflection-y` normalized to `0…1` within the card bounds;
   - `--reflection-opacity` capped at `0.12` on fine pointers and `0` on coarse pointers;
   - reflection footprint `96px` maximum or `18%` of the card width, whichever is smaller;
   - highlight uses an elongated, blurred specular streak, not an 18 rem radial blob;
   - fade duration `180ms` entering and `240ms` leaving;
   - disable entirely under `prefers-reduced-motion`, `prefers-reduced-transparency`, and touch/coarse-pointer conditions.
4. Remove the current `transparent 18rem` radial hover rule and any card hover opacity near `0.8`.

The card must still look premium when the pointer is stationary or absent. Pointer response is confirmation of material, not the material's source.

### 7.4 Entry and exit choreography

Drive transforms from the same `transitionT` as the camera.

#### Outgoing card, direction `+1`

At `transitionT=0`, start at rest. At `transitionT=0.52`, reach:

```css
translate3d(-12vw, -2vh, -140px) rotateY(10deg) scale(0.95)
opacity: 0;
filter: blur(6px);
```

For direction `-1`, mirror the X translation and Y rotation.

#### Incoming card, direction `+1`

Remain invisible until `transitionT=0.42`. Start from:

```css
translate3d(18vw, 4vh, -180px) rotateY(-14deg) scale(0.92)
opacity: 0;
filter: blur(8px);
```

Reach the resting transform by `transitionT=1`. Mirror X/rotation for direction `-1`.

Use opacity only as support for depth and movement; do not crossfade two static cards. The Future→Origins transition uses the same outgoing Future and incoming Origins nodes and the same transform functions.

At settle:

- active card: `pointer-events:auto`, `aria-hidden=false`, not inert;
- all other cards: `pointer-events:none`, `aria-hidden=true`, `inert`;
- transition pair: visible but only the card above 0.5 progress is focusable;
- move focus only after keyboard-initiated chapter navigation, never after passive wheel movement.

## 8. Spatial clouds, travel acceleration, and model halos

### 8.1 Split far field from spatial fog

Retain `src/components/scene/NebulaBackground.tsx` only as a far-field color volume:

- continue centering the large sphere on the camera so it cannot reveal an edge;
- reduce shader motion at dwell to 20% of the current rate;
- remove pointer-driven warp from the nebula shader;
- cap far-field opacity/contrast so it never reads as a foreground cloud;
- modulate its motion with the shared travel pulse, not cursor position.

Create `src/components/scene/RouteCloudField.tsx` for all nearby fog. Use Drei's `<Clouds>` provider and `<Cloud>` children so the field is grouped into one instanced draw call. Drei documents this batching behavior, while Three.js documents the draw-call benefit of instancing. [Drei Cloud](https://drei.docs.pmnd.rs/staging/cloud), [Three.js `InstancedMesh`](https://threejs.org/docs/pages/InstancedMesh.html)

### 8.2 Deterministic corridor distribution

Use a committed seeded generator with constant seed `0x4d414d41` (`"MAMA"`). Generate the field once with no `Math.random()` in render or effects.

For each of the five route segments:

- high tier: 12 cloud clusters per segment, 60 total;
- medium tier: 8 per segment, 40 total;
- low tier: 5 per segment, 25 total.

For a corridor sample `s` in `(0.08, 0.92)`:

```ts
center =
  cameraCurvePoint(segment, s) +
  routeNormal * seededRange(-5.0, 5.0) +
  routeBinormal * seededRange(-3.2, 3.2) +
  tangent * seededRange(-1.5, 1.5)
```

Assign every corridor:

- 25% foreground/near-camera clusters with low opacity and large soft scale;
- 50% midground clusters with the highest visible density;
- 25% background clusters near or behind the next model;
- at least two clusters within the next model halo's light distance;
- a clear center channel so the model silhouette is never fully obscured at arrival.

Use local texture `/textures/cloud-soft.png` and a lit transparent material (`MeshLambertMaterial` or an equivalent custom lit cloud material), `depthWrite=false`, and controlled render order. Do not fetch an external cloud texture at runtime.

### 8.3 Travel-linked cloud behavior

Derive one travel pulse:

```ts
travelPulse = sample.mode === 'transition' ? Math.sin(Math.PI * sample.transitionT) ** 2 : 0
```

At dwell (`travelPulse=0`):

- cluster drift speed: `0.015–0.03` world units/s;
- corridor opacity multiplier: `0.62`;
- fog near/far: chapter registry values, approximately `near=13`, `far=54`;
- nebula motion multiplier: `0.2`.

At transition midpoint (`travelPulse=1`):

- move cloud texture/instances along the route tangent by a maximum of `0.55` world units/s relative motion;
- elongate cloud bounds along the tangent up to `1.22×`;
- corridor opacity multiplier: `1.0`;
- tighten volumetric depth to approximately `near=7`, `far=36`;
- raise far-field motion multiplier to `0.85`;
- raise FOV to the route-defined `47°` maximum.

Return all values to dwell levels by arrival. Use `delta` in `useFrame`; never allocate vectors or set React state per frame. The result must feel like the camera accelerates into denser fog, passes through it, and brakes as the next model resolves.

### 8.4 Model halo and cloud response

Create `src/components/scene/ModelHalo.tsx` and mount one inside each canonical `ChapterExhibit` group.

Each halo contains:

- one camera-facing radial sprite using additive blending;
- sprite scale `1.10–1.18 ×` the model's normalized bounding-sphere diameter;
- sprite center opacity `0.10–0.16`, edge opacity zero;
- one chapter-colored `PointLight` for active/adjacent models only;
- light intensity `0.28` high tier, `0.20` medium, `0` low;
- distance `12`, decay `2`;
- inactive/far halo opacity and light intensity zero.

Only the active and incoming/outgoing model may own nonzero lights, so at most two halo point lights are evaluated during a transition. Because route clouds use a lit material, cloud clusters inside the light distance receive a faint color/luminance lift. Keep that lift under roughly 12% relative luminance; it must not tint the full scene.

Tune postprocessing in the existing effects component:

- bloom threshold `>= 0.92`;
- bloom intensity `0.18–0.28` high tier and disabled on low tier;
- halo sprite provides the silhouette aura even without bloom;
- remove or reduce chromatic aberration during dwell; cap it to a small travel-only pulse;
- keep vignette subtle and static.

Acceptance is visual: halo extends only 6–10% beyond the apparent model silhouette at dwell, and the nearest clouds respond without producing a screen-sized glow.

## 9. Immersive page composition and secondary content

### 9.1 Home route

Rewrite `src/components/portfolio/PortfolioDocument.tsx` into a composition root or replace it with `src/components/portfolio/ImmersiveExperience.tsx`:

```tsx
<main className="immersive-journey">
  <ExperienceCanvas />
  <CyclicJourneyController>
    <CyclicChapterStage />
  </CyclicJourneyController>
  <ChapterAnnouncement />
  <ExperienceOverlays />
</main>
```

The home route must not mount:

- `SiteHeader`;
- `ChapterProgressIndicator` as fixed chrome;
- `SiteFooter`;
- `PublicationStatusSection` as an after-journey section;
- `ContactSection` as an after-journey section;
- `CreditsSection` as an after-journey section;
- vertically stacked `ChapterSection` wrappers.

Delete now-unused components only after their content has been relocated and routes compile.

### 9.2 Preserve information without recreating a header/footer

- Fold meaningful publication/research status into the Research card. Do not render an empty publication section after the journey.
- Open contact content in `ContactDialog.tsx` from the relevant chapter action. While open, pause the journey controller and model/camera travel; `Escape` closes it and returns focus to the trigger.
- Keep `/credits` and `/privacy` as separate semantic routes. They may use a plain document layout because they are outside the immersive home experience.
- Put one small `Information` action inside the active card, not in fixed global chrome; it opens links to Credits and Privacy in `InformationDialog.tsx`.
- If chapter progress is retained, render only `01 / 05` and/or five small marks inside the card material. Do not restore a fixed rail, header, or footer.

## 10. Scene registry and content contract

Refactor `src/lib/chapterRegistry.ts` so each record owns every spatial and runtime parameter needed by a generic scene component:

```ts
type ChapterSceneSpec = {
  id: ChapterId
  index: 0 | 1 | 2 | 3 | 4
  exhibitId: ExhibitId
  modelCenter: readonly [number, number, number]
  modelRotation: readonly [number, number, number]
  modelOffset: readonly [number, number, number]
  targetDiameter: number
  lookYOffset: number
  cardSide: 'left' | 'right'
  cardRestYawDeg: number
  haloColor: string
  fogColor: string
  fogNear: number
  fogFar: number
  environmentColor: string
}
```

Do not store camera positions by hand in the registry after `closedRoute.ts` is introduced. Derive them from model center/radial basis so changing `ROUTE_RADIUS` preserves composition.

Keep content and spatial data separate:

- `src/content/siteContent.ts`: headings, prose, CTAs, accessible labels;
- `src/content/assets.ts`: runtime asset paths and model settings;
- `src/lib/chapterRegistry.ts`: spatial/material composition;
- `src/lib/journeyTimeline.ts`: scroll/timeline mathematics.

The chapter array order remains the canonical order: Origins, Interests, Research, Computation, Future. Endless behavior changes ordinal arithmetic, not content order or array duplication.

## 11. Performance and resource policy

The selected real models are substantially heavier than the procedural substitutes, so the following measures are part of the implementation, not optional follow-up work.

### 11.1 Optimize real assets without replacing them

Add `scripts/inspect-glb.mjs` and `scripts/optimize-glb.mjs` using a pinned glTF tooling dependency. For each selected source asset:

- report mesh, primitive, vertex, texture, material, skin, and animation counts;
- remove unused nodes/materials and deduplicate accessors;
- preserve animations, node names needed by clips, morph targets, and visible geometry;
- resize only textures exceeding the tier budget;
- emit optimized real-model derivatives under `public/models/runtime/` with deterministic filenames;
- record source path, source byte size, output path, output byte size, and a geometry/animation summary in `public/models/runtime/manifest.json`.

The runtime manifest may point to optimized derivatives after side-by-side visual signoff. A derivative of the real GLB is permitted; procedural reconstruction or static mock replacement is not.

### 11.2 Tier budgets

| Tier   |        DPR | Route clouds | Halo light                   | Bloom         | Real-model policy                                                                    |
| ------ | ---------: | -----------: | ---------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| High   | max `1.75` |           60 | active + transition neighbor | low intensity | optimized real GLBs, full intended animation                                         |
| Medium | max `1.35` |           40 | active only, neighbor sprite | reduced       | optimized real GLBs, full intended animation at lower mixer update range             |
| Low    |  max `1.0` |           25 | sprite only                  | off           | lower-resolution optimized derivatives of the same real GLBs; no procedural fallback |

Keep the existing static/reduced-capability poster only for devices that cannot create the WebGL context. It is not a chapter-level fallback.

### 11.3 Runtime budgets and invariants

- one `<Canvas>`;
- five canonical model root groups after all loads resolve;
- five canonical card roots;
- no scene-graph count increase after each loop;
- one cloud provider / one instanced cloud field;
- at most two active halo point lights;
- no GLB network request caused by a loop boundary;
- no per-frame React state update;
- no per-frame `new Vector3`, new arrays, or material allocation;
- pause far animation mixers with `timeScale=0`;
- reuse geometry/material resources where possible, following [R3F scaling guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

Add a development-only `JourneyDiagnostics` overlay behind `process.env.NODE_ENV !== "production"`. It reports units, decoded phase, loop count, active indices, model root count, card root count, cloud draw calls, total draw calls, triangles, and renderer memory. It must not ship visibly in production.

## 12. Responsive, accessibility, and reduced-motion behavior

### 12.1 Responsive composition

- Desktop `>= 1024px`: alternate card side by chapter, max card width `min(42vw, 620px)`, model on opposite side.
- Tablet `768–1023px`: card width `min(52vw, 560px)`, reduced yaw and travel X offsets by 25%.
- Mobile `<768px`: card in lower 46% of viewport, model in upper 54%, card max width `calc(100vw - 32px)`, entry/exit X offsets `10vw`, Z depth retained, cloud near density reduced one tier.
- Use safe-area insets for bottom card spacing; no header offset exists.
- Recompute projection/aspect and CSS layout on resize, but do not rebuild the route or model instances.

### 12.2 Semantic and input behavior

- The stage root is `<main>` with an accessible name, not `role="application"`.
- Add concise offscreen instructions: “Scroll, swipe vertically, or use arrow keys to move between five looping chapters.”
- `ChapterAnnouncement` uses `aria-live="polite"` and announces only after settle, e.g. “Chapter 3 of 5: Research.” It must not announce every transition frame or loop count.
- Keep inactive cards inert and hidden from the accessibility tree.
- Dialogs trap focus, pause journey input, close on Escape, and restore focus.
- All CTA buttons remain actual buttons or links.
- Preserve browser zoom by ignoring ctrl-wheel.

### 12.3 Reduced motion

When `prefers-reduced-motion: reduce` is active:

- jump directly between dwell centers; do not animate the camera through cloud corridors;
- disable card blur, Z flight, bank, FOV pulse, cloud velocity pulse, chromatic aberration, and pointer reflection;
- keep the current chapter's real model visible with its embedded animation paused unless the user explicitly enables animation;
- keep Previous/Next keyboard and visible in-card controls; Next from Future wraps instantly to Origins and Previous from Origins wraps to Future;
- retain the one-instance cyclic data model.

Do not use a long forced scroll document as the reduced-motion implementation.

## 13. File-by-file implementation sequence

Each patch must be independently reviewable. Do not combine the full rewrite into one commit.

### Patch 0 — baseline, alternate-DNA intake, and decision records

**Files**

- add `docs/adr/0007-closed-cyclic-journey.md`;
- add `docs/adr/0008-spatial-clouds-and-local-halos.md`;
- add `docs/adr/0009-testing-phase-real-asset-policy.md`;
- add `public/models/dna_animated_alt_for_site.glb` when supplied;
- add/update `public/models/runtime/manifest.json`;
- update prior ADR index/README if present.

**Work**

- Record the superseded decisions from Section 3.
- Inspect every mapped GLB and record bounds/animation counts.
- Validate the alternate DNA against Section 6.2.
- Record the supplied recording as baseline evidence in the PR description; do not commit the user video unless explicitly requested.

**Done when**

- every runtime model path resolves to a real GLB;
- alternate DNA has at least one animation and is visibly different from current DNA;
- provenance fields may remain deferred without changing runtime availability.

**Rollback point:** no runtime behavior changed.

### Patch 1 — cyclic timeline mathematics

**Files**

- add `src/lib/journeyTimeline.ts`;
- add `src/lib/journeyRuntime.ts`;
- update `src/stores/narrativeStore.ts`.

**Work**

- Implement the constants, pure decoder, positive modulo, direction, loop count, and magnetic target rules.
- Create Motion values/provider and discrete store boundary.
- Start at `INITIAL_UNITS=25`.
- Add development assertions for the exact seam samples: `244.99`, `245`, `250`, `255`, `255.01`, and their negative equivalents.

**Done when**

- Future→Origins and Origins→Future decode correctly with no cloned array entries;
- repeated `+250` or `-250` changes only `loopCount`, not cyclic chapter/phase output;
- continuous updates do not trigger component rerenders.

**Rollback point:** current document/camera still consumes old state until Patch 3.

### Patch 2 — immersive input controller and card-stage skeleton

**Files**

- add `src/components/motion/CyclicJourneyController.tsx`;
- add `src/components/narrative/CyclicChapterStage.tsx`;
- add `src/components/narrative/ChapterCardShell.tsx`;
- update `src/components/narrative/ChapterDetail.tsx`;
- update global/component styles for fixed-stage sizing.

**Work**

- Implement wheel normalization, touch capture, keyboard controls, modal pause, and magnetic settle.
- Mount five stable card shells with temporary existing visual styles.
- Prove inert/aria/focus behavior before adding premium material.

**Done when**

- input can move forward and backward across the seam indefinitely;
- card DOM count remains five after three loops;
- keyboard and touch reach the same dwell centers as wheel input;
- opening a temporary modal pause flag prevents journey movement.

**Rollback point:** feature-flag controller with `NEXT_PUBLIC_CYCLIC_JOURNEY` until Patch 7 removes the old document.

### Patch 3 — closed route, expanded layout, and camera physics

**Files**

- add `src/lib/closedRoute.ts`;
- rewrite `src/lib/chapterRegistry.ts`;
- rewrite `src/components/scene/ChapterCameraRig.tsx`;
- update `src/components/scene/SceneContent.tsx` to consume route centers;
- update `src/components/canvas/ExperienceCanvas.tsx` if provider wiring belongs there.

**Work**

- Generate the radius-22 model centers and derived camera/target anchors.
- Build closed camera/target curves.
- Replace discrete pose lerp with the decoded route sample.
- Add exact dwell poses, FOV pulse, tangent lead, and restrained bank.

**Done when**

- measured adjacent chord is 25.86 units;
- camera velocity is visually zero at each dwell and greatest near transition midpoint;
- Future→Origins follows the same physical path as all other neighbor transitions;
- crossing the seam produces no camera position, target, FOV, or roll discontinuity.

**Rollback point:** cyclic controller can still be disabled to compare old and new camera rigs.

### Patch 4 — real GLB exhibits and animation lifetime

**Files**

- update `src/content/assets.ts`;
- update `src/content/siteContent.ts` credit/runtime separation;
- add `src/components/scene/exhibits/ChapterGLTFModel.tsx`;
- add/update `src/components/scene/exhibits/ChapterExhibit.tsx`;
- rewrite `src/components/scene/SceneContent.tsx` mounting/preload policy;
- delete procedural exhibit files after parity is verified;
- add `scripts/inspect-glb.mjs` and `scripts/optimize-glb.mjs` if optimized derivatives are required;
- update `package.json`/lockfile only for pinned optimization tooling.

**Work**

- Apply the exact five-model mapping.
- Normalize bounds and orientations through registry data.
- Play embedded clips and pause far mixers.
- Stage preload once and retain loaded groups.
- Confirm Git LFS binaries are correctly served by Netlify rather than pointer text.

**Done when**

- all five chapters show real GLB geometry;
- Origins shows the alternate animated DNA path and clip;
- no procedural exhibit component remains in the runtime bundle;
- no model refetch/remount occurs across three full loops;
- low tier uses optimized derivatives of real models, never mocks.

**Rollback point:** keep the previous commit, not dormant procedural branches in the new scene.

### Patch 5 — spatial cloud corridors, halos, and lighting

**Files**

- add `src/components/scene/RouteCloudField.tsx`;
- add `src/components/scene/ModelHalo.tsx`;
- update `src/components/scene/NebulaBackground.tsx`;
- update `src/components/scene/AtmosphereController.tsx`;
- update `src/components/scene/Lighting.tsx`;
- update the postprocessing/effects component;
- add `public/textures/cloud-soft.png` if no suitable local texture exists.

**Work**

- Build seeded corridor positions around all five route segments.
- Link opacity, drift, elongation, fog, FOV support, and nebula motion to `travelPulse`.
- Add active/neighbor halo sprites and short-range lights.
- Use lit cloud material so nearby clouds respond.
- Remove pointer coupling from background atmosphere.

**Done when**

- each transition passes through foreground, midground, and background fog;
- clouds visibly accelerate/decelerate with travel and are near-static at dwell;
- halo subtly affects nearby clouds only;
- one cloud provider and at most two halo lights are active;
- no erratic random repositioning occurs between reloads.

**Rollback point:** route/camera/models remain valid with the old far field if this visual patch is reverted.

### Patch 6 — pearlescent card material and entry choreography

**Files**

- rewrite `src/components/ui/LiquidGlass.tsx` or retire it in favor of `ChapterCardShell.tsx`;
- rewrite `src/components/motion/LiquidGlassPointerTracker.tsx`;
- delete `src/components/motion/CursorGlow.tsx`;
- update `CyclicChapterStage.tsx` and `ChapterCardShell.tsx`;
- update card/global CSS.

**Work**

- Build base, pearl, bevel, thickness, content, and restrained reflection layers.
- Apply exact outgoing/incoming transforms from Section 7.4.
- Mirror transforms by travel direction.
- Disable pointer reflection on coarse pointers/reduced-motion.

**Done when**

- card is visibly dimensional without pointer movement;
- cursor does not create a free-floating orb or large stain;
- transition cards enter from depth on every chapter and both seam directions;
- text remains legible on all tier/background combinations.

**Rollback point:** cyclic stage remains functional with the temporary card skin from Patch 2.

### Patch 7 — remove 2D chrome and relocate secondary content

**Files**

- rewrite `src/components/portfolio/PortfolioDocument.tsx` or add/use `ImmersiveExperience.tsx`;
- add `src/components/portfolio/ExperienceOverlays.tsx`;
- add `src/components/portfolio/ContactDialog.tsx`;
- add `src/components/portfolio/InformationDialog.tsx`;
- retain/update `/credits` and `/privacy` routes;
- remove unused home imports/components: header, fixed progress, footer, stacked chapter sections, and inline post-journey sections.

**Work**

- Make the stage the only home-route layout.
- Move contact into a pausing dialog.
- Move credit/privacy navigation into the information dialog and separate routes.
- Fold research/publication status into Research content.
- Add settled chapter announcement and concise controls help.

**Done when**

- `/` contains no header/footer and cannot vertically reach a non-3D tail;
- scrolling forever stays inside the five-chapter loop;
- contact and information dialogs remain accessible and pause travel;
- Credits and Privacy remain reachable without global chrome.

**Rollback point:** secondary routes remain independent of the immersive stage.

### Patch 8 — tiering, diagnostics, and memory stability

**Files**

- update existing quality/performance-tier utilities;
- add `src/components/debug/JourneyDiagnostics.tsx`;
- update loader, cloud, halo, effects, and canvas tier branches;
- update documentation for runtime budgets.

**Work**

- Apply the exact tier table.
- Confirm animation mixers pause while far.
- Confirm resource reuse and no per-frame allocations.
- Report dev-only instance/draw/memory counters.
- Remove the diagnostics overlay from production output through an environment guard.

**Done when**

- three consecutive loops do not trend upward in model/card/cloud counts or renderer memory after warm-up;
- no loop-triggered GLB request appears;
- medium/low tiers remain real-model experiences;
- interaction stays responsive on representative desktop and mobile hardware.

### Patch 9 — visual QA, cleanup, and final decision record

**Files**

- update README architecture section;
- update ADR status to accepted;
- remove obsolete styles, exports, tests that hide the canvas, and dead procedural code;
- store final QA notes in `docs/visual-qa/cyclic-restructure.md`.

**Work**

- Capture the visual scenarios in Section 14.
- Compare against the supplied baseline and reference.
- Verify every matrix row in Section 4.
- Remove the feature flag only after signoff.

**Done when**

- all visual acceptance checks pass on desktop and mobile;
- no dead old journey path is reachable;
- the implementation and ADRs describe the same architecture;
- build, typecheck, and lint complete without new warnings.

## 14. Visual QA protocol — intentionally lightweight

Do not add an elaborate automated visual-test system. Use short repeatable captures plus browser/runtime counters.

### 14.1 Required captures

1. **Desktop forward loop:** 1440×900, Origins→Interests→Research→Computation→Future→Origins.
2. **Desktop reverse seam:** 1440×900, Origins→Future using upward scroll, then Future→Origins downward.
3. **Mobile forward loop:** 390×844, the same six arrivals.
4. **Three-loop stability:** desktop continuous travel for three cycles with diagnostics visible in development.
5. **Reduced motion:** desktop keyboard Next/Previous across both seams.
6. **Modal pause:** open Contact during Origins dwell, attempt wheel/touch/key travel, close, and verify the camera stayed at the same dwell.

### 14.2 Per-capture checklist

- No header or footer appears.
- Card looks dimensional before pointer interaction.
- Pointer reflection is barely visible and remains inside the card.
- Card visibly exits and the next card enters from depth.
- The camera accelerates into cloud fog and brakes into the next chapter.
- Clouds occupy foreground, midground, and background without covering the destination model at rest.
- Adjacent models do not crowd one another; no previous model remains unintentionally dominant at arrival.
- Every chapter uses the mapped real GLB.
- Alternate DNA visibly animates.
- Halo is faint and local; nearby clouds respond subtly.
- Future→Origins is indistinguishable in continuity and duration from other transitions.
- Reverse travel mirrors camera/card behavior correctly.
- No blank frame, teleport, scrollbar reset, or content flash appears at either seam.

### 14.3 Stability readings after warm-up

Record diagnostics at Origins dwell before loop 1 and after loop 3:

- model root count: exactly 5 at both readings;
- card root count: exactly 5 at both readings;
- cloud provider count: exactly 1;
- active halo lights: 1 at dwell, never over 2 in transition;
- GLB requests during loops 2 and 3: 0;
- renderer geometries/textures: no monotonic per-loop increase after all models have loaded;
- console errors/unhandled rejections: 0.

## 15. Non-negotiable implementation invariants

1. Never duplicate the chapter array to simulate infinity.
2. Never mount sentinel first/last cards or models.
3. Never reset document scroll position at the seam.
4. Never use `loopCount` as a React key for cards, model groups, clouds, canvas, or the experience root.
5. Never reload a GLB because a chapter recurs.
6. Never substitute procedural geometry when a mapped real GLB is slow or provenance is deferred.
7. Never use the current DNA as the requested alternate under a renamed ID.
8. Never drive cloud acceleration from cursor position.
9. Never restore a fixed site header, footer, or progress rail on the home route.
10. Never make pointer glow necessary for the card to read as pearlescent/3D.
11. Never write per-frame scene data to React state/Zustand.
12. Never use CSS Scroll Snap as the primary physics engine.

## 16. Risks and fixed mitigations

| Risk                                        | Fixed mitigation                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Alternate DNA binary is absent              | Reserve and validate the exact canonical path before Patch 4 completion; do not fake the asset                     |
| Heavy brain/Earth GLBs delay interaction    | Stage preload, create optimized derivatives preserving real geometry/animation, cap DPR, pause far mixers          |
| Closed curve produces seam orientation flip | Use a closed curve, exact dwell anchors, continuous tangent sampling, and explicit seam capture in both directions |
| Wheel behavior differs across devices       | Normalize `deltaMode`, clamp spikes, provide touch/keyboard controls, use magnetic target rules                    |
| Custom wheel capture harms dialogs/zoom     | Disable controller for dialogs/editable targets and ignore ctrl-wheel                                              |
| Clouds become expensive                     | One instanced cloud provider, tiered deterministic counts, reused material/texture                                 |
| Halo recreates current glow problem         | Local sprite opacity cap, short light distance, high bloom threshold, at most two active lights                    |
| Card transparency lowers legibility         | Alpha floor, controlled backdrop blur, chapter-specific contrast validation, opaque-enough content underlay        |
| Loop accumulates objects/memory             | Stable keys, mount-once models/cards, loop-independent effects, three-loop diagnostics comparison                  |
| Secondary content becomes unreachable       | Contact/information dialogs plus standalone Credits/Privacy routes and semantic card actions                       |

## 17. Authoritative technical references

- Three.js closed spline parameters: [CatmullRomCurve3](https://threejs.org/docs/pages/CatmullRomCurve3.html)
- Three.js curve point, tangent, and frame APIs: [Curve](https://threejs.org/docs/pages/Curve.html)
- Three.js physically based clearcoat, iridescence, transmission, thickness, and cost note: [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
- Three.js object-scoped animation updates and mixer pausing: [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html)
- Three.js repeated-geometry draw-call reduction: [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)
- Drei single-instanced cloud provider: [Cloud](https://drei.docs.pmnd.rs/staging/cloud)
- React Three Fiber frame-loop mutation guidance: [Performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- React Three Fiber reuse/instancing guidance: [Scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- Motion values without React rerender and velocity access: [Motion values](https://motion.dev/docs/react-motion-value)
- Motion value spring tracking: [`useSpring`](https://motion.dev/docs/react-use-spring)
- Browser scroll-snap physics are intentionally unspecified: [CSS Scroll Snap Level 1](https://www.w3.org/TR/css-scroll-snap-1/)
- Wheel-event variability and cancelability: [MDN `wheel` event](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event)

## 18. Final definition of done

The restructure is complete only when the home route is one chrome-free immersive viewport; all five chapters use their assigned real GLBs; Origins uses the supplied alternate animated DNA; cards read as pearlescent 3D slabs without relying on cursor glow; every card enters/exits from depth; model centers occupy the closed radius-22 layout; deterministic clouds form spatial transition corridors; camera/cloud motion accelerates and decelerates according to the exact 5/40/5 timeline; faint local model halos affect nearby clouds; and both forward and reverse travel cross the Future/Origins seam indefinitely with exactly one canonical instance and one model load per chapter.
