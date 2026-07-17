import type { ComponentPropsWithRef, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import styles from './liquid-glass.module.css'

interface LiquidGlassControlProps extends ComponentPropsWithRef<'button'> {
  children: ReactNode
}

export default function LiquidGlassControl({
  children,
  className,
  type = 'button',
  ...props
}: LiquidGlassControlProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(styles.button, 'px-3 py-2 text-sm font-medium transition-colors', className)}
    >
      <span>{children}</span>
    </button>
  )
}
