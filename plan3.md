# Plan 3 - UI/UX Visibility, Attention, and Portfolio Clarity

**Scope:** Homepage experience at `/`, including desktop, mobile, WebGL-capable, WebGL-fallback, reduced-motion, keyboard, and high-contrast states.

**Purpose:** Turn the current immersive portfolio from an atmospheric but quiet interface into a clear, memorable, and usable scientific portfolio. The work must improve attention and visual hierarchy without introducing continuous animation, inaccessible contrast, decorative noise, or another parallel design system.

**Observed baseline:** The preview renders the chapter card and fallback atmosphere correctly, but the first viewport is dominated by empty background space. The card sits too low on mobile and too far toward the edge on desktop. Muted copy is difficult to read against the glass surface. Users are instructed to scroll but receive no visible progress rail, chapter status, or strong continuation cue. The first screen establishes the name and discipline, but the portfolio's distinctive combination of biology, computation, and scientific storytelling is not visually emphasized enough. The local preview reported no canvas, so WebGL and fallback states must be verified independently rather than assumed.

## 1. Design principles

- **Identity before atmosphere:** The first viewport must communicate who Adhiraj is, what he studies, and why the work is interesting before decorative motion is noticed.
- **One visual system:** Keep `GlassCard` as the canonical card, link, and button treatment. Do not reintroduce the removed liquid-glass system or add another competing surface primitive.
- **Attention through hierarchy:** Use scale, contrast, composition, chapter accents, and deliberate transitions. Avoid attention gained through nonstop motion, excessive glow, or visual clutter.
- **Scientific specificity:** Every chapter should have a recognizable scientific subject or visual motif. Gradients alone are not sufficient to communicate the portfolio's subject.
- **Progressive enhancement:** The WebGL scene may enhance the experience, but the poster/fallback must remain a complete and attractive experience on its own.
- **Accessible by default:** All visual upgrades must preserve keyboard operation, screen-reader semantics, reduced motion, high contrast, readable focus states, and touch usability.

## 2. Priority order

### P0 - First-viewport clarity and readability

**Targets**

- Establish `Adhiraj Muduli` as the primary identity signal.
- Make `Biological Sciences` and the molecule/computation/storytelling angle immediately legible.
- Move the card into a stronger visual center of gravity.
- Increase text and surface contrast.
- Make the primary next action obvious.

**Implementation surfaces**

- `src/components/journey/ChapterCardShell.tsx`
- `src/components/journey/CyclicChapterStage.tsx`
- `src/content/portfolio.ts`
- `src/components/glass-card/GlassCard.tsx`
- `src/components/glass-card/glass-card.css`
- `src/app/globals.css`

**Actions**

1. Add a compact identity eyebrow or metadata line to the Origins chapter, such as `Biological Sciences · Molecules · Computation`.
2. Treat the Origins title as the first-screen H1-equivalent in visual hierarchy, while preserving the existing document heading semantics.
3. Add a concise primary action, such as `Explore the work`, that advances to the next meaningful chapter. Keep GitHub as a secondary action.
4. Replace very low-contrast muted text with a readable semantic text token. Do not solve contrast by adding a dark opaque block around every paragraph.
5. Increase GlassCard surface opacity and tune border/glow strength per chapter accent. The card must remain readable over both the poster and WebGL background.
6. Reposition the card responsively: desktop should use a deliberate left/right composition with consistent safe margins; mobile should place the card above the bottom safe area with enough space for the title, description, and primary action without excessive empty space.
7. Preserve a small, intentional glimpse of the next chapter or progress cue so the viewport implies continuation.

**Acceptance criteria**

- At 390x844 and 430x932, the identity, title, description, and primary action are visible without awkward clipping or excessive scrolling.
- At 1280x720 and 1440x900, the card is not stranded at the extreme edge or bottom of the viewport.
- Body copy and action labels pass the repository's accessibility contrast checks.
- No card content overlaps the safe-area inset, navigation, or focus ring.

### P1 - Visible navigation and continuation cues

**Targets**

- Make the seven-chapter journey discoverable without relying on the hidden instruction paragraph.
- Show the current chapter and progress at a glance.
- Give users an explicit way to continue while keeping wheel, swipe, keyboard, and anchor navigation.

**Implementation surfaces**

- `src/components/journey/CyclicChapterStage.tsx`
- `src/components/motion/CyclicJourneyController.tsx`
- `src/stores/narrativeStore.ts`
- `src/lib/chapterRegistry.ts`
- `src/components/portfolio/ImmersiveStage.tsx`
- `src/app/globals.css`

**Actions**

