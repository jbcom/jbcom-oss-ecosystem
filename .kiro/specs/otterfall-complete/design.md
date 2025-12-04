# Design Document: Otterfall Complete Implementation

## Overview

Otterfall is a mobile-first 3D exploration game built with React Three Fiber, Zustand state management, and Miniplex ECS architecture. The design leverages procedural generation, shader-based rendering, and AI steering behaviors to create an immersive ecosystem simulation. The current baseline provides player movement, collision detection, and basic rendering. This design extends the baseline to implement the complete game vision including dynamic weather, time-of-day cycles, NPC behaviors, resource collection, and performance optimization.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  R3F Canvas  │  │  HUD/Overlay │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │              Game Systems Layer                     │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │   Time   │ │ Weather  │ │  Biome   │           │     │
│  │  │  System  │ │  System  │ │  System  │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘           │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │    AI    │ │Collision │ │ Resource │           │     │
│  │  │  System  │ │  System  │ │  System  │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘           │     │
│  └─────────────────────────┬──────────────────────────┘     │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │              ECS Layer (Miniplex)                   │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │ Entities │ │Components│ │  World   │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘           │     │
│  └─────────────────────────┬──────────────────────────┘     │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │           State Management (Zustand)                │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │     │
│  │  │  Player  │ │  Input   │ │  Rocks   │           │     │
│  │  │  State   │ │  State   │ │  State   │           │     │
│  │  └──────────┘ └──────────┘ └──────────┘           │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input → State**: User input (keyboard/touch) updates Zustand input state
2. **State → ECS**: Game systems read Zustand state and update ECS entities
3. **ECS → Systems**: Systems process entities each frame via Miniplex queries
4. **Systems → Rendering**: R3F components read ECS data and render via Three.js
5. **Rendering → Display**: Three.js renders to WebGL canvas

## Components and Interfaces

### ECS Components

```typescript
// Core Components
interface TransformComponent {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

interface MovementComponent {
    velocity: Vector3;
    acceleration: Vector3;
    maxSpeed: number;
    turnRate: number;
}

interface SpeciesComponent {
    id: string;
    name: string;
    type: 'predator' | 'prey' | 'player';
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    speed: number;
    state: 'idle' | 'walk' | 'run' | 'flee' | 'chase' | 'attack' | 'dead';
}

// AI Components
interface SteeringComponent {
    behaviors: SteeringBehavior[];
    target: Entity | null;
    awarenessRadius: number;
}

interface SteeringBehavior {
    type: 'seek' | 'flee' | 'wander' | 'avoid' | 'separate';
    weight: number;
}

// Resource Components
interface ResourceComponent {
    type: 'fish' | 'berries' | 'water';
    healthRestore: number;
    staminaRestore: number;
    respawnTime: number;
    collected: boolean;
}

// Collision Components
interface ColliderComponent {
    type: 'sphere' | 'capsule' | 'box';
    radius?: number;
    height?: number;
    dimensions?: Vector3;
}

// Biome Components
interface BiomeComponent {
    type: 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';
    bounds: { min: Vector3; max: Vector3 };
    terrainColor: Color;
    fogColor: Color;
    spawnTables: { predators: SpawnEntry[]; prey: SpawnEntry[] };
}
```

### System Interfaces

```typescript
interface GameSystem {
    update(deltaTime: number, world: World<Entity>): void;
    priority: number; // Execution order
}

interface TimeSystem extends GameSystem {
    advanceTime(deltaTime: number): void;
    updateLighting(): void;
}

interface WeatherSystem extends GameSystem {
    transitionWeather(): void;
    applyWeatherEffects(): void;
}

interface AISystem extends GameSystem {
    updateSteering(entity: Entity): Vector3;
    detectThreats(entity: Entity): Entity[];
    updateState(entity: Entity): void;
}

interface CollisionSystem extends GameSystem {
    checkCollisions(entity: Entity): Collision[];
    resolveCollision(collision: Collision): void;
    calculateSlope(position: Vector3): number;
}
```

## Data Models

### Species Data

Species data is defined in static configuration files and loaded at initialization:

