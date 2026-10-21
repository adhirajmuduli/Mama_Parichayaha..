/**
 * Journey topology — pure functions over an ordered chapter id list
 * (new_plan.md §7.3). The id list is INJECTED (from the content projection)
 * so this module never imports content and stays testable for any N.
 *
 * This replaces the retired `lib/chapterSelectors.ts`, fixing its linear
 * (non-cyclic) presence/adjacency math as a side effect: distances on a ring
 * must wrap.
 */

export interface JourneyTopology {
  /** Ordered chapter ids; index 0 is the landing chapter. */
  readonly chapterIds: readonly string[]
  readonly count: number
  indexById(id: string): number
  idByIndex(index: number): string
  /** Minimal cyclic step count between two indices (0..floor(count/2)). */
  cyclicDistance(a: number, b: number): number
  /** [previous, next] indices around the ring. */
  adjacentIndices(index: number): [number, number]
  /** Indices within `radius` cyclic steps, ordered by distance then direction. */
  windowIndices(index: number, radius: number): number[]
  indexForIdOrThrow(id: string): number
}

function assertIndex(topology: { count: number }, index: number, label: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= topology.count) {
    throw new Error(`Topology ${label} out of range [0, ${topology.count}): ${index}.`)
  }
}

export function createTopology(chapterIds: readonly string[]): JourneyTopology {
  const seen = new Set<string>()

  chapterIds.forEach((id) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Topology requires non-empty string chapter ids.')
    }

    if (seen.has(id)) {
      throw new Error(`Topology received a duplicate chapter id: ${id}.`)
    }

    seen.add(id)
  })

  if (chapterIds.length < 3 || chapterIds.length > 12) {
    throw new Error(`Topology requires 3..12 chapters; received ${chapterIds.length}.`)
  }

  const indexById = new Map<string, number>(chapterIds.map((id, index) => [id, index]))

  const topology = {
    chapterIds,
    count: chapterIds.length,

    indexById(id: string): number {
      return indexById.get(id) ?? -1
    },

    idByIndex(index: number): string {
      assertIndex(topology, index, 'idByIndex')

      return chapterIds[index] as string
    },

    cyclicDistance(a: number, b: number): number {
      assertIndex(topology, a, 'cyclicDistance-a')
      assertIndex(topology, b, 'cyclicDistance-b')

      const raw = Math.abs(a - b)
      return Math.min(raw, topology.count - raw)
    },

    adjacentIndices(index: number): [number, number] {
      assertIndex(topology, index, 'adjacentIndices')

      return [(index - 1 + topology.count) % topology.count, (index + 1) % topology.count]
    },

    windowIndices(index: number, radius: number): number[] {
      assertIndex(topology, index, 'windowIndices')

      if (radius <= 0) return [index]

      const window: number[] = [index]

      for (let step = 1; step <= radius; step += 1) {
        const forward = (index + step) % topology.count
        const backward = (index - step + topology.count) % topology.count

        if (!window.includes(forward)) window.push(forward)

        // On small rings the backward neighbor can coincide with the forward
        // one (2*step === count) or with an already-collected index; the
        // includes() guards keep every window member unique.
        if (backward !== forward && !window.includes(backward)) window.push(backward)
      }

      return window
    },

    indexForIdOrThrow(id: string): number {
      const index = indexById.get(id)

      if (index === undefined) {
        throw new Error(`Topology has no chapter id '${id}'.`)
      }

      return index
    },
  }

  return topology
}
