/**
 * Biome System Patterns - Rivermarsh/Otterfall
 *
 * Biomes define:
 * - Terrain generation parameters (SDF, noise)
 * - Visual appearance (colors, fog, textures)
 * - Species spawn tables
 * - Environmental effects
 */

import { Color, Vector3 } from 'three';

// ============================================================================
// BIOME TYPE DEFINITIONS
// ============================================================================

export type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

/**
 * Biome configuration data
 */
export interface BiomeConfig {
    displayName: string;
    terrainColor: Color;
    fogColor: Color;
    fogDensity: number;
    waterLevel: number; // y position of water surface (0 = no water)
    vegetationDensity: number; // plants per square meter
    temperatureModifier: number; // affects stamina/weather
    ambientSound: string;
    spawnTables: {
        predators: SpawnEntry[];
        prey: SpawnEntry[];
    };
    terrainParams: TerrainParams;
}

export interface SpawnEntry {
    speciesId: string;
    weight: number; // 0-1, should sum to 1 within category
}

export interface TerrainParams {
    baseHeight: number;
    noiseScale: number;
    noiseOctaves: number;
    noiseAmplitude: number;
    caveThreshold?: number; // For cave generation
    waterVolumes?: { center: Vector3; radius: number }[];
}

// ============================================================================
// BIOME DEFINITIONS
// ============================================================================

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
    marsh: {
        displayName: 'Rivermarsh Wetlands',
        terrainColor: new Color(0x2a4a2a),
        fogColor: new Color(0x4a5a5a),
        fogDensity: 0.03,
        waterLevel: 0.2,
        vegetationDensity: 0.5,
        temperatureModifier: 1.0,
        ambientSound: '/audio/environment/marsh_ambient.ogg',
        spawnTables: {
            predators: [
                { speciesId: 'otter', weight: 0.6 },
                { speciesId: 'raccoon', weight: 0.3 },
                { speciesId: 'fox', weight: 0.1 },
            ],
            prey: [
                { speciesId: 'frog', weight: 0.3 },
                { speciesId: 'fish_bass', weight: 0.25 },
                { speciesId: 'crayfish', weight: 0.2 },
                { speciesId: 'duck', weight: 0.15 },
                { speciesId: 'rabbit', weight: 0.1 },
            ],
        },
        terrainParams: {
            baseHeight: 0,
            noiseScale: 0.02,
            noiseOctaves: 3,
            noiseAmplitude: 0.5, // Minimal variation for flat wetlands
        },
    },

    forest: {
        displayName: 'Whispering Woods',
        terrainColor: new Color(0x1a3a1a),
        fogColor: new Color(0x2a4a3a),
        fogDensity: 0.02,
        waterLevel: 0.0,
        vegetationDensity: 0.8,
        temperatureModifier: 0.9,
        ambientSound: '/audio/environment/forest_ambient.ogg',
        spawnTables: {
            predators: [
                { speciesId: 'fox', weight: 0.4 },
                { speciesId: 'badger', weight: 0.3 },
                { speciesId: 'wolf', weight: 0.2 },
                { speciesId: 'raccoon', weight: 0.1 },
            ],
            prey: [
                { speciesId: 'deer', weight: 0.3 },
                { speciesId: 'rabbit', weight: 0.25 },
                { speciesId: 'squirrel', weight: 0.2 },
                { speciesId: 'grouse', weight: 0.15 },
                { speciesId: 'vole', weight: 0.1 },
            ],
        },
        terrainParams: {
            baseHeight: 2,
            noiseScale: 0.03,
            noiseOctaves: 4,
            noiseAmplitude: 3,
        },
    },

    desert: {
        displayName: 'Sunbaked Dunes',
        terrainColor: new Color(0xc4a55a),
        fogColor: new Color(0xd4b56a),
        fogDensity: 0.01,
        waterLevel: 0.0,
        vegetationDensity: 0.1,
        temperatureModifier: 1.5,
        ambientSound: '/audio/environment/desert_ambient.ogg',
        spawnTables: {
            predators: [
                { speciesId: 'meerkat', weight: 0.5 },
                { speciesId: 'honey_badger', weight: 0.3 },
                { speciesId: 'mongoose', weight: 0.2 },
            ],
            prey: [
                { speciesId: 'vole', weight: 0.35 },
                { speciesId: 'lizard', weight: 0.3 },
                { speciesId: 'beetle', weight: 0.25 },
                { speciesId: 'grouse', weight: 0.1 },
            ],
        },
        terrainParams: {
            baseHeight: 0,
            noiseScale: 0.015,
            noiseOctaves: 2,
            noiseAmplitude: 4,
            // Sine-based dune pattern
        },
    },

    tundra: {
        displayName: 'Frozen Expanse',
        terrainColor: new Color(0xd0e0f0),
        fogColor: new Color(0xc0d0e0),
        fogDensity: 0.025,
        waterLevel: 0.0,
        vegetationDensity: 0.15,
        temperatureModifier: 0.5,
        ambientSound: '/audio/environment/tundra_ambient.ogg',
        spawnTables: {
            predators: [
                { speciesId: 'wolf', weight: 0.6 },
                { speciesId: 'fox', weight: 0.4 },
            ],
            prey: [
                { speciesId: 'rabbit', weight: 0.4 },
                { speciesId: 'vole', weight: 0.3 },
                { speciesId: 'grouse', weight: 0.2 },
                { speciesId: 'deer', weight: 0.1 },
            ],
        },
        terrainParams: {
            baseHeight: 1,
            noiseScale: 0.025,
            noiseOctaves: 3,
            noiseAmplitude: 2,
        },
    },

    savanna: {
        displayName: 'Golden Plains',
        terrainColor: new Color(0xb08a4a),
        fogColor: new Color(0xc09a5a),
        fogDensity: 0.015,
        waterLevel: 0.0,
        vegetationDensity: 0.3,
        temperatureModifier: 1.2,
        ambientSound: '/audio/environment/savanna_ambient.ogg',
        spawnTables: {
            predators: [
                { speciesId: 'mongoose', weight: 0.4 },
                { speciesId: 'pangolin', weight: 0.3 },
                { speciesId: 'meerkat', weight: 0.3 },
            ],
            prey: [
                { speciesId: 'wallaby', weight: 0.3 },
                { speciesId: 'deer', weight: 0.25 },
                { speciesId: 'vole', weight: 0.2 },
                { speciesId: 'lizard', weight: 0.15 },
                { speciesId: 'beetle', weight: 0.1 },
            ],
        },
        terrainParams: {
            baseHeight: 0,
            noiseScale: 0.02,
            noiseOctaves: 3,
            noiseAmplitude: 1.5,
        },
    },

    mountain: {
        displayName: 'Craggy Peaks',
        terrainColor: new Color(0x6a5a5a),
        fogColor: new Color(0x8a7a7a),
        fogDensity: 0.02,
        waterLevel: 0.0,
        vegetationDensity: 0.2,
        temperatureModifier: 0.7,
        ambientSound: '/audio/environment/mountain_ambient.ogg',
        spawnTables: {
            predators: [
                { speciesId: 'red_panda', weight: 0.5 },
                { speciesId: 'wolf', weight: 0.3 },
                { speciesId: 'fox', weight: 0.2 },
            ],
            prey: [
                { speciesId: 'deer', weight: 0.35 },
                { speciesId: 'rabbit', weight: 0.25 },
                { speciesId: 'squirrel', weight: 0.2 },
                { speciesId: 'grouse', weight: 0.15 },
                { speciesId: 'vole', weight: 0.05 },
            ],
        },
        terrainParams: {
            baseHeight: 5,
            noiseScale: 0.04,
            noiseOctaves: 5,
            noiseAmplitude: 25, // High peaks
            caveThreshold: 0.15, // Enable caves
        },
    },

    scrubland: {
        displayName: 'Dusty Outback',
        terrainColor: new Color(0x7a6a4a),
        fogColor: new Color(0x8a7a5a),
        fogDensity: 0.018,
        waterLevel: 0.0,
        vegetationDensity: 0.35,
        temperatureModifier: 1.1,
        ambientSound: '/audio/environment/scrubland_ambient.ogg',
        spawnTables: {
            predators: [
                { speciesId: 'wombat', weight: 0.4 },
                { speciesId: 'tasmanian_devil', weight: 0.3 },
                { speciesId: 'coati', weight: 0.3 },
            ],
            prey: [
                { speciesId: 'wallaby', weight: 0.3 },
                { speciesId: 'rabbit', weight: 0.25 },
                { speciesId: 'lizard', weight: 0.2 },
                { speciesId: 'vole', weight: 0.15 },
                { speciesId: 'beetle', weight: 0.1 },
            ],
        },
        terrainParams: {
            baseHeight: 1,
            noiseScale: 0.03,
            noiseOctaves: 3,
            noiseAmplitude: 2.5,
        },
    },
};

