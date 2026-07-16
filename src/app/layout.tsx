import type { Metadata } from 'next'

import './globals.css'

import Providers from './providers'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Adhiraj Muduli | Biological Sciences',

  description:
    'Interactive biological sciences portfolio featuring computational biology, molecular systems, and scientific visualization.',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans', geist.variable)}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
