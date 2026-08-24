# Action Plan — Visual Coherence, Layout, and Experience Fixes

**Basis:** rigorous browser audit of the production build (`next build` + standalone server) on 2026-08-22, using Chromium at 1440×900 and 390×844, per-chapter screenshots, computed-style probes, and console/network capture — combined with a code review of the layout, registry, and scene systems. Screenshot evidence and probe JSON were captured outside the repo; all numbers below are measured values, not estimates.

**Visitor experience today:** every card is crushed against the viewport's left edge with almost no internal spacing; buttons have zero padding and clipped labels; the 3D camera slides sideways (world X 0 → 72) through three chapters that contain nothing, so the "persistent 3D world" reads as a horizontal void behind a vertically scrolling column of dense text cards; the hero DNA renders as a giant flat-orange clipped silhouette; the only other exhibit is a small purple "lollipop" floating in emptiness; the contact form uses raw native controls under a huge purple glow blob; and there is no header, progress indicator, or footer to orient the visitor.

---

## 1. Root-cause defects (fix these first)

### D1 — A global unlayered reset kills every Tailwind spacing utility in the app (P0)

`src/app/globals.css:8-12`:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

Tailwind v4 emits utilities inside `@layer utilities`. **Unlayered author styles beat all cascade layers**, so this rule overrides every `px-*`, `py-*`, `mt-*`, `mb-*`, and `scroll-mt-*` utility in the entire app. Measured in the running production build:

| Element               | Class                  | Computed                                                       |
| --------------------- | ---------------------- | -------------------------------------------------------------- |
| Chapter `<section>`   | `px-6 py-20 sm:px-12`  | `padding: 0px`                                                 |
| Hero heading          | `mb-4`                 | `margin-bottom: 0px`                                           |
| ChapterDetail wrapper | `mt-8` (class present) | `margin-top: 0px`                                              |
| LiquidGlass buttons   | (padding utilities)    | `padding: 0px` → labels clip ("Email Adhiraj", "Send message") |

The only spacing that survives comes from unlayered CSS-module rules (`.panel`, `.button`) and from `gap-*` (not a margin/padding property). This single rule is the primary cause of the **cluttered, cramped** feel: zero page margins, zero inter-block rhythm, zero button padding.

**Fix:** delete the `*` reset entirely (Tailwind v4 preflight already normalizes margins/paddings inside `@layer base`), or move it into `@layer base`. Then re-run the spacing probe: section padding must compute to 48px at ≥640px, `mt-8` to 2rem, button padding ≥ 0.5rem.

### D2 — Chapter card alternation is a no-op; every card is flush-left (P0)

`src/components/narrative/ChapterSection.tsx:16,27`:

```tsx
const alignment = chapter.order % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
<article className={`w-full ${alignment}`}>
```

`justify-content` only applies to flex/grid containers. The `<article>` is `display: block` (measured), so `md:justify-end` computes but does nothing — confirmed: `justify: flex-end`, `panelX: 0` on every chapter. Consequences:

- All five cards sit at the exact left edge (x=0), overlapping the region where exhibits render.
- Composition is identical in every chapter: dense card left, model center, dead space right.
- With D1 fixed the cards would still be left-flush — this must be fixed too.

**Fix:** make the article a flex container (`flex w-full md:justify-end` / `md:justify-start`) or give the panel `md:ml-auto`. Decide deliberately which side the model should occupy per chapter so card and model never overlap.

### D3 — The 3D world is a horizontal corridor with nothing in it (P0 — the core "not a 3D environment" complaint)

`src/lib/chapterRegistry.ts:81-231`: chapter centers march laterally — X = 0 → 18 → 36 → 54 → 72 — while the DOM scrolls vertically. The camera pans 72 world units across the scroll, but:

- `research`, `computation`, and `future` declare `exhibits: []` — **three of five chapters have no exhibit at all** (registry lines 167, 199, 231).
- Exhibits that exist hide themselves between chapters: `PhageSystem.tsx:31-33` scales to 10% and sets `visible = false` when `presence.distance > 2`; `DNA.tsx:56-61` scales to `inactiveScale`.
- Fog (`near 10-12, far 38-43`) hides everything beyond the current chapter.

