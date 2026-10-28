/**
 * Per-chapter presentation data (new_plan.md §7.2) — P11 plasma edition.
 *
 * `background` is now a vivid plasma trio [deep base, plasma A, plasma B]:
 * the base keeps text contrast while the two plasma stops drive the living
 * background blobs (see StageBackground). Accents stay the chapter identity.
 *
 * Each chapter uses a distinct recurring colored ASCII artwork. Existing
 * project links remain available in the Research chapter's copy surface.
 */

export const sceneEntries = [
  {
    id: 'origins',
    cardSide: 'left',
    accent: '#F08A74',
    background: ['#100B18', '#6A3159', '#D26D82'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'interests',
    cardSide: 'right',
    accent: '#A99AFF',
    background: ['#090916', '#493A84', '#8F7CFF'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'research',
    cardSide: 'left',
    accent: '#65C9D8',
    background: ['#06121F', '#174762', '#FF9C73'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'computation',
    cardSide: 'right',
    accent: '#52E0A5',
    background: ['#061511', '#165B47', '#52E0A5'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'future',
    cardSide: 'left',
    accent: '#7584FF',
    background: ['#0B0F24', '#323E86', '#60E4C0'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'publications',
    cardSide: 'right',
    accent: '#E8CFA5',
    background: ['#121319', '#554A43', '#E69B7A'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
  {
    id: 'contact',
    cardSide: 'left',
    accent: '#43D9C1',
    background: ['#041516', '#0B5551', '#79B8FF'],
    visual: { kind: 'ascii' },
    panelAspect: 'square',
  },
] as const
