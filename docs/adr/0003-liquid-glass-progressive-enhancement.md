# ADR 0003: Progressive liquid-glass surfaces

Status: Accepted

## Decision

Liquid glass is a bounded shared surface system: a translucent base, constrained backdrop treatment where supported, pointer-driven CSS-variable specular highlight, edge reflection, subtle noise cue, and internal depth. It retains an opaque high-contrast fallback.

The shared CSS module caps blur at 18 px. A surface never fills the viewport, surface nesting is prohibited, and button controls use an opaque reflected treatment without `backdrop-filter`. A single client tracker delegates fine-pointer movement to `data-liquid-glass` surfaces and writes CSS variables directly; it does not schedule React state updates. It detaches on coarse pointers and reduced-motion preferences.

## Consequences

- Semantic content remains server-rendered; only the optional pointer tracker hydrates for glass interaction.
- `LiquidGlass`, `LiquidGlassPanel`, `LiquidGlassButton`, and `LiquidGlassControl` are the only permitted shared presentation primitives for the current page shell.
- Forced fallback, reduced motion, low update rate, and high-contrast modes disable blur and decorative layers while retaining opaque contrast.
- Browser checks reject nested surfaces and filtered surfaces that occupy 80% or more of the viewport. The isolated `/lab/liquid-glass` harness owns default, fallback, loading, focus, hover, mobile, reduced-motion, and no-WebGL visual references.
