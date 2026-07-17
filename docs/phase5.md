# Phase 5 Completion Record

Completed: 2026-07-17

## Status

Phase 5 is complete. No Phase 5 gate remains open. Phase 6 may build reliable model interaction on the one-Canvas, server-first scene boundary established here.

## Completed system

- `SceneClient` performs WebGL capability detection before loading `Experience`; static, Save-Data, reduced-motion, and forced no-WebGL clients retain the semantic document and local scene poster without a Canvas.
- `Experience` configures alpha, antialias policy, power preference, DPR ceiling, resize debounce, event source, sRGB color space, ACES tone mapping, and an adaptive `static` / `low` / `medium` / `high` quality policy with hysteresis.
- The route dynamically imports the WebGL runtime. The first route payload excludes the `Experience` chunk, while the one persistent Canvas remains available as progressive enhancement for capable clients.
- `src/content/assets.ts` is the typed runtime manifest for local GLBs and the procedural phage exhibit. It records local URLs, hashes, transfer sizes, geometry, texture limits, credits, chapter ownership, normalization, material ownership, and tier/preload policy.
- GLTF instances clone cached scenes and clone owned materials, stop animation mixers on cleanup, and dispose only clone-owned materials. Geometry and loader-cache resources remain shared and are never disposed by an individual exhibit.
- Scene mounting is limited to active and adjacent chapter exhibits. Only eligible desktop-class adjacent GLBs are preloaded during idle time; low/mobile profiles automatically preload no GLB and never request GFP or tardigrade.
- GLTF loader calls explicitly disable Draco and enable bundled Meshopt decoding. This prevents any remote Draco decoder dependency while keeping locally optimized Meshopt variants compatible.
- Procedural particles use a fixed seed, making initial geometry deterministic across hydration and test runs.
- The remote Google font import was removed in favor of a local system font stack. No external scene environment or font request remains. Analytic local lighting is used instead of an HDR preset; low tier disables postprocessing.
- `asset:audit` validates the precise retained model set, GLB headers, byte counts, hashes, direct-path policy, no remote scene/font imports, and embedded PNG dimensions. `bundle` enforces the initial route and deferred scene gzip budgets.
- `asset:optimize` produces an ignored Meshopt candidate for scientific and visual review, without overwriting shipped assets. The tardigrade candidate validated with no GLB errors and reduced 21,943,424 raw bytes to 4,517,896 bytes and 10,124,706 Brotli bytes to 2,981,489 bytes. It remains non-deployed because it is still above the 2 MiB default model budget; ADR 0005 records the accepted bounded exception.

## Verification evidence

| Gate                             | Result               | Evidence                                                                                                                                                                                                                                                                      |
| -------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static quality                   | Passed               | `npm run quality` passed Prettier, ESLint, TypeScript, 21 unit tests, coverage, Knip, asset inspection, production build, and bundle check.                                                                                                                                   |
| Asset integrity and local policy | Passed               | `npm run asset:audit` verified the three retained SHA-256 values, GLB 2.0 headers, exact bytes, only approved paths, maximum 1024 px texture, and no remote scene/font source imports.                                                                                        |
| Bundle budget                    | Passed               | `npm run bundle` measured 72,670 B gzip for initial route JavaScript excluding framework runtime and 341,160 B gzip for the deferred WebGL runtime, within the 180 KiB and 350 KiB limits.                                                                                    |
| Browser and fallback             | Passed               | `npm run e2e` passed 16 applicable desktop, mobile, reduced-motion, and no-WebGL checks; 8 viewport-duplicate checks were intentionally skipped. It rejects remote scene/font requests, browser errors, failed responses, and Canvas creation in the forced no-WebGL project. |
| Visual regression                | Passed               | `npm run test:visual` passed 10 applicable visual references; 6 focus/fine-pointer duplicates were intentionally skipped. Two mobile baselines were explicitly updated for the intentional local system-font migration.                                                       |
| Candidate optimization           | Passed, non-deployed | `npm run asset:optimize -- tardigrade`, `gltf-transform validate`, and `gltf-transform inspect` verified the Meshopt candidate. The validator reports no errors; its extension-support notice is informational.                                                               |

## Commands exercised

`npm run asset:audit`  
`npm run asset:optimize -- tardigrade`  
`npx gltf-transform validate artifacts/phase5/meshopt/tardigrade.meshopt.glb`  
`npm run bundle`  
`npm run quality`  
`npm run e2e`  
`npm run test:visual`

## Phase 6 boundary

Phase 6 replaces `InteractiveModel` with the shared accessible interaction state machine. It must preserve the manifest-owned asset paths, explicit clone/material ownership rules, one persistent Canvas, local-only decoder policy, quality-tier behavior, semantic content fallback, and all current asset, bundle, browser, accessibility, and visual gates.
