/**
 * Site identity + metadata source of truth (new_plan.md §7.1).
 *
 * `siteUrl` prefers NEXT_PUBLIC_SITE_URL and falls back to the deployed
 * origin. It must remain a valid absolute URL or construction throws — the
 * fallback path guards against malformed env values.
 *
 * `lib/siteMetadata.ts` re-exports everything from here so existing importers
 * (robots, sitemap, manifest, opengraph-image, layout) keep working until they
 * are redirected in later phases; the shim is deleted with the legacy wave.
 */

import { readPublicString } from './env'

import { siteContent } from '@/content/site'

const defaultSiteOrigin = 'https://adhirajmuduli.netlify.app'

function resolveSiteUrl(): URL {
  const configured = readPublicString(process.env.NEXT_PUBLIC_SITE_URL)

  if (configured) {
    try {
      return new URL(configured)
    } catch {
      // Malformed override: fail to the default origin rather than crashing
      // metadata generation for every route.
    }
  }

  return new URL(defaultSiteOrigin)
}

export const siteUrl: URL = resolveSiteUrl()
export const siteName = 'Adhiraj Muduli | Biological Sciences'
export const siteDescription =
  'A biological sciences portfolio exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.'

export function siteUrlFor(pathname = '/') {
  return new URL(pathname, siteUrl).toString()
}

export function getStructuredData() {
  const profileUrls = siteContent.publicProfiles
    .filter((profile) => profile.external)
    .map((profile) => profile.href)

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Adhiraj Muduli',
      url: siteUrlFor(),
      sameAs: profileUrls,
      jobTitle: 'Biological Sciences undergraduate',
      affiliation: {
        '@type': 'Organization',
        name: 'National Institute of Science Education and Research',
      },
      knowsAbout: [
        'Computational biology',
        'Molecular systems',
        'Scientific visualization',
        'AI-assisted discovery',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrlFor(),
      description: siteDescription,
      inLanguage: 'en',
    },
  ]
}
