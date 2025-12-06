# ECS Component Patterns - Rivermarsh Game

This document contains the actual working ECS component patterns used in our game.
Use these patterns when generating new ECS components.

## Core Principles

1. **Components are pure data** - No methods, only interfaces
2. **Use TypeScript interfaces** - Properly typed with explicit types
3. **Import Vector3 from THREE** - For 3D positions/rotations
4. **Follow naming conventions** - `FooComponent` for component types

## Base Components (src/ecs/components.ts)

```typescript
import { Vector3 } from 'three';

// Core components for all entities
export interface Transform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface Physical {
  mass: number;
  velocity: Vector3;
  acceleration: Vector3;
  drag: number;
}

export interface Health {
  current: number;
  max: number;
  regeneration: number;
}

// AI and behavior components
export interface AIControl {
  state: 'idle' | 'wander' | 'chase' | 'flee' | 'attack';
  target?: string; // Entity ID
  detectionRange: number;
  seekWeight: number;
  fleeWeight: number;
}

export interface Species {
  id: string;
  type: 'predator' | 'prey';
  displayName: string;
  maxSpeed: number;
  turnRate: number;
  size: number;
}

// Visual components
export interface Visual {
  modelPath: string;
  animations: string[];
  currentAnimation?: string;
  color?: string;
}

// Interaction components
export interface Interactable {
  type: 'pickup' | 'talk' | 'examine';
  prompt: string;
  onInteract: () => void;
}

export interface Inventory {
  items: string[];
  maxItems: number;
}
```

## World Definition (src/ecs/world.ts)

```typescript
import { World } from 'miniplex';
import type { Transform, Physical, Health, AIControl, Species, Visual, Interactable, Inventory } from './components';

// Define the Entity type with all available components
export type Entity = Partial<{
  id: string;
  transform: Transform;
  physical: Physical;
  health: Health;
  aiControl: AIControl;
  species: Species;
  visual: Visual;
  interactable: Interactable;
  inventory: Inventory;
}>;

// Create and export the main world instance
export const world = new World<Entity>();

// Type guard helpers
export const hasPhysics = (e: Entity): e is Entity & Required<Pick<Entity, 'transform' | 'physical'>> => 
  !!e.transform && !!e.physical;

export const hasAI = (e: Entity): e is Entity & Required<Pick<Entity, 'transform' | 'species' | 'aiControl'>> =>
  !!e.transform && !!e.species && !!e.aiControl;
```

## BiomeComponent Pattern (src/ecs/data/BiomeComponent.ts)

```typescript
export type BiomeType = 
  | 'marsh'      // River otters, mink - waterlogged, reeds, cattails
  | 'forest'     // Fox, badger, raccoon - dense trees, undergrowth
  | 'desert'     // Meerkat, honey badger - sand, cacti, sparse vegetation
  | 'tundra'     // Arctic fox (variant) - snow, ice, moss
  | 'savanna'    // Mongoose, pangolin - grasslands, scattered trees
  | 'mountain'   // Red panda - rocky terrain, bamboo, steep slopes
  | 'scrubland'; // Wombat, Tasmanian devil - dry brush, burrows

export interface BiomeComponent {
  type: BiomeType;
  
  // Environmental properties
  temperature: number;      // -40 to 50°C
  moisture: number;         // 0.0 to 1.0 (dry to wet)
  terrainRoughness: number; // 0.0 to 1.0 (flat to mountainous)
  elevation: number;        // meters above sea level
  
  // Gameplay modifiers
  staminaDrainMod: number;  // 1.0 = normal, 1.5 = desert drains 50% faster
  movementSpeedMod: number; // 0.7 = snow slows you, 1.2 = downhill boost
  visibility: number;       // 0.5 = foggy/dense forest, 1.0 = clear
  stealthBonus: number;     // Forest gives +0.3 stealth, open savanna -0.2
  
  // Spawning rules
  preySpawnRate: number;       // 0.0 to 1.0
  stockSpawnRate: number;      // Resources like berries, fish
  predatorPatrolChance: number; // Hostile NPCs
  
  // Resource spawning
  resources: string[];      // ['cattails', 'water_lily', 'reeds', 'berries']
  
  // Procedural rendering hints
  groundCover: string[];    // ['reeds', 'cattails', 'moss', 'mud']
  plantTypes: string[];     // ['willow', 'cypress']
  colorPalette: {
    primary: string;
    secondary: string;
    foliage: string;
  };
}

// Biome archetypes - starting templates
export const BIOME_ARCHETYPES: Record<BiomeType, Omit<BiomeComponent, 'type'>> = {
  marsh: {
    temperature: 15,
    moisture: 0.9,
    terrainRoughness: 0.2,
    elevation: 5,
    staminaDrainMod: 1.1,
    movementSpeedMod: 0.85,
    visibility: 0.7,
    stealthBonus: 0.2,
    preySpawnRate: 0.7,
    stockSpawnRate: 0.8,
    predatorPatrolChance: 0.3,
    resources: ['cattails', 'water_lily', 'reeds', 'moss'],
    groundCover: ['mud', 'shallow_water'],
    plantTypes: ['willow', 'cypress'],
    colorPalette: {
      primary: '#4a5f4d',
      secondary: '#6b8e6f',
      foliage: '#7fa87f'
    }
  },
  // ... other biomes follow same pattern
};
```

## CombatComponent Pattern (src/ecs/data/CombatComponent.ts)

```typescript
export type AttackType = 
  | 'bite'        // Close range, high damage
  | 'claw_swipe'  // Medium range, fast
  | 'tail_whip'   // Long range, knockback
  | 'headbutt'    // Close range, stun
  | 'pounce'      // Leap attack
  | 'roll_crush'; // Pangolin special

export interface Attack {
  type: AttackType;
  damage: number;
  range: number;
  staminaCost: number;
  cooldown: number;
  knockback: number;
  stunDuration: number;
  animationId: number;
}

export interface CombatComponent {
  attacks: Attack[];
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  staminaRegen: number;
  armor: number;
  dodgeChance: number;
  isInCombat: boolean;
  lastAttackTime: number;
  currentTarget: string | null;
  damageBonus: number;
  armorBonus: number;
  staminaCostReduction: number;
}

// Presets for different archetypes
export const COMBAT_STAT_PRESETS = {
  tank: {
    maxHealth: 150,
    maxStamina: 80,
    staminaRegen: 8,
    armor: 0.3,
    dodgeChance: 0.1
  },
  agile: {
    maxHealth: 80,
    maxStamina: 120,
    staminaRegen: 15,
    armor: 0.05,
    dodgeChance: 0.35
  },
  balanced: {
    maxHealth: 100,
    maxStamina: 100,
    staminaRegen: 10,
    armor: 0.15,
    dodgeChance: 0.2
  }
};
```

## Key Patterns

1. **Type unions for categories** - Use `type Foo = 'a' | 'b' | 'c'` for fixed categories
2. **Numeric modifiers as multipliers** - 1.0 = normal, >1.0 = increase, <1.0 = decrease
3. **Presets/Archetypes** - Define common configurations as const objects
4. **Gameplay-relevant comments** - Document what values mean in game terms
5. **Procedural hints** - Include data that helps rendering without hardcoding visuals
