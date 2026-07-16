# Portfolio Completion and Deployment-Readiness Plan

**Baseline:** uploaded `bio-portfolio` Next.js/R3F repository, reviewed file-by-file.
**Goal:** a production-grade, high-end biological-sciences portfolio with a persistent but performance-bounded scientific 3D world, reliable model interaction, dynamic dark cloud-like lighting, liquid-glass UI, complete portfolio content, a secure contact path, automated quality gates, and reproducible deployment.

## 1. Non-negotiable architectural decisions

1. **One persistent Canvas only.** DOM content scrolls normally above a fixed scene. No section may create a second WebGL renderer.
2. **One chapter registry only.** Section order, ids, content keys, camera poses, atmosphere, exhibit loaders, navigation, preload policy, and responsive overrides come from one typed registry.
3. **Real semantic sections replace the 500vh spacer.** Scrolling remains native; no scroll hijacking.
4. **High-frequency state does not live in a broad React context.** A selector store and MotionValues prevent every pointer/scroll update rerendering the page and Canvas.
5. **WebGL is progressive enhancement.** The complete portfolio, links, projects, CV, and contact form work without WebGL, with reduced motion, on keyboard, and on mobile.
6. **Content is typed and verified.** Components do not embed claims, project status, metrics, dates, or publication state. No unverified or fabricated outcomes are displayed.
7. **Every external asset is local, licensed, hashed, budgeted, and credited.** No runtime dependency on Drei environment presets or remote fonts.
8. **Liquid glass is progressive, bounded, and accessible.** It uses nonlinear specular/caustic/refraction cues with a high-contrast fallback; large full-screen backdrop-filter layers are prohibited.
9. **Contact is a server boundary.** Validation, anti-spam, rate limiting, origin policy, provider credentials, sanitization, and redacted logging stay server-side.
10. **No phase closes without its automated gate.** Formatting, lint, types, tests, accessibility, bundle/asset budgets, build, and deployment smoke tests are required evidence.

## 2. Current-state audit and risk ranking

### Blockers

- `public/` is ignored, while the scene references local GLB files. A clean clone cannot be assumed to contain required assets.
- The active page uses a fixed 500vh spacer and five global percentage bands instead of real sections.
- Two incompatible navigation/camera systems remain: the active five-chapter system and the obsolete four-section system.
- `computation` and `future` move the camera into largely empty space and have no overlay content.
- The build depends on fetching Geist from Google through `next/font/google`; offline/reproducible production build is not guaranteed.
- No non-interactive ESLint configuration, unit tests, E2E tests, accessibility tests, coverage, CI, or deployment smoke workflow exists.

### High-risk implementation defects

- `InteractiveModel` mutates the shared cached GLTF scene and allocates new materials whenever hover state changes; materials are not disposed.
- Pointer events are `any`-typed, pointer capture/cancel/lost-capture is absent, and dragging can remain stuck when release occurs outside the object.
- `canvas { touch-action: none; }` can prevent normal touch scrolling; model interaction and page navigation are not coordinated.
- Every scene model is mounted together; chapter-level dynamic imports, asset variants, idle prefetch, and memory budgets are absent.
- `Environment preset="city"` can require externally resolved environment assets and is not under the project's licensing/performance control.
- Camera/model interpolation uses fixed per-frame lerp values and therefore changes speed with refresh rate.
- Lighting is duplicated in `Experience` and `Lighting`; intensities are arbitrary and not coordinated with tone mapping or chapter atmosphere.

### Medium-risk quality defects

- `CursorGlow` calls React state on every mousemove and remains active on coarse pointers/reduced-motion devices.
- Global design tokens conflict: light shadcn variables, hard-coded dark backgrounds, a Tailwind v4 config, and hard-coded violet/orange utility classes all compete.
- Overlay cards use fixed 500–520 px widths and absolute positions without a mobile composition.
- Console debug output and a visible chapter debugger remain in the normal page.
- Source contains 38 zero-byte placeholders, creating a false impression of implemented architecture.
- Several implemented components are generic sci-fi boilerplate rather than portfolio-specific scientific communication.

### Security assessment

The current static presentation has a small direct attack surface; the principal present concerns are supply-chain, headers, external assets/fonts, and deployment configuration. The contact form will introduce a meaningful server boundary, so abuse controls and data-handling rules must be designed before it is enabled.

## 3. Target information architecture

The final page will use these semantic sections. Scene exhibits may be shared between adjacent sections so the renderer is not forced to load eight unique heavy models.

1. **Origins / Hero** — identity, scientific focus, concise value proposition, CV and selected-work CTAs.
2. **About** — academic context, scientific approach, concise biography, working principles.
3. **Research Interests** — specific biological questions, domains, and methods rather than generic keywords.
4. **Research & Fieldwork** — verified research experiences, environmental/biological work, methods, collaborators/acknowledgements, outputs.
5. **Scientific Software & Projects** — selected case studies with problem, method, role, architecture, evidence, and links.
6. **Publications, Posters & Talks** — verified published/in-progress outputs; unavailable categories are hidden rather than padded.
7. **Methods & Skills** — scientific, computational, visualization, and engineering capability linked to evidence.
8. **Current Work / Future Direction** — active projects, status, next milestone, collaboration/availability.
9. **Contact Me** — secure form, direct links, CV, response expectations, privacy notice.
10. **Footer / Credits** — navigation, licensing/credits, privacy, source links where appropriate.

## 4. Phase-by-phase execution plan

### Phase 0 — Freeze, recover, and document the baseline

**Purpose:** make the current state reproducible before architecture changes.

- Create a clean branch/tag and record the supplied lockfile hash.
- Recover the actual `public/models` and other media assets; identify missing files before changing model code.
- Produce an asset inventory: path, source, author, license, polygon count, animation clips, uncompressed/compressed size, texture dimensions, and visual bounds.
- Capture baseline desktop/mobile screenshots, build logs, TypeScript result, console output, and a performance profile.
- Remove generated `.next` and `tsconfig.tsbuildinfo` from source control if tracked.
- Write ADR 0001–0004 before implementation begins.

**Gate:** a fresh clone plus `npm ci` reproduces the same source tree; every referenced asset is accounted for or explicitly marked missing.

### Phase 1 — Establish the developer workflow before feature work

**Root/config changes**

