# ADR 0009: Testing-Phase Real-Asset Policy

- Status: Proposed
- Date: 2026-08-25
- Supersedes: the provenance-gated asset posture recorded in `docs/assets/model-provenance.md` and the procedural-exhibit interim decision in `action_plan.md` (D3a)

## Context

Four of five chapter exhibits are procedural substitutes because GLB candidates lacked verified provenance. The restructuring plan requires real GLBs to render now for the testing phase: bacteriophage, hemoglobin ribbon, brain point cloud, and animated Earth are already local binaries. The owner-supplied alternate animated DNA (`/models/dna_animated_alt_for_site.glb`) is not yet present in the repository. Publication credits and runtime availability were previously coupled through the site content schema.

## Decision

1. Runtime model loading consumes only a `RuntimeAssetSpec` manifest (`id`, `assetPath`, `chapterId`, `targetDiameter`, `animationClips`, `testingOnly`) in `src/content/assets.ts`. Deferred or missing `PublicationCredit` records must not remove an `assetPath`, skip a preload, or substitute procedural geometry.
2. Canonical runtime mapping for the testing phase: Origins → `dna_animated_alt_for_site.glb` (requires ≥ 1 embedded clip), Interests → `bacteriophage_for_site.glb`, Research → `6HHB-ribbon-secondary-vis_NIH3D.glb`, Computation → `brain_point_cloud_site.glb`, Future → `earth_animated_for_site.glb`.
3. The alternate DNA binary is an owner-supplied intake. Its canonical path is reserved and validated by `scripts/inspect-glb.mjs`, which fails while the binary is absent. At Patch 0 the intake status is `blocked-asset-not-supplied`. The current `dna_for_site.glb` remains in the repository strictly as a rollback asset: it may render for Origins through an explicit, diagnostics-flagged rollback fallback only while the alternate is absent, and it is never relabeled as the alternate.
4. Publication credits move to a separate non-runtime manifest surfaced on `/credits`, with `status: "verified" | "deferred"`; provenance completion stays a publication concern and does not gate this testing phase.
5. Optimized derivatives of the real GLBs (never procedural reconstructions) may be emitted under `public/models/runtime/` by `scripts/optimize-glb.mjs`, preserving animations, clip-critical node names, morph targets, and visible geometry, with side-by-side visual signoff before a derivative replaces a source path.

## Consequences

All five chapters can render real GLB geometry during testing without waiting for provenance work. The Origins exhibit is the only blocked item: it renders the documented rollback DNA until the owner places the alternate binary at the canonical path, at which point the fallback disengages without code changes and `scripts/inspect-glb.mjs` passes. Low-tier devices receive lower-resolution optimized derivatives of the same real models; no procedural fallback ships in the production scene.
