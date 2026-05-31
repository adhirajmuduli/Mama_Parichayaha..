import * as THREE from "three"

export const cameraPoses = {
  origins: {
    position: new THREE.Vector3(
      -8,
      0,
      8
    ),

    target: new THREE.Vector3(
      -12,
      0,
      0
    ),
  },

  interests: {
    position: new THREE.Vector3(
      2,
      0,
      8
    ),

    target: new THREE.Vector3(
      0,
      0,
      0
    ),
  },

  research: {
    position: new THREE.Vector3(
      16,
      0,
      8
    ),

    target: new THREE.Vector3(
      12,
      0,
      0
    ),
  },

  computation: {
    position: new THREE.Vector3(
      28,
      0,
      8
    ),

    target: new THREE.Vector3(
      24,
      0,
      0
    ),
  },

  future: {
    position: new THREE.Vector3(
      40,
      0,
      10
    ),

    target: new THREE.Vector3(
      36,
      0,
      0
    ),
  },
}