- Pin Node LTS and add `engines` plus `packageManager` to `package.json`.
- Replace `next lint` with `eslint .`; add format, lint, typecheck, unit, coverage, E2E, accessibility, visual, build, bundle, asset, security, and aggregate `quality` scripts.
- Install only selected direct dependencies and remove unused direct dependencies after Knip confirms no use.
- Standardize on `motion/react`; migrate and remove the separate `framer-motion` package.
- Add Vitest, Testing Library, user-event, jest-dom, Playwright, axe, ESLint flat-config dependencies, Prettier, Knip, bundle analyzer, Lighthouse CI, Husky/lint-staged if the repository team uses local hooks, Zod, Zustand, contact/rate-limit providers, and glTF tooling.
- Replace the three-line `.gitignore` with explicit Next, test, logs, env, editor, cache, and generated-asset rules. Do **not** ignore `public/`.
- Configure `next.config.js` for standalone output, strict production behavior, security headers not handled by middleware, image/asset policy, bundle analysis flag, and compiler settings. Experimental options remain only if measured and documented.
- Tighten TypeScript incrementally: retain `strict`, add `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `forceConsistentCasingInFileNames`, and explicit test/config includes after compatibility fixes.

**CI**

- `quality.yml`: install with `npm ci`, format check, ESLint, typecheck, unit/coverage, content validation, Knip, asset audit, production build.
- `e2e.yml`: Playwright Chromium projects for desktop, mobile, reduced motion, and no-WebGL fallback.
- `lighthouse.yml`: performance/accessibility/SEO budgets against a production build.
- `security.yml`: dependency review, CodeQL, audit policy, license inventory, and secret scanning.

**Gate:** `npm run quality` is non-interactive and green locally and in CI; no feature phase may bypass it.

### Phase 2 — Consolidate architecture and content contracts

- Define the target content schemas and populate verified data files before rebuilding section UI.
- Replace `NarrativeContext`, `ScrollChapterController`, `NarrativeScroll`, duplicate registries, duplicate pose maps, and obsolete section state with:
  - one `chapterRegistry`;
  - a selector-based narrative store;
  - semantic `ChapterSection` observers;
  - pure selectors and assertions;
  - responsive camera/atmosphere definitions.
- Registry entries contain serializable tuples/data, not mutable `THREE.Vector3`, materials, or React component instances. Exhibit components are loaded by typed dynamic loader functions.
- Separate discrete state (`activeChapter`, direction, selected exhibit) from continuous values (section progress, pointer parallax) so React render frequency remains bounded.
- Build the page server-first. Only scene, interaction, animation, theme, form status, and mobile menu components become clients.
- Remove all obsolete files only after tests prove the canonical path handles every section/navigation case.

**Gate:** registry completeness tests pass; every visible section, navigation item, camera pose, atmosphere, content entry, and optional exhibit has one canonical mapping; no obsolete scroll system is imported.

### Phase 3 — Rebuild the semantic page shell and navigation

- `page.tsx` renders the fixed `SceneClient`, skip link, `SiteHeader`, all semantic sections, contact, and footer.
- Header navigation is generated from the registry and uses normal anchors plus `scroll-margin-top`; explicit clicks may update store immediately, while passive scroll is observer-driven.
- Mobile navigation uses a real dialog/menu with focus return and Escape handling.
- Add a compact chapter progress indicator; it must not hijack wheel/touch input.
- Add server-rendered fallback content and scene poster so LCP does not depend on loading Three.js.
- Add `error`, `global-error`, `loading`, and `not-found` routes.

**Gate:** complete content and navigation remain usable with JavaScript disabled except the contact submission enhancement; with JavaScript enabled but WebGL unavailable, the full page still works.

### Phase 4 — Establish design tokens and liquid-glass UI

**Liquid-glass specification**

The effect will not be a renamed `backdrop-blur` card. Each surface uses bounded layers:

1. dark translucent base tint;
2. backdrop blur plus saturation/contrast where supported;
3. nonlinear pointer-responsive specular highlight through CSS custom properties;
4. thin edge caustic/reflection layer;
5. subtle noise/displacement cue to avoid flat gradients;
6. internal shadow for depth;
7. high-contrast opaque fallback when backdrop filters, reduced transparency, or low-power mode applies.

Performance constraints:

- no full-screen liquid-glass layer;
- no nested backdrop-filter surfaces;
- blur radius capped and measured;
- pointer tracking uses MotionValues/CSS variables, not React state;
- movement disabled for reduced motion/coarse pointer;
- `contain`, `isolation`, and compositing used only after profiling;
- text contrast is tested over the brightest atmosphere frame.

**Implementation**

- Rewrite theme, typography, and animation styles into semantic tokens.
- Replace Origins/Interests/Research cards, BlurCard, MagicCard usage, button surfaces, header, project cards, and contact panel with the shared liquid-glass system.
- Keep card content/data separate from surface components.
- Add Storybook or an equivalent isolated visual harness for glass states, dark palettes, reduced motion, high contrast, hover, focus, disabled, loading, and mobile.

**Gate:** automated contrast and focus tests pass; visual regression covers default/hover/focus/reduced-motion/fallback; no large backdrop-filter layer appears in the performance trace.

### Phase 5 — Rebuild the scene runtime and asset pipeline

- Dynamically import `Experience` through `SceneClient` so the initial server-rendered portfolio does not include the full WebGL bundle.
- Add a renderer error boundary and WebGL capability detection before creating Canvas.
- Configure renderer color space, tone mapping, DPR cap, antialias policy, alpha, power preference, resize behavior, and event source deliberately.
- Replace `Environment preset="city"` with local HDR/environment maps and low-quality fallback.
- Add quality tiers: `static`, `low`, `medium`, `high`. Inputs include viewport, DPR, Save-Data, coarse pointer, memory/concurrency signals where available, and measured frame performance. Tier changes are hysteresis-controlled to avoid oscillation.
- Create a generated asset manifest and optimization scripts using gltf-transform/Draco/Meshopt/KTX2 where validated.
- Normalize model origins, orientation, bounds, and scale in the asset pipeline or manifest—not with unexplained component constants.
- Load only active/adjacent exhibits; preload next/previous on idle if data/memory policy permits; dispose evicted resources only when not owned by loader cache.
- Seed procedural particles for deterministic tests and hydration-independent visuals.

**Initial budgets**

- server-rendered route content must arrive without downloading the WebGL chunk;
- initial route JS target: ≤ 180 KiB gzip excluding framework runtime, reviewed against actual build output;
- initial WebGL scene chunk target: ≤ 350 KiB gzip excluding model binaries;
- no single default model > 2 MiB compressed without an ADR/quality variant;
- total automatically prefetched model bytes on mobile: ≤ 2.5 MiB;
- default texture maximum 2048 px, with 1024/512 variants where quality impact is acceptable;
- sustained scene target: 60 FPS desktop medium/high and 30 FPS mobile low, with no long main-thread tasks from pointer/scroll handlers.

Budgets are refined from Phase 0 measurements but may only become stricter without an explicit review.

**Gate:** clean production build, asset audit, bundle budget, no remote scene/font requests, and stable fallback under forced WebGL failure.

### Phase 6 — Make every model interaction reliable and accessible

- Replace `InteractiveModel` with a shared interaction state machine.
- Clone cached GLTF scenes per interactive instance; clone or share materials according to an explicit ownership policy.
- Use typed R3F `ThreeEvent<PointerEvent>` handlers.
- On pointer down: verify active/interactable chapter, capture pointer, store pointer id and position, set interaction mode, and stop only the intended scene propagation.
- On move: rotate with bounded delta and no React setState loop.
- On up/cancel/lost capture/window blur/visibility change: always release interaction and restore page scroll policy.
- Use inertia with delta-time damping and maximum velocity; reduced motion disables inertia/autorotation.
- Add keyboard focus and controls: arrows rotate, Home/Reset restores pose, Enter/Space opens details where applicable, Escape exits interaction.
- Add explicit DOM controls and instructions so interaction is not discoverable only by cursor behavior.
- Coordinate touch behavior: normal vertical scrolling is default; an explicit focused interaction region or gesture threshold prevents the Canvas from trapping the page.
- DNA, phage, protein, computation, ecology (if retained), and future exhibits all consume the same contract.

**Gate:** Playwright tests cover mouse drag, release outside object, pointer cancel, touch-emulation scroll coexistence, keyboard rotation/reset, reduced motion, inactive chapter, and WebGL fallback.

### Phase 7 — Implement the dynamic dark cloud atmosphere and chapter lighting

- Add one GPU nebula/cloud background using bounded FBM/domain-warp noise. It produces slowly evolving, non-linear cloud fields—not a linear gradient.
- Define restrained dark palettes per chapter, for example:
  - origins: black-violet + muted indigo + amber trace;
  - about/interests: aubergine + deep teal + low orange accent;
  - research: navy + cyan/green bioluminescent trace;
  - projects/computation: graphite + blue-violet + restrained magenta;
  - future/contact: midnight blue + plum + soft silver/teal.
- Interpolate palette, fog, exposure, key/rim/fill lights, bloom threshold, and particle tint through one AtmosphereController.
- Background movement uses slow time, pointer parallax only on fine pointers, and no high-frequency camera-dependent noise.
- Low/static quality uses fewer noise octaves or a CSS radial/noise blob fallback.
- Reduced motion freezes or nearly freezes cloud evolution; reduced transparency/high contrast uses opaque dark surfaces behind text.
- Remove the body purple radial gradient as the primary visual source.

**Gate:** visual regression at every chapter, no visible color banding at standard monitors, text contrast passes at worst-case bright cloud positions, and shader frame cost remains within budget.

### Phase 8 — Build the complete portfolio content sections

- **Hero:** verified identity, concise positioning, selected work/CV/contact CTAs, availability, interaction hint.
- **About:** biography, education context, scientific approach, no generic filler.
- **Interests:** research questions and methods, with links to relevant work.
- **Research:** verified fieldwork/research entries; dates, role, methodology, collaborators/acknowledgements, outputs, and media.
- **Projects:** 4–8 selected case studies, not an exhaustive undifferentiated grid. Each has a detail view or expanded section loaded on demand.
- **Publications/Talks:** source-linked and status-labeled; “planned” is never presented as published.
- **Skills:** grouped by scientific evidence and project use; no arbitrary proficiency percentages.
- **Current Work:** clearly distinguishes active, experimental, and completed work.
- **Contact:** form, public channels, CV, and privacy statement.
- **Footer/Credits:** all asset and scientific-source attribution.

Every content item passes schema validation and link checking. Empty sections are either omitted or clearly labelled without pretending completeness.

**Gate:** editorial review confirms every claim, date, role, status, collaborator attribution, link, and asset credit.

### Phase 9 — Implement Contact Me as a secure server feature

**Client**

- Fields: name, email, subject/category, message, optional affiliation; all labels visible.
- Apply strict client limits for immediate feedback but treat server validation as authoritative.
- Include honeypot and minimum-fill-time signals.
- Turnstile is enabled in production after keys are configured; privacy text explains it.
- Pending state prevents duplicate submissions; result messages are accessible and generic.

**Server**

- Accept POST JSON only with strict content type and body-size limit.
- Verify allowed origin/host and the selected CSRF posture.
- Verify Turnstile with timeout and fail closed in production.
- Apply distributed per-IP/per-email rate limiting; store only privacy-preserving hashes where possible.
- Normalize Unicode, reject control characters/header injection, escape all mail rendering, and never render user HTML.
- Do not echo whether an email address or provider exists.
- Redact name/email/message from application logs; record only request id, outcome code, latency, and abuse category.
- Provider errors return a retryable generic message; alerts contain no message body unless explicitly secured.
- Define retention and deletion policy on the privacy page.

**Gate:** unit/integration/E2E abuse tests pass; secrets are absent from client bundles and logs; production endpoint is rate limited and monitored.

### Phase 10 — Accessibility, responsive behavior, and resilience

- Validate heading hierarchy, landmarks, skip link, anchor focus, and visible focus rings.
- Provide meaningful alternate descriptions and DOM details for every 3D exhibit.
- Ensure all model functionality has keyboard/DOM controls.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency` where available, `forced-colors`, Save-Data, coarse pointer, and low quality.
- Replace fixed card widths and absolute-only layouts with fluid clamp/grid logic.
- Use `100svh`/`100dvh` carefully and safe-area padding.
- On low-power mobile, default to static/low scene and allow opt-in enhancement rather than forcing heavy GPU work.
- Pause animations when document is hidden and when scene is outside useful visibility.
- Add no-WebGL, context-loss, asset-failure, API-failure, and offline submission guidance.

