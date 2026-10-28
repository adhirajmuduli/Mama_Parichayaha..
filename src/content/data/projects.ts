/**
 * Project tiles for the research slot's spiral (new_plan.md §7.2).
 *
 * Real repositories from github.com/adhirajmuduli (fetched 2026-10-24; keep
 * this list in sync by editing here — the spiral, validation and tests all
 * read from this file). Each tile carries a two-stop gradient for its
 * visual identity.
 */

const reposSource = {
  file: 'https://github.com/adhirajmuduli?tab=repositories',
  location: 'Owner GitHub repositories',
} as const

export const projects = [
  {
    title: 'Needra',
    description:
      'RT-PCR data analysis platform for single and multi-plate pipelines, with statistical tests and post-hoc analysis.',
    gradient: ['#55C2A5', '#2FB8F0'],
    href: 'https://github.com/adhirajmuduli/Needra',
    source: reposSource,
  },
  {
    title: 'Heatmaps',
    description:
      'Interactive browser tool visualizing geospatial environmental data as time-varying heatmaps.',
    gradient: ['#E34C26', '#F1E05A'],
    href: 'https://github.com/adhirajmuduli/Heatmaps',
    source: reposSource,
  },
  {
    title: 'Trendmapp',
    description:
      'Trendmaps and heatmaps for spatial visualization of abstract or geographical distributions.',
    gradient: ['#F1E05A', '#69A8FF'],
    href: 'https://github.com/adhirajmuduli/Trendmapp',
    source: reposSource,
  },
  {
    title: 'Evolution — 3-allele equilibrium',
    description:
      'Hardy–Weinberg genotype frequencies for a 3-allele 1-locus system, calculated and plotted across gene frequencies.',
    gradient: ['#C084FC', '#69A8FF'],
    href: 'https://github.com/adhirajmuduli/Evolution_2nd_1',
    source: reposSource,
  },
  {
    title: 'Village-dashboard',
    description: 'Village-level analytics dashboard build.',
    gradient: ['#3178C6', '#55C2A5'],
    href: 'https://github.com/adhirajmuduli/Village-dashboard',
    source: reposSource,
  },
  {
    title: 'NEWEM',
    description: 'Experimental TypeScript build.',
    gradient: ['#3178C6', '#C084FC'],
    href: 'https://github.com/adhirajmuduli/NEWEM',
    source: reposSource,
  },
  {
    title: 'Mama Parichayaha',
    description: 'Python experiment set.',
    gradient: ['#3572A5', '#D97745'],
    href: 'https://github.com/adhirajmuduli/Mama_Parichayaha..',
    source: reposSource,
  },
  {
    title: 'Atisahvahakata',
    description: 'Python experiment set.',
    gradient: ['#3572A5', '#55C2A5'],
    href: 'https://github.com/adhirajmuduli/_Atisahvahakata_',
    source: reposSource,
  },
] as const
