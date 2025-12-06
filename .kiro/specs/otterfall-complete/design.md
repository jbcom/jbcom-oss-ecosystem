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

**Validates: Requirements 21.1, 21.2**

### Property 19: Species Data Completeness

*For any* predator species loaded, all required properties (health, stamina, armor, dodge, attacks, native biome) should be defined and non-null.

**Validates: Requirements 1.1, 1.2**

### Property 20: Prey Drop Probability

*For any* prey death event, the probability of dropping items should match the species-defined drop chance, and drop quantities should be within the specified range.

**Validates: Requirements 2.5, 14.1, 14.2, 14.3**

### Property 21: Combat Damage Calculation

*For any* attack that connects, the final damage should equal base damage minus armor percentage, with variance of ±10%.

**Validates: Requirements 3.4, 4.6, 5.8**

### Property 22: Attack Cooldown Enforcement

*For any* attack with active cooldown, attempting to use that attack should be prevented until cooldown expires.

**Validates: Requirements 3.2, 3.7, 5.1-5.6**

### Property 23: Stamina Regeneration Rate

*For any* species archetype, stamina regeneration should match the defined rate: tank 8/sec, agile 15/sec, balanced 10/sec.

**Validates: Requirements 4.4, 13.3**

### Property 24: AI State Machine Validity

*For any* NPC state transition, the transition should only occur if it's defined in the state machine graph for that entity type.

**Validates: Requirements 6.7, 7.1-7.7**

### Property 25: Yuka Vehicle Synchronization

*For any* NPC with Yuka vehicle, the ECS Transform position should match the Yuka Vehicle position within epsilon 0.01 units.

**Validates: Requirements 6.1, 6.7**

### Property 26: Biome Spawn Table Weights

*For any* biome spawn event, the probability of spawning each species should match the weighted percentages in the spawn table.

**Validates: Requirements 10.1, 10.2**

### Property 27: Population Target Enforcement

*For any* biome, when population exceeds 150% of target, no new entities of that type should spawn.

**Validates: Requirements 10.5**

### Property 28: SDF Terrain Continuity

*For any* two adjacent points on terrain, the SDF value difference should be proportional to the distance between points (Lipschitz continuity).

**Validates: Requirements 22.1, 22.8**

### Property 29: Marching Cubes Topology

*For any* cube configuration, the generated triangles should match the lookup table for that configuration index.

**Validates: Requirements 23.2**

### Property 30: Instance Buffer Bounds

*For any* instanced mesh, the number of instances should not exceed the defined maximum (grass: 8000, rocks: 150).

**Validates: Requirements 24.1, 24.2**

### Property 31: LOD Distance Thresholds

*For any* entity, the LOD level should be determined solely by distance: full < 30, medium 30-60, low 60-100, culled > 100.

**Validates: Requirements 27.1-27.4**

### Property 32: Memory Budget Compliance

*For any* frame, total memory usage should not exceed 600MB without triggering asset unloading.

**Validates: Requirements 28.4, 25.6**

### Property 33: Adaptive Quality Monotonicity

*For any* quality reduction, restoring quality should only occur after sustained good performance (60 frames below 14ms).

**Validates: Requirements 25.4**

### Property 34: Entity Pool Reset

*For any* entity retrieved from pool, all component values should be reset to defaults before reuse.

**Validates: Requirements 26.6**

### Property 35: Water Buoyancy Force

*For any* entity in water, buoyancy force should be proportional to submersion depth.

**Validates: Requirements 31.2**

### Property 36: Ecosystem Population Balance

*For any* biome, when prey population drops below 20% of target, spawn rate should increase by 50%.

**Validates: Requirements 32.1**

### Property 37: Prey Flee Radius

*For any* prey entity, flee behavior should activate when predator distance is less than flee radius (8 units).

**Validates: Requirements 33.2**

### Property 38: Predator Pursue Behavior

*For any* predator in chase state, movement should use Yuka pursue behavior to predict prey trajectory.

**Validates: Requirements 34.2**

### Property 39: Camera Collision Avoidance

*For any* camera position that would intersect terrain, the camera should raycast and adjust position to avoid clipping.

**Validates: Requirements 35.5**

