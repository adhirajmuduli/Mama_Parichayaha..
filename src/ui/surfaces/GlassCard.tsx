'use client'

/**
 * Glass surfaces (new_plan.md §7.6) — the new-era replacement for the retired
 * legacy glass-card module: one restrained panel + pill link, built on the
 * stage tokens and the §12 expense rules (single capped blur, gated by
 * coarse pointer and reduced transparency). A pill button joins when a
 * consumer needs it (no speculative exports — knip stays clean).
 */

import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional accent glow tint (css color); defaults to the site accent. */
  accent?: string
  children?: ReactNode
}

export function GlassCard({ accent, className = '', style, children, ...rest }: GlassCardProps) {
  return (
    <div
      className={`surface-glass ${className}`.trim()}
      style={{ ...(accent ? ({ '--surface-accent': accent } as CSSProperties) : null), ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface GlassLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'filled' | 'outline'
  children?: ReactNode
}

export function GlassLink({ variant = 'outline', className = '', ...rest }: GlassLinkProps) {
  return <a className={`surface-pill surface-pill--${variant} ${className}`.trim()} {...rest} />
}
