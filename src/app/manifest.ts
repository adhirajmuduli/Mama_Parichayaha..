import type { MetadataRoute } from 'next'

import { siteName, siteUrlFor } from '@/lib/siteMetadata'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Adhiraj Muduli',
    description:
      'A biological sciences portfolio exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'any',
    scope: '/',
    background_color: '#05070D',
    theme_color: '#05070D',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