1. Add a desktop chapter rail with seven compact items using `navigationLabel` and the active state from `settledChapterId`/`focusableChapterId`.
2. Add a mobile-safe progress indicator such as `01 / 07` plus the current chapter label.
3. Make each navigation item keyboard reachable and activate the corresponding dwell target through `runtime.navigateTo`.
4. Add a first-chapter-only scroll/swipe cue with a clear icon and short label. Remove or hide it after the user begins navigation.
5. Provide a visible active-state treatment that uses accent color, contrast, and shape, not color alone.
6. Keep the existing screen-reader instruction and add live status only where changes are meaningful, avoiding announcement spam during continuous motion.

**Acceptance criteria**

- A first-time user can identify the current chapter and the number of available chapters without reading source text.
- Navigation works with mouse, touch, keyboard, and screen readers.
- The rail never obscures the GlassCard or 3D subject on desktop.
- The mobile indicator remains visible without reducing the card's usable height.

### P1 - Scientific visual motifs and fallback parity

**Targets**

- Make each chapter visually memorable and scientifically specific.
- Ensure the fallback experience does not become a generic gradient when WebGL is unavailable.

**Implementation surfaces**

- `src/lib/chapterRegistry.ts`
- `src/content/assets.ts`
- `src/components/scene/SceneContent.tsx`
- `src/components/scene/ScenePoster.tsx`
- `src/app/globals.css`
- `public/models/` and `public/textures/`

**Suggested motif map**

| Chapter | Visual direction |
|---|---|
| Origins | DNA or molecular helix / structure |
| Interests | organism, ecology, or systems form |
| Research | protein or molecular geometry |
| Computation | neural, graph, or data-network pattern |
| Future | planetary or systems-scale form |
| Publications | evidence, paper, or signal motif |
| Contact | restrained connection/network motif |

**Actions**

1. Verify the actual active chapter registry and asset manifest before assigning motifs; do not create placeholder model entries.
2. Use the existing WebGL exhibit assets where their tier and load policies support them.
3. For fallback, use lightweight deterministic imagery, CSS shapes, or cached bitmap assets that communicate the same chapter motif. Avoid adding another continuously animated full-screen filter stack.
4. Expose a chapter-specific poster motif through `data-chapter` or CSS variables so the background, card accent, and progress indicator share one visual language.
5. Keep model loading current/adjacent/on-demand. Do not preload large assets marked `none`.
6. Make the fallback and WebGL versions share the same chapter title, accent, navigation, and content hierarchy.

**Acceptance criteria**

- Each chapter has a recognizable visual signal in both WebGL and fallback states.
- No fallback asset causes a large initial download or creates a full-viewport blur/compositing regression.
- Reduced-motion and low-tier profiles receive static or materially simplified motifs.

### P1 - Transition and motion polish

**Targets**

- Make chapter changes feel intentional and directional.
- Use motion to support orientation, not distract from reading.

**Implementation surfaces**

- `src/components/journey/ChapterCardShell.tsx`
- `src/components/journey/CyclicChapterStage.tsx`
- `src/components/motion/CyclicJourneyController.tsx`
- `src/styles/animations.css`
- `src/app/globals.css`
- `src/components/scene/Experience.tsx`

**Actions**

1. Add a short staggered entrance for eyebrow, title, description, and actions when a chapter becomes focusable.
2. Use travel direction to determine a small directional translate or accent transition.
3. Keep transition durations short and interruptible; do not delay interaction until animation completes.
4. Use the existing velocity-aware magnetic settle as the source of navigation direction.
5. Keep the poster static or lightly animated at fallback tiers; let the WebGL scene carry most of the ambient movement when available.
6. Add `prefers-reduced-motion` rules that remove transforms and stagger delays while preserving immediate state changes.

**Acceptance criteria**

- Motion never blocks keyboard or touch interaction.
- Reduced-motion snapshots show equivalent information with no animated layout movement.
- There is no new per-frame React state update or random regeneration during chapter transitions.

### P2 - Card composition and action hierarchy

**Targets**

- Make repeated cards scannable and give actions a consistent visual priority.
- Avoid oversized detail blocks that push important actions below the fold.

**Implementation surfaces**

- `src/components/glass-card/GlassCard.tsx`
- `src/components/glass-card/glass-card.css`
- `src/components/narrative/ChapterDetail.tsx`
- `src/components/sections/ContactSection.tsx`
- `src/components/sections/PublicationStatusSection.tsx`

**Actions**

1. Use `GlassCard` for all intentional portfolio surfaces and its `GlassButton`/`GlassLink` family for actions.
2. Define filled, outline, and quiet action variants with stable heights and focus states.
3. Keep primary action first in DOM order and visually strongest; keep external links secondary.
4. Limit card height on mobile and make only the detail region scrollable when necessary.
5. Improve metadata labels, dividers, and spacing so users can scan without reading every paragraph.
6. Ensure links and buttons have visible labels, adequate hit areas, and no nested interactive elements.

