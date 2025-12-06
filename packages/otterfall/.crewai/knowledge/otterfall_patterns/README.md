# Otterfall Code Patterns

## Project Overview

Otterfall is a mobile-first 3D survival game built with:
- **React Three Fiber** for 3D rendering
- **Miniplex ECS** for entity management
- **Zustand** for state management
- **Yuka.js** for AI steering behaviors
- **React Native + Expo** for mobile deployment

## ECS Architecture

### Components (Pure Data)

Components contain only data, no logic:

```typescript
// Example: TimeOfDayComponent
export interface TimeOfDayComponent {
    hour: number;          // 0.0 to 24.0
    phase: TimePhase;      // 'dawn' | 'day' | 'dusk' | 'night'
    sunIntensity: number;
    sunAngle: number;
    ambientLight: number;
    fogDensity: number;
    timeScale: number;
}
```

**Key Patterns:**
- Use TypeScript interfaces
- All properties are primitives or simple types
- No methods or functions
- Export from `src/ecs/components.ts`

### Systems (Pure Logic)

Systems operate on entities with specific components:

```typescript
// Example: TimeSystem pattern
export function updateTimeSystem(world: World<Entity>, deltaTime: number) {
    // Query entities with time component
    const worldEntity = world.with('isWorld', 'time').first;
    if (!worldEntity?.time) return;

    // Update time
    worldEntity.time.hour += deltaTime * worldEntity.time.timeScale;
    
    // Wrap at 24 hours
    if (worldEntity.time.hour >= 24) {
        worldEntity.time.hour -= 24;
    }
    
    // Update phase based on hour
    if (worldEntity.time.hour >= 5 && worldEntity.time.hour < 7) {
        worldEntity.time.phase = 'dawn';
    } else if (worldEntity.time.hour >= 7 && worldEntity.time.hour < 17) {
        worldEntity.time.phase = 'day';
    } else if (worldEntity.time.hour >= 17 && worldEntity.time.hour < 19) {
        worldEntity.time.phase = 'dusk';
    } else {
        worldEntity.time.phase = 'night';
    }
}
```

**Key Patterns:**
- Systems are functions, not classes
- Use `world.with()` to query entities
- Modify component data directly
- Export from `src/ecs/systems/`
- Keep systems focused on one responsibility

### Entity Creation

Entities are created with components:

```typescript
// Example: Create NPC entity
export function createNPC(
    world: World<Entity>,
    speciesId: string,
    position: Vector3,
    type: 'predator' | 'prey'
): Entity {
    const species = type === 'predator' 
        ? getPredatorSpecies(speciesId)
        : getPreySpecies(speciesId);
    
    if (!species) throw new Error(`Unknown species: ${speciesId}`);
    
    return world.createEntity({
        isNPC: true,
        isPredator: type === 'predator',
        isPrey: type === 'prey',
        transform: {
            position: position.clone(),
            rotation: new Quaternion(),
            scale: new Vector3(1, 1, 1)
        },
        species: {
            speciesId,
            displayName: species.displayName,
            type,
            size: species.size,
            state: 'idle'
        },
        combat: {
            health: species.health,
            maxHealth: species.health,
            stamina: type === 'predator' ? species.stamina : 0,
            maxStamina: type === 'predator' ? species.stamina : 0,
            armor: type === 'predator' ? species.armor : 0,
            dodge: type === 'predator' ? species.dodge : 0,
            staminaRegenRate: 10,
            lastDamageTime: 0,
            isStunned: false,
            stunEndTime: 0
        },
        steering: {
            target: null,
            awarenessRadius: type === 'prey' ? species.awarenessRadius : 20,
            wanderAngle: 0,
            wanderTimer: 0
        }
    });
}
```

**Key Patterns:**
- Factory functions create entities
- Initialize all required components
- Use species data for stats
- Clone Vector3/Quaternion to avoid shared references

## Data Definitions

### Species Data

Located in `src/ecs/data/species.ts`:

```typescript
export const PREDATOR_SPECIES: Record<string, PredatorSpecies> = {
    otter: {
        displayName: 'River Otter',
        size: 'medium',
        archetype: 'balanced',
        health: 100,
        stamina: 100,
        armor: 15,
        dodge: 20,
        attacks: ['bite', 'claw', 'tail_whip'],
        nativeBiome: 'marsh',
        meshyPrompt: '...'
    },
    // ... more species
};
```

**Key Patterns:**
- Use `Record<string, Type>` for lookup tables
- Export const objects
- Include all required properties
- Use TypeScript interfaces for type safety

## React Three Fiber Components

### Rendering Pattern

```typescript
// Example: Player rendering component
export function Player() {
    const world = useWorld();
    const player = world.with('isPlayer', 'transform', 'species').first;
    
    if (!player?.transform) return null;
    
    return (
        <group position={player.transform.position}>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
            </mesh>
        </group>
    );
}
```

**Key Patterns:**
- Use `useWorld()` hook to access ECS
- Query entities with `world.with()`
- Return null if entity doesn't exist
- Use R3F declarative syntax
- Position/rotation from transform component

## State Management (Zustand)

### Store Pattern