// ============================================================================
// SPAWN SYSTEM
// ============================================================================

/**
 * Select a species from spawn table using weighted random
 */
export function selectFromSpawnTable(entries: SpawnEntry[]): string {
    const roll = Math.random();
    let cumulative = 0;

    for (const entry of entries) {
        cumulative += entry.weight;
        if (roll <= cumulative) {
            return entry.speciesId;
        }
    }

    // Fallback to last entry
    return entries[entries.length - 1].speciesId;
}

/**
 * Population targets for each biome
 */
export const POPULATION_TARGETS: Record<BiomeType, { predators: number; prey: number }> = {
    marsh: { predators: 5, prey: 30 },
    forest: { predators: 6, prey: 40 },
    desert: { predators: 4, prey: 20 },
    tundra: { predators: 5, prey: 25 },
    savanna: { predators: 5, prey: 35 },
    mountain: { predators: 4, prey: 30 },
    scrubland: { predators: 5, prey: 30 },
};

// ============================================================================
// BIOME TRANSITION
// ============================================================================

/**
 * Calculate biome blend factor at a position near boundary
 *
 * @param position - World position
 * @param biomeA - First biome
 * @param biomeB - Second biome
 * @param boundaryPosition - Center of boundary line
 * @param transitionWidth - Width of blend zone (default 10 units)
 */
