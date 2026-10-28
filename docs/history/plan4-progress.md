# Plan 4 implementation progress

## Direction

The requested reference is `plan4.md` (its internal title is Plan 3). The latest user direction overrides its static header/footer proposal: retain the immersive seven-chapter journey, including publications and contact, with no header or footer. Preserve one Canvas and the existing camera, registry, and motion runtime.

## Completed first slice

- Replaced the procedural nebula with a lightweight spherical boundary gradient: black center, slowly sweeping chapter colors, and a gentle pulse. The background follows the camera and respects the atmosphere motion factor.
- Removed fallback cloud layers, turbulence filters, texture overlays, and their CSS. The fallback now renders black with an edge gradient and deterministic particles, including before hydration. Static and reduced-motion modes stop decorative animation.
- Kept the existing quality-tiered 3D particle field.
- Removed the obsolete visual workflow that invoked the deleted `test:visual` script. Existing e2e and quality workflows remain; every remaining workflow npm script exists in package.json.

## Remaining audit work

- Build server-rendered, anchor-addressable content with progressive enhancement while retaining the moving journey; reconcile old five-chapter/header/footer assertions with the approved design.
- Add accessible model controls and restore pointer hit testing together.
- Normalize repository formatting and enforce staged-file formatting.
- Resolve remaining timeline and unused registry-field findings after checking their consumers.
- Review the orphan demo before removal.
- Run full quality, e2e, bundle budgets, and browser visual verification. This first slice does not establish full 3D environment completion or audit closure.

## Validation

- TypeScript, ESLint, server/content boundaries, and formatting for changed source files passed.
- Initial unit run encountered sandbox `spawn EPERM`; elevated retry completed: 74 passed, 14 failed across 19 files. Failures are in unchanged timeline (6), registry (3), cyclic controller (2), narrative store (1), and model interaction (2) tests. Several assert the old five-chapter contract; others require interaction investigation. The suite is not green.
- Browser rendering and e2e have not been verified in this slice.
