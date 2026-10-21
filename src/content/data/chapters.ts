/**
 * Chapter copy data — migrated verbatim from the retired `content/portfolio.ts`
 * (provenance claims intact, per R10) with two authored additions:
 *   - `navLabel` for the progress rail,
 *   - the interests `rotating` word cycle for the RotatingText line.
 *
 * Copy is owner-approved; do not paraphrase. Edits happen here only.
 */

const phase2Source = {
  file: 'docs/content/phase2-content-provenance.md',
  location: 'Phase 2 content provenance',
} as const

const phase8Source = {
  file: 'docs/content/phase8-content-provenance.md',
  location: 'Owner-approved public details',
} as const

export const profile = {
  name: 'Adhiraj Muduli',
  discipline: 'Biological Sciences undergraduate',
  positioning:
    'Exploring molecular systems, computational biology, scientific visualization, and AI-assisted discovery.',
} as const

export const chapters = [
  {
    id: 'origins',
    eyebrow: 'Origins',
    navLabel: 'Origins',
    title: 'Adhiraj Muduli',
    description:
      'A biological sciences undergraduate studying how molecules, computation, and scientific storytelling can reveal structure, function, and systems-level insight.',
    actions: [
      {
        external: false,
        href: '#interests',
        label: 'Explore scientific focus',
        source: {
          file: 'src/content/portfolio.ts',
          location: 'Origins in-page navigation',
        },
      },
      {
        external: true,
        href: 'https://github.com/adhirajmuduli',
        label: 'GitHub profile',
        source: {
          file: 'docs/content/phase3-site-provenance.md',
          location: 'Verified public profile',
        },
      },
    ],
    detail: {
      eyebrow: 'About',
      title: 'Education and scientific approach',
      items: [
        {
          title: 'Education context',
          description: 'Biological Sciences undergraduate.',
          source: {
            file: 'docs/content/phase2-content-provenance.md',
            location: 'Origins / identity and scientific-focus statement',
          },
        },
      ],
    },
    source: phase2Source,
  },
  {
    id: 'interests',
    eyebrow: 'Interests',
    navLabel: 'Interests',
    title: 'Molecular Systems & Biological Computation',
    description:
      'Exploring protein structure, computational biology, and the visual language of biological systems through simulation, modeling, and data-driven discovery.',
    rotating: {
      prefix: 'Exploring',
      items: [
        'protein structure',
        'molecular systems',
        'computational biology',
        'scientific visualization',
        'AI-assisted discovery',
      ],
    },
    actions: [],
    detail: {
      eyebrow: 'Research questions and methods',
      title: 'Scientific interests',
      items: [
        {
          title: 'Protein systems',
          description: 'Protein systems and molecular structure.',
          source: {
            file: 'docs/content/phase2-content-provenance.md',
            location: 'Interests / molecular-systems and biological-computation statement',
          },
        },
        {
          title: 'Biological computation',
          description: 'Bioinformatics, molecular simulation, and computational biology.',
          source: {
            file: 'docs/content/phase2-content-provenance.md',
            location: 'Interests / molecular-systems and biological-computation statement',
          },
        },
        {
          title: 'Scientific communication',
          description: 'Scientific visualization and AI-assisted discovery.',
          source: {
            file: 'docs/content/phase2-content-provenance.md',
            location: 'Interests / molecular-systems and biological-computation statement',
          },
        },
      ],
    },
    source: phase2Source,
  },
  {
    id: 'research',
    eyebrow: 'Research',
    navLabel: 'Research',
    title: 'Protein Structure & Computational Biology',
    description:
      'Investigating how molecular structure, sequence information, and computational workflows can help explain biological function and scientific discovery.',
    actions: [],
    detail: {
      eyebrow: 'Research focus',
      title: 'Protein structure and computational biology',
      items: [
        {
          title: 'Current scope',
          description:
            'The published portfolio currently describes research focus rather than verified research entries or outcomes.',
          source: {
            file: 'docs/content/phase2-content-provenance.md',
            location: 'Deferred data boundary',
          },
        },
      ],
    },
    source: phase2Source,
  },
  {
    id: 'computation',
    eyebrow: 'Computation',
    navLabel: 'Computation',
    title: 'Biological Computation & Scientific Visualization',
    description:
      'Building computational tools and visual interfaces that make molecular systems more legible, interpretable, and useful for scientific reasoning.',
    actions: [],
    detail: {
      eyebrow: 'Computational focus',
      title: 'Biological computation and visualization',
      items: [],
    },
    source: {
      file: 'README.md',
      location: 'Author / Interests include',
    },
  },
  {
    id: 'future',
    eyebrow: 'Future direction',
    navLabel: 'Future',
    title: 'Molecular Systems & AI-Assisted Discovery',
    description:
      'Looking toward systems biology, AI-assisted scientific workflows, and richer interfaces for exploring biology as an interactive, computational discipline.',
    actions: [],
    detail: {
      eyebrow: 'Current work',
      title: 'Active and exploratory work',
      items: [
        {
          status: 'active',
          title: 'Internship at NISER',
          description: 'Currently undertaking an internship at NISER.',
          source: {
            file: 'docs/content/phase8-content-provenance.md',
            location: 'Owner-approved active work status',
          },
        },
      ],
    },
    source: phase2Source,
  },
  {
    id: 'publications',
    eyebrow: 'Publications and talks',
    navLabel: 'Publications',
    title: 'No publications or talks listed',
    description:
      'No publications, talks, or research articles are currently listed in this portfolio.',
    actions: [],
    detail: {
      eyebrow: 'Research output',
      title: 'Publications and talks',
      items: [],
    },
    source: phase8Source,
  },
  {
    id: 'contact',
    eyebrow: 'Contact and public profiles',
    navLabel: 'Contact',
    title: 'Get in touch',
    description: 'Email, source code, and the public ORCID record are available below.',
    actions: [],
    detail: {
      eyebrow: 'Contact information',
      title: 'Public profiles',
      items: [
        {
          title: 'Email',
          description: 'Contact via email for inquiries and collaboration.',
          source: phase8Source,
        },
        {
          title: 'GitHub',
          description: 'Source code and repositories.',
          source: phase8Source,
        },
      ],
    },
    source: phase8Source,
  },
] as const
