'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useAtmosphereRuntime } from './AtmosphereContext'

export default function Lighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const keyRef = useRef<THREE.DirectionalLight>(null)
  const rimRef = useRef<THREE.PointLight>(null)
  const fillRef = useRef<THREE.PointLight>(null)
  const runtime = useAtmosphereRuntime()

  useFrame(() => {
    if (!ambientRef.current || !keyRef.current || !rimRef.current || !fillRef.current) {
      return
    }

    ambientRef.current.intensity = runtime.ambientIntensity
    keyRef.current.color.copy(runtime.keyColor)
    keyRef.current.intensity = runtime.keyIntensity
    keyRef.current.position.copy(runtime.center).add(runtime.keyOffset)
    keyRef.current.target.position.copy(runtime.center)
    keyRef.current.target.updateMatrixWorld()

    rimRef.current.color.copy(runtime.rimColor)
    rimRef.current.intensity = runtime.rimIntensity
    rimRef.current.position.copy(runtime.center).add(runtime.rimOffset)

    fillRef.current.color.copy(runtime.fillColor)
    fillRef.current.intensity = runtime.fillIntensity
    fillRef.current.position.copy(runtime.center).add(runtime.fillOffset)
  })

  return (
    <>
      <ambientLight ref={ambientRef} />
      <directionalLight ref={keyRef} />
      <pointLight ref={rimRef} distance={20} />
      <pointLight ref={fillRef} distance={18} />
    </>
  )
}