```typescript
// Example: Game store
interface GameState {
    loaded: boolean;
    player: PlayerState;
    
    // Actions
    setLoaded: (loaded: boolean) => void;
    updatePlayer: (updates: Partial<PlayerState>) => void;
}

export const useGameStore = create<GameState>((set) => ({
    loaded: false,
    player: {
        position: new Vector3(0, 0, 0),
        health: 100,
        stamina: 100
    },
    
    setLoaded: (loaded) => set({ loaded }),
    updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates }
    }))
}));
```

**Key Patterns:**
- Define interface for type safety
- Use `create<Interface>()` for store
- Actions are functions in the store
- Use functional updates for nested state
- Keep stores focused (game, input, etc.)

## File Organization

```
packages/otterfall/src/
├── ecs/
│   ├── components.ts          # All component interfaces
│   ├── world.ts               # Miniplex world setup
│   ├── data/
│   │   ├── species.ts         # Species definitions
│   │   ├── biomes.ts          # Biome definitions
│   │   └── resources.ts       # Resource definitions
│   └── systems/
│       ├── TimeSystem.ts      # Time of day logic
│       ├── WeatherSystem.ts   # Weather logic
│       ├── AISystem.ts        # AI logic
│       └── CollisionSystem.ts # Collision logic
├── components/
│   ├── Player.tsx             # Player rendering
│   ├── NPCs.tsx               # NPC rendering
│   ├── World.tsx              # World rendering
│   └── ui/
│       └── HUD.tsx            # UI overlay
├── stores/
│   └── gameStore.ts           # Zustand state
├── utils/
│   ├── collision.ts           # Collision helpers
│   ├── sdf.ts                 # SDF functions
│   └── save.ts                # Save/load
└── App.tsx                    # Main app component
```

## Common Patterns

### 1. Singleton World Entity

```typescript
// Create world entity for global state
const worldEntity = world.createEntity({
    isWorld: true,
    time: { hour: 8, phase: 'day', ... },
    weather: { current: 'clear', ... },
    biome: { current: 'marsh', ... }
});
```

### 2. Component Queries

```typescript
// Query all NPCs
const npcs = world.with('isNPC', 'transform', 'species');

// Query specific type
const predators = world.with('isPredator', 'transform', 'combat');

// Get first match
const player = world.with('isPlayer').first;
```

### 3. System Updates

```typescript
// In GameSystems.tsx
useFrame((_, delta) => {
    updateTimeSystem(world, delta);
    updateWeatherSystem(world, delta);
    updateAISystem(world, delta);
    updateCollisionSystem(world, delta);
});
```

### 4. Error Handling

```typescript
// Always check for null/undefined
const player = world.with('isPlayer', 'transform').first;
if (!player?.transform) return;

// Validate data
const species = getPredatorSpecies(speciesId);
if (!species) {
    console.error(`Unknown species: ${speciesId}`);
    return;
}
```

## Testing Patterns

### Unit Tests

```typescript
describe('TimeSystem', () => {
    it('should advance time', () => {
        const world = createWorld<Entity>();
        const entity = world.createEntity({
            isWorld: true,
            time: { hour: 8, phase: 'day', timeScale: 1 }
        });
        
        updateTimeSystem(world, 1); // 1 second
        
        expect(entity.time.hour).toBeGreaterThan(8);
    });
});
```

### Property-Based Tests

```typescript
import fc from 'fast-check';

// Feature: otterfall-complete, Property 1: Time Progression Monotonicity
describe('Property: Time Progression Monotonicity', () => {
    it('should always increase hour with positive delta', () => {
        fc.assert(
            fc.property(
                fc.float({ min: 0, max: 24 }), // Initial hour
                fc.float({ min: 0.001, max: 1 }), // Delta time
                (initialHour, delta) => {
                    const world = createWorld<Entity>();
                    const entity = world.createEntity({
                        isWorld: true,
                        time: { hour: initialHour, timeScale: 1 }
                    });
                    
                    updateTimeSystem(world, delta);
                    
                    // Hour should increase (with wrapping)
                    const newHour = entity.time.hour;
                    return newHour !== initialHour;
                }
            ),
            { numRuns: 100 }
        );
    });
});
```

## Mobile-First Considerations

### Touch Input

```typescript
// Use touch events, not mouse
<Canvas
    onPointerDown={handleTouchStart}
    onPointerMove={handleTouchMove}
    onPointerUp={handleTouchEnd}
>
```

### Performance

```typescript
// Use LOD for distant objects
const distance = player.position.distanceTo(npc.position);
const lod = distance < 30 ? 'high' : distance < 60 ? 'medium' : 'low';

// Cull entities beyond view distance
if (distance > 100) return null;

// Use instancing for repeated objects
<Instances limit={1000}>
    {rocks.map(rock => (
        <Instance key={rock.id} position={rock.position} />
    ))}
</Instances>
```

### Safe Areas

```typescript
// Respect mobile safe areas
<div style={{
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)'
}}>
```

## Key Principles

1. **Components are data** - No logic in components
2. **Systems are logic** - No data in systems
3. **Query before use** - Always check entity exists
4. **Clone vectors** - Avoid shared references
5. **Mobile-first** - Touch input, performance, safe areas
6. **Type safety** - Use TypeScript interfaces everywhere
7. **Test properties** - Use property-based testing for universal rules
8. **Follow patterns** - Match existing code structure

