# Phase 0 Completion Record

Completed: 2026-07-16

## Status

Phase 0 is complete. No Phase 0 gate remains open. Phase 1 has not started.

## Immutable baseline identifiers

| Record                            | Identifier                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Historical source snapshot        | `phase0-baseline-2026-07-15` → `51018ff11f4cdc1da3fb10c8d79526f1dd8ff325`       |
| Clean tree-shaken source baseline | `phase0-clean-baseline-2026-07-16` → `0f304a9653985a3985b998236f653ac42743ed11` |
| Baseline evidence commit          | `c0d1da5bffc026fe74d87cc12d1703ad7cd3d40b`                                      |
| Verified remote branch            | `origin/main` → `c0d1da5bffc026fe74d87cc12d1703ad7cd3d40b`                      |

## Implemented cleanup

- Removed every unreachable TypeScript/TSX source module identified from the `src/app/page.tsx` and `src/app/layout.tsx` import closure.
- Removed inactive debug UI/logging, dormant scene branches, obsolete page sections, unused world primitives, unreferenced style files, and the stale `src_zip.zip` source archive.
- Removed the remote Drei environment preset and added a local DNA-inspired `src/app/icon.svg`; final browser capture contains no favicon error.
- Removed unused direct dependencies: `class-variance-authority`, `gsap`, `leva`, `lucide-react`, `motion`, `radix-ui`, `shadcn`, and `tw-animate-css`.
- Removed retired binaries and dormant Earth component: Bacteriophage GLB, Earth GLB, AChBp, apoptosome, and Prohead T7.
- Retained and Git-LFS-tracked only DNA, GFP, and tardigrade. Source, author, license, credit, hash, and derivative status are recorded in `docs/assets/model-provenance.md` and `docs/baseline/asset-inventory.md`.

## Validation evidence

| Gate             | Result                                                                                          | Evidence                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Import closure   | Every remaining TS/TSX source file reachable; no retired-model reference                        | Captured during cleanup; source state at clean baseline tag         |
| TypeScript       | `npx tsc --noEmit` passed                                                                       | Fresh clone log                                                     |
| Production build | `npm run build` passed; `/` 383 kB and first load 486 kB                                        | `docs/evidence/phase0/reproducibility/clean-clone-validation.log`   |
| Git LFS          | Three retained objects listed and `git lfs fsck` passed                                         | `docs/evidence/phase0/git-lfs/ls-files.txt`, `fsck.txt`             |
| Fresh clone      | `git clone`, `npm ci`, typecheck, and build passed from `origin/main`                           | `docs/evidence/phase0/reproducibility/clean-clone-validation.log`   |
| Production HTTP  | Route, three GLBs, and icon all returned HTTP 200                                               | `docs/evidence/phase0/reproducibility/clean-clone-http-checks.json` |
| Browser baseline | Desktop 1440x1000 and mobile viewport 390x844 screenshots; one Canvas each; zero console events | `docs/evidence/phase0/browser/`                                     |

## Commands executed

```text
git lfs fsck
git push origin main --follow-tags
git lfs push --all origin main
git clone <origin> C:\tmp\pp81-phase0-cleanclone-20260716
npm ci
npx tsc --noEmit
npm run build
npm run start -- -p 3002
```

## Notes

The local repository may show a Next.js workspace-root warning because `C:\Users\ADHIRAJ\package-lock.json` is an ancestor lockfile. The isolated clean clone built without that ancestor and reproduced the application successfully. The three moderate `npm audit` findings reported during `npm ci` are dependency-security workflow work scheduled for Phase 1; they do not invalidate Phase 0 reproducibility, provenance, or runtime gates.
