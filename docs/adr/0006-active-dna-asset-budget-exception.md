# ADR 0006: Active DNA Asset Budget Exception

- Status: Accepted
- Date: 2026-07-19

## Context

The default Phase 11 budget for an interactively loaded GLB is 2 MiB compressed. The retained DNA exhibit is 2,663,212 bytes (about 2.54 MiB) after Draco compression. It is the only assigned GLB and has verified provenance, a recorded SHA-256 digest, local Draco decoder assets, and no known smaller source that preserves the intended animation.

## Decision

Retain the current Draco-compressed DNA model as a documented temporary exception. It is available only to medium and high scene tiers, is loaded only for the current chapter, and is never preloaded at module evaluation. Low-tier, compact, data-saving, reduced-motion, and no-WebGL experiences retain the complete semantic chapter content without requesting the GLB.

## Consequences

The low-tier scene substitutes the existing atmospheric and semantic fallback for the DNA exhibit. Any future replacement must meet the 2 MiB compressed budget or amend this ADR with measured visual and performance evidence.