Net effect, confirmed by screenshots: during 60% of the scroll the viewport is an empty fog gradient, and lateral camera motion is imperceptible because there are no spatial landmarks to move past. The visitor perceives exactly what they described: **horizontal (occasional models) + vertical (cards), not one coherent space**.

**Fix (structural, see §3 for the design proposal):**

1. Give every chapter at least one exhibit or environmental anchor (protein for research, data/stream structure for computation, forward-looking arrangement for future — the GLBs already exist in `public/models` and the manifest: `6HHB` ribbons, `adenosine_A2A_receptor`, `hb_wohemo`, `brain_point_cloud`, `diatom`, `mitochondrion`, `ibuprofen`).
2. Keep exhibits mounted with presence-based opacity/material fade instead of scale-to-10% + `visible=false`, so the world persists during transitions.
3. Compress the lateral span (e.g., 6-8 units per chapter with Z variation and slight heading changes) so neighbors are visible through fog and travel feels spatial, not translational.

### D4 — Model presentation contradicts the "restrained scientific elegance" goal (P0)

- **DNA renders as a flat orange silhouette, clipped at both screen edges** (`desktop-origins` screenshot). Cause: `src/lib/materials.ts:8-10` forces `color #f97316` + `emissive #ea580c` at `emissiveIntensity 1.8` on every mesh, combined with registry rim light `#f59e0b` at intensity **10** and bloom. All geometric detail is blown out; the model is also scaled larger than the viewport (`activeScale` normalization) so it reads as a wall, not an object.
- **Phage reads as a purple lollipop** (`desktop-interests` screenshot): icosahedron head + one orange cylinder + four barely-visible white sticks (`Phage.tsx:7-22`), rendered small at camera distance ~8 while the card occupies the left half. Two of the three phages in `PhageSystem.tsx:40-42` are outside the frustum/fog — only one is ever visible.
- **Color incoherence:** the interests chapter palette is navy/teal/amber, but the phage is purple + origin-orange.

**Fix:** retune `applyDnaMaterial` (drop emissive to ≤0.35 or remove; roughness ~0.5; let chapter key/rim lights model the surface); cap model screen coverage (~55-65% height, fully in frame); rebuild phage proportions (longer striated tail, splayed foot fibers, head-to-tail ratio per real T4 morphology ~1:2) and tint exhibits within their chapter palette; place all three phages in frustum.

### D5 — The pointer specular renders as a permanent giant blob until first hover (P1)

`src/components/liquid-glass/liquid-glass.module.css:3-4,30-45`: `--glass-pointer-x/y` default to `50%`, so on desktop the radial highlight sits dead-center at `opacity: 0.8` from load. On the contact panel (768px wide) this is a huge purple egg behind the form (visible in `desktop-contact`, `desktop-publications`, `mobile-contact` screenshots), reducing text contrast and looking like a rendering stain. On coarse-pointer/reduced-motion profiles it is correctly replaced by a flat sheen — desktop is the broken case.

**Fix:** default the specular layer to `opacity: 0` and transition it in on first `pointerenter` (tracker already exists: `LiquidGlassPointerTracker.tsx`), or gate `::before` on a `data-glass-hovered` attribute.

### D6 — All navigation chrome is disabled (P1)

`src/components/layout/PortfolioDocument.tsx:17`: `const showDocumentChrome = false` disables `SiteHeader`, `ChapterProgressIndicator`, and `SiteFooter`. The site ships **no chapter navigation, no progress affordance, and no footer** — visitors cannot tell where they are in five chapters or jump anywhere; `CreditsSection` floats unanchored at the bottom.

**Fix:** re-enable header + progress indicator (they were built and tested for this), or replace with the planned minimal chapter dock/progress rail. Keep the footer.

### D7 — Contact form: native controls, oversized panel, broken offline state (P1)

Measured panel: 768×914 px in a 900 px viewport — **taller than the screen**, flush to the top edge. Observed:

