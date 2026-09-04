import type { Metadata, Viewport } from 'next'

import { getStructuredData, siteDescription, siteName, siteUrl } from '@/lib/siteMetadata'
import RegisterSW from '@/components/RegisterSW'
import Providers from './providers'

import './globals.css'
import '../../glass-card.css'

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

export default function RootLayout({ children }: RootLayoutProps) {
  const structuredData = getStructuredData()

  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        <Providers>{children}</Providers>
        <RegisterSW />
      </body>
    </html>
  )
}