export function calculateBiomeBlend(
    position: Vector3,
    boundaryPosition: Vector3,
    transitionWidth: number = 10
): number {
    const distance = position.distanceTo(boundaryPosition);
    if (distance > transitionWidth) return 1.0;
    return distance / transitionWidth;
}

/**
 * Blend two biome colors
 */
export function blendBiomeColors(
    colorA: Color,
    colorB: Color,
    blendFactor: number
): Color {
    const result = new Color();
    result.lerpColors(colorA, colorB, blendFactor);
    return result;
}

// ============================================================================
// TERRAIN SDF FUNCTIONS
// ============================================================================

/**
 * Basic Fractal Brownian Motion noise for terrain
 *
 * @param x - World X coordinate
 * @param z - World Z coordinate
 * @param params - Terrain parameters from biome
 */
export function terrainFBM(
    x: number,
    z: number,
    params: TerrainParams
): number {
    let height = params.baseHeight;
    let amplitude = params.noiseAmplitude;
    let frequency = params.noiseScale;

    for (let i = 0; i < params.noiseOctaves; i++) {
        // In real implementation, use proper noise function (simplex, perlin)
        const noise = Math.sin(x * frequency) * Math.cos(z * frequency);
        height += noise * amplitude;

        amplitude *= 0.5;
        frequency *= 2;
    }

    return height;
}

/**
 * Desert dune pattern using sine waves
 */
export function desertDunes(x: number, z: number): number {
    const duneHeight = 4;
    const duneFrequency = 0.1;
    return Math.sin(x * duneFrequency + z * 0.05) * duneHeight +
        Math.sin(z * duneFrequency * 1.5) * (duneHeight * 0.5);
}

/**
 * Mountain ridge noise with domain warping
 */
export function mountainTerrain(x: number, z: number): number {
    // Warp coordinates for organic shape
    const warpedX = x + Math.sin(z * 0.1) * 5;
    const warpedZ = z + Math.cos(x * 0.1) * 5;

    // Ridge noise (absolute value creates sharp peaks)
    const ridge = Math.abs(Math.sin(warpedX * 0.05) * Math.cos(warpedZ * 0.05));
    return 5 + ridge * 20;
}

/**
 * Cave SDF - returns negative when inside cave
 */
export function caveSDF(x: number, y: number, z: number, threshold: number = 0.15): number {
    // Only generate caves below y=10
    if (y > 10) return 1;

    // 3D noise for cave system
    const noise = Math.sin(x * 0.2) * Math.cos(y * 0.2) * Math.sin(z * 0.2);
    return noise - threshold;
}

// ============================================================================
// BIOME SYSTEM
// ============================================================================

/**
 * Biome System state and utilities
 */
export interface BiomeSystem {
    currentBiome: BiomeType;
    biomeAtPosition(pos: Vector3): BiomeType;
    getConfig(biome: BiomeType): BiomeConfig;
    getTerrainHeight(x: number, z: number, biome: BiomeType): number;
}

export function createBiomeSystem(): BiomeSystem {
    return {
        currentBiome: 'marsh',

        biomeAtPosition(pos: Vector3): BiomeType {
            // Simplified biome selection based on position
            // Real implementation would use Voronoi or noise-based regions
            const region = Math.floor(pos.x / 100) % 7;
            const biomes: BiomeType[] = ['marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland'];
            return biomes[Math.abs(region)];
        },

        getConfig(biome: BiomeType): BiomeConfig {
            return BIOME_CONFIGS[biome];
        },

        getTerrainHeight(x: number, z: number, biome: BiomeType): number {
            const config = BIOME_CONFIGS[biome];

            if (biome === 'desert') {
                return desertDunes(x, z);
            }

            if (biome === 'mountain') {
                return mountainTerrain(x, z);
            }

            return terrainFBM(x, z, config.terrainParams);
        },
    };
}
