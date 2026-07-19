import type { MetadataRoute } from 'next'

import { siteUrlFor } from '@/lib/siteMetadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: siteUrlFor('/sitemap.xml'),
  }
}