```typescript
// packages/otterfall/src/ecs/data/species.ts
export const PREDATOR_SPECIES = {
    fox: {
        name: 'Red Fox',
        size: 'medium',
        primaryColor: '#c45a2a',
        baseHealth: 30,
        damage: 8,
        walkSpeed: 1.5,
        runSpeed: 4.5,
        personality: 'cunning',
        awarenessRadius: 15,
    },
    // ... more predators
};

export const PREY_SPECIES = {
    rabbit: {
        name: 'Cottontail Rabbit',
        size: 'small',
        primaryColor: '#8a7a6a',
        baseHealth: 10,
        walkSpeed: 1.0,
        runSpeed: 5.5,
        personality: 'skittish',
        awarenessRadius: 12,
    },
    // ... more prey
};
```

### Biome Data

```typescript
// packages/otterfall/src/ecs/data/biomes.ts
export const BIOMES = {
    marsh: {
        terrainColor: new Color(0x2a4a2a),
        fogColor: new Color(0x4a5a5a),
        fogDensity: 0.03,
        waterLevel: 0.2,
        spawnTables: {
            predators: [
                { species: 'fox', weight: 0.3 },
                { species: 'raccoon', weight: 0.5 },
            ],
            prey: [
                { species: 'frog', weight: 0.6 },
                { species: 'fish_bass', weight: 0.4 },
            ],
        },
    },
    // ... more biomes
};
```

### Save Data

```typescript
interface SaveData {
    version: string;
    timestamp: number;
    player: {
        position: [number, number, number];
        health: number;
        stamina: number;
    };
    world: {
        time: number;
        weather: string;
    };
    resources: {
        id: string;
        collected: boolean;
        respawnAt: number;
    }[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Time Progression Monotonicity

*For any* game frame with positive deltaTime, advancing time should increase the hour value, and when hour reaches 24.0, it should wrap to 0.0 while maintaining continuity.

**Validates: Requirements 1.1, 1.2**

### Property 2: Phase Transition Consistency

*For any* hour value, the calculated time phase should match exactly one of the four defined phases (dawn, day, dusk, night) based on the hour ranges.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 3: Weather Transition Completeness

*For any* weather transition, when transitionProgress reaches 1.0, the current weather should equal nextWeather and nextWeather should be null.

**Validates: Requirements 2.1, 2.2**

### Property 4: Visibility Bounds

*For any* weather condition, the calculated visibility modifier should be between 0.0 and 1.0 inclusive.

**Validates: Requirements 2.3, 2.4, 2.7**

### Property 5: Biome Boundary Exclusivity

*For any* position in the world, the position should be contained within exactly one biome's bounds.

**Validates: Requirements 3.1, 3.2**

### Property 6: Species Health Bounds

*For any* entity with a species component, the health value should be between 0 and maxHealth inclusive.

**Validates: Requirements 4.3, 4.6**

### Property 7: State Transition Validity

*For any* NPC entity state transition, the new state should be reachable from the current state according to the state machine definition.

**Validates: Requirements 4.4, 4.5, 4.6**

### Property 8: Steering Force Magnitude

*For any* entity with steering behaviors, the combined steering force magnitude should not exceed the entity's maxSpeed.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 9: Stamina Conservation

*For any* player state update, if the player is not running, stamina should increase or remain constant, never decrease.

**Validates: Requirements 6.2, 6.3**

### Property 10: Resource Collection Idempotence

*For any* resource entity, collecting it multiple times before respawn should only apply the health/stamina restoration once.

**Validates: Requirements 7.3, 7.4, 7.5, 7.6**

### Property 11: Collision Prevention

*For any* player position update, if a collision is detected with a solid object, the final position should not penetrate the object's collision bounds.

**Validates: Requirements 8.1, 8.4**

### Property 12: Slope Walkability

*For any* terrain point, if the slope angle is less than 30 degrees, the player should be able to walk onto it without jumping.

**Validates: Requirements 8.2, 8.3**

### Property 13: Particle Count Bounds

*For any* weather particle system, the active particle count should not exceed the defined maximum for that weather type.

**Validates: Requirements 9.3, 9.4**

### Property 14: Audio Sync

*For any* footstep sound event, the time between events should match the player's animation cycle period.

**Validates: Requirements 10.1**

### Property 15: HUD Value Accuracy

*For any* frame, the health and stamina values displayed in the HUD should exactly match the player entity's current health and stamina values.

**Validates: Requirements 11.1, 11.2**

### Property 16: Frame Rate Target

*For any* 60-frame window, at least 90% of frames should complete within 16.67ms on target hardware.

**Validates: Requirements 12.1**

### Property 17: Save Data Round Trip

*For any* valid game state, serializing to save data and then deserializing should produce an equivalent game state.

**Validates: Requirements 13.1, 13.2**

### Property 18: Touch Input Responsiveness

*For any* touch event, the input system should update the movement direction within one frame (16.67ms).

**Validates: Requirements 14.1, 14.2**

## Error Handling

### Input Validation

- All user input (touch, keyboard) is validated before updating state
- Invalid input values are clamped to valid ranges
- Malformed touch events are ignored with console warning

### ECS Safety

- Entity queries return empty arrays if no matches found
- Component access checks for existence before reading
- System updates wrapped in try-catch with error logging

### Resource Loading

- Missing species data falls back to default values
- Failed texture loads use solid color fallback
- Audio load failures are logged but don't block gameplay

### Save System

- Corrupted save data triggers new game initialization
- Save writes are debounced to prevent excessive I/O
- localStorage quota exceeded triggers warning and disables saves

### Performance Degradation

- Frame time exceeding 20ms triggers quality reduction
- Particle counts reduced by 50% if FPS drops below 45
- LOD system automatically adjusts based on frame budget

## Testing Strategy

### Unit Testing

Unit tests verify specific examples and edge cases:

- Time phase calculation for boundary hours (4.9, 5.0, 5.1)
- Weather transition at 0%, 50%, 100% progress
- Collision detection for overlapping and non-overlapping entities
- Stamina calculation when running vs idle
- Save data serialization for various game states

### Property-Based Testing

Property-based tests verify universal properties using **fast-check** library:

- Each property test runs minimum 100 iterations
- Tests generate random valid inputs within constraints
- Each test is tagged with the property number from this design document
- Format: `// Feature: otterfall-complete, Property N: <property text>`

