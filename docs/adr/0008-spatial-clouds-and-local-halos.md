# ADR 0008: Spatial Clouds and Local Model Halos

- Status: Proposed
- Date: 2026-08-25
- Supersedes: the pointer-reactive atmosphere behavior and dominant cursor-orb treatment described in ADR 0003 and the Phase 7 atmosphere implementation notes

## Context

The current atmosphere combines a camera-following nebula shader that responds to pointer position, randomly distributed particles, and independent drifting blobs. In the supplied baseline recording, fog drifts independently of chapter travel, models do not feel embedded in their environment, and the cursor treatment renders as a large luminous stain over content. The restructuring plan requires deterministic spatial fog that forms travel corridors between chapters, and per-model halos that embed models into nearby fog without recreating a glow problem.

## Decision

1. Retain the nebula shader only as a restrained far field centered on the camera: dwell motion reduced to 20% of the previous rate, pointer-driven warp removed, motion modulated by the shared travel pulse instead of cursor position.
2. Introduce one instanced cloud field (`RouteCloudField`) built on Drei's `Clouds` provider with a committed seeded generator (seed `0x4d414d41`): tiered cluster counts (60 high / 40 medium / 25 low) distributed as foreground/midground/background corridors around the closed route, using the local texture `/textures/cloud-soft.png` with a lit, depth-write-disabled material.
3. Couple cloud opacity, drift, elongation, scene fog (dwell ≈ 13/54 → midpoint ≈ 7/36), camera FOV pulse (42° → 47°), and far-field motion to a single derived `travelPulse = sin²(π·transitionT)`; clouds are near-static at dwell.
4. Add one `ModelHalo` per canonical exhibit: an additive camera-facing sprite at 1.10–1.18× the model's normalized bounding-sphere diameter with 0.10–0.16 center opacity, plus at most one short-range chapter-colored point light per active or transition-neighbor model (intensity 0.28 high / 0.20 medium / 0 low; distance 12, decay 2). At most two halo lights are ever evaluated.
5. Remove the global cursor orb (`CursorGlow`) entirely and cap any card-local pointer reflection at opacity 0.12, confined to the active card mask.
6. Retune postprocessing: bloom threshold ≥ 0.92 with intensity 0.18–0.28 on high tier and off on low tier; chromatic aberration only as a small travel pulse; vignette static and subtle.

## Consequences

Clouds become deterministic across reloads and form planned foreground/midground/background depth during every transition, accelerating with travel and settling on arrival. Models own a faint localized aura that lifts only nearby lit clouds (under ~12% relative luminance). The cursor is never a light source; card material reads as premium without pointer movement. Pointer coordinates no longer influence any scene system.