**Gate:** keyboard-only review, screen-reader spot check, Axe with no serious/critical violations, mobile touch test, reduced-motion screenshots, and forced WebGL failure test.

### Phase 11 — Performance, chunking, and memory hardening

- Confirm server/client boundaries with build analyzer; prevent content components from importing Three.js or client-only stores.
- Dynamic import SceneClient, heavy project detail components, terminal/demo widgets, and chapter exhibit modules.
- Use route/component prefetch intentionally; do not preload all GLBs at module evaluation.
- Audit R3F frame callbacks for allocations, fixed-frame lerps, unnecessary updates, and objects that can stop updating when inactive.
- Use shared geometry/materials or instancing for repeated procedural objects.
- Limit shadows to objects/lights where visual value is measured; disable on low tier.
- Pause/disable postprocessing passes by tier and chapter.
- Detect WebGL context loss and release temporary resources.
- Measure Chrome performance, React profiler, GPU frame cost, heap snapshots during a complete scroll cycle, and mobile thermal behavior.
- Add bundle, asset, and Lighthouse budgets to CI.

**Gate:** no memory growth after two full navigation cycles beyond an agreed tolerance; budget scripts and Lighthouse assertions pass; no scroll/pointer long tasks.

### Phase 12 — SEO, structured data, privacy, and credibility

- Add canonical metadata, metadataBase, Open Graph/Twitter image, manifest, robots, sitemap, favicon/icon set, and theme color.
- Add JSON-LD for `Person`, `WebSite`, selected `SoftwareSourceCode`, and verified scholarly outputs where fields are accurate.
- Make project/research links crawlable HTML, not Canvas-only interactions.
- Add accessible CV PDF and stable download URL.
- Add privacy and credits pages; disclose analytics/contact/anti-bot processing.
- Use privacy-respecting analytics only if it answers defined questions. Do not add trackers by default.
- Add semantic external-link behavior and link checking.

**Gate:** Lighthouse SEO and accessibility thresholds pass; structured data validates; social cards render correctly; no undocumented third-party requests.

### Phase 13 — Test completion and release candidate stabilization

**Unit tests**

- registry, ordering, adjacency, presence, responsive poses, damping, palettes, content schemas, asset manifest, contact schema, security utilities, environment validation.

**Component tests**

- liquid glass fallback/focus, navigation/menu, section headings, project cards, terminal sequencing, contact states, error/fallback components.

**3D/integration tests**

- keep pure scene math unit-tested; use browser integration for actual Canvas interaction. Add R3F test renderer only after React 19 compatibility is proven.

**E2E/visual**

- complete desktop and mobile navigation;
- model interaction and page-scroll coexistence;
- reduced motion, no WebGL, context loss/failure;
- contact success and failure paths using provider mocks;
- no uncaught console errors or failed asset requests;
- visual snapshots for each chapter and breakpoint.

**Coverage policy**

- ≥ 85% statements/lines and ≥ 80% branches for nonvisual application/security logic;
- shaders and declarative scene composition are governed primarily by visual/browser tests and budgets, not artificial line coverage.

**Gate:** release candidate runs green twice from clean CI, with reviewed visual diffs and no waived serious accessibility/security defects.

### Phase 14 — Deployment, monitoring, and rollback

- Primary deployment profile: Next-compatible platform such as Vercel; secondary reproducible profile: standalone Docker/Node.
- Validate all environment variables at startup/build as appropriate.
- Configure custom domain, HTTPS, HSTS after domain stability, CSP, Permissions-Policy, Referrer-Policy, X-Content-Type-Options, framing policy, and cache headers.
- Cache immutable hashed models/textures aggressively; HTML/API/contact responses use appropriate non-public policies.
- Add health route and post-deploy smoke script.
- Add privacy-safe error monitoring for renderer crashes, asset failures, contact delivery failures, and Web Vitals. Sampling and redaction are documented.
- Enable preview deployments for PRs; production deploy only from protected main/tag after quality workflows.
- Define rollback to previous immutable deployment and contact-provider failover/disable switch.
- Run post-deploy checks from desktop/mobile: headers, assets, scene, no-WebGL fallback, contact, CV, social metadata, robots/sitemap, and logs.

**Final gate:** all items in the deployment readiness checklist below are satisfied with evidence and no critical waiver.

## 5. Required package/script changes

### Dependencies to add after compatibility verification

- Runtime: `zod`, `zustand`; server-only contact provider, distributed rate limiter, and Turnstile client/server helper as selected by ADR.
- Development: Vitest, Testing Library, jest-dom, user-event, Playwright, axe, ESLint flat-config plugins, Prettier, Knip, Lighthouse CI, bundle analyzer, gltf-transform tooling, license checker, and optional Husky/lint-staged.

### Dependencies to remove or consolidate

- Consolidate `framer-motion` and `motion` to `motion`/`motion/react`.
- Remove `gsap`, `leva`, `radix-ui`, `shadcn`, `class-variance-authority`, or other direct dependencies if Knip and the target UI implementation confirm they are unused. Keep CLI packages out of runtime dependencies.
- Do not rely on transitive dependencies directly; add them explicitly only when used.

### Required scripts

```jsonc
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:a11y": "playwright test tests/e2e/accessibility.spec.ts",
  "test:visual": "playwright test tests/e2e/visual.spec.ts",
  "check:unused": "knip",
  "check:content": "node scripts/verify-content.mjs",
  "check:assets": "node scripts/audit-assets.mjs",
  "check:bundle": "node scripts/check-bundle-budget.mjs",
  "security:audit": "npm audit --audit-level=high",
  "quality": "npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run check:unused && npm run check:content && npm run check:assets && npm run build",
}
```

Exact commands may be adjusted for selected providers, but every capability remains present.

## 6. Existing-file disposition ledger

