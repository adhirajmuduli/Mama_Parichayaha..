import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import LiquidGlass, { type LiquidGlassProps } from './LiquidGlass'
import styles from './liquid-glass.module.css'

interface LiquidGlassPanelProps extends Omit<LiquidGlassProps, 'as' | 'children'> {
  children: ReactNode
}

export default function LiquidGlassPanel({ children, className, ...props }: LiquidGlassPanelProps) {
  return (
    <LiquidGlass {...props} className={cn(styles.panel, className)}>
      {children}
    </LiquidGlass>
  )
}
