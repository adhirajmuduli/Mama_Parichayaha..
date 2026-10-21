/**
 * Project tiles for the research slot's spiral (new_plan.md §7.2).
 *
 * Seeded with the owner's real public links so the slot never carries fake
 * entries; the owner extends this list with actual project repositories.
 */

const phase8Source = {
  file: 'docs/content/phase8-content-provenance.md',
  location: 'Owner-approved public details',
} as const

export const projects = [
  {
    title: 'GitHub — repositories and source code',
    description: 'Personal repositories, experiment code, and computational notebooks.',
    href: 'https://github.com/adhirajmuduli',
    source: phase8Source,
  },
  {
    title: 'ORCID — public researcher record',
    description: 'Verified public researcher identifier and activity record.',
    href: 'https://orcid.org/0009-0005-5655-8120?lang=en',
    source: phase8Source,
  },
] as const
