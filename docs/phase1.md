# Phase 1 Completion Record

Completed: 2026-07-17

## Status

Phase 1 is complete. No Phase 1 gate remains open. Phase 2 may begin.

## Published revision

| Record | Identifier |
| --- | --- |
| Phase 0 clean baseline | `phase0-clean-baseline-2026-07-16` -> `0f304a9653985a3985b998236f653ac42743ed11` |
| Phase 1 workflow foundation | `4ac6b9e` |
| Lighthouse and visual stabilization | `81e9e62` |
| Initial-paint and local browser-run stability repair | `e7eb65e` |
| Verified remote branch | `origin/main` -> `e7eb65e` |

## Implemented foundation

- Pinned Node `22.17.0` and npm `11.4.2`; package-manager and engine constraints are enforced locally and in GitHub Actions.
- Added non-interactive format, lint, type, unit, coverage, asset, bundle, security, visual, browser, and production-build commands.
- Added GitHub Actions workflows for quality, browser checks, visual regression, Lighthouse, and security; all checkout Git LFS objects and run `git lfs fsck` before commands that read GLBs.
- Added cached Next build artifacts to CI, browser projects for desktop, mobile, reduced motion, and disabled WebGL, reviewed visual baselines for each mode, and Lighthouse report artifacts.
- Added dependency review, CodeQL v4, Gitleaks, production dependency audit, and a lockfile-derived license inventory artifact.
- Added deterministic model hash/GLB validation and a portable bundle-analysis launcher.
- Restored visible server-rendered initial content by removing the client-only hidden reveal state. A local Chrome run with GPU and WebGL disabled recorded first paint and first contentful paint at 400 ms.
- Serialized the local browser command to prevent the observed Windows Node allocator failure from eight concurrent production-browser workers.

## Verification evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Quality workflow | Passed | GitHub Actions run for `e7eb65e`; local `npm run format:check`, `npm run typecheck`, and `npm run build` passed. |
| Browser workflow | Passed | GitHub Actions run for `e7eb65e`; local `npm run e2e` passed 8/8 with desktop, mobile, reduced-motion, and no-WebGL projects. |
| Visual workflow | Passed | GitHub Actions run for `e7eb65e`; local four-mode visual suite passed 4/4. Baselines: `tests/e2e/visual.spec.ts-snapshots/`. |
| Lighthouse workflow | Passed | GitHub Actions run for `e7eb65e`; the prior `NO_FCP` collector error is prevented by visible server HTML. Local forced no-GPU/no-WebGL production probe recorded `first-contentful-paint` at 400 ms. |
| Security workflow | Passed | GitHub Actions dependency review, CodeQL, Gitleaks, audit, and license-inventory jobs for `e7eb65e`. |
| Git LFS | Passed | Checkout with `lfs: true` and `git lfs fsck` precede all GLB-reading CI paths. Retained-object evidence: `docs/evidence/phase0/git-lfs/`. |

## Commands exercised

```text
npm ci
git lfs fsck
npm run format:check
npm run typecheck
npm run build
npm run prepare:standalone
npm run asset:verify
npm run test:visual
npm run e2e
npm run security
npm run licenses:inventory
npm run bundle
```

## Audit policy

`npm run security` fails on production dependency findings at high severity or above. Moderate findings remain visible in the audit output and are not suppressed; the existing Next/PostCSS moderate advisory does not have an acceptable automated remediation because the offered fix changes the Next version outside the pinned compatible line. Dependency review, CodeQL, Gitleaks, and the generated license inventory provide independent CI coverage.

## Approved Phase 2 boundary

Phase 2 will introduce the canonical typed content schemas, serializable chapter registry, selector-based discrete narrative store, semantic section observers, responsive scene definitions, and pure registry assertions. It will not rebuild the semantic page shell or implement the complete no-WebGL content fallback; those remain Phase 3 work.
