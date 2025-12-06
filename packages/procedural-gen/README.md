# @jbcom/procedural-gen

A unified procedural generation library for `react-three-fiber` bringing together SDF, marching cubes, GPU instancing, and raymarching under one roof.

**Lifted from the Otterfall game engine** - battle-tested procedural rendering code organized into a reusable library.

## Features

### 🎯 Core Algorithms (`@jbcom/procedural-gen/core`)

- **Signed Distance Functions (SDF)**
  - Primitives: sphere, box, plane, capsule, torus, cone
  - Boolean operations: union, subtraction, intersection
  - Smooth blending variants
  - Domain transformations

- **Noise Functions**
  - 3D value noise
  - Fractal Brownian Motion (FBM)
  - Domain warping for organic shapes

- **Marching Cubes**
  - Generate meshes from SDFs
  - Smooth normals
  - Chunked terrain support

### 🎨 Shaders (`@jbcom/procedural-gen/shaders`)

All shaders are fully procedural - no external textures required!

- **Water** - Multi-layered waves, fresnel reflections, procedural caustics, foam
- **Terrain** - Triplanar mapping, biome blending, PBR support, procedural fallback
- **Fur/Shell** - Multi-pass shell rendering, wind animation, gravity droop
- **Volumetrics** - Raymarched fog, underwater effects, atmospheric scattering, dust particles

### 🧩 React Components (`@jbcom/procedural-gen/components`)

Drop-in components for `react-three-fiber`:

- **`<Water>`** / **`<AdvancedWater>`** - Animated water surfaces
- **`<GrassInstances>`** / **`<TreeInstances>`** / **`<RockInstances>`** - GPU-instanced vegetation
- **`<ProceduralSky>`** - Day/night cycle, stars, weather effects
- **`<VolumetricEffects>`** - Fog, underwater overlays

### 🛠 Utilities (`@jbcom/procedural-gen/utils`)

- Texture loading with caching
- PBR texture set management
- Support for common texture providers (AmbientCG, Poly Haven)

## Installation

```bash
npm install @jbcom/procedural-gen
# or
pnpm add @jbcom/procedural-gen
```

### Peer Dependencies

```bash
npm install three @react-three/fiber react
```

## Quick Start

```tsx
import { Canvas } from '@react-three/fiber';
import { 
  Water, 
  GrassInstances, 
  ProceduralSky, 
  VolumetricEffects 
} from '@jbcom/procedural-gen';

function Scene() {
  return (
    <Canvas>
      {/* Background */}
      <ProceduralSky 
        timeOfDay={{ sunIntensity: 0.8, sunAngle: 45 }} 
      />
      
      {/* Midground */}
      <Water position={[0, -0.5, 0]} size={100} />
      <VolumetricEffects enableFog={true} />
      
      {/* Foreground */}
      <GrassInstances 
        count={5000} 
        areaSize={50} 
        heightFunc={(x, z) => Math.sin(x * 0.1) * 0.5} 
      />
    </Canvas>
  );
}
```

## Using SDFs and Marching Cubes

```tsx
import { 
  sdSphere, 
  sdBox, 
  opSmoothUnion, 
  marchingCubes, 
  createGeometryFromMarchingCubes 
} from '@jbcom/procedural-gen/core';
import * as THREE from 'three';

// Define an SDF
function mySDF(p: THREE.Vector3): number {
  const sphere = sdSphere(p, new THREE.Vector3(0, 0, 0), 1);
  const box = sdBox(p, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.5, 0.5, 0.5));
  return opSmoothUnion(sphere, box, 0.3);
}

// Generate mesh
const result = marchingCubes(mySDF, {
  resolution: 32,
  bounds: {
    min: new THREE.Vector3(-2, -2, -2),
    max: new THREE.Vector3(2, 2, 2)
  }
});

const geometry = createGeometryFromMarchingCubes(result);
```

## Using Shaders Directly

```tsx
import { 
  waterVertexShader, 
  waterFragmentShader,
  createWaterUniforms 
} from '@jbcom/procedural-gen/shaders';
import * as THREE from 'three';

const material = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: createWaterUniforms(),
  transparent: true
});
```

## Procedural Textures (Fully PROCGEN)

All shaders include procedural fallbacks that require **zero external textures**:

- **Fur**: Multi-octave noise for strand patterns, procedural color gradients
- **Water**: Hash-based noise for ripples, procedural normal mapping
- **Terrain**: Biome-based procedural coloring, triplanar noise detail
- **Volumetrics**: FBM-based fog density, procedural caustics

This makes the library ideal for prototyping and scenarios where you want fully procedural rendering without texture dependencies.

## Architecture

```
@jbcom/procedural-gen
├── core/           # CPU-side algorithms
│   ├── sdf.ts      # SDF primitives and operations
│   └── marching-cubes.ts
├── shaders/        # GLSL shader code
│   ├── water.ts
│   ├── terrain.ts
│   ├── fur.ts
│   └── volumetrics.ts
├── components/     # React Three Fiber components
│   ├── Water.tsx
│   ├── Instancing.tsx
│   ├── Sky.tsx
│   └── VolumetricEffects.tsx
└── utils/          # Texture loading and helpers
    └── texture-loader.ts
```

## Credits

This library was extracted and generalized from the [Otterfall](https://github.com/jbcom/otterfall) game engine. All code has been battle-tested in a real-world game environment.

## License

MIT
