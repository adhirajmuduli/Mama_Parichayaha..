/**
 * ASCII exhibit metadata (new_plan.md §10) — placeholder era.
 *
 * `animated` stays false and `sourceKey` stays 'placeholder' until the
 * owner-supplied animation sources are integrated (P9b); the player, controls
 * and layout are final from day one. Descriptions are written for the
 * *intended* animation so aria labels stay stable across the swap.
 */

export const exhibits = [
  {
    id: 'dna',
    chapter: 'origins',
    sourceKey: 'placeholder',
    label: 'DNA',
    description: 'ASCII rendering of a DNA double helix turning against a dark field.',
    fps: 12,
    animated: false,
  },
  {
    id: 'bacteriophage',
    chapter: 'interests',
    sourceKey: 'placeholder',
    label: 'Bacteriophage',
    description: 'ASCII rendering of a bacteriophage capsid and tail assembly.',
    fps: 12,
    animated: false,
  },
  {
    id: 'hemoglobin',
    chapter: 'research',
    sourceKey: 'placeholder',
    label: 'Hemoglobin',
    description: 'ASCII ribbon rendering of the hemoglobin tertiary structure.',
    fps: 12,
    animated: false,
  },
  {
    id: 'brain',
    chapter: 'computation',
    sourceKey: 'placeholder',
    label: 'Brain',
    description: 'ASCII point-cloud rendering of brain anatomy.',
    fps: 12,
    animated: false,
  },
  {
    id: 'earth',
    chapter: 'future',
    sourceKey: 'placeholder',
    label: 'Earth',
    description: 'ASCII globe rendering with drifting cloud bands.',
    fps: 12,
    animated: false,
  },
] as const
