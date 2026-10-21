/**
 * Per-chapter presentation data (new_plan.md §7.2) — migrated from the retired
 * chapter registry's atmosphere palettes and card sides. The 3D-only fields
 * (centers, camera poses, lighting, fog, model transforms) are intentionally
 * dropped; DOM presentation keeps only what it consumes.
 *
 * Visual kinds (R15): origins carries the lanyard island, research carries the
 * project spiral; every other chapter uses the ASCII slot.
 */

export const sceneEntries = [
  {
    id: 'origins',
    cardSide: 'left',
    accent: '#D97745',
    background: ['#05070D', '#151B33', '#D97745'],
    visual: { kind: 'lanyard' },
    panelAspect: 'square',
  },
  {
    id: 'interests',
    cardSide: 'right',
    accent: '#55C2A5',
    background: ['#05070D', '#102A2A', '#55C2A5'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'research',
    cardSide: 'left',
    accent: '#69A8FF',
    background: ['#05070D', '#142B3D', '#69A8FF'],
    visual: { kind: 'spiral' },
    panelAspect: 'wide',
  },
  {
    id: 'computation',
    cardSide: 'right',
    accent: '#C084FC',
    background: ['#05070D', '#231538', '#C084FC'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'future',
    cardSide: 'left',
    accent: '#F0B35B',
    background: ['#05070D', '#2D2011', '#F0B35B'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'publications',
    cardSide: 'right',
    accent: '#B69CFF',
    background: ['#05070D', '#211A36', '#B69CFF'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'contact',
    cardSide: 'left',
    accent: '#73D6BD',
    background: ['#05070D', '#102826', '#73D6BD'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
] as const
