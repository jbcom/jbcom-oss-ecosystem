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

export interface SpeciesComponent {
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

    // Components
    transform?: TransformComponent;
    movement?: MovementComponent;
    species?: SpeciesComponent;
    steering?: SteeringComponent;
    resource?: ResourceComponent;

    // Global Singletons (usually on isWorld entity)
    time?: TimeOfDayComponent;
    weather?: WeatherComponent;
    biome?: BiomeComponent;
};
