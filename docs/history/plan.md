# Refactor and Restructuring Plan

## 1. Objective

This document is a repo-grounded implementation plan for refactoring the portfolio into a coherent, production-grade product. It captures the architecture that exists today, the mismatch between intended design and the live implementation, the false masks and dead toggles in the code, the schema and runtime assumptions, and a phase-by-phase roadmap to correct the product.

The project already contains a strong conceptual foundation: a cinematic scientific portfolio, a 5-chapter narrative, a continuous journey model, a scene runtime, asset manifests, and strong test infrastructure. The main problem is not absence of architecture; it is inconsistency, feature gating, Hybrid composition, and partial implementation. The codebase currently looks like a product in transition from a classic document portfolio into an immersive 3D narrative without a clean migration boundary.

---

## 2. Repository review summary

### 2.1 High-level product direction

The product intends to be:

- a premium, cinematic scientific portfolio
- immersive and atmospheric
- built around a persistent 3D world
- spatially anchored to five scientific chapters
- shaped by motion, scroll, and chapter transitions
- visually rich without feeling like a game or a generic motion landing page

This intent is visible in:

- `src/app/page.tsx`
- `src/lib/journeyTimeline.ts`
- `src/lib/closedRoute.ts`
- `src/components/portfolio/ImmersiveStage.tsx`
- `src/components/scene/SceneClient.tsx`
- `src/lib/chapterRegistry.ts`
- `src/content/portfolio.ts`

### 2.2 Reality of the current implementation

The actual app now uses the immersive stage as its default home experience:

- the default route mounts the fixed immersive stage and its cyclic journey
- supporting information is available through standalone routes
- the retired document shell is no longer part of the shipping composition

This phase consolidates the shipping path around that intended system and moves secondary information to dedicated routes.

---

## 3. Architecture map

### 3.1 App shell and page routing

