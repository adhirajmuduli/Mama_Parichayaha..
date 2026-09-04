/**
 * GlassCard.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * A translucent, glowing "glass" card system — the look of backlit glass
 * rings on a dark surface (depth + rim light + a soft glossy sheen),
 * adapted into a UI card that can hold real content (titles, copy, buttons).
 *
 * PERFORMANCE PHILOSOPHY (per the brief: no heavy GPU cost, no light-following
 * interactivity):
 *   - Everything is static CSS: gradients, box-shadows, one backdrop-filter.
 *     No canvas, no WebGL, no per-frame JS, no pointer-tracked gradients.
 *   - The only animated properties on hover are `transform` and `box-shadow`
 *     opacity/spread — both are compositor/paint operations the browser is
 *     built to handle cheaply for a handful of elements. Nothing animates
 *     continuously; motion only happens in response to user interaction.
 *   - `backdrop-filter: blur()` is the single most expensive property here.
 *     It's applied once per card (not layered, not animated). A `glass`
 *     prop lets you turn it off entirely and fall back to a flat translucent
 *     fill — useful if you're rendering many cards on a low-power device.
 *   - There's a `@supports not (backdrop-filter)` fallback in the CSS file
 *     so older browsers still get a translucent look, just without blur.
 *
 * USAGE
 *   import { GlassCard, GlassCardHeader, GlassCardBody, GlassCardFooter, GlassButton } from './GlassCard';
 *   import './glass-card.css';
 *
 *   <GlassCard glow="cyan">
 *     <GlassCardHeader eyebrow="Plan" title="Studio" />
 *     <GlassCardBody>
 *       Everything you need to ship a small team's design system.
 *     </GlassCardBody>
 *     <GlassCardFooter>
 *       <GlassButton>Choose Studio</GlassButton>
 *     </GlassCardFooter>
 *   </GlassCard>
 * ─────────────────────────────────────────────────────────────────────────
 */

import React, {
  forwardRef,
  type ElementType,
  type ReactNode,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';

// ── Glow presets ────────────────────────────────────────────────────────
// Named presets map to a small set of coordinated CSS custom properties.
// Pass any valid CSS color to `glow` instead of a preset name for a fully
// custom accent (e.g. glow="#22d3ee" or glow="rgb(232 121 249)").
const GLOW_PRESETS = {
  cyan: { rim: '#7dd8ff', core: '#2fb8f0', ambient: 'rgba(47, 184, 240, 0.35)' },
  violet: { rim: '#c9b6ff', core: '#8b6bf0', ambient: 'rgba(139, 107, 240, 0.35)' },
  amber: { rim: '#ffd9a0', core: '#f0a83f', ambient: 'rgba(240, 168, 63, 0.32)' },
  rose: { rim: '#ffc2d6', core: '#f0568f', ambient: 'rgba(240, 86, 143, 0.32)' },
} as const;

export type GlowPreset = keyof typeof GLOW_PRESETS;

function resolveGlow(glow: GlowPreset | string) {
  if (glow in GLOW_PRESETS) return GLOW_PRESETS[glow as GlowPreset];
  // Custom color string: reuse it for rim + core, and derive a translucent ambient.
  return { rim: glow, core: glow, ambient: glow };
}

// ── GlassCard ───────────────────────────────────────────────────────────

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Accent color. Use a preset name or any CSS color string. */
  glow?: GlowPreset | string;
  /** Card padding scale. */
  padding?: 'sm' | 'md' | 'lg';
  /** Corner radius in px. */
  radius?: number;
  /** Lift + brighten on hover. Turn off for static/decorative cards. */
  interactive?: boolean;
  /** Turn off backdrop-filter blur for low-power rendering; keeps the tint/glow. */
  glass?: boolean;
  /** Render as a different element (e.g. 'article', 'a', 'li'). */
  as?: ElementType;
  children?: ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      glow = 'cyan',
      padding = 'md',
      radius = 20,
      interactive = true,
      glass = true,
      as: Component = 'div',
      className = '',
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const colors = resolveGlow(glow)

    return React.createElement(
      Component as React.ElementType,
      {
        ...rest,
        ref,
        className: [
          'glass-card',
          `glass-card--pad-${padding}`,
          interactive ? 'glass-card--interactive' : '',
          glass ? '' : 'glass-card--no-blur',
          className,
        ]
          .filter(Boolean)
          .join(' '),
        style: {
          '--gc-radius': `${radius}px`,
          '--gc-rim': colors.rim,
          '--gc-core': colors.core,
          '--gc-ambient': colors.ambient,
          ...style,
        } as React.CSSProperties,
      },
      React.createElement('span', { className: 'glass-card__sheen', 'aria-hidden': true }),
      React.createElement('div', { className: 'glass-card__content' }, children),
    )
  },
)
GlassCard.displayName = 'GlassCard';

// ── Structural helpers ─────────────────────────────────────────────────
// Optional — plain divs with semantic class names. Use them or don't;
// GlassCard doesn't require any particular children shape.

export function GlassCardHeader({
  eyebrow,
  title,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { eyebrow?: string; title: ReactNode }) {
  return (
    <div className={`glass-card__header ${className}`} {...rest}>
      {eyebrow && <div className="glass-card__eyebrow">{eyebrow}</div>}
      <h3 className="glass-card__title">{title}</h3>
    </div>
  );
}

export function GlassCardBody({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass-card__body ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function GlassCardFooter({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass-card__footer ${className}`} {...rest}>
      {children}
    </div>
  );
}

// ── GlassButton ─────────────────────────────────────────────────────────
// A companion button that shares the same glass/rim-light language, sized
// to sit inside a GlassCard footer.

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  glow?: GlowPreset | string;
  variant?: 'filled' | 'outline';
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ glow = 'cyan', variant = 'filled', className = '', style, ...rest }, ref) => {
    const colors = resolveGlow(glow);
    return (
      <button
        ref={ref}
        className={['glass-btn', `glass-btn--${variant}`, className].filter(Boolean).join(' ')}
        style={
          {
            '--gc-rim': colors.rim,
            '--gc-core': colors.core,
            '--gc-ambient': colors.ambient,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  }
);
GlassButton.displayName = 'GlassButton';