### Property 40: Animation Speed Scaling

*For any* movement animation, playback speed should be proportional to entity velocity.

**Validates: Requirements 36.2, 36.3**

### Property 41: Particle Lifetime Bounds

*For any* particle, lifetime should not exceed the defined maximum for that particle type.

**Validates: Requirements 37.1-37.7**

### Property 42: Minimap Entity Representation

*For any* NPC within minimap radius, it should appear as a colored dot (red: predator, green: prey).

**Validates: Requirements 38.4**

### Property 43: Tutorial Progression

*For any* tutorial step, it should only trigger once per save file and mark completion in save data.

**Validates: Requirements 39.6**

### Property 44: Settings Persistence

*For any* settings change, the new value should be saved to AsyncStorage and applied immediately.

**Validates: Requirements 40.7**

### Property 45: Species Selection Validation

*For any* species selection, the created player entity should have stats matching the selected species archetype.

**Validates: Requirements 41.4**

### Property 46: Achievement Unlock Idempotence

*For any* achievement, unlocking it multiple times should only trigger the notification once and save once.

**Validates: Requirements 42.7**

### Property 47: Biome Transition Smoothness

*For any* biome boundary crossing, terrain color blend should be continuous over the 10-meter transition zone.

**Validates: Requirements 43.1**

### Property 48: Combat Feedback Timing

*For any* attack that connects, damage number should appear within one frame (16.67ms) of impact.

**Validates: Requirements 44.1**

### Property 49: Day/Night Spawn Rate Modifiers

*For any* night phase, predator spawn rate should be 150% of base rate and prey spawn rate should be 70% of base rate.

**Validates: Requirements 45.1, 45.2**

### Property 50: Weather Movement Penalties

*For any* weather condition, movement speed modifier should match the defined penalty: storm 90%, snow 85%, sandstorm with stamina drain.

**Validates: Requirements 46.3, 46.4, 46.5**

### Property 51: Footprint Fade Time

*For any* footprint decal, fade time should match weather conditions: snow 60s, rain 10s, normal 30s.

**Validates: Requirements 47.2, 47.3**

### Property 52: Hunger Penalty Thresholds

*For any* hunger level, penalties should activate at defined thresholds: 50% (stamina regen -30%), 25% (max stamina -20%), 0% (damage over time).

**Validates: Requirements 48.2, 48.3, 48.4**

### Property 53: Crafting Recipe Unlock

*For any* crafting recipe, it should only unlock when the player has collected the required materials at least once.

**Validates: Requirements 49.1, 49.5**

### Property 54: Inventory Stack Limits

*For any* item type, stack count should not exceed the defined maximum: meat 10, materials 50.

**Validates: Requirements 52.7**

### Property 55: ECS System Execution Order

*For any* frame, systems should execute in strict order: Input → AI → Movement → Collision → Combat → Render.

**Validates: Requirements 51.7**

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

## Additional System Designs

### Combat System Design

**Attack System:**
- Each species has archetype-specific attacks defined in species data
- Attack execution checks: stamina >= cost, cooldown == 0, target in range
- Damage calculation: `finalDamage = baseDamage * (1 ± 0.1) * (1 - armorPercent)`
- Cooldown tracking per attack type using timestamps
- Knockback applies physics impulse to target entity
- Stun prevents all entity actions for duration

**Combat Stats:**
- Tank: 150 HP, 80 stamina, 30% armor, 10% dodge, 8/sec regen
- Agile: 80 HP, 120 stamina, 5% armor, 35% dodge, 15/sec regen
- Balanced: 100 HP, 100 stamina, 15% armor, 20% dodge, 10/sec regen

### AI System Design

**Yuka.js Integration:**
- Each NPC has paired Yuka Vehicle synchronized with ECS Transform
- Steering behaviors: Wander (idle), Seek (chase), Flee (escape), Separate (avoid clustering), ObstacleAvoidance
- State machines: Predator (idle, patrol, chase, attack, eat), Prey (idle, graze, alert, flee)
- Update at 20Hz (every 3rd frame) for performance
- Spatial grid for proximity queries (cell size: 20 units)

