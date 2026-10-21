/**
 * Input velocity tracking (new_plan.md §7.4) — a small sample-window
 * estimator shared by the wheel and touch paths.
 *
 * Ring-buffer implementation: no per-record allocations after construction,
 * bounded memory, O(1) record/estimate.
 */

export interface VelocitySample {
  time: number
  units: number
}

export interface VelocityTracker {
  record(units: number, nowMs: number): void
  /** Signed units/second across the in-window samples; 0 when empty. */
  estimate(nowMs: number): number
  reset(): void
  sampleCount(): number
}

const BUFFER_SIZE = 8

export function createVelocityTracker(windowMs: number): VelocityTracker {
  const times = new Float64Array(BUFFER_SIZE)
  const units = new Float64Array(BUFFER_SIZE)
  let writeIndex = 0
  let count = 0

  return {
    record(nextUnits: number, nowMs: number) {
      times[writeIndex] = nowMs
      units[writeIndex] = nextUnits
      writeIndex = (writeIndex + 1) % BUFFER_SIZE
      if (count < BUFFER_SIZE) count += 1
    },

    estimate(nowMs: number) {
      if (count < 2) return 0

      // Walk the ring from oldest to newest, keeping only in-window samples
      // for the extreme endpoints (oldest in-window, newest).
      let oldestTime = Number.POSITIVE_INFINITY
      let oldestUnits = 0
      let newestTime = 0
      let newestUnits = 0

      for (let index = 0; index < count; index += 1) {
        const slot = (writeIndex + BUFFER_SIZE - count + index) % BUFFER_SIZE
        const sampleTime = times[slot] ?? 0
        const sampleUnits = units[slot] ?? 0

        // The slot range only covers written entries (count tracks writes),
        // so every visited sample is real — including legitimate time 0.
        if (nowMs - sampleTime > windowMs) {
          continue
        }

        if (sampleTime < oldestTime) {
          oldestTime = sampleTime
          oldestUnits = sampleUnits
        }

        if (sampleTime >= newestTime) {
          newestTime = sampleTime
          newestUnits = sampleUnits
        }
      }

      const elapsedSeconds = (newestTime - oldestTime) / 1000

      return elapsedSeconds > 0 ? (newestUnits - oldestUnits) / elapsedSeconds : 0
    },

    reset() {
      writeIndex = 0
      count = 0
      times.fill(0)
      units.fill(0)
    },

    sampleCount() {
      return count
    },
  }
}
