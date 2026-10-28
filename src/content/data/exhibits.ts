/**
 * ASCII exhibit metadata (new_plan.md §10).
 *
 * Seven authored procedural ASCII artworks; each source is lazy-loaded by
 * the exhibit registry and carries its own multicolor palette.
 */

export const exhibits = [
  {
    id: 'cell-landscape',
    chapter: 'origins',
    sourceKey: 'origins',
    label: 'Emergent cell',
    description:
      'A recurring cellular landscape with a rippling membrane, organelles, a gated transport channel, and a moving fluorescent tracer.',
    fps: 12,
    animated: true,
  },
  {
    id: 'molecular-observatory',
    chapter: 'interests',
    sourceKey: 'interests',
    label: 'Molecular systems observatory',
    description:
      'A ligand approaches a membrane receptor as a branching, pulsing signal cascade travels through a molecular systems landscape.',
    fps: 12,
    animated: true,
  },
  {
    id: 'protein-foldscape',
    chapter: 'research',
    sourceKey: 'research',
    label: 'Protein foldscape',
    description:
      'A changing conformational ensemble links a flexible backbone, transient contacts, and an abstract energy basin; it does not depict a single experimentally determined structure.',
    fps: 12,
    animated: true,
  },
  {
    id: 'inference-field',
    chapter: 'computation',
    sourceKey: 'computation',
    label: 'Inference field',
    description:
      'An abstract recurring visualization moves from sequence-like input through a shifting confidence field toward a reconstructed model; it represents a workflow, not a scientific result.',
    fps: 12,
    animated: true,
  },
  {
    id: 'attractor-chamber',
    chapter: 'future',
    sourceKey: 'future',
    label: 'Systems attractor chamber',
    description:
      'A changing regulatory network routes recurrent signals between coupled nodes, showing an abstract systems-biology landscape rather than a specific measured pathway.',
    fps: 12,
    animated: true,
  },
  {
    id: 'evidence-constellation',
    chapter: 'publications',
    sourceKey: 'publications',
    label: 'Evidence constellation',
    description:
      'An abstract archive of figure-like panels and evidence signals; intentionally no paper titles, citations, or publication claims are represented.',
    fps: 12,
    animated: true,
  },
  {
    id: 'signal-exchange',
    chapter: 'contact',
    sourceKey: 'contact',
    label: 'Signal exchange',
    description:
      'A recurring signal routes through a connected field toward an open endpoint, accompanying the portfolio’s actual contact paths without simulating a sent message.',
    fps: 12,
    animated: true,
  },
] as const
