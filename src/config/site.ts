/**
 * Site identity + metadata source of truth (new_plan.md §7.1).
 *
 * `siteUrl` comes from NEXT_PUBLIC_SITE_URL (set per environment — e.g. the
 * Netlify build env); the local fallback keeps canonical/robots/sitemap
 * honest in development. NO production origin literal lives in the repo:
 * deploy-time secret scanners flag origin literals that match env values.
 */

import { readPublicString } from './env'

import { siteContent } from '@/content'

const localDevelopmentOrigin = 'http://localhost:3000'

function resolveSiteUrl(): URL {
  const configured = readPublicString(process.env.NEXT_PUBLIC_SITE_URL)

  if (configured) {
    try {
      return new URL(configured)
    } catch {
      // Malformed override: fail to the local fallback rather than crashing
      // metadata generation for every route.
    }
  }

  return new URL(localDevelopmentOrigin)
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
