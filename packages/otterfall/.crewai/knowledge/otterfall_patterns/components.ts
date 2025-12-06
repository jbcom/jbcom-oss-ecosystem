import { Quaternion, Vector3 } from 'three';

// Component Types
export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

export type WeatherType =
    | 'clear'
    | 'rain'
    | 'fog'
    | 'snow'
    | 'storm'
    | 'sandstorm';

export interface TimeOfDayComponent {
    hour: number;          // 0.0 to 24.0
    phase: TimePhase;
    sunIntensity: number;
    sunAngle: number;
    ambientLight: number;
    fogDensity: number;
    timeScale: number;
}

export interface WeatherComponent {
    current: WeatherType;
    intensity: number;
    transitionProgress: number;
    nextWeather: WeatherType | null;
    windSpeed: number;
    windDirection: [number, number];
    visibilityMod: number;
    startTime: number;
    durationMinutes: number;
}

export type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

export interface BiomeComponent {
    current: BiomeType;
    transitionProgress: number;
}

export type AttackType = 'bite' | 'claw' | 'tail_whip' | 'headbutt' | 'pounce' | 'roll_crush';
export type CombatArchetype = 'tank' | 'agile' | 'balanced';

export interface SpeciesComponent {
    speciesId: string; // e.g., 'otter', 'fox', 'rabbit'
    displayName: string;
    type: 'predator' | 'prey' | 'player';
    size: 'tiny' | 'small' | 'medium' | 'large';
    state: 'idle' | 'walk' | 'run' | 'flee' | 'chase' | 'attack' | 'eat' | 'dead';
}

export interface CombatComponent {
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    armor: number; // Percentage (0-100)
    dodge: number; // Percentage (0-100)
    archetype?: CombatArchetype; // Only for predators
    attacks?: AttackType[]; // Only for predators
    staminaRegenRate: number; // Per second
    lastDamageTime: number;
    isStunned: boolean;
    stunEndTime: number;
}

export interface AttackCooldown {
    [attackType: string]: number; // Timestamp when attack becomes available again
}

export interface DropComponent {
    dropItems: Array<{
        itemId: string;
        minQuantity: number;
        maxQuantity: number;
        healthRestore: number;
        staminaRestore: number;
    }>;
    dropChance: number; // Percentage (0-100)
}

export interface MovementComponent {
    velocity: Vector3;
    acceleration: Vector3;
    maxSpeed: number;
    turnRate: number;
}

export interface TransformComponent {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

export interface SteeringComponent {
    target: number | null; // Entity ID
    awarenessRadius: number;
    wanderAngle: number;
    wanderTimer: number;
}

export interface ResourceComponent {
    type: 'fish' | 'berries' | 'water';
    healthRestore: number;
    staminaRestore: number;
    respawnTime: number;
    collected: boolean;
    collectedAt: number;
}

// The Entity Type
export type Entity = {
    id?: number; // Miniplex auto-generates this, so it's optional when creating entities

    // Tags
    isPlayer?: boolean;
    isWorld?: boolean; // Singleton for global state
    isNPC?: boolean;
    isResource?: boolean;
    isPredator?: boolean;
    isPrey?: boolean;

    // Components
    transform?: TransformComponent;
    movement?: MovementComponent;
    species?: SpeciesComponent;
    combat?: CombatComponent;
    attackCooldowns?: AttackCooldown;
    steering?: SteeringComponent;
    resource?: ResourceComponent;
    drop?: DropComponent;

    // Global Singletons (usually on isWorld entity)
    time?: TimeOfDayComponent;
    weather?: WeatherComponent;
    biome?: BiomeComponent;
};
