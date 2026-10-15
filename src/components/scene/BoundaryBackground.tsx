'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useAtmosphereRuntime } from './AtmosphereContext'
import type { SceneQualityTier } from '@/lib/sceneRuntime'

interface BoundaryBackgroundProps {
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
uniform vec3 uColorMid;
uniform vec3 uColorAccent;
uniform vec2 uPointer;
uniform float uTime;
varying vec3 vDirection;

void main() {
  vec3 direction = normalize(vDirection);
  float angle = atan(direction.y, direction.x);
  float pulse = 0.5 + 0.5 * sin(uTime * 0.65);
  float rim = smoothstep(0.18, 0.78, length(direction.xy + uPointer * 0.04));
  float sweep = 0.5 + 0.5 * sin(angle * 2.0 - uTime * 0.12);
  vec3 glow = mix(uColorMid, uColorAccent, sweep);
  gl_FragColor = vec4(glow * rim * (0.16 + pulse * 0.22), 1.0);
}
`

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

export default function BoundaryBackground({ tier }: BoundaryBackgroundProps) {
  const runtime = useAtmosphereRuntime()
  const meshRef = useRef<THREE.Mesh>(null)
  const pointerTarget = useFinePointerTarget()
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const uniforms = useMemo(
    () => ({
      uColorAccent: { value: runtime.cloudAccent.clone() },
      uColorMid: { value: runtime.cloudMid.clone() },
      uPointer: { value: pointer },
      uTime: { value: 0 },
    }),
    [pointer, runtime],
  )

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return
    }

    meshRef.current.position.copy(state.camera.position)
    pointer.lerp(pointerTarget.current, 1 - Math.exp(-1.8 * delta))
    uniforms.uColorMid.value.copy(runtime.cloudMid)
    uniforms.uColorAccent.value.copy(runtime.cloudAccent)
    uniforms.uTime.value += Math.min(delta, 0.1) * runtime.motionFactor
  })

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-100} scale={90}>
      <sphereGeometry args={[1, tier === 'low' ? 16 : 32, tier === 'low' ? 12 : 24]} />
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
