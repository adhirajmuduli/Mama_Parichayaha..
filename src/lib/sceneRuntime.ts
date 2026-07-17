export type SceneQualityTier = 'static' | 'low' | 'medium' | 'high'

export interface SceneRuntimeProfile {
  tier: SceneQualityTier
  dprCap: number
  particleCount: number
  postProcessing: boolean
  powerPreference: WebGLPowerPreference
}

interface NavigatorConnection {
  saveData?: boolean
}

interface NavigatorSignals extends Navigator {
  connection?: NavigatorConnection
  deviceMemory?: number
}

const profiles: Record<SceneQualityTier, SceneRuntimeProfile> = {
  static: {
    tier: 'static',
    dprCap: 1,
    particleCount: 0,
    postProcessing: false,
    powerPreference: 'low-power',
  },
  low: {
    tier: 'low',
    dprCap: 1,
    particleCount: 48,
    postProcessing: false,
    powerPreference: 'low-power',
  },
  medium: {
    tier: 'medium',
    dprCap: 1.5,
    particleCount: 96,
    postProcessing: true,
    powerPreference: 'high-performance',
  },
  high: {
    tier: 'high',
    dprCap: 2,
    particleCount: 160,
    postProcessing: true,
    powerPreference: 'high-performance',
  },
}

const tierOrder: readonly SceneQualityTier[] = ['static', 'low', 'medium', 'high']

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function getSceneRuntimeProfile(): SceneRuntimeProfile {
  const navigatorSignals = navigator as NavigatorSignals
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const prefersCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const isCompactViewport = window.innerWidth < 768
  const deviceMemory = navigatorSignals.deviceMemory
  const hardwareConcurrency = navigatorSignals.hardwareConcurrency

  if (prefersReducedMotion || navigatorSignals.connection?.saveData) {
    return profiles.static
  }

  if (
    prefersCoarsePointer ||
    isCompactViewport ||
    (deviceMemory !== undefined && deviceMemory <= 4) ||
    (hardwareConcurrency !== undefined && hardwareConcurrency <= 4)
  ) {
    return profiles.low
  }

  if (
    (deviceMemory !== undefined && deviceMemory < 8) ||
    (hardwareConcurrency !== undefined && hardwareConcurrency < 8) ||
    window.devicePixelRatio > 2
  ) {
    return profiles.medium
  }

  return profiles.high
}

export function getSceneProfileForTier(tier: SceneQualityTier): SceneRuntimeProfile {
  return profiles[tier]
}

export class SceneQualityGovernor {
  private slowSamples = 0
  private fastSamples = 0

  constructor(private tier: Exclude<SceneQualityTier, 'static'>) {}

  sample(frameDurationSeconds: number): SceneQualityTier | null {
    const frameDurationMilliseconds = frameDurationSeconds * 1000
    const currentIndex = tierOrder.indexOf(this.tier)

    if (frameDurationMilliseconds > 42 && currentIndex > 1) {
      this.slowSamples += 1
      this.fastSamples = 0

      if (this.slowSamples >= 90) {
        this.tier = tierOrder[currentIndex - 1] as Exclude<SceneQualityTier, 'static'>
        this.slowSamples = 0
        return this.tier
      }

      return null
    }

    if (frameDurationMilliseconds < 20 && currentIndex < tierOrder.length - 1) {
      this.fastSamples += 1
      this.slowSamples = 0

      if (this.fastSamples >= 600) {
        this.tier = tierOrder[currentIndex + 1] as Exclude<SceneQualityTier, 'static'>
        this.fastSamples = 0
        return this.tier
      }

      return null
    }

    this.slowSamples = 0
    this.fastSamples = 0
    return null
  }
}