| Existing file                                          | Required disposition                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                                  | Rewrite. Remove the conflicting light shadcn defaults plus hard-coded dark body gradient; import dedicated token, typography, motion, and liquid-glass layers; establish focus, reduced-motion, high-contrast, safe-area, canvas, and fallback rules.                                                           |
| `src/app/layout.tsx`                                   | Rewrite. Replace build-time Google font fetching with bundled local fonts; add metadataBase, canonical defaults, Open Graph/Twitter metadata, JSON-LD injection, CSP nonce wiring, skip link, and stable body classes.                                                                                          |
| `src/app/page.tsx`                                     | Rewrite as a server composition root. Remove unused imports and debug UI; render the site header, semantic chapter sections, fixed dynamically imported scene shell, contact section, and footer.                                                                                                               |
| `src/app/providers.tsx`                                | Rewrite. Remove duplicate props declaration; compose ThemeProvider, narrative store bridge, reduced-motion preference, error/telemetry provider, and optional analytics provider without turning the whole app into one high-frequency client context.                                                          |
| `src/components/cards/InterestsCard.tsx`               | Migrate copy to typed chapter content and delete. Its presentation becomes a generic responsive ChapterPanel using LiquidGlass.                                                                                                                                                                                 |
| `src/components/cards/OriginsCard.tsx`                 | Migrate copy to typed chapter content and delete. Hero identity and CTAs move to HeroSection/HeroPanel.                                                                                                                                                                                                         |
| `src/components/cards/ResearchCard.tsx`                | Migrate copy to typed chapter content and delete. Research details become structured project/research entries rather than one boilerplate paragraph.                                                                                                                                                            |
| `src/components/debug/ChapterDebug.tsx`                | Rewrite as a lazy, development-only SceneDiagnostics panel behind NEXT_PUBLIC_ENABLE_SCENE_DEBUG; never render or log in production.                                                                                                                                                                            |
| `src/components/effects/BloomEffects.tsx`              | Delete. Bloom ownership remains in the unified PostProcessing component to prevent duplicate composers/passes.                                                                                                                                                                                                  |
| `src/components/effects/FloatSystem.tsx`               | Implement as AmbientFloat: delta-time-based, reduced-motion-aware, reusable group motion with configurable amplitude/frequency and no allocations inside useFrame.                                                                                                                                              |
| `src/components/effects/Glow.tsx`                      | Replace with a typed FresnelGlowMaterial/helper backed by the fresnel shader module; it must reuse/dispose materials correctly.                                                                                                                                                                                 |
| `src/components/effects/Particles.tsx`                 | Rewrite. Use seeded deterministic generation, quality-tier counts, frustum-aware bounds, depthWrite=false, appropriate alpha falloff, reduced-motion behavior, and no per-frame allocations.                                                                                                                    |
| `src/components/effects/PostProcessing.tsx`            | Rewrite. Make passes quality-tier and chapter-palette aware; disable chromatic aberration for reduced motion/low quality; expose tested defaults and avoid unnecessary full-resolution passes.                                                                                                                  |
| `src/components/models/Coral.tsx`                      | Remove unless a verified coral-specific portfolio entry requires it. Do not retain empty decorative biology placeholders.                                                                                                                                                                                       |
| `src/components/models/DNA.tsx`                        | Rewrite as DNAExhibit. Load through the asset abstraction, clone the cached scene, use material factories, support pointer/keyboard interaction, chapter presence, loading/error fallback, bounds normalization, delta-time damping, and asset credits.                                                         |
| `src/components/models/Earth.tsx`                      | Repurpose as EcologyGlobeExhibit for fieldwork/environmental research, using verified data/visual intent; otherwise remove. It must not be a generic spinning globe.                                                                                                                                            |
| `src/components/models/Forest.tsx`                     | Remove unless tied to a verified project. Generic scenery conflicts with the scientific-elegance goal.                                                                                                                                                                                                          |
| `src/components/models/InteractiveModel.tsx`           | Replace with InteractiveExhibit plus ModelAsset. Fix shared GLTF mutation, material leaks, any-typed events, absent pointer capture/cancel, stuck dragging, lack of keyboard controls, reduced-motion behavior, cursor feedback, and active-chapter gating.                                                     |
| `src/components/models/Mitochondria.tsx`               | Implement only if mapped to an actual research-interest chapter; otherwise remove. Use the same asset/interactivity contracts as every exhibit.                                                                                                                                                                 |
| `src/components/models/ModelLoader.tsx`                | Implement as ModelAsset. Centralize Suspense loading, GLTF cloning, Draco/Meshopt support, normalization, material policy, asset errors, bounds, credits, and optional animation clips.                                                                                                                         |
| `src/components/models/Phage.tsx`                      | Rewrite as a presentation-only geometry component using shared memoized geometry/material resources; remove per-instance material duplication and make hover state externally controlled.                                                                                                                       |
| `src/components/models/PhageSystem.tsx`                | Rewrite as PhageExhibit. Use a scientifically meaningful composition, active/nearby mount policy, deterministic motion, group interaction, quality-tier instance count, and descriptive accessible controls.                                                                                                    |
| `src/components/models/ProteinShowcase.tsx`            | Rewrite as ProteinExhibit. Use ModelAsset/InteractiveExhibit, verified protein identity, normalized scale, chapter details, proper loading/error handling, and no nested competing rotations.                                                                                                                   |
| `src/components/models/Tradigrade.tsx`                 | Delete the misspelled empty placeholder. Add a correctly named TardigradeExhibit only if justified by portfolio content.                                                                                                                                                                                        |
| `src/components/motion/ChapterCameraRig.tsx`           | Rewrite. Read typed poses from the canonical chapter registry, use delta-time exponential damping, clamp transitions, support continuous section progress, reduced-motion snap/static mode, responsive framing, and no mutable shared pose vectors.                                                             |
| `src/components/motion/FadeReveal.tsx`                 | Rewrite against motion/react only. Respect reduced motion, permit semantic element selection, avoid whileInView for already visible hero content, and use centralized motion tokens.                                                                                                                            |
| `src/components/motion/HoverAnimations.tsx`            | Delete. Store reusable hover/tap variants in lib/motion/variants.ts rather than an empty component.                                                                                                                                                                                                             |
| `src/components/motion/SceneController.tsx`            | Delete after migration. It is a competing object-pose architecture; exhibit transforms will come from the canonical registry and presence controller.                                                                                                                                                           |
| `src/components/motion/SectionLighting.tsx`            | Replace with ChapterLighting driven by the canonical palette/lighting registry, delta-time interpolation, quality tier, and responsive/reduced-motion state.                                                                                                                                                    |
| `src/components/motion/SectionTransitions.tsx`         | Implement as SectionTransition for DOM content only, with reduced-motion and route/section semantics. It must not own chapter state.                                                                                                                                                                            |
| `src/components/motion/WorldAtmosphere.tsx`            | Replace with AtmosphereController that coordinates nebula palette, fog, exposure, and postprocessing from one chapter atmosphere definition.                                                                                                                                                                    |
| `src/components/narrative/ChapterBoundary.tsx`         | Replace with ChapterSection. Use semantic section markup, stable ids, IntersectionObserver with deterministic tie-breaking, per-section progress, keyboard anchor navigation, and testable callbacks.                                                                                                           |
| `src/components/narrative/NarrativeEngine.tsx`         | Rewrite as a thin client bridge over the narrative store and observers. Remove the global scroll listener and keep high-frequency progress outside React render paths.                                                                                                                                          |
| `src/components/narrative/NarrativeOverlay.tsx`        | Replace with ChapterOverlay/ChapterPanelRenderer generated from registry content. Support all chapters, responsive placement, enter/exit transitions, interactive pointer zones, and accessibility.                                                                                                             |
| `src/components/narrative/NarrativeScroll.tsx`         | Delete. Real semantic sections replace the artificial 500vh spacer.                                                                                                                                                                                                                                             |
| `src/components/narrative/ScrollChapterController.tsx` | Delete after ChapterSection/store migration. Global percentage thresholds are brittle and inaccessible.                                                                                                                                                                                                         |
| `src/components/scene/CameraRig.tsx`                   | Delete. It belongs to the obsolete four-section system and conflicts with ChapterCameraRig.                                                                                                                                                                                                                     |
| `src/components/scene/Environment.tsx`                 | Implement LocalEnvironment. Load only local HDR/environment assets, select quality variants, provide a neutral fallback, and eliminate external preset downloads.                                                                                                                                               |
| `src/components/scene/Experience.tsx`                  | Major rewrite. Become the renderer composition root only: canvas configuration, color management, camera, quality controller, local environment, atmosphere, scene content, interactions, postprocessing, and fallbacks. Remove duplicate lights, unused imports, external city preset, and hard-coded quality. |
| `src/components/scene/Fog.tsx`                         | Implement ChapterFog using registry values and delta-time interpolation; coordinate with the nebula background rather than setting independent colors.                                                                                                                                                          |
| `src/components/scene/Lighting.tsx`                    | Replace with BaseLighting plus ChapterLighting. Establish physically plausible intensities, tone mapping/exposure, shadow budgets, and no duplicate light rigs.                                                                                                                                                 |
| `src/components/scene/SceneCanvas.tsx`                 | Replace with SceneShell/SceneClient. Dynamically import the WebGL runtime with ssr=false, reserve layout, expose fallback poster, and isolate the heavy bundle from initial HTML.                                                                                                                               |
| `src/components/scene/SceneContent.tsx`                | Rewrite as a registry-driven exhibit loader. Dynamically mount only active and adjacent exhibits, prefetch the next asset on idle, and wrap each exhibit in an error boundary.                                                                                                                                  |
| `src/components/scene/SceneManager.tsx`                | Delete. Scene orchestration is split clearly among Experience, SceneContent, narrative store, and atmosphere controller.                                                                                                                                                                                        |
| `src/components/sections/CoursesSection.tsx`           | Delete or merge verified coursework into EducationSection. Do not ship an empty generic course grid.                                                                                                                                                                                                            |
| `src/components/sections/CurrentWorkSection.tsx`       | Implement. Show current research/software work, status, methods, and next milestone using typed data and no fabricated completion claims.                                                                                                                                                                       |
| `src/components/sections/FooterSection.tsx`            | Rewrite as SiteFooter with contact links, navigation, CV, credits/privacy links, copyright year, and no duplicate hero identity block.                                                                                                                                                                          |
| `src/components/sections/HeroSection.tsx`              | Rewrite. Remove the second Canvas; render semantic hero content, liquid-glass panel, primary CTAs, availability/status, model interaction hint, and static fallback art.                                                                                                                                        |
| `src/components/sections/InterestsSection.tsx`         | Rewrite from typed research-interest data with meaningful questions/methods, LiquidGlass cards, responsive layout, and links to related work.                                                                                                                                                                   |
| `src/components/sections/ProjectsSection.tsx`          | Rewrite as selected case studies. Each entry must include problem, role, scientific/technical method, stack, outcome/evidence, status, links, and media; lazy-load detail panels.                                                                                                                               |
| `src/components/sections/ResearchSection.tsx`          | Implement. Separate research/fieldwork from software projects; support affiliations, supervisors/acknowledgements where appropriate, methods, dates, outputs, and ethical attribution.                                                                                                                          |
| `src/components/sections/ScrollContent.tsx`            | Delete after page.tsx directly composes registry-backed semantic sections. It currently preserves the obsolete four-section branch.                                                                                                                                                                             |
| `src/components/ui/BlurCard.tsx`                       | Replace with HeroPanel using LiquidGlass. Remove boilerplate hard-coded copy and gradient overlays; accept typed content/CTA props.                                                                                                                                                                             |
| `src/components/ui/Buttons.tsx`                        | Replace with Button and LiquidGlassButton variants supporting button/anchor semantics, loading/disabled states, focus-visible, external-link labeling, and analytics hooks.                                                                                                                                     |
| `src/components/ui/CursorGlow.tsx`                     | Rewrite using MotionValues instead of React state per mousemove; use pointer events, requestAnimationFrame semantics, coarse-pointer/reduced-motion disablement, palette integration, and lower z-index discipline.                                                                                             |
| `src/components/ui/Dock.tsx`                           | Implement as optional desktop ChapterDock generated from the registry; keyboard accessible, active-state announced, hidden/replaced by compact navigation on mobile.                                                                                                                                            |
| `src/components/ui/GradientBackground.tsx`             | Replace with AtmosphereFallback: layered CSS radial/noise blobs matching chapter palettes for WebGL-disabled, reduced-data, and error states. No linear-gradient-only background.                                                                                                                               |
| `src/components/ui/MagneticButton.tsx`                 | Rewrite as an enhancement over a real link/button. Add href/onClick/type/disabled props, keyboard and coarse-pointer behavior, reduced-motion fallback, focus-visible state, and no movement that obscures hit targets.                                                                                         |
| `src/components/ui/Navbar.tsx`                         | Implement as SiteHeader/ChapterNavigation with skip link support, section anchors, CV/contact actions, scroll state, mobile menu, focus management, and liquid-glass surface.                                                                                                                                   |
| `src/components/ui/SectionTitle.tsx`                   | Implement a reusable semantic heading component with eyebrow, title, description, heading level, and anchor support.                                                                                                                                                                                            |
| `src/components/ui/magic-card.tsx`                     | Retire after LiquidGlass migration unless its pointer-border mode is demonstrably needed. Avoid one set of global listeners per card; no duplicate visual-surface systems.                                                                                                                                      |
| `src/components/ui/terminal.tsx`                       | Retain and harden for the computation/projects chapter. Add reduced-motion instant rendering, semantic labels, pause/cancel cleanup, no thrown render errors, responsive overflow, and tests for sequencing.                                                                                                    |
| `src/components/world/Beacon.tsx`                      | Delete or replace with a scientifically meaningful interaction marker. Current animation overwrites the supplied base y-position and is generic game-like decoration.                                                                                                                                           |
| `src/components/world/Corridor.tsx`                    | Delete. Generic corridor scenery is not tailored to the portfolio and adds geometry without narrative value.                                                                                                                                                                                                    |
| `src/components/world/DataPillar.tsx`                  | Repurpose as DataStreamExhibit for computation only if it visualizes real pipeline/data concepts; otherwise delete.                                                                                                                                                                                             |
| `src/components/world/ExhibitAnchor.tsx`               | Retain and expand into a typed anchor wrapper that applies registry position, visibility, quality, error boundary, and interaction state.                                                                                                                                                                       |
| `src/components/world/RingPlatform.tsx`                | Delete. Generic platform staging conflicts with the restrained scientific presentation unless redesigned around a specific exhibit.                                                                                                                                                                             |
| `src/context/NarrativeContext.tsx`                     | Replace with a selector-based narrative store and a minimal provider bridge. Remove the unsafe no-op default and prevent all consumers rerendering on progress changes.                                                                                                                                         |
| `src/hooks/useChapter.ts`                              | Rewrite as a selector hook over the canonical store; expose only the requested discrete state.                                                                                                                                                                                                                  |
| `src/hooks/useChapterPresence.ts`                      | Rewrite to read presence curves/config from the registry and return mount/visible/interactable plus normalized transition values.                                                                                                                                                                               |
| `src/hooks/useHoverGlow.ts`                            | Implement as part of useModelInteraction or remove. It must update stable materials, not allocate new materials per hover.                                                                                                                                                                                      |
| `src/hooks/useModelAnimation.ts`                       | Implement a typed animation-clip controller with explicit clip names, play/pause/crossfade, visibility pausing, reduced-motion policy, and cleanup.                                                                                                                                                             |
| `src/hooks/useMouseParallax.ts`                        | Implement pointer MotionValues with viewport normalization, coarse-pointer disablement, reduced-motion fallback, and no React render on every move.                                                                                                                                                             |
| `src/hooks/usePresence.ts`                             | Delete. It duplicates chapterPresence/useChapterPresence and carries a fixed three-model schema that cannot scale.                                                                                                                                                                                              |
| `src/hooks/useResponsive.ts`                           | Implement stable media-query and rendering-capability hooks; avoid reading window during SSR and expose coarse pointer, reduced data, viewport class, and DPR caps.                                                                                                                                             |
| `src/hooks/useScrollProgress.ts`                       | Delete. Replace stateful unthrottled window scroll handling with section observers and MotionValues.                                                                                                                                                                                                            |
| `src/hooks/useSectionState.tsx`                        | Delete. It is the obsolete four-section state model.                                                                                                                                                                                                                                                            |
| `src/lib/animations.ts`                                | Implement centralized motion durations, easing, spring values, and reduced-motion alternatives; no component-specific magic numbers.                                                                                                                                                                            |
| `src/lib/camera.ts`                                    | Implement typed camera pose construction, responsive framing, exponential damping helpers, bounds fitting, and unit-testable math.                                                                                                                                                                              |
| `src/lib/cameraPoses.ts`                               | Delete after moving camera definitions into the canonical chapter registry. Current Object.fromEntries result is weakly typed and shares mutable vectors.                                                                                                                                                       |
| `src/lib/chapterAnchors.ts`                            | Delete or replace with generated helpers from the registry; no second source of section ids.                                                                                                                                                                                                                    |
| `src/lib/chapterPoses.ts`                              | Delete. It is the competing object-pose map.                                                                                                                                                                                                                                                                    |
| `src/lib/chapterPresence.ts`                           | Delete. Presence definitions move into each chapter/exhibit registry entry with scalable typed keys and transition curves.                                                                                                                                                                                      |
| `src/lib/chapterSceneRegistry.ts`                      | Replace with the sole chapterRegistry.ts containing content id, DOM section, camera, atmosphere, exhibit loader, palette, navigation, accessibility description, preload policy, and responsive overrides.                                                                                                      |
| `src/lib/chapterScenes.ts`                             | Delete. It duplicates the registry and contradicts research model identity.                                                                                                                                                                                                                                     |
| `src/lib/chapters.ts`                                  | Rewrite to derive ChapterId and ordered ids from chapterRegistry, or keep only immutable ids if needed to break cycles; add runtime completeness assertions.                                                                                                                                                    |
| `src/lib/colors.ts`                                    | Implement semantic chapter palettes and color utilities in OKLCH/linear RGB where appropriate; coordinate CSS tokens and Three.js colors.                                                                                                                                                                       |
| `src/lib/constants.ts`                                 | Implement narrowly scoped runtime constants: quality limits, asset budgets, interaction thresholds, contact limits, and URLs. Do not create a miscellaneous dumping ground.                                                                                                                                     |
| `src/lib/helpers.ts`                                   | Delete. Add domain-specific utilities in named modules instead of a generic helpers file.                                                                                                                                                                                                                       |
| `src/lib/materials.ts`                                 | Rewrite as material factories/hooks with ownership and disposal rules. Remove mutable module-level singleton materials assigned into cached scenes.                                                                                                                                                             |
| `src/lib/utils.ts`                                     | Retain cn; add only universally safe utilities with tests. Do not add security, asset, or scene logic here.                                                                                                                                                                                                     |
| `src/lib/worldLayout.ts`                               | Rewrite from registry data using readonly tuples and responsive overrides; avoid exporting mutable THREE.Vector3 instances as configuration.                                                                                                                                                                    |
| `src/styles/animations.css`                            | Implement only CSS fallback/keyframe utilities, reduced-motion overrides, and compositor-safe animations. Primary choreography stays in motion/R3F logic.                                                                                                                                                       |
| `src/styles/theme.css`                                 | Implement the authoritative semantic token system for dark palettes, liquid-glass surfaces, chapter accents, contrast mode, and fallback atmosphere.                                                                                                                                                            |
| `src/styles/typography.css`                            | Implement local font faces, fluid type scale, reading widths, heading tracking, and responsive typography.                                                                                                                                                                                                      |
| `src/types/animations.ts`                              | Define motion token/variant and reduced-motion policy types if not inferable; remove if redundant.                                                                                                                                                                                                              |
| `src/types/models.ts`                                  | Define AssetManifestEntry, ModelAssetProps, material policy, animation clip, bounds, credits, and interaction contracts.                                                                                                                                                                                        |
| `src/types/scene.ts`                                   | Define ChapterId, camera/atmosphere definitions, quality tier, WebGL capability, exhibit definition, and interaction state without importing mutable Three objects into content data.                                                                                                                           |

