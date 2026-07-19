import type { Metadata } from 'next'

import { getStructuredData, siteDescription, siteName, siteUrl } from '@/lib/siteMetadata'

import './globals.css'

import Providers from './providers'

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
    icon: '/icon.png',
    apple: '/icon.png',
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
      </body>
    </html>
  )
}