**Predator AI:**
- Awareness radius: 20 units
- Chase: Use pursue behavior to predict prey movement
- Attack range: 2 units
- Eat state: Stationary for 10s, restore 50 HP
- Hungry (HP < 50%): Prioritize hunting over wandering

**Prey AI:**
- Awareness radius: 15 units (alert), 8 units (flee)
- Flee speed: Species-specific (rabbit 8 m/s, deer 10 m/s, vole 6 m/s)
- Safe distance: 25 units
- Aquatic prey: Flee toward deeper water

### Terrain Generation Design

**SDF Functions:**
- Base terrain: FBM with 3-5 octaves, frequency 0.5, amplitude 1.0
- Mountain: Warped FBM with ridge noise, peaks up to 25 units
- Marsh: Minimal noise (0.5 unit variation), water level 0.2
- Desert: Sine-based noise for sand dunes
- Caves: 3D noise below y=10, threshold 0.15
- Overhangs: Domain warping pushes surfaces outward

**Marching Cubes:**
- Grid resolution: 32-128 based on quality setting
- Chunk size: 64x64x64 units
- Vertex deduplication using position-based key mapping
- Normal calculation: SDF gradient with epsilon 0.001
- Chunk unloading when out of view (> 150 units)

### Water System Design

**Rendering:**
- Gerstner waves: 4 frequencies for realistic motion
- Fresnel effect for reflections/refractions
- Normal mapping from Water002 texture
- Caustics in shallow water (depth < 0.5 units)
- Underwater: Blue fog tint, visibility 20 units

**Physics:**
- Buoyancy force proportional to submersion depth
- Movement speed reduced by 30% in water
- Swim animation when submerged
- Aquatic prey restricted to water volumes via Yuka containment

### Ecosystem System Design

**Population Management:**
- Target populations per biome (marsh: 30 prey/5 predators, forest: 40/6, desert: 20/4)
- Spawn rate adjustments: < 20% target (+50%), > 150% target (stop spawning)
- Predator overpopulation triggers increased prey spawning
- Kill tracking updates population statistics

**Spawn System:**
- Weighted random selection from biome spawn tables
- Minimum distance from player: 20 units
- Raycast to terrain for valid placement
- Aquatic prey only in water volumes (y < waterLevel)

### Camera System Design

**Positioning:**
- Default: 8 units behind, 4 units above player
- Smooth follow: Lerp with damping 0.1
- Orbit on player rotation
- Pinch zoom: 5-15 units range
- Combat zoom: 12 units
- Water: Lower to 2 units above surface

**Collision Avoidance:**
- Raycast from player to camera position
- If terrain hit, move camera forward to avoid clipping
- Smooth transition using lerp

### Animation System Design

**States:**
- Idle: Breathing cycle animation
- Walk/Run: Speed-proportional playback
- Jump: Takeoff → Air → Land phases
- Attack: Type-specific animations (bite, claw, tail)
- Hit: 0.3s reaction animation
- Death: Ragdoll or death animation

**Implementation:**
- Meshy skeletal animations if available
- Fallback to procedural animation
- Animation blending for smooth transitions

### Particle System Design

**Types:**
- Dust: 10/sec when running
- Impact: Blood (flesh) or sparks (armor)
- Collection: Sparkle particles, rise and fade over 1s
- Weather: Rain (500 drops, 15 m/s), Snow (300 flakes, 2 m/s)
- Fireflies: Night only, glow effect, random paths
- Splash: Water entry

**Optimization:**
- Particle pooling for reuse
- Adaptive counts based on performance
- Culling beyond camera frustum

### UI System Design

**HUD Elements:**
- Health bar: Top-left, red fill
- Stamina bar: Below health, yellow fill
- Hunger bar: Below stamina, orange fill
- Time display: Top-right, "8:00 AM - Day"
- Resource prompt: Center, tap-to-collect with icon
- Attack buttons: Bottom-right, circular cooldown timers
- Danger vignette: Red pulse when HP < 30%

**Minimap:**
- Size: 150x150px, bottom-right
- Terrain: Grayscale heightmap
- Player: White arrow showing direction
- NPCs: Red dots (predators), green dots (prey)
- Biomes: Colored regions
- Toggle: Tap to switch zoom (50 unit / 200 unit radius)

