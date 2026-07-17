import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import styles from './liquid-glass.module.css'

type LiquidGlassElement = 'article' | 'div' | 'footer' | 'header' | 'nav' | 'section'
type LiquidGlassTone = 'default' | 'strong'

export interface LiquidGlassProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  accent?: string
  as?: LiquidGlassElement
  children: ReactNode
  forceFallback?: boolean
  interactive?: boolean
  style?: CSSProperties
  tone?: LiquidGlassTone
}

export default function LiquidGlass({
  accent,
  as: Surface = 'div',
  children,
  className,
  forceFallback = false,
  interactive = true,
  style,
  tone = 'default',
  ...props
}: LiquidGlassProps) {
  const surfaceStyle = accent ? ({ ...style, '--glass-accent': accent } as CSSProperties) : style

  return (
    <Surface
      {...props}
      className={cn(styles.surface, className)}
      data-glass-fallback={forceFallback ? 'true' : undefined}
      data-glass-interactive={interactive ? 'true' : 'false'}
      data-glass-tone={tone}
      data-liquid-glass="true"
      style={surfaceStyle}
    >
      <div className={styles.content}>{children}</div>
    </Surface>
  )
}
