import * as THREE from 'three'

import type { AtmosphereDefinition, Vector3Tuple } from '@/lib/chapterRegistry'

export interface AtmosphereRuntimeState {
  ambientIntensity: number
  background: THREE.Color
  bloomIntensity: number
  bloomThreshold: number
  center: THREE.Vector3
  cloudAccent: THREE.Color
  cloudBase: THREE.Color
  cloudDensity: number
  cloudMid: THREE.Color
  exposure: number
  fillColor: THREE.Color
  fillIntensity: number
  fogColor: THREE.Color
  fogFar: number
  fogNear: number
  keyColor: THREE.Color
  keyIntensity: number
  keyOffset: THREE.Vector3
  motionFactor: number
  particleColor: THREE.Color
  particleOpacity: number
  rimColor: THREE.Color
  rimIntensity: number
  rimOffset: THREE.Vector3
  fillOffset: THREE.Vector3
}

export interface AtmospherePreferences {
  reduceMotion: boolean
}

const chapterTransitionRate = 2.8
const preferenceTransitionRate = 8

export function createAtmosphereRuntime(
  atmosphere: AtmosphereDefinition,
  center: Vector3Tuple,
): AtmosphereRuntimeState {
  return {
    ambientIntensity: atmosphere.lighting.ambientIntensity,
    background: new THREE.Color(atmosphere.palette[0]),
    bloomIntensity: atmosphere.bloom.intensity,
    bloomThreshold: atmosphere.bloom.threshold,
    center: new THREE.Vector3(...center),
    cloudAccent: new THREE.Color(atmosphere.palette[2]),
    cloudBase: new THREE.Color(atmosphere.palette[0]),
    cloudDensity: atmosphere.cloudDensity,
    cloudMid: new THREE.Color(atmosphere.palette[1]),
    exposure: atmosphere.exposure,
    fillColor: new THREE.Color(atmosphere.lighting.fill.color),
    fillIntensity: atmosphere.lighting.fill.intensity,
    fillOffset: new THREE.Vector3(...atmosphere.lighting.fill.offset),
    fogColor: new THREE.Color(atmosphere.fogColor),
    fogFar: atmosphere.fog.far,
    fogNear: atmosphere.fog.near,
    keyColor: new THREE.Color(atmosphere.lighting.key.color),
    keyIntensity: atmosphere.lighting.key.intensity,
    keyOffset: new THREE.Vector3(...atmosphere.lighting.key.offset),
    motionFactor: 1,
    particleColor: new THREE.Color(atmosphere.particleColor),
    particleOpacity: atmosphere.particleOpacity,
    rimColor: new THREE.Color(atmosphere.lighting.rim.color),
    rimIntensity: atmosphere.lighting.rim.intensity,
    rimOffset: new THREE.Vector3(...atmosphere.lighting.rim.offset),
  }
}

export function transitionAtmosphereRuntime(
  runtime: AtmosphereRuntimeState,
  atmosphere: AtmosphereDefinition,
  center: Vector3Tuple,
  deltaSeconds: number,
  preferences: AtmospherePreferences,
) {
  const delta = Math.min(Math.max(deltaSeconds, 0), 0.1)
  const chapterFactor = dampFactor(chapterTransitionRate, delta)
  const preferenceFactor = dampFactor(preferenceTransitionRate, delta)

  runtime.background.lerp(new THREE.Color(atmosphere.palette[0]), chapterFactor)
  runtime.cloudBase.lerp(new THREE.Color(atmosphere.palette[0]), chapterFactor)
  runtime.cloudMid.lerp(new THREE.Color(atmosphere.palette[1]), chapterFactor)
  runtime.cloudAccent.lerp(new THREE.Color(atmosphere.palette[2]), chapterFactor)
  runtime.fogColor.lerp(new THREE.Color(atmosphere.fogColor), chapterFactor)
  runtime.keyColor.lerp(new THREE.Color(atmosphere.lighting.key.color), chapterFactor)
  runtime.rimColor.lerp(new THREE.Color(atmosphere.lighting.rim.color), chapterFactor)
  runtime.fillColor.lerp(new THREE.Color(atmosphere.lighting.fill.color), chapterFactor)
  runtime.particleColor.lerp(new THREE.Color(atmosphere.particleColor), chapterFactor)
  runtime.center.lerp(new THREE.Vector3(...center), chapterFactor)
  runtime.keyOffset.lerp(new THREE.Vector3(...atmosphere.lighting.key.offset), chapterFactor)
  runtime.rimOffset.lerp(new THREE.Vector3(...atmosphere.lighting.rim.offset), chapterFactor)
  runtime.fillOffset.lerp(new THREE.Vector3(...atmosphere.lighting.fill.offset), chapterFactor)

  runtime.ambientIntensity = dampNumber(
    runtime.ambientIntensity,
    atmosphere.lighting.ambientIntensity,
    chapterFactor,
  )
  runtime.bloomIntensity = dampNumber(
    runtime.bloomIntensity,
    atmosphere.bloom.intensity,
    chapterFactor,
  )
  runtime.bloomThreshold = dampNumber(
    runtime.bloomThreshold,
    atmosphere.bloom.threshold,
    chapterFactor,
  )
  runtime.cloudDensity = dampNumber(runtime.cloudDensity, atmosphere.cloudDensity, chapterFactor)
  runtime.exposure = dampNumber(runtime.exposure, atmosphere.exposure, chapterFactor)
  runtime.fillIntensity = dampNumber(
    runtime.fillIntensity,
    atmosphere.lighting.fill.intensity,
    chapterFactor,
  )
  runtime.fogFar = dampNumber(runtime.fogFar, atmosphere.fog.far, chapterFactor)
  runtime.fogNear = dampNumber(runtime.fogNear, atmosphere.fog.near, chapterFactor)
  runtime.keyIntensity = dampNumber(
    runtime.keyIntensity,
    atmosphere.lighting.key.intensity,
    chapterFactor,
  )
  runtime.particleOpacity = dampNumber(
    runtime.particleOpacity,
    atmosphere.particleOpacity,
    chapterFactor,
  )
  runtime.rimIntensity = dampNumber(
    runtime.rimIntensity,
    atmosphere.lighting.rim.intensity,
    chapterFactor,
  )
  runtime.motionFactor = dampNumber(
    runtime.motionFactor,
    preferences.reduceMotion ? 0 : 1,
    preferenceFactor,
  )
}

function dampFactor(rate: number, delta: number) {
  return 1 - Math.exp(-rate * delta)
}

function dampNumber(current: number, target: number, factor: number) {
  return current + (target - current) * factor
}
