/**
 * Cross-cutting, framework-free types shared by server projection and client
 * runtime/UI (new_plan.md §6 "shared surfaces").
 *
 * Nothing in this file may import anything else: it is the intersection
 * vocabulary between content (server), journey (pure), runtime, exhibits and
 * ui. Adding a dependency here would leak it into every layer.
 */

// ---------------------------------------------------------------------------
// Journey
// ---------------------------------------------------------------------------

export type JourneyDirection = -1 | 0 | 1
export type TravelMode = 'dwell' | 'transition'

/**
 * One journey sample, decoded once per frame while the experience moves.
 * `currentIndex` is the incoming chapter during transitions and the settled
 * chapter at dwell; outgoing/incoming equal `currentIndex` outside transitions.
 */
export interface JourneyFrame {
  /** Spring-smoothed journey units for this frame. */
  units: number
  /** Units per second, signed. */
  velocity: number
  /** Direction of the last intentional input (-1 backward, 1 forward). */
  direction: JourneyDirection
  /** Current phase of the cyclic journey. */
  mode: TravelMode
  /** See interface docs. */
  currentIndex: number
  outgoingIndex: number
  incomingIndex: number
  /** sin²(π · transition progress); 0 at dwell. Drives motion intensity. */
  travelPulse: number
  /** Completed cycles through the ring (signed by travel direction). */
  loopCount: number
  /** Continuous chapter position (index + transition progress). */
  indexFloat: number
}

// ---------------------------------------------------------------------------
// Exhibits / visuals
// ---------------------------------------------------------------------------

/** Lifecycle of an exhibit slot as published to stores (low-frequency). */
export type ExhibitAvailability = 'placeholder' | 'ready' | 'error'

/**
 * Playback state per exhibit (new_plan.md §10.4, P11 simplification):
 * the user controls were removed as redundant — playback is automatic.
 * 'static' = no animation possible (reduced motion, fpsCap 0, unanimated
 * source or feature off); 'playing' = active + animatable; 'idle' = the
 * chapter is outside the visible window.
 */
export type ExhibitPlayback = 'idle' | 'playing' | 'static'

/** Which component renders a chapter's visual slot (R15). */
export type ChapterVisualKind = 'ascii' | 'spiral' | 'lanyard'

/** Serializable exhibit metadata shipped to the client stage. */
export interface ClientExhibit {
  id: string
  chapterId: string
  /** Human name used by the controls group ("DNA model controls" era names). */
  label: string
  /** Stable aria description for the panel (role="img"). */
  description: string
  /** Authored frame rate; the player caps it per quality tier. */
  fps: number
  /** False while only the placeholder art exists (FEATURES.exhibits=false). */
  animated: boolean
  /** Adapter key resolved by the exhibit registry (sources table). */
  sourceKey: string
}

// ---------------------------------------------------------------------------
// Client content projection
// ---------------------------------------------------------------------------

export interface ClientChapterAction {
  label: string
  href: string
  external: boolean
}

export interface ClientChapterDetailItem {
  title: string
  description: string
  status?: 'active' | 'completed' | 'experimental'
  /** Optional link target (internal path or absolute URL). */
  href?: string
  external?: boolean
}

export interface ClientChapterDetail {
  eyebrow: string
  title: string
  items: ClientChapterDetailItem[]
}

/** Interests-era rotating copy line: "Exploring → {word cycle}". */
export interface ClientRotatingCopy {
  prefix: string
  items: string[]
}

export interface ClientChapterVisual {
  kind: ChapterVisualKind
}

export interface ClientChapter {
  id: string
  /** Short rail/pill label ("Origins"); defaults to eyebrow when omitted. */
  navLabel: string
  eyebrow: string
  title: string
  description: string
  detail: ClientChapterDetail
  actions: ClientChapterAction[]
  rotating?: ClientRotatingCopy
  cardSide: 'left' | 'right'
  /** Per-chapter accent (css color) for rail, glow and ascii tint. */
  accent: string
  /** Background ramp: [base, mid, accent]. */
  background: readonly [string, string, string]
  visual: ClientChapterVisual
  /** ASCII exhibit metadata; null for chapters whose slot is not ascii. */
  exhibit: ClientExhibit | null
}

export interface ClientProfile {
  name: string
  discipline: string
  positioning: string
}

export interface ClientProject {
  title: string
  description: string
  href: string
  external: boolean
  /** Two-stop tile gradient [from, to] — spiral cards are never uncolored. */
  gradient: readonly [string, string]
}

export interface ClientPublicProfile {
  label: string
  href: string
  external: boolean
}

export interface ClientCreditsModel {
  assetId: string
  title: string
  attribution: string
  license: string
  links: { label: string; href: string }[]
}

export interface ClientContent {
  profile: ClientProfile
  /** Ordered journey chapters; length N drives every derived system. */
  chapters: ClientChapter[]
  /** Lanyard face image (public asset path). */
  portrait: string
  publications: {
    eyebrow: string
    title: string
    description: string
  }
  contact: {
    /** Journey chapter id that hosts the contact extras (data, not a literal). */
    id: string
    eyebrow: string
    title: string
    description: string
    privacyNotice: string
  }
  profiles: ClientPublicProfile[]
  /** Project tiles for the research slot's spiral. */
  projects: ClientProject[]
  credits: {
    title: string
    description: string
    /** Open-source component attribution note (React Bits / Magic UI, MIT). */
    components: string
    models: ClientCreditsModel[]
  }
}
