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
      'A living cell: bilayer membrane, porous nucleus with nucleolus, cristae-folded mitochondria, ER, cytoskeleton, vesicles, and a fluorescent tracer crossing a gated channel.',
    fps: 12,
    animated: true,
  },
  {
    id: 'molecular-observatory',
    chapter: 'interests',
    sourceKey: 'interests',
    label: 'Molecular systems observatory',
    description:
      'A 7-helix membrane receptor in a bilayer: a ligand docks in its pocket, a G-protein detaches inside, and a signal cascade propagates with a live activation meter.',
    fps: 12,
    animated: true,
  },
  {
    id: 'protein-foldscape',
    chapter: 'research',
    sourceKey: 'research',
    label: 'Protein foldscape',
    description:
      'A polypeptide refolding between alpha-helix and beta-strand, with H-bond dashes, a glowing active site, and a periodically binding substrate. Abstract, not a determined structure.',
    fps: 12,
    animated: true,
  },
  {
    id: 'inference-field',
    chapter: 'computation',
    sourceKey: 'computation',
    label: 'Inference field',
    description:
      'A 3-layer network forward pass: signal pulses travel weighted edges, activations wave through nodes, the loss sparkline descends, and a softmax readout names the winner.',
    fps: 12,
    animated: true,
  },
  {
    id: 'attractor-chamber',
    chapter: 'future',
    sourceKey: 'future',
    label: 'Systems attractor chamber',
    description:
      'Dynamical systems: contour rings of an attractor basin, three trajectories spiraling in, a ball settling at the floor, and potential energy decaying to the minimum.',
    fps: 12,
    animated: true,
  },
  {
    id: 'evidence-constellation',
    chapter: 'publications',
    sourceKey: 'publications',
    label: 'Evidence constellation',
    description:
      'A constellation of paper nodes sized by impact, linked by citation edges; pulses travel the strong edges and the current work is ringed. No real titles or counts.',
    fps: 12,
    animated: true,
  },
  {
    id: 'signal-exchange',
    chapter: 'contact',
    sourceKey: 'contact',
    label: 'Signal exchange',
    description:
      'A sender and an open endpoint joined by a clear route: packets travel forward, replies back, and a readout cycles SYN, ACK, OPEN. No message is simulated.',
    fps: 12,
    animated: true,
  },
] as const
