import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import styles from './liquid-glass.module.css'

interface LiquidGlassButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
}

export default function LiquidGlassButton({
  children,
  className,
  rel,
  target,
  ...props
}: LiquidGlassButtonProps) {
  return (
    <a
      {...props}
      className={cn(styles.button, 'px-4 py-2 font-medium transition-colors', className)}
      rel={target === '_blank' ? (rel ?? 'noreferrer') : rel}
      target={target}
    >
      <span>{children}</span>
    </a>
  )
}
