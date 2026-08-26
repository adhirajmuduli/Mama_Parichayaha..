# Baseline Evidence — Supplied Live-Page Recording

- Date recorded: 2026-08-25
- Source: owner-supplied 1910×1018, 30 fps, 43.733-second screen recording of the deployed home page
- Note: the recording file itself is intentionally **not committed** (owner media). The deployment could not be reached from the available network at audit time, so the recording is the runtime baseline. Observations below mirror `plan_restructuring.md` §2.2 and are the "before" reference for the cyclic-restructure visual QA (`docs/visual-qa/cyclic-restructure.md`, Patch 9).

## Observed baseline behavior

1. Origins shows the current orange DNA while the fixed header and static glass card remain visually dominant.
2. Interests shows the procedural purple/orange phage forms.
3. Research shows a procedural helix and retains visible remnants of the preceding scene.
4. Computation shows a procedural purple lattice.
5. Future shows a procedural orbit.
6. The camera mainly slides sideways through large empty regions; close exhibit spacing and limited depth cues prevent a sense of scale.
7. Fog forms drift independently of chapter travel instead of forming planned transition corridors.
8. Publications, contact, and credits continue after Future, breaking the 3D narrative.
9. The card/cursor highlight becomes a large bright stain over the credits area near the end of the recording.

## Required contrast after restructure

- No header, footer, or post-journey document tail on the home route.
- All five chapters render their mapped real GLBs; Origins renders the supplied alternate animated DNA (currently blocked — see ADR 0009).
- Cards read as pearlescent 3D slabs; the cursor never produces a free-floating glow or stain.
- Fog forms deterministic corridors that the camera accelerates through and brakes out of.
- Future→Origins continues the journey with no seam artifact, duplication, or content flash.
