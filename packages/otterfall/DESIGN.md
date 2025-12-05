# Otterfall Design Document

## Vision
Otterfall (formerly Rivermarsh) is a mobile-first 3D game where the player controls an otter navigating diverse biomes. The game emphasizes exploration, survival, and interaction with a simulated ecosystem.

## Core Pillars
1.  **Procedural Ecosystem**: A living world with predator/prey dynamics, weather systems, and biome-specific resources.
2.  **Mobile-First Control**: Intuitive touch controls designed for one-handed or two-handed play on mobile devices.
3.  **Visual Immersion**: High-quality rendering using React Three Fiber, custom shaders, and atmospheric effects.

## Architecture
The game is built on a modern web stack (React 19):

-   **Rendering**: React Three Fiber v9 with drei v10 helpers
    -   Custom shaders for fur, terrain, water
    -   `<Detailed>` component for automatic LOD
    -   Post-processing via `@react-three/postprocessing`
    -   **Volumetric Effects**:
        -   World-space volumetric fog with animated noise
        -   Screen-space underwater effects with caustics
        -   Height-based fog density falloff
        -   Light scattering simulation

-   **Terrain**: SDF-based procedural terrain
    -   **Signed Distance Fields (SDF)**: Mathematical representation of geometry
    -   **Marching Cubes**: Mesh extraction from SDF (caves, overhangs)
    -   **Chunk-based loading**: Dynamic LOD and culling
    -   **Biome vertex colors**: Seamless blending between biomes
    -   **TrimeshCollider**: Physics-accurate collision from marching cubes output

-   **Vegetation**: GPU-driven instancing
    -   Wind animation with procedural noise
    -   Camera-distance LOD scaling
    -   Biome-aware density and placement
    -   12,000+ grass instances, 600+ trees, 250+ rocks

-   **Physics**: Rapier via `@react-three/rapier`
    -   WASM-based physics engine (runs on separate thread)
    -   `RigidBody` for player and NPCs
    -   `CapsuleCollider`, `BallCollider`, `CuboidCollider` for collision
    -   `TrimeshCollider` for complex terrain geometry
    -   Automatic broad-phase optimization (BVH)

-   **State**: Zustand for game state management

-   **Logic**: Miniplex ECS (Entity Component System) for entity management

-   **AI**: Yuka library for production-quality AI:
    -   `Vehicle` class for physics-based NPC movement
    -   Steering behaviors: Wander, Seek, Flee, Separation, Arrive
    -   `StateMachine` with Idle, Wander, Flee, Chase, Attack states
    -   `CellSpacePartitioning` for efficient neighbor queries

-   **Audio**: Tone.js for procedural ambient audio

-   **Testing**:
    -   Unit tests with Vitest
    -   E2E gameplay tests with Playwright
    -   Visual regression with Meticulous (session recording + replay)
    -   Stress/soak testing for memory leaks
    -   Input recording/replay for deterministic testing

## Advanced Rendering

### Signed Distance Fields (SDF)
SDFs represent geometry as a function `f(p) → distance`:
- Negative = inside, Positive = outside, Zero = surface
- Primitives: Sphere, Box, Plane, Capsule, Torus, Cone
- Operations: Union, Subtraction, Intersection (smooth variants)
- Used for terrain, caves, rock formations

### Marching Cubes
Algorithm to extract triangle mesh from SDF:
1. Sample SDF on 3D grid
2. For each cube, determine configuration (256 possibilities)
3. Interpolate vertices along edges crossing the surface
4. Output triangles with calculated normals

### Volumetric Rendering
Raymarched atmospheric effects:
- Fog with height-based density and FBM turbulence
- Underwater caustics using overlapping sine waves
- Light scattering for sun rays through fog

## Biomes
The world consists of 7 distinct biomes, each with unique challenges and resources:
1.  **Marsh**: Home biome, waterlogged, reeds.
2.  **Forest**: Dense trees, moderate difficulty.
3.  **Desert**: Hot, resource-scarce.
4.  **Tundra**: Cold, stamina drain.
5.  **Savanna**: Open grasslands, many predators.
6.  **Mountain**: Rocky, climbing required.
7.  **Scrubland**: Dry brush, transitional.

## Species
The ecosystem is populated by various species defined by archetypes:
-   **Player**: River Otter.
-   **Predators** (13 types): Fox, Wolf, Badger, Raccoon, Mongoose, etc.
-   **Prey** (15 types): Rabbit, Squirrel, Mouse, Fish, Frog, etc.

## Controls
-   **Desktop**:
    -   **Movement**: Arrow Keys (Up/Down/Left/Right)
    -   **Jump**: Spacebar
-   **Mobile**:
    -   **Movement**: Virtual Joystick (Nipple.js)
    -   **Jump**: Swipe Up gesture

## Technical Targets
-   **Performance**: 60 FPS on high-end mobile devices (e.g., iPhone 13).
-   **Draw Calls**: < 100 per frame.
-   **Polycount**: < 500k vertices per frame.
