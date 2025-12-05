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

-   **Physics**: Rapier via `@react-three/rapier`
    -   WASM-based physics engine (runs on separate thread)
    -   `RigidBody` for player and NPCs
    -   `CapsuleCollider`, `BallCollider`, `CuboidCollider` for collision
    -   Automatic broad-phase optimization (BVH)

-   **State**: Zustand for game state management

-   **Logic**: Miniplex ECS (Entity Component System) for entity management

-   **AI**: Yuka library for production-quality AI:
    -   `Vehicle` class for physics-based NPC movement
    -   Steering behaviors: Wander, Seek, Flee, Separation, Arrive
    -   `StateMachine` with Idle, Wander, Flee, Chase, Attack states
    -   `CellSpacePartitioning` for efficient neighbor queries

-   **Audio**: Tone.js for procedural ambient audio

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