### Integration Testing

Integration tests verify system interactions:

- Time system updates lighting when phase changes
- Weather system affects player movement speed
- AI system responds to player proximity
- Collision system prevents terrain penetration
- Resource collection updates player stats and HUD

### Performance Testing

Performance tests verify frame rate targets:

- Measure frame time over 1000 frames
- Verify 90% of frames complete within 16.67ms
- Test with maximum entity counts (50 NPCs, 1000 particles)
- Profile memory usage over 5-minute gameplay session

## Implementation Notes

### Rendering Optimization

- Use instanced meshes for grass (8000 instances), rocks (150 instances), trees (variable by biome)
- Implement frustum culling for entities beyond camera view
- Apply LOD system: full detail < 30 units, medium detail 30-60 units, low detail 60-100 units, culled > 100 units
- Use texture atlases to reduce draw calls
- Batch particle systems by weather type

### AI Performance

- Update AI steering at 20Hz instead of 60Hz (every 3rd frame)
- Use spatial partitioning (grid) for proximity queries
- Limit awareness checks to entities within 2x awareness radius
- Cache steering calculations for 3 frames

### Mobile Optimization

- Reduce shadow map resolution to 1024x1024 on mobile
- Disable post-processing effects on devices with < 4GB RAM
- Use simplified shaders (no fur shells) on low-end devices
- Implement adaptive quality based on sustained FPS

### State Management

- Use Zustand for reactive UI state (health, stamina, HUD)
- Use ECS for game logic state (entities, components)
- Minimize state duplication between Zustand and ECS
- Update Zustand from ECS only when UI needs to react

### Code Organization

```
packages/otterfall/src/
├── components/          # R3F rendering components
│   ├── Player.tsx
│   ├── NPC.tsx
│   ├── World.tsx
│   ├── Water.tsx
│   ├── Fireflies.tsx
│   └── ui/
│       ├── HUD.tsx
│       └── Loader.tsx
├── ecs/                 # Entity Component System
│   ├── world.ts
│   ├── components.ts
│   ├── systems/
│   │   ├── TimeSystem.ts
│   │   ├── WeatherSystem.ts
│   │   ├── AISystem.ts
│   │   ├── CollisionSystem.ts
│   │   └── ResourceSystem.ts
│   └── data/
│       ├── species.ts
│       ├── biomes.ts
│       └── resources.ts
├── systems/             # Game logic systems
│   ├── GameSystems.tsx
│   └── input.tsx
├── stores/              # Zustand state
│   └── gameStore.ts
├── shaders/             # GLSL shaders
│   ├── fur.ts
│   ├── terrain.ts
│   ├── water.ts
│   └── particles.ts
├── utils/               # Utility functions
│   ├── collision.ts
│   ├── steering.ts
│   └── save.ts
└── App.tsx
```
