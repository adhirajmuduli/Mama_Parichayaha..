'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useAtmosphereRuntime } from './AtmosphereContext'
import type { SceneQualityTier } from '@/lib/sceneRuntime'

interface NebulaBackgroundProps {
  tier: Exclude<SceneQualityTier, 'static'>
}

const vertexShader = /* glsl */ `
varying vec3 vDirection;

void main() {
  vDirection = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uColorBase;
uniform vec3 uColorMid;
uniform vec3 uColorAccent;
uniform float uDensity;
uniform float uMotion;
uniform int uOctaves;
uniform vec2 uPointer;
uniform float uTime;

varying vec3 vDirection;

float hash(vec3 point) {
  point = fract(point * 0.3183099 + vec3(0.1, 0.7, 0.3));
  point *= 17.0;
  return fract(point.x * point.y * point.z * (point.x + point.y + point.z));
}

float valueNoise(vec3 point) {
  vec3 cell = floor(point);
  vec3 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);

  float n000 = hash(cell + vec3(0.0, 0.0, 0.0));
  float n100 = hash(cell + vec3(1.0, 0.0, 0.0));
  float n010 = hash(cell + vec3(0.0, 1.0, 0.0));
  float n110 = hash(cell + vec3(1.0, 1.0, 0.0));
  float n001 = hash(cell + vec3(0.0, 0.0, 1.0));
  float n101 = hash(cell + vec3(1.0, 0.0, 1.0));
  float n011 = hash(cell + vec3(0.0, 1.0, 1.0));
  float n111 = hash(cell + vec3(1.0, 1.0, 1.0));

  float x00 = mix(n000, n100, local.x);
  float x10 = mix(n010, n110, local.x);
  float x01 = mix(n001, n101, local.x);
  float x11 = mix(n011, n111, local.x);
  float y0 = mix(x00, x10, local.y);
  float y1 = mix(x01, x11, local.y);

  return mix(y0, y1, local.z);
}

float fbm(vec3 point) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int octave = 0; octave < 4; octave++) {
    if (octave >= uOctaves) {
      break;
    }

    value += amplitude * valueNoise(point * frequency);
    frequency *= 2.03;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  float time = uTime * uMotion;
  vec3 direction = normalize(vDirection);
  vec3 point = direction * 2.2 + vec3(uPointer * 0.08, 0.0);
  vec3 warp = vec3(
    fbm(point + vec3(0.0, time * 0.025, 0.0)),
    fbm(point.yzx + vec3(time * 0.018, 0.0, 0.0)),
    fbm(point.zxy + vec3(0.0, 0.0, time * 0.021))
  );
  float cloud = fbm(point * 1.45 + (warp - 0.5) * 1.35 + time * 0.012);
  float filament = fbm(point * 3.1 + warp * 0.8 - time * 0.01);
  float density = smoothstep(0.22, 0.9, cloud * uDensity);
  float accent = smoothstep(0.58, 0.92, filament) * density;
  float horizon = smoothstep(-0.7, 0.55, direction.y);

  vec3 color = mix(uColorBase, uColorMid, density * 0.82);
  color = mix(color, uColorAccent, accent * 0.48);
  color *= mix(0.54, 1.0, horizon);

  gl_FragColor = vec4(color, 1.0);
}
`

function getOctaveCount(tier: Exclude<SceneQualityTier, 'static'>) {
  if (tier === 'low') {
    return 2
  }

  return tier === 'medium' ? 3 : 4
}

function useFinePointerTarget() {
  const target = useRef(new THREE.Vector2())

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

    const onPointerMove = (event: PointerEvent) => {
      if (!mediaQuery.matches) {
        return
      }

      target.current.set(
        event.clientX / window.innerWidth - 0.5,
        event.clientY / window.innerHeight - 0.5,
      )
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  return target
}

export default function NebulaBackground({ tier }: NebulaBackgroundProps) {
  const runtime = useAtmosphereRuntime()
  const meshRef = useRef<THREE.Mesh>(null)
  const pointerTarget = useFinePointerTarget()
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const uniforms = useMemo(
    () => ({
      uColorAccent: { value: runtime.cloudAccent.clone() },
      uColorBase: { value: runtime.cloudBase.clone() },
      uColorMid: { value: runtime.cloudMid.clone() },
      uDensity: { value: runtime.cloudDensity },
      uMotion: { value: runtime.motionFactor },
      uOctaves: { value: getOctaveCount(tier) },
      uPointer: { value: pointer },
      uTime: { value: 0 },
    }),
    [pointer, runtime, tier],
  )

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return
    }

    meshRef.current.position.copy(state.camera.position)
    pointer.lerp(pointerTarget.current, 1 - Math.exp(-1.8 * delta))
    uniforms.uColorBase.value.copy(runtime.cloudBase)
    uniforms.uColorMid.value.copy(runtime.cloudMid)
    uniforms.uColorAccent.value.copy(runtime.cloudAccent)
    uniforms.uDensity.value = runtime.cloudDensity
    uniforms.uMotion.value = runtime.motionFactor
    uniforms.uTime.value += delta
  })

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-100} scale={90}>
      <sphereGeometry args={[1, 32, 24]} />
      <shaderMaterial
        depthTest={false}
        depthWrite={false}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  )
}
