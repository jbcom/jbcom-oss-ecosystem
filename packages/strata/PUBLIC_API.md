# Strata Public API Contract

**This document defines the stable, public API of @jbcom/strata.**

All APIs listed here are guaranteed to follow semantic versioning:
- **Major versions** (1.0.0 → 2.0.0): Breaking changes allowed
- **Minor versions** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch versions** (1.0.0 → 1.0.1): Bug fixes only, backward compatible

## Package Exports

### Main Export (`@jbcom/strata`)

All public APIs are available from the main export:

```ts
import { 
  // Core algorithms
  generateInstanceData,
  createWaterMaterial,
  // Components
  Water,
  Character,
  // Presets
  createFurSystem,
  // Types
  FurOptions,
  CharacterState
} from '@jbcom/strata';
```

### Subpath Exports

For tree-shaking and explicit imports:

- `@jbcom/strata/core` - Pure TypeScript algorithms (no React)
- `@jbcom/strata/components` - React Three Fiber components
- `@jbcom/strata/presets` - Organized game primitives by layer
- `@jbcom/strata/shaders` - GLSL shader code and uniform factories
- `@jbcom/strata/utils` - Utility functions (texture loading, etc.)

## Core API (Pure TypeScript)

### SDF Functions

```ts
// Primitives
sdSphere(p: Vector3, center: Vector3, radius: number): number
sdBox(p: Vector3, center: Vector3, halfExtents: Vector3): number
sdPlane(p: Vector3, normal: Vector3, distance: number): number
sdCapsule(p: Vector3, a: Vector3, b: Vector3, radius: number): number
sdTorus(p: Vector3, center: Vector3, majorRadius: number, minorRadius: number): number
sdCone(p: Vector3, center: Vector3, angle: number, height: number): number
sdRock(p: Vector3, center: Vector3, baseRadius: number): number

// Operations
opUnion(d1: number, d2: number): number
opSubtraction(d1: number, d2: number): number
opIntersection(d1: number, d2: number): number
opSmoothUnion(d1: number, d2: number, k: number): number
opSmoothSubtraction(d1: number, d2: number, k: number): number
opSmoothIntersection(d1: number, d2: number, k: number): number

// Noise
noise3D(x: number, y: number, z: number): number
fbm(x: number, y: number, z: number, octaves?: number): number
warpedFbm(x: number, y: number, z: number, octaves?: number): number

// Utilities
calcNormal(p: Vector3, sdfFunc: (p: Vector3) => number, epsilon?: number): Vector3
getBiomeAt(x: number, z: number, biomes: BiomeData[]): BiomeData
getTerrainHeight(x: number, z: number, biomes: BiomeData[]): number
sdTerrain(p: Vector3, biomes: BiomeData[]): number
sdCaves(p: Vector3): number
```

### Marching Cubes

```ts
marchingCubes(
  sdf: (p: Vector3) => number,
  options: MarchingCubesOptions
): MarchingCubesResult

createGeometryFromMarchingCubes(result: MarchingCubesResult): BufferGeometry

generateTerrainChunk(
  sdf: (p: Vector3) => number,
  chunkPosition: Vector3,
  chunkSize: number,
  resolution: number
): TerrainChunk
```

### Instancing

```ts
generateInstanceData(
  count: number,
  areaSize: number,
  biomes: BiomeData[],
  heightFunction?: (x: number, z: number) => number,
  seed?: number
): InstanceData[]

createInstancedMesh(
  geometry: BufferGeometry,
  material: Material,
  instances: InstanceData[]
): InstancedMesh
```

### Water

```ts
createWaterMaterial(options?: WaterMaterialOptions): ShaderMaterial
createAdvancedWaterMaterial(options?: AdvancedWaterMaterialOptions): ShaderMaterial
createWaterGeometry(size: number, segments?: number): PlaneGeometry
```

### Ray Marching

```ts
createRaymarchingMaterial(options: RaymarchingMaterialOptions): ShaderMaterial
createRaymarchingGeometry(): PlaneGeometry
```

### Sky

```ts
createSkyMaterial(options: SkyMaterialOptions): ShaderMaterial
createSkyGeometry(size?: [number, number]): PlaneGeometry
```

### Volumetrics

```ts
createVolumetricFogMeshMaterial(options?: VolumetricFogMeshMaterialOptions): ShaderMaterial
createUnderwaterOverlayMaterial(options?: UnderwaterOverlayMaterialOptions): ShaderMaterial
```

## Presets API

### Fur

