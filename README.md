# Adhiraj Muduli — Interactive Biological Sciences Portfolio

A cinematic scientific portfolio built using modern web graphics and immersive UI systems.

This project combines:

* React Three Fiber (R3F)
* Next.js
* Three.js
* Framer Motion
* GLSL-inspired visual systems
* Scroll-driven cinematic choreography

to create an interactive biological-sciences-themed web experience.

---

# Vision

The goal of this project is not merely to create a personal portfolio, but to build an atmospheric computational-biology interface where:

* molecular structures exist within a persistent 3D world,
* scientific models evolve through narrative scrolling,
* interaction design feels cinematic and spatial,
* biological aesthetics merge with modern web graphics.

The site is designed around:

* dark biotech visual language,
* volumetric depth,
* molecular motion systems,
* holographic interaction cues,
* continuous environmental storytelling.

---

# Core Features

## Persistent 3D World

A fixed global WebGL scene remains active throughout scrolling.

The user moves through sections while the molecular environment evolves semantically.

---

## Scroll-Driven Narrative Choreography

Objects reposition and reframe according to page sections.

Examples:

* DNA dominates the hero section,
* bacteriophages emerge during interests,
* proteins become emphasized during projects.

---

## Interactive Biological Models

Supports:

* animated `.glb` / `.gltf` assets,
* static scientific meshes,
* hoverable and rotatable molecular objects,
* future shader-driven scientific rendering.

---

## Cinematic Rendering Pipeline

Includes:

* bloom,
* atmospheric fog,
* floating particle systems,
* dynamic lighting,
* camera drift,
* layered composition.

---

## Premium Interaction Design

Microinteraction systems include:

* magnetic buttons,
* cursor glow field,
* motion-based reveals,
* cinematic easing,
* inertial motion systems.

---

# Tech Stack

## Framework

* Next.js 15
* React 19
* TypeScript

---

## 3D / Rendering

* Three.js
* React Three Fiber
* @react-three/drei
* @react-three/postprocessing

---

## Motion

* Framer Motion

---

## Styling

* Tailwind CSS v4

---

# Project Structure

```bash
src/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── providers.tsx
│
├── components/
│   │
│   ├── scene/
│   │   ├── Experience.tsx
│   │   └── Lighting.tsx
│   │
│   ├── models/
│   │   ├── DNA.tsx
│   │   ├── Phage.tsx
│   │   ├── PhageSystem.tsx
│   │   └── ProteinShowcase.tsx
│   │
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── InterestsSection.tsx
│   │   └── ProjectsSection.tsx
│   │
│   ├── effects/
│   │   ├── Particles.tsx
│   │   └── PostProcessing.tsx
│   │
│   ├── motion/
│   │   ├── CameraRig.tsx
│   │   ├── FadeReveal.tsx
│   │   ├── SceneController.tsx
│   │   ├── SectionLighting.tsx
│   │   └── WorldAtmosphere.tsx
│   │
│   └── ui/
│       ├── BlurCard.tsx
│       ├── CursorGlow.tsx
│       └── MagneticButton.tsx
│
├── hooks/
│   ├── useScrollProgress.ts
│   └── useSectionState.ts
│
└── lib/
```

---

# Installation

## Clone Repository

```bash
git clone <repo-url>
cd <repo-name>
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

Then open:

```bash
http://localhost:3000
```

---

# Model Workflow

## Recommended Export Format

Use:

* `.glb`
* `.gltf`

from:

* Spline
* Blender
* Cinema4D
* Maya
* scientific visualization tools

---

## Recommended Optimization

Before production deployment:

* compress meshes,
* reduce unnecessary geometry,
* optimize texture sizes,
* use Draco compression where applicable.

---

# Current Rendering Philosophy

The visual direction prioritizes:

* restrained cinematic lighting,
* atmospheric depth,
* spatial continuity,
* biological ambience,
* minimal UI clutter,
* scientific elegance.

The rendering approach intentionally avoids:

* oversaturated neon cyberpunk,
* excessive bloom,
* hyper-aggressive particle density,
* game-like visual noise.

---

# Planned Systems

## Material Systems

Future work includes:

* fresnel shaders,
* iridescent protein materials,
* holographic biological surfaces,
* transmission materials,
* scientific edge-lighting systems.

---

## Advanced Interaction

Planned interaction systems:

* reactive particles,
* molecular hover states,
* focus transitions,
* interactive protein inspection,
* semantic camera events.

---

## Scientific Extensions

Potential future integrations:

* AlphaFold structure rendering,
* PDB ingestion,
* molecular trajectory playback,
* protein interaction visualization,
* graph-based biological systems.

---

# Performance Notes

The project architecture is designed around:

* persistent GPU rendering,
* reusable scene systems,
* semantic state choreography,
* batched particles,
* modular scene composition.

Target:

* desktop-first cinematic rendering,
* graceful degradation for mobile.

---

# Author

Adhiraj Muduli
Undergraduate — Biological Sciences

Interests include:

* computational biology,
* molecular systems,
* scientific visualization,
* AI-assisted biological research,
* interactive scientific interfaces.

---

# License

MIT License

This project may be modified and adapted for educational, research, and portfolio purposes.
"# Mama_Parichayaha.."
