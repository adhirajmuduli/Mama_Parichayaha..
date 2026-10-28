/**
 * Per-chapter presentation data (new_plan.md §7.2) — P11 plasma edition.
 *
 * `background` is now a vivid plasma trio [deep base, plasma A, plasma B]:
 * the base keeps text contrast while the two plasma stops drive the living
 * background blobs (see StageBackground). Accents stay the chapter identity.
 *
 * Visual kinds (R15): origins carries the lanyard island, research carries
 * the full-bleed project spiral; every other chapter uses the ASCII slot.
 */

export const sceneEntries = [
  {
    id: 'origins',
    cardSide: 'left',
    accent: '#D97745',
    background: ['#0B0705', '#8A3E14', '#D97745'],
    visual: { kind: 'lanyard' },
    panelAspect: 'square',
  },
  {
    id: 'interests',
    cardSide: 'right',
    accent: '#55C2A5',
    background: ['#04100C', '#0F5F46', '#55C2A5'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'research',
    cardSide: 'left',
    accent: '#69A8FF',
    background: ['#04091A', '#14438A', '#69A8FF'],
    visual: { kind: 'spiral' },
    panelAspect: 'wide',
  },
  {
    id: 'computation',
    cardSide: 'right',
    accent: '#C084FC',
    background: ['#0A0414', '#4C1D95', '#C084FC'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'future',
    cardSide: 'left',
    accent: '#F0B35B',
    background: ['#0D0803', '#7A4A10', '#F0B35B'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'publications',
    cardSide: 'right',
    accent: '#B69CFF',
    background: ['#070413', '#372778', '#B69CFF'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'contact',
    cardSide: 'left',
    accent: '#73D6BD',
    background: ['#031010', '#0E5348', '#73D6BD'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
] as const