```ts
createFurMaterial(
  layerIndex: number,
  totalLayers: number,
  options?: FurOptions
): ShaderMaterial

createFurSystem(
  geometry: BufferGeometry,
  baseMaterial: Material,
  options?: FurOptions
): Group

updateFurUniforms(furSystem: Group, time: number): void
```

### Characters

```ts
createCharacter(options?: CharacterOptions): {
  root: Group
  joints: CharacterJoints
  state: CharacterState
}

animateCharacter(
  character: { root: Group; joints: CharacterJoints; state: CharacterState },
  time: number,
  deltaTime?: number
): void
```

### Molecular

```ts
createMolecule(
  atoms: AtomData[],
  bonds: BondData[],
  options?: MolecularOptions
): Group

createWaterMolecule(
  position?: Vector3,
  scale?: number
): Group
```

## React Components API

### Water

```tsx
<Water size={number} time?: number />
<AdvancedWater 
  size={number}
  waterColor?: ColorRepresentation
  deepWaterColor?: ColorRepresentation
  foamColor?: ColorRepresentation
  causticIntensity?: number
/>
```

### Instancing

```tsx
<GPUInstancedMesh
  geometry={BufferGeometry}
  material={Material}
  count={number}
  instances={InstanceData[]}
  enableWind?: boolean
  windStrength?: number
  lodDistance?: number
/>

<GrassInstances count={number} areaSize={number} biomes={BiomeData[]} />
<TreeInstances count={number} areaSize={number} biomes={BiomeData[]} />
<RockInstances count={number} areaSize={number} biomes={BiomeData[]} />
```

### Sky

```tsx
<ProceduralSky
  timeOfDay={Partial<TimeOfDayState>}
  weather?: Partial<WeatherState>
  gyroTilt?: Vector2
/>
```

### Volumetrics

```tsx
<VolumetricEffects
  fogEnabled?: boolean
  underwaterEnabled?: boolean
/>

<VolumetricFogMesh
  color?: Color
  density?: number
  height?: number
/>

<UnderwaterOverlay
  waterColor?: Color
  density?: number
  causticStrength?: number
/>
```

### Ray Marching

```tsx
<Raymarching
  sdfFunction={string} // GLSL function string
  maxSteps?: number
  maxDistance?: number
  minDistance?: number
  backgroundColor?: Color
  fogStrength?: number
  fogColor?: Color
/>
```

## Type Definitions

All types are exported and part of the public API:

```ts
// SDF
interface BiomeData {
  type: 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland'
  center: Vector2
  radius: number
}

// Instancing
interface InstanceData {
  position: Vector3
  rotation: Euler
  scale: Vector3
  biome: string
  height: number
  underwater: boolean
}

// Marching Cubes
interface MarchingCubesOptions {
  resolution: number
  bounds: { min: Vector3; max: Vector3 }
  isoLevel?: number
}

interface MarchingCubesResult {
  vertices: Float32Array
  normals: Float32Array
  indices: Uint32Array
}

// Presets
interface FurOptions {
  baseColor?: ColorRepresentation
  tipColor?: ColorRepresentation
  layerCount?: number
  spacing?: number
  windStrength?: number
  gravityDroop?: number
}

interface CharacterOptions {
  skinColor?: ColorRepresentation
  furOptions?: FurOptions
  scale?: number
}

interface CharacterState {
  speed: number
  maxSpeed: number
  rotation: number
  position: Vector3
  velocity: Vector3
}

// ... and more (see full type exports)
```

## Input Validation

All public functions include input validation and throw descriptive errors:

```ts
// Example error messages
"sdSphere: radius must be positive"
"generateInstanceData: count must be positive"
"createWaterMaterial: time must be a finite number"
```

## Performance Guarantees

- **GPU-accelerated**: All rendering uses GPU where possible
- **Mobile-optimized**: Texture compression, LOD, and performance tuning
- **Deterministic**: Seeded random for reproducible results
- **Memory-safe**: Proper disposal of resources (materials, geometries)

## Breaking Changes Policy

Breaking changes will only occur in major versions and will be:
1. Documented in CHANGELOG.md
2. Deprecated for at least one minor version before removal
3. Clearly marked in TypeScript types

## Internal APIs

APIs not listed in this document are **internal** and may change without notice:
- Internal helper functions
- Private class methods
- Implementation details
- Test utilities

## Examples vs Tests

- **Examples** (`examples/`) - Documentation and demos for developers
- **Tests** (`tests/`) - Automated verification of API contract
  - `tests/unit/` - Unit tests for core functions
  - `tests/integration/` - Integration tests for components
  - `tests/e2e/` - End-to-end Playwright tests

Examples are for learning; tests are for verification.