- Raw native `<select>` (OS chrome), unstyled inputs, labels cramped by D1 ("Affiliation" / "(optional)" have zero gap).
- The Cloudflare Turnstile iframe renders as a **large white error box** ("Unable to connect to website") when the challenge API is unreachable, and emits console 400s (the six console errors captured on desktop). There is no themed container or graceful failure state.
- Primary button has zero padding; link buttons clip their labels.

**Fix:** style form controls to the glass system (shared input/select/textarea classes, visible focus), constrain panel height (`max-h` + internal scroll or a two-column desktop layout), give the Turnstile widget a fixed-size themed container with a "verification unavailable — retry" state, and re-check after D1 restores padding.

### D8 — Exhibit cards carry contradictory, noisy interaction UI (P1)

`src/components/models/ModelInteractionControls.tsx:47-48,97-102`: `isActive` requires `activeChapter === chapter.id`, so **during every scroll transition the outgoing card flips its controls to disabled and injects "The interactive … model is unavailable here…"** (captured in the mid-scroll screenshot). On mobile the DNA is tier-gated (`assets.ts:98` — `availableTiers: ['medium','high']`), so phones permanently show the unavailable message **plus** the still-visible Rotate/Reset buttons — contradictory UI in the hero of every phone visit.

**Fix:** show the unavailable notice only when the renderer is actually unavailable (`rendererAvailable === false`) or the exhibit failed; hide the controls block entirely when the exhibit is tier-gated away; keep controls enabled while the chapter is adjacent (interaction already gates on active chapter inside the store).

### D9 — Content redundancy inflates every card (P1)

Each chapter card stacks: eyebrow + title + description + detail eyebrow + detail title + N items + (exhibit description + instruction paragraph + 3 buttons + status message) + scroll hint. Multiple chapters repeat the same sentence twice (e.g., computation: description and "Methods of interest" item are verbatim-identical; hero repeats the interests list as "Scientific approach"). The publications section spends a full 100svh viewport on a single sentence card.

**Fix (editorial + layout):** one idea per block — drop per-chapter descriptions that duplicate detail items; move model instructions into a tooltip/`aria-describedby` (visible only on focus/hover of controls); collapse publications into a compact strip or merge into the footer band; reserve the hero for identity + one CTA row + one interaction hint.

### D10 — Text contrast over glass is marginal (P2)

Muted body text (`--site-muted`) over the glass panel + center glow blob + blurred model behind (DNA bleeds through the hero panel) measures visibly low-contrast in screenshots, worst in the hero and contact. The plan's own gate requires contrast tested "over the brightest atmosphere frame."

**Fix:** after D1/D2/D5, re-run the Axe contrast pass at the brightest chapter frames; raise `--site-muted` lightness or add a local scrim behind text blocks where the model passes under the panel.

---

## 2. Secondary code findings

| #   | Finding                                                                                                                                                                          | Location                      | Severity |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------- |
| S1  | `scroll-mt-24` on sections is dead (D1 cascade issue) — anchor jumps ignore header offset                                                                                        | `ChapterSection.tsx:23`       | P2       |
| S2  | `Phage.tsx` legs use `rotation.z = offset` (≤0.3 rad) — fibers barely splay; white material invisible against fog                                                                | `Phage.tsx:55-60`             | P2       |
| S3  | Module-level shared geometries/materials in `Phage.tsx` are never disposed on HMR and bypass the material-factory policy                                                         | `Phage.tsx:7-22`              | P3       |
| S4  | `DNA.tsx:59` writes `position.y` every frame even when the exhibit is far/invisible — harmless but wasteful; same pattern in `PhageSystem.tsx`                                   | models                        | P3       |
| S5  | `ChapterSectionObserver` fires on programmatic instant scrolls during tests/inspection; combined with D8 this produces visible status churn                                      | narrative                     | P2       |
| S6  | Console 400s in audit were Turnstile challenge calls from the offline sandbox — not a production defect, but they confirm there is no quiet failure path for the widget (see D7) | `TurnstileWidget.tsx`         | P2       |
| S7  | `showDocumentChrome` flag leaves `SiteHeader`/`SiteFooter`/`ChapterProgressIndicator` built-but-dead code paths and an unused `interactiveDecorations` prop                      | `PortfolioDocument.tsx:17,24` | P3       |

