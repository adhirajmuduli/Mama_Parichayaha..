/**
 * Site content data — migrated verbatim from the retired `content/site.ts`
 * (provenance intact), plus `portrait` (lanyard face image; placeholder
 * silhouette until the owner supplies a photo) and the open-source component
 * attribution note for /credits.
 */

const modelProvenanceSource = {
  file: 'docs/assets/model-provenance.md',
  location: 'Retained assets',
} as const

const phase8Source = {
  file: 'docs/content/phase8-content-provenance.md',
  location: 'Owner-approved public details',
} as const

export const siteContent = {
  /**
   * Lanyard face image. Drop your photo at `public/images/portrait.jpg`
   * (or .png — update this one line to match the extension) and it renders
   * on the badge; the committed file is a placeholder to overwrite.
   */
  portrait: '/images/portrait.jpg',
  contact: {
    id: 'contact',
    eyebrow: 'Contact and public profiles',
    title: 'Get in touch',
    description:
      'Send a direct message below — it reaches the owner inbox. Source code and the public ORCID record are linked alongside.',
    privacyNotice:
      'Contact submissions are sent by email and retained in the recipient inbox until manually deleted. The site stores no message archive; temporary abuse-control hashes expire automatically.',
  },
  credits: {
    id: 'credits',
    eyebrow: 'Credits',
    title: 'Model and scientific-source attribution',
    description:
      'Molecular models from prior explorations of this portfolio are archived with their required source and license attribution.',
    components:
      'Interactive component adaptations from React Bits and Magic UI (both MIT), ported as owned source with local modifications.',
    models: [
      {
        assetId: 'dna-alt',
        title: 'DNA VR Interactive Animation (Alternate)',
        attribution: 'DNA VR Interactive Animation by nilantunes, via Sketchfab.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
            label: 'Alternate DNA source on Sketchfab',
          },
          {
            href: 'https://sketchfab.com/nilantunes',
            label: 'nilantunes on Sketchfab',
          },
        ],
        source: modelProvenanceSource,
      },
      {
        assetId: 'bacteriophage',
        title: 'Bacteriophage Model',
        attribution: 'Procedural bacteriophage study, portfolio source.',
        license: 'Original implementation.',
        links: [
          {
            href: 'https://github.com/adhirajmuduli',
            label: 'GitHub repository',
          },
        ],
        source: modelProvenanceSource,
      },
      {
        assetId: 'hemoglobin-ribbon',
        title: 'Hemoglobin Ribbon (6HHB)',
        attribution: 'Hemoglobin ribbon structure from NIH 3D Print Exchange.',
        license: 'CC0 (Public Domain).',
        links: [
          {
            href: 'https://3d.nih.gov/',
            label: 'NIH 3D Print Exchange',
          },
        ],
        source: modelProvenanceSource,
      },
      {
        assetId: 'brain-point-cloud',
        title: 'Brain Point Cloud',
        attribution: 'Brain point cloud data from Human Cell Atlas / EBI.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://www.ebi.ac.uk/',
            label: 'European Bioinformatics Institute',
          },
        ],
        source: modelProvenanceSource,
      },
      {
        assetId: 'earth-animated',
        title: 'Animated Earth',
        attribution: 'Animated Earth model from NASA Visible Earth.',
        license: 'Public Domain.',
        links: [
          {
            href: 'https://visibleearth.nasa.gov/',
            label: 'NASA Visible Earth',
          },
        ],
        source: modelProvenanceSource,
      },
      {
        assetId: 'dna',
        title: 'DNA VR Interactive Animation (Rollback)',
        attribution: 'DNA VR Interactive Animation by nilantunes, via Sketchfab.',
        license: 'Creative Commons Attribution (CC BY).',
        links: [
          {
            href: 'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
            label: 'DNA source on Sketchfab',
          },
          {
            href: 'https://sketchfab.com/nilantunes',
            label: 'Rollback DNA author on Sketchfab',
          },
        ],
        source: modelProvenanceSource,
      },
    ],
  },
  publications: {
    id: 'publications',
    eyebrow: 'Publications and talks',
    title: 'No publications or talks listed',
    description:
      'No publications, talks, or research articles are currently listed in this portfolio.',
  },
  publicProfiles: [
    {
      external: true,
      href: 'https://github.com/adhirajmuduli',
      label: 'GitHub profile',
      source: phase8Source,
    },
    {
      external: true,
      href: 'https://orcid.org/0009-0005-5655-8120?lang=en',
      label: 'ORCID record',
      source: phase8Source,
    },
  ],
} as const