Primary files:

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/providers.tsx`
- `src/components/portfolio/ImmersiveStage.tsx`

Observed behavior:

- `src/app/page.tsx` renders `ImmersiveStage` as the home composition.
- Secondary information is available through standalone routes.
- The home page has one deliberate experience rather than environment-specific variants.

### 3.2 Narrative and chapter architecture

Primary files:

- `src/content/portfolio.ts`
- `src/lib/chapterRegistry.ts`
- `src/lib/chapterSelectors.ts`
- `src/hooks/useChapter.ts`
- `src/stores/narrativeStore.ts`

Observed architecture:

- a canonical chapter set exists: `origins`, `interests`, `research`, `computation`, `future`
- each chapter has content metadata, section id, navigation label, registry scene metadata, and exhibit mapping
- `chapterRegistry` drives the 3D experience
- `narrativeStore` tracks active chapter, direction, visible pair, travel mode, loop count, and overlay state

This is a structured and deliberate model. It gives the project a solid narrative spine while keeping supporting information on dedicated routes.

### 3.3 Journey timeline and continuous motion model

Primary files:

- `src/lib/journeyTimeline.ts`
- `src/components/motion/CyclicJourneyController.tsx`
- `src/lib/journeyRuntime.tsx`
- `src/components/motion/ChapterCameraRig.tsx`

Observed architecture:

- there is a formal cyclic journey system with entry, dwell, exit, transition, and wrap-around semantics
- the timeline uses a continuous unwrapped unit model rather than discrete chapter state
- `JourneyRuntimeProvider` exposes motion values and spring-based settling
- `CyclicJourneyController` handles wheel, keyboard, and pointer input
- the model makes a serious effort to produce a true immersive closed loop

This is one of the project’s strongest design pieces. It is likely the architectural core of the intended experience.

### 3.4 3D scene runtime and scene enhancement layer

Primary files:

- `src/components/scene/SceneClient.tsx`
- `src/components/scene/Experience.tsx`
- `src/components/scene/AtmosphereController.tsx`
- `src/components/scene/SceneContent.tsx`
- `src/components/scene/exhibitLoaders.ts`
- `src/components/scene/exhibits/ChapterGLTFModel.tsx`
- `src/lib/sceneRuntime.ts`
- `src/stores/sceneInteractionStore.ts`

Observed architecture:

- the app has runtime tier detection and WebGL capability gating
- `SceneClient` decides whether to render the webgl experience or a sr-only fallback message
- `Experience` runs a 3D canvas with camera rig, atmosphere, and scene content
- there is an explicit quality governor and performance adaptation layer
- `SceneContent` preloads assets and mounts dynamic models per chapter

This is a real implementation of a progressive enhancement model, but it is not fully aligned with the intended visual narrative. It mostly behaves like an advanced prototype rather than a finished, coherent experience.

### 3.5 Content schema and provenance model

Primary files:

- `src/content/portfolio.ts`
- `src/content/site.ts`
- `src/content/assets.ts`

Observed architecture:

- `portfolio.ts` validates content with Zod schemas
- the schema includes chapter metadata, actions, detail items, source proving origin
- `site.ts` governs public profile and credit schema
- `assets.ts` tracks runtime model assets, local asset policy, quality tiers, and runtime manifest integration

This is a strong content governance layer and a notable strength of the repo. The app attempts to enforce provenance and runtime integrity.

---

## 4. Schema and implementation analysis

### 4.1 Chapter and content schema

The content layer is strongly typed and intentionally designed to validate scientific claims. It enforces:

- enumerated chapter ids
- constrained lengths and titles
- strict action validation
- strong provenance tracking via `source.file` and `source.location`

This makes the repo more disciplined than a typical portfolio. It is the kind of system that prevents editorial drift.

However, the content layer still contains some soft spots:

- several chapter descriptions are editorially repetitive
- some detail blocks are intentionally placeholders or “deferred data boundary” messages
- the structure is more complete than the content quality in the actual narrative

### 4.2 Asset schema and runtime manifest

`src/content/assets.ts` is a sophisticated model manifest. It includes:

- `availableTiers`
- `preload` policy
- `materialOwnership`
- `compression`
- `normalization`
- `sha256`
- `credit` metadata
- `url` and runtime resolution policy

This is a substantive asset governance system. It is far beyond a basic portfolio and shows deliberate performance + license + provenance thinking.

The caveat is that not all actual runtime assets are coherently aligned to the visual design goal. Some assets are intentionally present in the manifest but their visual behavior still reads as procedural or substituted in the user-facing experience.

### 4.3 Store and state design

The Zustand stores are intentionally narrow and clean:

- `narrativeStore` manages high-level trip states
- `sceneInteractionStore` tracks renderer availability and interactive commands

This is a proper separation between discrete narrative state and immediate interaction state.

The risk is that the runtime still mixes narrative logic with DOM measurement and scene behavior in ways that can drift from the intended immersive loop.

---

## 5. Intended experience vs implemented experience

### 5.1 Intended experience

The project intends to provide:

- one continuous immersive 3D journey
- five canonical chapter anchors on a closed ring or route
- each chapter with matching model and atmospheric palette
- scroll / wheel travel as a fluid transition rather than a document scroll
- atmospheric fog, particle field, dynamic camera, and clear scene continuity
- premium card styling with nuanced motion, not a generic glassmorphism block

This direction is strongly encoded in the design docs and code naming (`ImmersiveStage`, `JourneyRuntimeProvider`, `ChapterCameraRig`, `CyclicJourneyController`, `route`, `ring`, `loop`, etc.).

### 5.2 Implemented experience

The implemented experience is closer to a hybrid portfolio prototype:

- root page optionally chooses immersive stage but default remains document composition
- 3D scene appears as a background enhancement rather than the main product mechanic
- document chapters remain a main content structure rather than a pure cyclic motion stage
- some content sections like contact/publications/credits remain appended as finite document blocks
- some exhibits and cards still behave as legacy doc features instead of pure immersive route elements

This is not a failure of the idea. It is a product architecture gap: an impressive simulated design exists, but the default route and product composition have not fully migrated to the intended system.

---

## 6. False masks, dead toggles, and placeholder patterns

### 6.1 Feature flag as false mask

`src/app/page.tsx`:

- the immersive route is the main product
- supporting content is separated into dedicated document routes
- the home experience is consistent across deployment environments

The home route now has a single deliberate composition.

### 6.2 Retired document chrome

The former document shell and its navigation chrome are no longer part of the application graph.

### 6.3 Procedural/substitute model signals

`src/content/assets.ts` contains references to the current and alternate DNA and other model IDs, but several entries still carry credit narratives suggesting original portfolio procedural source or transitional assignments.

This is not necessarily a bug, but it is exactly the kind of evidence that indicates the app is part way between a styled concept portfolio and a clean runtime asset product. It creates a fake impression of real scientific asset provenance when the motion and scene composition still rely on edited / provisional items.

### 6.4 Runtime fallback as a soft mask

`src/components/scene/SceneClient.tsx` intentionally falls back to sr-only status messaging when WebGL is unavailable. This is good from accessibility and resilience perspective, but it also creates a false mask when the scene should still feel part of the narrative. The real UI does not necessarily render a meaningful fallback scene, only a text status. This is acceptable for resilience but not for an immersive experience.

### 6.5 Dead or half-wired motion states

`src/lib/journeyRuntime.tsx` and `src/stores/narrativeStore.ts` contain a full runtime and state model, but the actual page composition still contains document-based observers and scroll-driven section logic. That means the route is improved in abstraction but not fully in the product stack.

The repo is currently carrying at least two product realities at once: the new cinematic journey and the legacy document portfolio.

---

## 7. Stub, mock, and weak implementation indicators

This project is not dominated by obvious dummy code, but there are several signs of transitional or provisional implementation:

- `src/content/portfolio.ts` contains deferred data boundary messaging for research/computation/future content.
- some content blocks are intentionally sparse or present as placeholders rather than real editorial content
- `src/content/assets.ts` includes a list of additional candidate model assets that are not all assigned to runtime use, suggesting controlled experimentation rather than final product
- `resolveRuntimeExhibitId` can swap alt DNA to rollback DNA if the intake file is not present; this is an intentional fallback but also a signal that the runtime can silently drift between variants
- some modules include strong abstractions but weak visual finalization: the architecture is excellent, the polish is not consistently finished

There are no big `TODO`/`FIXME` bombs, which is a strength. The central issue is not obvious stub code; it is partial migration and architecture drift.

---

## 8. UI/UX strengths and weaknesses

### 8.1 Strengths

- strong color language and chapter atmosphere
- deliberate scientific aesthetic
- coherent chapter-based narrative structure
- good motion-state abstraction
- thoughtful accessibility and reduced-motion detection through `sceneRuntime.ts`
- presence of chapter content schema and provenance validation
- presence of route + loop architecture and asset governance

### 8.2 Weaknesses

- default route is not the intended immersive route
- document and gasping immersive systems overlap
- not every chapter carries a convincing or consistent exhibit / anchor
- some scientific content is sparse or duplicated
- the user may not feel that the 3D world is one continuous space because the transition logic and content composition are not fully unified
- some motion UI and card details are likely to feel visually busy or inconsistent without stronger visual restraint
- contact/publications/credits still appear as a finite document tail rather than a coherent immersive landing flow

---

## 9. Performance and engineering recommendations

These are not necessarily “issues” yet, but they will materially improve the experience and stability:

### 9.1 Performance

- enforce a strict asset budget with budget thresholds per chapter and per route
- preload only the current and adjacent chapter assets; avoid eager loading of all GLB content
- keep heavy assets behind a progressive enhancement gate tied to quality tier
- cache model instances and avoid repeated clone/dispose churn when the scene crosses transitions
- treat `requestIdleCallback` / timeout preloading as a non-critical path and guard it from hydration mismatch

### 9.2 UX

- standardize one narrative route: home is immersive; secondary content lives in dedicated routes or overlays
- make the interaction controls contextual, not always visible across the document flow
- unify card copy so each chapter has a singular purpose and one CTA, not a dense stack
- reduce visual clutter in contact/publication blocks and keep forms compact
- provide clearer chapter navigation and clear direction of travel for the user

### 9.3 Engineering discipline

- keep runtime route logic and UI DOM logic separated
- avoid using environment flags as the product implementation strategy
- avoid mixing immersive state and classic document state in the same app shell
- keep deterministic chapter ids and canonical route logic explicit and documented
- consider creating a clear product ADR: “Immersive Home Route” vs “Legacy Document Route”

---

## 10. Final product acceptance criteria

The immersive home route is the single official product surface. The app is accepted only when all of the following conditions are true:

1. The default home route renders the immersive journey and never falls back to the legacy document-shell composition.
2. The route has one canonical chapter model, one canonical travel loop, and one stable camera narrative.
3. The home view occupies a single immersive stage with no fixed header, footer, or document tail mounted as part of the core narrative.
4. The active chapter is determined by continuous journey state and not by a separate legacy intersection observer on the document body.
5. The chapter-to-scene pairing is clear, balanced, and readable in all five chapter states.
6. Scene and motion degrade gracefully for reduced motion, slow devices, or unsupported WebGL, without exposing a broken or half-migrated legacy shell.
7. The interaction hierarchy is clean: model controls, chapter cards, and motion states all reinforce the same single product story.
8. Model loading and scene composition remain performance-aware, with quality tiers and preloading strategies that protect runtime stability.
9. Secondary content such as contact, credits, and publication status is either moved under an intentional non-home route or presented as a deliberate overlay, not as a disguised legacy document tail.
10. The immersive experience is visually coherent and legible across desktop, tablet, and mobile breakpoints.

These criteria define the Phase 0 decision gate. Until the app meets them, the repository remains in a migration state.

## 11. Phase-by-phase refactor roadmap

### Phase 0 — Product alignment and scope freeze

Goal: decide the actual product shape before changing code.

Tasks:

- choose one canonical route: immersive home route or document route
- if immersive is the target, remove the document-shell default from the main route
- define a single source of truth for chapter structure and route logic
- create product acceptance criteria for the immersive experience and static fallback experience

Outputs:

- product decision document
- final chapter scope
- single canonical home experience defined

Exit criteria:

- there is one route strategy and no environment-driven split in shipping behavior
- all stakeholders agree on the canonical experience

### Phase 1 — Remove false masks and migration leftovers

Goal: eliminate dual-mode code drift.

Tasks:

- remove or simplify environment-gated immersive switching if it is not production-critical
- delete dead toggles such as disabled chrome flags and no-longer-used route branches
- collapse code paths so the app is not simultaneously implementing document and immersive systems
- unify page shell composition into one route strategy

Outputs:

- simplified route shell
- single home route composition
- removed dead UI feature toggles

Exit criteria:

- there is one active product path at runtime
- no environment branching decides the core experience in production

### Phase 2 — Data model and narrative hardening

Goal: make chapter data and content trusted and editorially coherent.

Tasks:

- audit chapter copy for repetition, ambiguity, and deferred content
- normalize chapter headings, detail items, and CTAs into a single editorial pattern
- decide which sections belong to the immersive route and which belong in secondary pages
- confirm which chapters ascribe to real assets and which are symbolic or editorial

Outputs:

- cleaned chapter content definitions
- editorial rules for each section
- durable chapter schema with minimal duplication

Exit criteria:

- all chapter content has clear purpose and no repeated claims
- narrative intent and real runtime match

### Phase 3 — Route and scene runtime consistency

Goal: make the immersive journey a coherent runtime rather than an advanced experimental shell.

Tasks:

- align `journeyTimeline`, `journeyRuntime`, `chapterRegistry`, and `closedRoute` into a single route contract
- ensure chapter order, route phase, and dwell transitions are internally consistent
- keep the route closed and continuous; avoid broken chapter jumps across the loop seam
- clean up transitions and ensures incoming/outgoing chapter pair matching is deterministic

Outputs:

- validated closed-route logic
- deterministic chapter transitions
- robust route seam behavior at loop boundaries

Exit criteria:

- unit tests confirm timeline invariants and continuous route behavior
- loop seam behavior is consistent in both directions

### Phase 4 — 3D scene world coherence

Goal: make the world feel like one environment rather than separate chapter fragments.

Tasks:

- assign or guarantee one visible anchor per chapter
- tune route spacing and camera path so the world feels spatial and continuous
- ensure fog and particles support depth instead of masking the environment
- improve model visibility and opacity behavior to avoid pop/disappear patterns
- set clear relation between chapter cards and exhibit placement

Outputs:

- more coherent environmental pacing
- stronger chapter-to-scene alignment
- stable and visible spatial anchors in every chapter

Exit criteria:

- the viewer can perceive a single world and not a sequence of isolated moments
- camera path and model placement feel stable and intentional

### Phase 5 — Card, interaction, and motion polish

Goal: improve product fidelity rather than only runtime correctness.

Tasks:

- replace generic glass treatment with a more premium, layered, pearlescent card system
- constrain pointer reflections to the active card rather than a global glow
- improve button affordance, form styling, and focus states
- align card content density with the user’s reading rhythm
- reduce the “noisy” appearance of stacked metadata and instructions

Outputs:

- premium card styling
- motion cues with better hierarchy
- improved affordance and interaction clarity

Exit criteria:

- card UX feels intentional and premium
- no overpowering cursor or pointer blur dominates the content

### Phase 6 — Contact, publication, and secondary flows

Goal: remove non-essential content from the home experience and move it to correct lifecycle.

Tasks:

- decide whether publications/contact/credits are route-level or overlay/modal-level
- move secondary information to dedicated pages or dialogs when appropriate
- redesign the contact flow to fit the actual product style
- add graceful fallback states for offline or challenge failure

Outputs:

- routed or modal secondary flows
- contact form experience aligned with the rest of the product
- clear user path away from the main immersive narrative

Exit criteria:

- secondary flows do not break the immersive core product
- forms and disclosures remain accessible and resilient

### Phase 7 — Performance, asset governance, and release quality

Goal: optimize for production and avoid large, unstable scene payloads.

Tasks:

- validate asset budgets and route budgets
- ensure static / reduced-motion / coarse-pointer fallbacks are good enough and intentional
- check bundle and scene budgets on both the main route and the 3D route
- run visual and accessibility audits after the migration

Outputs:

- bundle and runtime budgets
- quality gates for main route and immersive route
- staging release checklist

Exit criteria:

- route passes quality, performance, and accessibility gates
- the app is stable under real device constraints

### Phase 8 — Final hardening and product signoff

Goal: lock the shipping version.

Tasks:

- compare implemented product against the final acceptance criteria
- run the E2E, unit, accessibility, and visual matrix
- verify there is no hidden doc route drift
- release signoff checklist with product QA, content QA, and performance QA

Outputs:

- release-ready product
- retrospective notes for future design iterations

Exit criteria:

- all required gates are green
- the app behaves consistently in production targeting

---

## 12. Recommended additions that are not major issues but strengthen the product

These are optional but high-value improvements:

1. A dedicated design token system for chapter accent colors, glow color, surfaces, text contrast, spacing, and motion curves.
2. Stable visual regression snapshots for the immersive route at key chapter states.
3. Route-level instrumentation for scroll progress, scene quality tier, and user intent to identify actual UX bottlenecks.
4. A minimal accessibility mode that reduces motion intensity while keeping science visuals readable.
5. A faster static fallback that still preserves the chapter narrative in a non-3D format.
6. Dedicated `/credits` and `/lab` routes if the product grows beyond a single home experience.
7. A more explicit asset provenance dashboard that separates “runtime asset,” “publication credit,” and “conceptual visual reference.”

---

## 13. Final assessment

The repo is not a trivial portfolio; it is a sophisticated design system and a serious attempt at an immersive scientific experience. The strongest elements are:

- the chapter data model
- the continuous journey abstraction
- the narrative registry
- modern scene and asset governance
- clear motion/state architecture

The biggest issues are:

- route drift between legacy document and immersive experience
- partial migration / false masking
- mismatched “intended vs implemented” shipping behavior
- some content and script logic that remain transitional rather than final
- a need to decide once and enforce a single product shape

The correct strategy is not to discard the current architecture; it is to unify it behind one operating model and move the project into a coherent final state with a disciplined phase-by-phase migration.

This plan is the practical refactor path.
