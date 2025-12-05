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

### Asset Integration Testing

Asset integration tests verify proper loading and optimization:

- Verify texture compression is applied correctly
- Test asset loading times stay under budget (< 3s for critical assets)
- Verify LOD system switches models at correct distances
- Test memory usage with all biome assets loaded (< 500MB)
- Verify audio files are properly compressed (OGG format)
- Test lazy loading of biome-specific assets
- Verify fallback behavior when assets fail to load

## Asset Integration and Enrichment

### Asset Library Overview

The development workstation has access to a comprehensive asset library at `~/assets/` including:
- **AmbientCG**: Complete texture library with PBR materials (albedo, normal, roughness, displacement, AO)
- **Quaternius**: Low-poly 3D models optimized for games
- **Kenney**: Game assets including UI elements, icons, and simple 3D models
- **Sound Effects**: Environmental audio, footsteps, UI sounds, ambient loops

### Strategic Asset Integration Philosophy

**Key Principles:**
1. **Judicious Selection**: Choose assets that provide maximum visual/audio impact for minimal performance cost
2. **Procedural First**: Use assets to enhance procedural generation, not replace it
3. **Mobile Optimization**: All assets must be optimized for mobile devices (compressed textures, low-poly models)
4. **Organized Structure**: Assets organized by purpose under `public/`, not by source pack
5. **Foreground Priority**: Highest quality assets for player-visible elements, simpler assets for distant/background elements

### Texture Integration Strategy

#### AmbientCG PBR Workflow

**Proper PBR Material Setup:**
```typescript
// Use complete PBR texture sets for realistic materials
const terrainMaterial = new MeshStandardMaterial({
    map: textureLoader.load('/textures/terrain/rock_albedo.jpg'),
    normalMap: textureLoader.load('/textures/terrain/rock_normal.jpg'),
    roughnessMap: textureLoader.load('/textures/terrain/rock_roughness.jpg'),
    aoMap: textureLoader.load('/textures/terrain/rock_ao.jpg'),
    displacementMap: textureLoader.load('/textures/terrain/rock_displacement.jpg'),
    displacementScale: 0.1,
});
```

**Texture Categories and Best Use Cases:**

1. **Ground/Terrain Textures** (Foreground - High Priority)
   - **Rock**: Rock035, Rock042 for mountain biome terrain
   - **Ground**: Ground037 (forest floor), Ground054 (desert sand)
   - **Mud**: Mud004 for marsh biome
   - **Snow**: Snow006 for tundra biome
   - **Technique**: Triplanar mapping to avoid UV stretching on procedural terrain
   - **Resolution**: 1024x1024 for mobile (downscaled from 2K source)

2. **Water Surfaces** (Foreground - High Priority)
   - **Water**: Water002 for normal maps and displacement
   - **Technique**: Animated UV scrolling + vertex displacement
   - **Resolution**: 512x512 (tiled)

3. **Vegetation** (Mid-ground - Medium Priority)
   - **Bark**: Bark007, Bark012 for tree trunks
   - **Leaves**: Leaves004 for foliage cards
   - **Grass**: Grass004 for ground cover
   - **Technique**: Alpha-tested cards for grass, instanced meshes
   - **Resolution**: 512x512

4. **Props/Objects** (Foreground - High Priority)
   - **Wood**: Wood049 for logs, branches
   - **Stone**: Stone textures for collectible rocks
   - **Technique**: Standard UV mapping on models
   - **Resolution**: 512x512

5. **Skybox/Background** (Background - Low Priority)
   - **Sky**: Procedural sky shader (no texture needed)
   - **Clouds**: Simple noise-based procedural
   - **Technique**: Shader-based for minimal memory

**Texture Compression:**
```typescript
// Apply compression for mobile
texture.format = THREE.RGBAFormat;
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.generateMipmaps = true;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

### 3D Model Integration Strategy

#### Model Selection Criteria

**Quaternius Models** (Low-poly, mobile-optimized):
- **Player Character**: Otter model from Animal Pack
- **NPCs**: Fox, rabbit, deer from Animal Pack
- **Props**: Rocks, trees, bushes from Nature Pack
- **Collectibles**: Fish, berries from Food Pack

**Organization Structure:**
```
public/
├── models/
│   ├── characters/
│   │   ├── otter.glb          # Player model
│   │   ├── fox.glb            # Predator
│   │   └── rabbit.glb         # Prey
│   ├── props/
│   │   ├── rock_01.glb        # Collision objects
│   │   ├── tree_pine.glb      # Forest biome
│   │   └── cactus.glb         # Desert biome
│   └── collectibles/
│       ├── fish.glb
│       └── berries.glb
├── textures/
│   ├── terrain/
│   │   ├── rock_albedo.jpg
│   │   ├── rock_normal.jpg
│   │   └── ...
│   ├── water/
│   └── vegetation/
└── audio/
    ├── environment/
    ├── footsteps/
    └── sfx/
