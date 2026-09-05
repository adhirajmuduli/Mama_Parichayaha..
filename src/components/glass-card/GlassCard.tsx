import React, {
  forwardRef,
  type ElementType,
  type ReactNode,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react'

const GLOW_PRESETS = {
  cyan: { rim: '#7dd8ff', core: '#2fb8f0', ambient: 'rgba(47, 184, 240, 0.35)' },
  violet: { rim: '#c9b6ff', core: '#8b6bf0', ambient: 'rgba(139, 107, 240, 0.35)' },
  amber: { rim: '#ffd9a0', core: '#f0a83f', ambient: 'rgba(240, 168, 63, 0.32)' },
  rose: { rim: '#ffc2d6', core: '#f0568f', ambient: 'rgba(240, 86, 143, 0.32)' },
} as const

export type GlowPreset = keyof typeof GLOW_PRESETS

function resolveGlow(glow: GlowPreset | string) {
  if (glow in GLOW_PRESETS) return GLOW_PRESETS[glow as GlowPreset]
  return { rim: glow, core: glow, ambient: glow }
}

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: GlowPreset | string
  padding?: 'sm' | 'md' | 'lg'
  radius?: number
  interactive?: boolean
  glass?: boolean
  as?: ElementType
  children?: ReactNode
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
GlassCard.displayName = 'GlassCard'

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
  )
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
  )
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
  )
}

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  glow?: GlowPreset | string
  variant?: 'filled' | 'outline'
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ glow = 'cyan', variant = 'filled', className = '', style, ...rest }, ref) => {
    const colors = resolveGlow(glow)
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
    )
  },
)
GlassButton.displayName = 'GlassButton'

export interface GlassLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  glow?: GlowPreset | string
  variant?: 'filled' | 'outline'
}

export const GlassLink = forwardRef<HTMLAnchorElement, GlassLinkProps>(
  ({ glow = 'cyan', variant = 'filled', className = '', style, ...rest }, ref) => {
    const colors = resolveGlow(glow)

    return (
      <a
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
    )
  },
)
GlassLink.displayName = 'GlassLink'
