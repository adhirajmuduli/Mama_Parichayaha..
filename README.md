# Adhiraj Muduli — Biological Sciences Portfolio

An immersive, accessible portfolio presenting Adhiraj Muduli's interests in
biological sciences, molecular systems, computational biology, and scientific
visualization.

The experience is built as a semantic DOM stage: seven chapters form a cyclic
journey controlled by wheel, touch, and keyboard input. Each chapter now has
its own recurring, procedural ASCII artwork, rendered in a distinct color
palette. Research project links remain in the chapter copy. The page remains a
readable document without JavaScript; the immersive presentation is a
progressive enhancement.

## Current exhibit status

Seven authored artworks are available under `src/arts/`: Emergent Cell,
Molecular Systems Observatory, Protein Foldscape, Inference Field, Systems
Attractor Chamber, Evidence Constellation, and Signal Exchange. They use
fixed-grid ASCII glyphs, deterministic continuous motion, and scene-specific
multicolor palettes. A semantic text frame is server-rendered; after
hydration, the same grid is drawn in color on a canvas. See
[`docs/architecture/ascii-contract.md`](docs/architecture/ascii-contract.md)
for the source contract and
[`docs/adr/0010-ascii-exhibit-medium.md`](docs/adr/0010-ascii-exhibit-medium.md)
for the decision to use ASCII rather than a site-wide 3D model pipeline.

The existing optional lanyard and project-spiral components are not part of
the current chapter art presentation. Three.js is not used to render these
artworks.

## Stack

- Next.js 15, React 19, and TypeScript
- CSS-first Tailwind CSS v4
- `motion` for UI motion
- Zustand for discrete runtime state
- Zod for server-side authored-content validation
- Seven procedurally animated multicolor ASCII exhibit sources
- Server-rendered text fallback with hydrated colored-glyph canvas

## Run locally

Requirements: Node.js `>=22.17.0 <23` and npm `>=10.9.2 <12`.

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`.

To select an explicit port, pass Next.js arguments after the npm separator:

```powershell
npm run dev -- --port 3100
```

## Environment

Copy `.env.example` to `.env.local` for local configuration. Contact delivery
requires server-side Resend, Upstash, and Turnstile configuration. Keep real
credentials out of source control. The `NEXT_PUBLIC_FEATURE_*` values control
optional client features; see `.env.example` for their defaults.

## Verification

```powershell
npm run typecheck
npm run lint
npm run content:check
npm run unit
npm run build
node scripts/check-bundle-budget.mjs
```

`npm run quality` runs the aggregate format, lint, type, architecture,
content, frame-allocation, link, unit, dependency, and bundle checks.
`npm run e2e` builds the app and runs the Playwright browser matrix for
desktop, mobile, reduced motion, and JavaScript-disabled document mode.

## Architecture

- [`docs/architecture/system-map.md`](docs/architecture/system-map.md) —
  runtime data flow, layers, and scheduler ownership.
- [`docs/architecture/ascii-contract.md`](docs/architecture/ascii-contract.md)
  — exhibit authoring and rendering contract.
- [`docs/adr/0010-ascii-exhibit-medium.md`](docs/adr/0010-ascii-exhibit-medium.md)
  — ASCII exhibit decision.
- [`docs/adr/0011-dom-only-architecture.md`](docs/adr/0011-dom-only-architecture.md)
  — DOM stage and constrained Three.js exception.
- [`docs/current-state-assessment.md`](docs/current-state-assessment.md) —
  recovery baseline and latest verified checks.

## Deployment

The Next.js configuration emits a standalone deployment. Use the repository's
`npm run start:standalone` and `npm run deploy:smoke` scripts to prepare/run
the standalone server and verify a deployment. See
[`docs/deployment.md`](docs/deployment.md) for deployment requirements and
security headers.

## Author

Adhiraj Muduli — Biological Sciences undergraduate.