## 7. New-file responsibility ledger

| New file/path                                              | Responsibility                                                                                                                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.example`                                             | Document required server-only and public environment variables with safe placeholders; no secrets.                                                                                                              |
| `.node-version`                                            | Pin the supported Node LTS runtime used locally, in CI, and in deployment.                                                                                                                                      |
| `.npmrc`                                                   | Enforce save-exact or documented lock policy, engine strictness, audit behavior, and reproducible install settings.                                                                                             |
| `.prettierignore`                                          | Exclude generated, lock, build, and optimized binary assets from formatting.                                                                                                                                    |
| `prettier.config.mjs`                                      | Single formatting policy plus Tailwind class sorting if compatible with Tailwind v4.                                                                                                                            |
| `eslint.config.mjs`                                        | Non-interactive ESLint 9 flat config for Next, TypeScript, React hooks, accessibility, testing, imports, and security-sensitive patterns.                                                                       |
| `vitest.config.ts`                                         | Unit/component test projects, aliases, coverage scope, deterministic environment, and setup file.                                                                                                               |
| `playwright.config.ts`                                     | Desktop/mobile/reduced-motion/WebGL E2E projects, local webServer, trace/video/screenshot retention, and CI retries.                                                                                            |
| `lighthouserc.json`                                        | Lighthouse CI URLs and budgets for performance, accessibility, SEO, and best practices.                                                                                                                         |
| `Dockerfile`                                               | Multi-stage npm ci/build standalone Next image with non-root runtime and health check.                                                                                                                          |
| `.dockerignore`                                            | Exclude source-control metadata, local caches, tests artifacts, secrets, and unneeded source from image context.                                                                                                |
| `CONTRIBUTING.md`                                          | Branch, commit, local setup, quality gates, asset workflow, content verification, and PR requirements.                                                                                                          |
| `SECURITY.md`                                              | Supported deployment, vulnerability reporting, secret handling, contact endpoint controls, and dependency policy.                                                                                               |
| `docs/architecture.md`                                     | Canonical DOM/Canvas/narrative/data-flow architecture and ownership boundaries.                                                                                                                                 |
| `docs/content-model.md`                                    | Schema and editorial rules for research, projects, publications, credits, and no-fabrication policy.                                                                                                            |
| `docs/performance-budget.md`                               | JS, model, texture, shader, LCP, INP, CLS, memory, and mobile quality budgets.                                                                                                                                  |
| `docs/asset-pipeline.md`                                   | GLB/GLTF acquisition, licensing, Blender/gltf-transform optimization, compression, thumbnails, and manifest update workflow.                                                                                    |
| `docs/deployment.md`                                       | Vercel and standalone Docker deployment, environment provisioning, rollback, cache, domain, monitoring, and smoke tests.                                                                                        |
| `docs/adr/0001-single-persistent-canvas.md`                | Record why one persistent Canvas and semantic DOM sections are canonical.                                                                                                                                       |
| `docs/adr/0002-narrative-store-and-registry.md`            | Record store/registry choices and rejected duplicate scroll architectures.                                                                                                                                      |
| `docs/adr/0003-liquid-glass-progressive-enhancement.md`    | Record visual implementation, browser fallbacks, and performance constraints.                                                                                                                                   |
| `docs/adr/0004-contact-delivery-and-abuse-controls.md`     | Record provider, rate limiting, Turnstile, privacy, retention, and failure behavior.                                                                                                                            |
| `.github/workflows/quality.yml`                            | Run npm ci, formatting, lint, typecheck, unit tests, coverage, build, Knip, and asset-budget checks.                                                                                                            |
| `.github/workflows/e2e.yml`                                | Run Playwright desktop/mobile/reduced-motion tests with browser caching and uploaded traces.                                                                                                                    |
| `.github/workflows/lighthouse.yml`                         | Run Lighthouse CI against production-like build and enforce budgets.                                                                                                                                            |
| `.github/workflows/security.yml`                           | Run dependency review, npm audit policy, CodeQL, secret scanning configuration, and license checks.                                                                                                             |
| `.github/dependabot.yml`                                   | Scheduled npm and GitHub Actions updates with grouped safe updates.                                                                                                                                             |
| `.github/pull_request_template.md`                         | Require scope, screenshots, test evidence, accessibility/performance impact, and asset licensing.                                                                                                               |
| `public/fonts/*`                                           | Bundled licensed webfont files used by next/font/local; exact files selected and documented.                                                                                                                    |
| `public/models/manifest.json`                              | Generated deploy-time asset manifest containing version, hash, byte size, compression, bounds, credits, and license.                                                                                            |
| `public/models/**/*`                                       | Optimized local GLB/KTX2/HDR assets. These must be tracked or fetched reproducibly, never silently ignored.                                                                                                     |
| `public/images/scene-fallback.avif`                        | Optimized static fallback/poster for no-WebGL, reduced-data, loading, and error states.                                                                                                                         |
| `public/cv/adhiraj-muduli-cv.pdf`                          | Versioned accessible CV export with stable public URL.                                                                                                                                                          |
| `src/env.ts`                                               | Zod-validated server/public environment contract; fail fast in production and prevent secret exposure.                                                                                                          |
| `src/middleware.ts`                                        | CSP nonce/origin and security-header middleware if the chosen CSP ADR confirms dynamic nonce mode.                                                                                                              |
| `src/app/error.tsx`                                        | Recoverable route error UI with retry and privacy-safe reporting.                                                                                                                                               |
| `src/app/global-error.tsx`                                 | Root fatal error fallback independent of normal layout.                                                                                                                                                         |
| `src/app/loading.tsx`                                      | Fast accessible HTML skeleton that does not wait for WebGL.                                                                                                                                                     |
| `src/app/not-found.tsx`                                    | Branded accessible 404 with navigation back to projects/home.                                                                                                                                                   |
| `src/app/manifest.ts`                                      | Web manifest metadata; no service worker is required unless separately justified.                                                                                                                               |
| `src/app/robots.ts`                                        | Environment-aware robots rules.                                                                                                                                                                                 |
| `src/app/sitemap.ts`                                       | Static and content-derived sitemap entries.                                                                                                                                                                     |
| `src/app/opengraph-image.tsx`                              | Deterministic generated social image without loading the WebGL scene.                                                                                                                                           |
| `src/app/privacy/page.tsx`                                 | Explain contact-form processing, analytics/telemetry, retention, and user rights.                                                                                                                               |
| `src/app/credits/page.tsx`                                 | List 3D assets, textures, fonts, libraries, scientific data sources, licenses, and acknowledgements.                                                                                                            |
| `src/app/api/contact/route.ts`                             | POST-only contact endpoint: content type/body limits, schema validation, origin/CSRF policy, Turnstile verification, rate limit, honeypot, sanitization, mail adapter, generic responses, and redacted logging. |
| `src/app/api/health/route.ts`                              | Minimal deployment health/readiness response with no sensitive configuration disclosure.                                                                                                                        |
| `src/content/site.ts`                                      | Name, role, summary, verified links, CV path, availability, and global metadata.                                                                                                                                |
| `src/content/chapters.ts`                                  | Human-facing chapter content keyed to the canonical registry; no Three.js objects.                                                                                                                              |
| `src/content/research.ts`                                  | Verified research and fieldwork entries with dates, role, methods, collaborators, outputs, and references.                                                                                                      |
| `src/content/projects.ts`                                  | Typed project case studies with status, role, methods, stack, evidence, links, media, and related chapter.                                                                                                      |
| `src/content/publications.ts`                              | Publications, preprints, posters, talks, and planned outputs; only verified status is displayed.                                                                                                                |
| `src/content/experience.ts`                                | Education, internships, positions, and selected coursework/timeline.                                                                                                                                            |
| `src/content/skills.ts`                                    | Scientific methods, computational methods, visualization, and engineering capabilities grouped by evidence.                                                                                                     |
| `src/content/contact.ts`                                   | Public contact channels, response expectations, and contact-section copy; no server secrets.                                                                                                                    |
| `src/store/narrative-store.ts`                             | Zustand selector store for active chapter, previous chapter, direction, progress, navigation requests, interaction lock, and hydration-safe actions.                                                            |
| `src/store/scene-store.ts`                                 | Selector store for quality tier, WebGL status, asset load state, selected exhibit, and interaction mode; isolate scene state from content rendering.                                                            |
| `src/lib/chapter/registry.ts`                              | Single typed chapter registry linking section id, order, content key, camera, atmosphere, exhibit loader, palette, preload, and responsive overrides.                                                           |
| `src/lib/chapter/assertions.ts`                            | Runtime/dev assertions for unique ids, complete order, valid adjacent links, content existence, and exhibit/asset mapping.                                                                                      |
| `src/lib/chapter/selectors.ts`                             | Pure selector and transition helpers for unit testing.                                                                                                                                                          |
| `src/lib/assets/manifest.ts`                               | Typed access to generated asset metadata and credit/license data.                                                                                                                                               |
| `src/lib/assets/preload.ts`                                | Idle/adjacent asset preload scheduler respecting Save-Data, connection quality, and memory tier.                                                                                                                |
| `src/lib/assets/quality.ts`                                | Choose model/texture/HDR variants by scene quality tier.                                                                                                                                                        |
| `src/lib/motion/variants.ts`                               | Shared DOM motion variants using central tokens.                                                                                                                                                                |
| `src/lib/motion/damping.ts`                                | Delta-time exponential damping utilities for vectors, scalars, colors, and rotations.                                                                                                                           |
| `src/lib/security/csp.ts`                                  | CSP construction and nonce helpers with tests.                                                                                                                                                                  |
| `src/lib/security/origin.ts`                               | Allowed-origin validation and deployment-aware host normalization.                                                                                                                                              |
| `src/lib/security/rate-limit.ts`                           | Distributed production limiter adapter plus explicitly development-only local fallback.                                                                                                                         |
| `src/lib/security/sanitize.ts`                             | Plain-text normalization, control-character rejection, safe email subject/body rendering, and log redaction.                                                                                                    |
| `src/lib/contact/schema.ts`                                | Shared Zod request schema, field limits, normalized output, and safe public error mapping.                                                                                                                      |
| `src/lib/contact/mailer.ts`                                | Server-only provider interface and implementation; secrets never reach client bundles.                                                                                                                          |
| `src/lib/contact/turnstile.ts`                             | Server-only anti-bot verification with timeout and fail-closed production policy.                                                                                                                               |
| `src/components/layout/SkipLink.tsx`                       | Keyboard skip link to main content.                                                                                                                                                                             |
| `src/components/layout/SiteHeader.tsx`                     | Responsive liquid-glass header and navigation composition.                                                                                                                                                      |
| `src/components/layout/ChapterNavigation.tsx`              | Registry-generated anchor navigation, active state, keyboard behavior, and compact/mobile presentation.                                                                                                         |
| `src/components/layout/SiteFooter.tsx`                     | Footer composition using verified site/contact data.                                                                                                                                                            |
| `src/components/liquid-glass/LiquidGlass.tsx`              | Core progressively enhanced liquid-glass surface with pointer CSS variables, specular layer, refraction/noise layer, semantic element support, and fallbacks.                                                   |
| `src/components/liquid-glass/LiquidGlassPanel.tsx`         | Content panel preset with constrained blur area, padding, contrast, and responsive variants.                                                                                                                    |
| `src/components/liquid-glass/LiquidGlassButton.tsx`        | Accessible CTA surface built on the shared Button primitive.                                                                                                                                                    |
| `src/components/liquid-glass/liquid-glass.module.css`      | Layered backdrop blur/saturation, nonlinear specular highlights, edge caustics, subtle displacement/noise, containment, and feature-query fallbacks.                                                            |
| `src/components/narrative/ChapterSection.tsx`              | Semantic section observer, progress calculation, registry association, focus target, and minimum-height policy.                                                                                                 |
| `src/components/narrative/ChapterOverlay.tsx`              | Registry-driven chapter panel renderer with responsive placement and pointer zones.                                                                                                                             |
| `src/components/narrative/ChapterProgress.tsx`             | Accessible visual progress/navigation indicator; no scroll hijacking.                                                                                                                                           |
| `src/components/narrative/NarrativeAnnouncer.tsx`          | Optional restrained aria-live chapter announcement for explicit navigation only, not every passive scroll threshold.                                                                                            |
| `src/components/scene/SceneClient.tsx`                     | Client-only dynamic import boundary for the heavy Experience chunk.                                                                                                                                             |
| `src/components/scene/SceneErrorBoundary.tsx`              | Catch renderer/asset failures and switch to the static atmosphere fallback.                                                                                                                                     |
| `src/components/scene/WebGLFallback.tsx`                   | Accessible static scene poster and explanatory interaction fallback.                                                                                                                                            |
| `src/components/scene/SceneQualityController.tsx`          | Use Drei PerformanceMonitor/AdaptiveDpr/AdaptiveEvents and device signals to set stable quality tiers without oscillation.                                                                                      |
| `src/components/scene/SceneInteractionLayer.tsx`           | Coordinate Canvas pointer events, page scrolling, touch-action, selected exhibit, and interaction mode.                                                                                                         |
| `src/components/scene/atmosphere/NebulaBackdrop.tsx`       | Single low-cost full-screen/sky shader producing slowly evolving dark colored cloud fields; palette blends by chapter and pauses/reduces by policy.                                                             |
| `src/components/scene/atmosphere/ChapterLighting.tsx`      | Chapter-registry lighting interpolation, exposure, rim/key/fill configuration, and quality-aware shadows.                                                                                                       |
| `src/components/scene/atmosphere/AtmosphereController.tsx` | Coordinate nebula, fog, clear color, postprocessing, and CSS fallback palette.                                                                                                                                  |
| `src/components/scene/exhibits/ComputationExhibit.tsx`     | Scientifically tailored representation of analysis pipelines/data transformation, not generic pillars or holographic clichés.                                                                                   |
| `src/components/scene/exhibits/FutureExhibit.tsx`          | Low-cost forward-looking scene tied to verified current directions and availability.                                                                                                                            |
| `src/components/scene/exhibits/EcologyGlobeExhibit.tsx`    | Optional environmental/fieldwork exhibit tied to actual Chilika/ecology content and properly credited data.                                                                                                     |
| `src/components/scene/interaction/InteractiveExhibit.tsx`  | Shared pointer/keyboard rotation, focus, inertia, reset, active-state gating, cursor hints, and accessible mirrored controls.                                                                                   |
| `src/components/scene/interaction/InteractionHint.tsx`     | Visible and screen-reader instructions that adapt to mouse, touch, keyboard, and reduced-motion states.                                                                                                         |
| `src/components/scene/interaction/ExhibitControls.tsx`     | DOM controls for rotate/reset/details so model interaction is not pointer-only.                                                                                                                                 |
| `src/components/contact/ContactForm.tsx`                   | Accessible client form with progressive enhancement, local validation, pending/success/error states, honeypot, Turnstile token, and no sensitive logging.                                                       |
| `src/components/contact/ContactLinks.tsx`                  | Verified email/social/ORCID/GitHub/CV links with external-link semantics.                                                                                                                                       |
| `src/components/contact/ContactStatus.tsx`                 | Accessible status messaging and retry guidance.                                                                                                                                                                 |
| `src/components/sections/AboutSection.tsx`                 | Scientific identity, academic context, working principles, and concise biography.                                                                                                                               |
| `src/components/sections/PublicationsSection.tsx`          | Verified publications/preprints/posters/talks and graceful empty-state hiding.                                                                                                                                  |
| `src/components/sections/SkillsSection.tsx`                | Evidence-linked methods and technologies; avoid generic percentage bars.                                                                                                                                        |
| `src/components/sections/ContactSection.tsx`               | Final contact chapter combining copy, links, secure form, availability, and scene transition.                                                                                                                   |
| `src/hooks/useMediaQuery.ts`                               | SSR-safe media query primitive used by responsive/capability hooks.                                                                                                                                             |
| `src/hooks/useReducedMotionPreference.ts`                  | Unified OS and user preference with stable hydration behavior.                                                                                                                                                  |
| `src/hooks/usePointerCapability.ts`                        | Coarse/fine/hover capability and interaction hint selection.                                                                                                                                                    |
| `src/hooks/useChapterObserver.ts`                          | IntersectionObserver registration and deterministic active-section selection.                                                                                                                                   |
| `src/hooks/useSceneQuality.ts`                             | Selector hook for the quality controller and Save-Data/device constraints.                                                                                                                                      |
| `src/hooks/useModelInteraction.ts`                         | Typed pointer capture, keyboard, inertia, focus, cancel, and reset state machine.                                                                                                                               |
| `src/shaders/nebula/vertex.ts`                             | Minimal fullscreen/sky vertex shader string with stable UV/world direction output.                                                                                                                              |
| `src/shaders/nebula/fragment.ts`                           | FBM/domain-warp dark cloud shader with bounded octaves, chapter palette uniforms, dithering, and quality defines.                                                                                               |
| `src/shaders/fresnel/vertex.ts`                            | Fresnel vertex shader string for view-space normal/view vectors.                                                                                                                                                |
| `src/shaders/fresnel/fragment.ts`                          | Subtle scientifically restrained rim/glow shader with configurable intensity and no uncontrolled bloom.                                                                                                         |
| `src/test/setup.ts`                                        | Testing Library matchers, deterministic browser APIs, IntersectionObserver/matchMedia mocks, and cleanup.                                                                                                       |
| `src/test/factories.ts`                                    | Typed content/chapter/contact test factories.                                                                                                                                                                   |
| `tests/unit/chapter-registry.test.ts`                      | Registry completeness, order, uniqueness, camera/atmosphere/content/asset mappings.                                                                                                                             |
| `tests/unit/narrative-selectors.test.ts`                   | Direction, adjacency, mount/presence, and navigation selector behavior.                                                                                                                                         |
| `tests/unit/camera.test.ts`                                | Responsive pose and damping math.                                                                                                                                                                               |
| `tests/unit/contact-schema.test.ts`                        | Validation, normalization, control characters, maximum lengths, and safe error mapping.                                                                                                                         |
| `tests/unit/security.test.ts`                              | CSP, origin, rate-limit adapter, sanitization, and redaction tests.                                                                                                                                             |
| `tests/components/liquid-glass.test.tsx`                   | Semantic rendering, pointer variables, reduced-motion/fallback classes, and keyboard focus.                                                                                                                     |
| `tests/components/contact-form.test.tsx`                   | Validation, submit lifecycle, accessible errors, anti-spam fields, and retry.                                                                                                                                   |
| `tests/components/navigation.test.tsx`                     | Anchor generation, active state, keyboard navigation, and mobile menu focus.                                                                                                                                    |
| `tests/e2e/portfolio.spec.ts`                              | Critical navigation, chapter content, project links, CV, and no-console-error smoke path.                                                                                                                       |
| `tests/e2e/model-interaction.spec.ts`                      | Mouse, touch-emulation, keyboard rotate/reset/details, scrolling coexistence, and lost-pointer recovery.                                                                                                        |
| `tests/e2e/contact.spec.ts`                                | Successful mocked delivery, validation, rate-limit/error behavior, and privacy link.                                                                                                                            |
| `tests/e2e/accessibility.spec.ts`                          | Axe checks, keyboard traversal, landmarks/headings, focus visibility, reduced-motion, and fallback mode.                                                                                                        |
| `tests/e2e/visual.spec.ts`                                 | Deterministic screenshots for key chapters, liquid glass, fallback, and responsive breakpoints.                                                                                                                 |
| `scripts/audit-assets.mjs`                                 | Fail CI on missing manifest entries, excessive bytes, uncredited assets, unsupported texture dimensions, and orphan files.                                                                                      |
| `scripts/optimize-models.mjs`                              | Reproducible gltf-transform compression/quantization/texture workflow with explicit input/output.                                                                                                               |
| `scripts/check-bundle-budget.mjs`                          | Parse build output/analyzer data and enforce initial JS and WebGL chunk budgets.                                                                                                                                |
| `scripts/verify-content.mjs`                               | Validate content schemas, links, dates/status values, unique slugs, and required project evidence.                                                                                                              |

## 8. Test matrix and release evidence

| Area                   |                              Unit |               Component |                     Browser/E2E |              Budget/monitoring |
| ---------------------- | --------------------------------: | ----------------------: | ------------------------------: | -----------------------------: |
| Chapter registry/store |                          Required | Required for navigation |                        Required |    Store update/render profile |
| Camera/presence math   |                          Required |                       — |               Visual transition |              Frame-time budget |
| Liquid glass           |                CSS contract tests |                Required |     Visual/focus/reduced motion |        Paint/composite profile |
| GLTF asset handling    |                Manifest/selection |         Fallback states |         Load/error/context loss |        Byte/GPU/memory budgets |
| Model interaction      |                     State machine |          Controls/hints |     Mouse/touch/keyboard/cancel |          Event long-task check |
| Nebula/lighting        |                      Palette/math |                Fallback |              Visual per chapter |         GPU frame cost/banding |
| Content                |                 Schema/link tests |          Cards/sections |                 Crawlable links |    Content verification report |
| Contact                | Schema/security/provider adapters |          Form lifecycle |           Success/failure/abuse |      Rate/error/latency alerts |
| Accessibility          |                      Pure helpers |        Axe where useful | Full keyboard/Axe/SR spot check |       Lighthouse accessibility |
| SEO                    |                  Metadata helpers |                       — |     Social/robots/sitemap smoke |                 Lighthouse SEO |
| Deployment             |                  Env/header tests |             Error pages |                Production smoke | Health, Web Vitals, error rate |

## 9. Deployment-readiness checklist

### Repository and reproducibility

- [ ] Node/package-manager version pinned.
- [ ] `npm ci` succeeds from a clean clone.
- [ ] `public/` assets are reproducibly available and licensed.
- [ ] No generated build/cache/secrets committed.
- [ ] Lockfile, dependency update, and audit policies documented.

### Architecture

- [ ] One chapter registry, one narrative store, one persistent Canvas.
- [ ] No imported obsolete four-section system, duplicate registries, duplicate poses, or 500vh spacer.
- [ ] Server/client boundaries reviewed by bundle analyzer.
- [ ] Every chapter has content, camera/atmosphere behavior, and a deliberate exhibit or deliberate shared/no-exhibit state.

### UI and content

- [ ] Liquid-glass surfaces use the shared component and tested fallbacks.
- [ ] Dynamic cloud atmosphere replaces the plain gradient and stays within GPU budget.
- [ ] All sections are responsive and content claims are verified.
- [ ] Contact, privacy, credits, CV, navigation, footer, and metadata are complete.

### 3D and performance

- [ ] Scene is dynamically chunked and not required for LCP.
- [ ] Models are optimized, variant-selected, credited, and loaded only when needed.
- [ ] No shared cached scene/material mutation or material leaks.
- [ ] Interactions work with mouse, touch, keyboard, cancel, and reduced motion.
- [ ] WebGL unavailable/context loss/asset failure switches to a complete fallback.
- [ ] Bundle, asset, Lighthouse, frame, and memory budgets pass.

### Security and privacy

- [ ] Environment variables validated; secrets remain server-only.
- [ ] CSP/security headers verified in production.
- [ ] Contact origin, schema, body limits, Turnstile, rate limit, sanitization, and redacted logs tested.
- [ ] Privacy/retention policy matches actual providers and monitoring.
- [ ] Dependency review, audit, CodeQL, secret scan, and license checks pass.

### Accessibility and quality

- [ ] Keyboard-only and screen-reader spot checks complete.
- [ ] Reduced motion, high contrast/forced colors, coarse pointer, and mobile behavior verified.
- [ ] No serious/critical Axe findings.
- [ ] Formatting, lint, strict types, unit coverage, E2E, visual, build, and production smoke are green.
- [ ] No uncaught browser console errors, missing assets, hydration errors, or failed network requests.

### Operations

- [ ] Preview and production deployment paths documented.
- [ ] Health check, privacy-safe telemetry, and alerts active.
- [ ] Immutable rollback procedure tested.
- [ ] Post-deploy smoke checklist completed for the production domain.

## 10. Final definition of done

The project is complete only when a clean deployment serves a fully crawlable and accessible portfolio before WebGL loads; the single persistent scene enhances each semantic section; liquid-glass surfaces remain readable and performant; dark procedural cloud lighting transitions coherently by chapter; all models have reliable pointer, touch, and keyboard interaction; content and credits are verified; the contact route resists common abuse and protects secrets; mobile/reduced-motion/no-WebGL users receive a complete experience; and every automated workflow, performance budget, security check, and production smoke test passes without critical waiver.