```

**Model Optimization:**
- Maximum 500 triangles for background props
- Maximum 2000 triangles for player character
- Maximum 1000 triangles for NPCs
- Use LOD system: full model < 30 units, simplified > 30 units

### Audio Asset Integration

**Current Audio Structure** (already implemented):
```
public/audio/
├── footsteps/          # Surface-specific footstep sounds
├── sfx/                # UI and gameplay sounds
└── environment/        # Ambient loops (to be added)
```

**Audio Enrichment Opportunities:**

1. **Biome Ambient Loops** (High Priority)
   - Marsh: Water trickling, frogs, insects
   - Forest: Birds, wind through trees, rustling leaves
   - Desert: Wind, distant animal calls
   - Tundra: Howling wind, ice cracking
   - Mountain: Wind, eagle cries, rock falls

2. **Weather Audio** (Medium Priority)
   - Rain: Light/medium/heavy rain loops
   - Storm: Thunder, heavy rain, wind
   - Snow: Soft wind, snow crunching

3. **NPC Vocalizations** (Medium Priority)
   - Predator: Growls, howls (distance-based)
   - Prey: Chirps, squeaks (alert sounds)

**Audio Optimization:**
- Format: OGG Vorbis (best compression for web)
- Sample Rate: 22050 Hz for ambient, 44100 Hz for important sounds
- Bitrate: 96 kbps for ambient, 128 kbps for SFX
- Spatial Audio: Use Three.js PositionalAudio for 3D sounds

### Asset Loading Strategy

**Lazy Loading for Performance:**
```typescript
// Load critical assets first (player, UI)
const criticalAssets = [
    '/models/characters/otter.glb',
    '/textures/terrain/rock_albedo.jpg',
    '/audio/sfx/jump.ogg',
];

// Load biome-specific assets on demand
const loadBiomeAssets = async (biomeType: string) => {
    const biomeAssets = BIOME_ASSET_MAP[biomeType];
    await Promise.all(biomeAssets.map(loadAsset));
};
```

**Asset Preloading:**
- Preload adjacent biome assets when player approaches boundary
- Cache loaded assets in memory (with memory budget monitoring)
- Unload distant biome assets when memory exceeds 400MB

### Visual Quality Tiers

**High-End Devices** (iPhone 13+, equivalent Android):
- Full PBR textures (1024x1024)
- All texture maps (albedo, normal, roughness, AO, displacement)
- High-poly models for player and nearby NPCs
- Full particle effects

**Mid-Range Devices**:
- Reduced textures (512x512)
- Essential maps only (albedo, normal)
- Medium-poly models
- Reduced particle counts

**Low-End Devices**:
- Minimal textures (256x256)
- Albedo only
- Low-poly models
- Minimal particles

### Asset Integration Checklist

Before adding any asset:
- [ ] Does it provide significant visual/audio improvement?
- [ ] Is it optimized for mobile (file size, poly count)?
- [ ] Is it organized properly under public/?
- [ ] Does it fit the game's art style (low-poly, stylized)?
- [ ] Have you tested it on target hardware?
- [ ] Is there a fallback for lower-end devices?

### Enrichment Priorities

**Phase 1: Core Visual Polish** (Current Phase)
1. Terrain textures for all 7 biomes (AmbientCG)
2. Player character model (Quaternius)
3. Water shader with normal maps
4. Collectible models (fish, berries)

**Phase 2: Environmental Detail**
1. Tree/vegetation models per biome
2. Rock prop variations
3. Ambient audio loops per biome
4. Weather sound effects

**Phase 3: NPC Enhancement**
1. Predator models (fox, wolf)
2. Prey models (rabbit, deer)
3. NPC vocalization sounds
4. Animation improvements

**Phase 4: Polish**
1. UI icons and elements (Kenney)
2. Particle textures
3. Additional ambient details
4. Skybox improvements

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
│   ├── save.ts
│   └── assetLoader.ts   # Asset loading and caching
└── App.tsx

packages/otterfall/public/
├── models/              # 3D models (GLB format)
│   ├── characters/      # Player and NPC models
│   ├── props/           # Environmental objects
│   └── collectibles/    # Resource items
├── textures/            # PBR texture sets
│   ├── terrain/         # Ground, rock, mud, snow
│   ├── water/           # Water normal/displacement
│   └── vegetation/      # Bark, leaves, grass
└── audio/               # Sound effects and music
    ├── environment/     # Biome ambient loops
    ├── footsteps/       # Surface-specific steps
    └── sfx/             # UI and gameplay sounds
```
