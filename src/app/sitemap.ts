import type { MetadataRoute } from 'next'

import { siteUrlFor } from '@/lib/siteMetadata'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/privacy', '/credits'].map((pathname) => ({
    url: siteUrlFor(pathname),
    changeFrequency: pathname === '/' ? 'monthly' : 'yearly',
    priority: pathname === '/' ? 1 : 0.4,
  }))
}