**Acceptance criteria**

- Every action has a consistent treatment across chapters, contact, and publication sections.
- The longest action label fits at mobile widths without layout shift.
- Focus, hover, active, disabled, and reduced-motion states are visibly distinct.

### P2 - Production-state and dev-overlay polish

**Targets**

- Ensure the preview seen by users represents production behavior.
- Separate development tooling from the product experience.

**Implementation surfaces**

- `next.config.js`
- `src/app/layout.tsx`
- `src/components/scene/SceneClient.tsx`
- Playwright project configuration and E2E tests

**Actions**

1. Verify the Next.js dev-tools button is absent in a production build and never use the development preview as the final visual reference.
2. Run the production server before screenshot review: `npm run build` followed by `npm run start`.
3. Verify a WebGL-capable production browser creates exactly one canvas.
4. Verify unsupported WebGL and reduced-motion environments show the fallback without requesting the scene chunk unnecessarily.
5. Verify context loss removes the canvas, retains semantic content, and reports the correct fallback reason.
6. Keep `next/dynamic` and the bundle-manifest assertion aligned; the scene must remain code-split.

**Acceptance criteria**

- Development controls do not appear in production screenshots.
- Default desktop, mobile, reduced-motion, and no-WebGL projects have deterministic expected states.
- The initial route and scene chunk remain within the repository's bundle budgets.

## 3. Accessibility and responsive matrix

Every implementation phase must be checked at these states:

| State | Required checks |
|---|---|
| Desktop 1440x900 | Composition, visual hierarchy, canvas/card layering, chapter rail |
| Desktop 1280x720 | Vertical crowding, card height, action visibility |
| Mobile 390x844 | Safe-area spacing, readable title/body, touch targets, progress indicator |
| Mobile 430x932 | Larger mobile composition and card balance |
| Reduced motion | No animated transforms/staggers; content and navigation remain complete |
| No WebGL | Fallback motif, no scene chunk request, complete semantic content |
| Keyboard | Skip path, chapter rail, action focus, arrow/page/digit navigation |
| High contrast | Card borders, buttons, active chapter state, text contrast |

## 4. Measurement and regression strategy

Do not approve visual improvements by intuition alone. Add or update checks for:

- First-viewport screenshot at all four primary viewports.
- Visible chapter count remains one at rest and two only during transitions.
- Chapter registry count remains seven and all seven IDs remain navigable.
- Active progress indicator matches `settledChapterId`.
- Primary CTA is visible and keyboard reachable on Origins.
- Card and action text meet contrast requirements.
- WebGL canvas count is one only in the capable desktop project.
- No-WebGL/reduced-motion projects do not request the dynamic scene chunk.
- Poster particle count and expensive layers remain bounded by the selected profile.
- No browser console errors or page errors during chapter navigation.
- Bundle manifest contains the dynamic Experience chunk and both bundle budgets pass.

## 5. Execution sequence

1. **Baseline production capture:** Build/start the production app and capture the four viewport screenshots plus reduced-motion/no-WebGL screenshots.
2. **P0 hierarchy pass:** Recompose Origins, improve contrast, and establish the primary CTA.
3. **P1 navigation pass:** Add desktop rail, mobile progress, active state, and first-use continuation cue.
4. **P1 fallback/motif pass:** Add chapter motifs and ensure WebGL/fallback parity without increasing runtime cost.
5. **P1 motion pass:** Add restrained directional/staggered transitions with reduced-motion parity.
6. **P2 action/card pass:** Normalize GlassCard-family buttons, links, spacing, and mobile card height.
7. **Production-state pass:** Remove dev-only visual noise from production review and verify all runtime branches.
8. **Final verification:** Run targeted unit/E2E checks, bundle budget, accessibility checks, and production screenshots. Record residual risks instead of weakening assertions.

## 6. Definition of done

The UI/UX work is complete when:

- The first viewport immediately communicates identity, discipline, and a clear next action.
- The composition is intentional at desktop and mobile sizes.
- Users can see where they are in the seven-chapter journey and how to continue.
- Every chapter has a recognizable scientific visual motif in both WebGL and fallback modes.
- Cards, buttons, and links use one coherent GlassCard visual family.
- Motion is purposeful, interruptible, and fully reduced for reduced-motion users.
- Production screenshots contain no dev tools, console errors, or broken assets.
- WebGL improves capable devices without penalizing fallback users through eager downloads or excessive background work.
- Accessibility, performance, bundle, and visual checks pass without mocks, stubs, suppressed failures, or weakened assertions.