**Menus:**
- Pause: Resume, settings, quit
- Settings: Graphics quality, audio volumes, controls
- Species selection: 13 predators with 3D previews, stats, descriptions
- Inventory: 20 slots, item icons, use/drop actions
- Crafting: Recipe list with material requirements

### Tutorial System Design

**Steps:**
1. Welcome + basic controls
2. First movement → Stamina explanation
3. First prey encounter → Hunting mechanics
4. First damage → Health and healing
5. First attack → Attack types and cooldowns

**Implementation:**
- Trigger conditions checked each frame
- Toast notifications with 5s display time
- Completion saved to AsyncStorage
- Replay option in settings

### Settings System Design

**Options:**
- Graphics: Low/Medium/High (affects shadows, particles, LOD)
- Master volume: 0-100%
- Music volume: 0-100%
- SFX volume: 0-100%
- Virtual joystick: On/Off (alternative: tap-to-move)

**Persistence:**
- Save to AsyncStorage on change
- Apply immediately without restart
- Load on app initialization

### Achievements System Design

**Achievements:**
- Novice Hunter: 10 prey hunted
- Master Hunter: 100 prey hunted
- Survivor: 10 in-game days
- Explorer: All 7 biomes visited
- Apex Predator: 5 predators defeated
- Species Master: Complete game with all 13 species

**Implementation:**
- Progress tracking in save data
- Toast notification on unlock
- Completion badges in species selection

### Hunger System Design

**Mechanics:**
- Decrease: 1% per minute
- Penalties:
  - 50%: Stamina regen -30%
  - 25%: Max stamina -20%, warning displayed
  - 0%: 1 damage/sec until eating
- Buffs:
  - > 75%: +10% movement speed, +20% stamina regen
- Restoration: Meat consumption (rabbit 20%, deer 40%)

### Crafting System Design

**Recipes:**
- Simple Trap: 5 sticks + 3 stones → Immobilizes prey for 5s
- Bandage: 10 plant fibers → Restore 30 HP over 10s

**Implementation:**
- Recipe unlock on material collection
- Crafting menu shows unlocked recipes
- Material consumption on craft
- Item added to inventory

### Inventory System Design

**Structure:**
- 20 slots total
- Stack limits: Meat 10, materials 50
- Item types: Consumables, materials, equipment

**Actions:**
- Collect: Add to inventory or stack
- Use: Apply effect, decrease count
- Drop: Spawn entity at player position
- Full inventory: Prevent collection, show message

### Footprint System Design

**Mechanics:**
- Spawn decal every 0.5s when moving
- Fade times: Snow 60s, rain 10s, normal 30s
- Display species type and age on examination
- No footprints in water
- Decal cleanup after fade time

### Biome Transition Design

**Blending:**
- Terrain color: Linear blend over 10 meters
- Ambient sound: Crossfade over 5 seconds
- Fog: Gradual adjustment over 10 meters
- Vegetation: Mix of both biomes in transition zone
- Distance-based weighting for smooth blending

### Combat Feedback Design

**Visual:**
- Damage numbers: Float upward from hit location
- Dodge text: Yellow "DODGE"
- Armor reduction: Gray damage numbers
- Critical hits: Red, 150% size (5% chance)
- Vignette: Red flash on damage

**Haptic:**
- Light impact: Player lands attack
- Medium impact: Player takes damage

**Audio:**
- Impact sounds based on attack type
- Hit reaction sounds

### Day/Night Effects Design

**Spawn Rates:**
- Night: Predators +50%, prey -30%
- Day: Prey +20%
- Dawn/Dusk: Increased prey activity

**Visibility:**
- Day: 100 units
- Night: 50 units

**Behavior:**
- Night predators: More aggressive, reduced flee threshold

### Weather Effects Design

**Gameplay Modifiers:**
- Rain: NPC awareness -20%
- Fog: NPC awareness -40%
- Storm: Player speed -10%
- Snow: Player speed -15%, footprint trails
- Sandstorm: Visibility 20 units, stamina drain 2/sec
- Clear: NPC awareness +10%

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