---

## 3. Experience redesign proposal — making it feel like one 3D environment

The audit shows the layout system is sound (persistent canvas + semantic sections + registry); what is missing is **spatial coherence**. Proposed direction, in priority order:

1. **One continuous environment, not a corridor of nothing.** Reduce chapter spacing (X step ~7-9 units, alternate slight Z depth and camera yaw per chapter so the path curves). Fog far tuned so the next chapter's anchor is faintly visible from the current one — the world should promise what's ahead.
2. **Every chapter gets a scientific anchor.** research → hemoglobin/6HHB ribbon exhibit; computation → adenosine A2A receptor or brain point cloud; future → a minimal composed arrangement (e.g., diatom + particles). All assets are already local, hashed, and credited in the manifest.
3. **Persistent presence.** Replace scale-to-10%/`visible=false` with distance-based opacity + slow parallax drift, so models glide past rather than pop.
4. **Deliberate card/model choreography.** With D2 fixed, alternate card side per chapter and place the exhibit on the opposite third; add a subtle camera X-offset toward the card side so the model occupies the free two-thirds. Never let the panel overlap the exhibit's screen region at rest.
5. **Material restraint.** Kill emissive-heavy materials (D4); rely on chapter key/rim lights + a shared fresnel rim so all exhibits belong to the same lighting world.
6. **Quieter cards.** Apply D9; target ≤5 content blocks per card, one accent color per chapter (the registry palette), and no duplicated sentences.

---

## 4. Execution checklist

### P0 — must fix before any other visual work

- [ ] D1: remove/re-layer the `*` reset in `src/app/globals.css:8-12`; verify spacing utilities compute non-zero (probe script).
- [ ] D2: make `<article>` a flex container (or `ml-auto` panel) in `ChapterSection.tsx`; verify alternating panel x ≈ 48 / 816 at 1440px.
- [ ] D4a: retune `applyDnaMaterial` in `src/lib/materials.ts` (emissive ≤ 0.35, roughness ~0.5) and reduce origins rim intensity in the registry; cap DNA screen height.
- [ ] D3a: assign exhibits to research/computation/future from the existing manifest assets; extend `exhibitIds`, loaders, and registry entries.

### P1 — experience correctness

- [ ] D3b: presence-based fade instead of scale/hide (`DNA.tsx`, `PhageSystem.tsx`, `useChapterPresence`).
- [ ] D3c: compress lateral span + add Z/yaw variation in `chapterRegistry.ts` camera poses.
- [ ] D5: specular layer off until pointer enter (`liquid-glass.module.css`, `LiquidGlassPointerTracker.tsx`).
- [ ] D6: restore header/progress/footer or a minimal progress rail (`PortfolioDocument.tsx`).
- [ ] D7: glass-styled form controls + bounded contact panel + themed Turnstile fallback (`ContactForm.tsx`, `TurnstileWidget.tsx`, `ContactSection.tsx`).
- [ ] D8: fix `ModelInteractionControls` active/unavailable logic; hide controls when tier-gated.
- [ ] D9: editorial de-duplication of chapter content (`src/content/portfolio.ts`) and compact publications section.

### P2 — polish

- [ ] D10 + S1: contrast re-verification over brightest frames; restore `scroll-mt` behavior.
- [ ] D4b: rebuild phage geometry/proportions and palette-align exhibits.
- [ ] S2-S7 as listed above.

## 5. Verification plan

1. Re-run the computed-style probe: section padding 48px (desktop), `mt-8` = 32px, button padding ≥ 8px, panel x alternates.
2. Screenshot sweep per chapter at 1440×900 and 390×844: no card/model overlap at rest, no clipped models, no center glow blob, visible next-chapter anchor through fog.
3. Mid-scroll capture: no "unavailable" status churn on outgoing cards.
4. Existing gates must stay green: `npm run quality`, full Playwright matrix, visual baselines (regenerate deliberately after each visual change, per Phase 13 discipline), bundle budgets.
5. Axe: no new serious/critical violations; contrast pass at worst-case frames.
