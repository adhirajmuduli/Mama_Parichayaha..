/**
 * ASCII exhibit metadata (new_plan.md §10).
 *
 * Mock era (2026-10-22): the five exhibit chapters point at the owner-
 * sanctioned interim preview animations (`animated: true` + their id as the
 * `sourceKey`); they run through the full production pipeline. P9b swaps
 * this data to the owner's real sources — `animated` stays true, the
 * `sourceKey` changes, nothing else moves.
 */

export const exhibits = [
  {
    id: 'dna',
    chapter: 'origins',
    sourceKey: 'dna',
    label: 'DNA',
    description: 'ASCII rendering of a DNA double helix turning against a dark field.',
    fps: 12,
    animated: true,
  },
  {
    id: 'bacteriophage',
    chapter: 'interests',
    sourceKey: 'bacteriophage',
    label: 'Bacteriophage',
    description: 'ASCII rendering of a bacteriophage capsid and tail assembly.',
    fps: 12,
    animated: true,
  },
  {
    id: 'hemoglobin',
    chapter: 'research',
    sourceKey: 'hemoglobin',
    label: 'Hemoglobin',
    description: 'ASCII ribbon rendering of the hemoglobin tertiary structure.',
    fps: 12,
    animated: true,
  },
  {
    id: 'brain',
    chapter: 'computation',
    sourceKey: 'brain',
    label: 'Brain',
    description: 'ASCII point-cloud rendering of brain anatomy.',
    fps: 12,
    animated: true,
  },
  {
    id: 'earth',
    chapter: 'future',
    sourceKey: 'earth',
    label: 'Earth',
    description: 'ASCII globe rendering with drifting cloud bands.',
    fps: 12,
    animated: true,
  },
] as const
