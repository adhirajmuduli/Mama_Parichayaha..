# ADR 0005: Model budget exception and tier policy

- Status: accepted
- Date: 2026-07-17

## Context

The retained tardigrade GLB is 21,943,424 bytes on disk and 10,124,706 bytes with Brotli compression. It exceeds the Phase 5 default 2 MiB compressed-model budget. The current GFP derivative is 2,063,201 bytes with gzip compression, marginally above the same boundary when gzip is the negotiated encoding.

## Decision

The scene asset manifest is the single runtime policy source. DNA is available from low through high tiers. GFP is limited to medium/high and is idle-prefetched only for adjacent desktop-class chapters. Tardigrade is limited to medium/high, is never automatically prefetched, and is fetched only when its computation chapter is active. Low/mobile and static profiles retain the complete semantic chapter content and ScenePoster without requesting either binary.

The retained tardigrade is a documented exception while an independently validated Meshopt variant is prepared. The reproducible `npm run asset:optimize -- tardigrade` candidate preserves the inspected mesh count and bounds, validates without GLB errors, and reduces transfer to 2,981,489 Brotli bytes. It remains above the 2 MiB target and is not deployed. Its 1024 px texture already meets the texture budget. Draco is excluded from the runtime policy because its default Drei decoder path is remote; Meshopt decodes from the bundled runtime. No geometry or texture rewrite is committed without visual and scientific review of the derivative.

## Consequences

The exception preserves the attributed original while bounding automatic transfer and GPU work. The default budget remains enforceable for new assets. A future optimized tardigrade variant must replace this exception only after integrity, visual, and quality-tier checks pass.
