import type { MetadataRoute } from 'next'

import { siteName, siteUrlFor } from '@/lib/siteMetadata'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Adhiraj Muduli',
    description:
      'A biological sciences portfolio exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
    start_url: siteUrlFor(),
    display: 'standalone',
    background_color: '#07020f',
    theme_color: '#07020f',
    icons: [{ src: '/icon.png', sizes: 'any', type: 'image/png' }],
  }
}
