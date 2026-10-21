import type { Metadata, Viewport } from 'next'

import { getStructuredData, siteDescription, siteName, siteUrl } from '@/config/site'
import Providers from './providers'

import './globals.css'
import '@/components/glass-card/glass-card.css'

export const viewport: Viewport = {
  themeColor: '#FDFCF8',
}

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteName,
    template: '%s | Adhiraj Muduli',
  },
  description: siteDescription,
  applicationName: siteName,
  category: 'science',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Adhiraj Muduli biological sciences portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Pre-paint mode boot (new_plan.md §12.1): runs before first paint, before
 * hydration, with no framework cost. Sets the experience mode and capability
 * hints on <html> so CSS can adopt the immersive layout immediately —
 * eliminating the document→immersive flash — while no-JS visitors keep the
 * semantic document layout that the markup below ships by default.
 */
const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement;
d.dataset.experience='immersive';
var m=window.matchMedia;
if(m){d.dataset.reducedMotion=m('(prefers-reduced-motion: reduce)').matches?'true':'false';
d.dataset.coarsePointer=m('(pointer: coarse)').matches?'true':'false';}
var c=navigator.connection;
d.dataset.saveData=(c&&c.saveData===true)?'true':'false';
}catch(e){document.documentElement.dataset.experience='document';}})();`

export default function RootLayout({ children }: RootLayoutProps) {
  const structuredData = getStructuredData()

  return (
    <html lang="en" suppressHydrationWarning className="font-sans" data-experience="document">
      <body>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
