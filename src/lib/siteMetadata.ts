import { siteContent } from '@/content/site'

export const siteUrl = new URL('https://adhirajmuduli.netlify.app')
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
