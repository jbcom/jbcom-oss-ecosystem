import * as THREE from 'three';

export type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

export interface SpawnEntry {
    species: string;
    weight: number;
}

export interface BiomeData {
    name: string;
    terrainColor: THREE.Color;
    fogColor: THREE.Color;
    fogDensity: number;
    waterLevel: number;
    treeCount: number;
    treeDensity: number; // trees per square meter
    grassColor: THREE.Color;
    spawnTables: {
        predators: SpawnEntry[];
        prey: SpawnEntry[];
    };
    ambientSound?: string;
}

export const BIOMES: Record<BiomeType, BiomeData> = {
    marsh: {
        name: 'Marsh',
        terrainColor: new THREE.Color(0x2a4a2a),
        fogColor: new THREE.Color(0x4a5a5a),
        fogDensity: 0.03,
        waterLevel: 0.2,
        treeCount: 20,
        treeDensity: 0.05,
        grassColor: new THREE.Color(0x335522),
        spawnTables: {
            predators: [
                { species: 'fox', weight: 0.3 },
                { species: 'raccoon', weight: 0.5 },
                { species: 'mink', weight: 0.2 },
            ],
            prey: [
                { species: 'frog', weight: 0.6 },
                { species: 'fish_bass', weight: 0.4 },
            ],
        },
        ambientSound: 'marsh_ambient',
    },
    forest: {
        name: 'Forest',
        terrainColor: new THREE.Color(0x2a3a1a),
        fogColor: new THREE.Color(0x3a4a3a),
        fogDensity: 0.025,
        waterLevel: 0,
        treeCount: 150,
        treeDensity: 0.3,
        grassColor: new THREE.Color(0x2a4a1a),
        spawnTables: {
            predators: [
                { species: 'wolf', weight: 0.3 },
                { species: 'bear', weight: 0.1 },
                { species: 'fox', weight: 0.4 },
                { species: 'badger', weight: 0.2 },
            ],
            prey: [
                { species: 'rabbit', weight: 0.4 },
                { species: 'squirrel', weight: 0.3 },
                { species: 'deer', weight: 0.2 },
                { species: 'mouse', weight: 0.1 },
            ],
        },
        ambientSound: 'forest_ambient',
    },
    desert: {
        name: 'Desert',
        terrainColor: new THREE.Color(0x8a7a4a),
        fogColor: new THREE.Color(0xaa9a7a),
        fogDensity: 0.015,
        waterLevel: 0,
        treeCount: 10, // Cacti
        treeDensity: 0.02,
        grassColor: new THREE.Color(0x7a6a3a),
        spawnTables: {
            predators: [
                { species: 'coyote', weight: 0.5 },
                { species: 'rattlesnake', weight: 0.3 },
                { species: 'hawk', weight: 0.2 },
            ],
            prey: [
                { species: 'lizard', weight: 0.5 },
                { species: 'mouse', weight: 0.3 },
                { species: 'rabbit', weight: 0.2 },
            ],
        },
        ambientSound: 'desert_ambient',
    },
    tundra: {
        name: 'Tundra',
        terrainColor: new THREE.Color(0xddeeff),
        fogColor: new THREE.Color(0xccddee),
        fogDensity: 0.02,
        waterLevel: 0,
        treeCount: 5,
        treeDensity: 0.01,
        grassColor: new THREE.Color(0xccddee),
        spawnTables: {
            predators: [
                { species: 'wolf', weight: 0.5 },
                { species: 'polar_bear', weight: 0.2 },
                { species: 'arctic_fox', weight: 0.3 },
            ],
            prey: [
                { species: 'hare', weight: 0.5 },
                { species: 'lemming', weight: 0.3 },
                { species: 'caribou', weight: 0.2 },
            ],
        },
        ambientSound: 'tundra_ambient',
    },
    savanna: {
        name: 'Savanna',
        terrainColor: new THREE.Color(0x8a7a3a),
        fogColor: new THREE.Color(0xaa9a6a),
        fogDensity: 0.018,
        waterLevel: 0,
        treeCount: 30,
        treeDensity: 0.06,
        grassColor: new THREE.Color(0x7a6a2a),
        spawnTables: {
            predators: [
                { species: 'lion', weight: 0.2 },
                { species: 'hyena', weight: 0.3 },
                { species: 'cheetah', weight: 0.2 },
                { species: 'leopard', weight: 0.3 },
            ],
            prey: [
                { species: 'gazelle', weight: 0.4 },
                { species: 'zebra', weight: 0.3 },
                { species: 'wildebeest', weight: 0.3 },
            ],
        },
        ambientSound: 'savanna_ambient',
    },
    mountain: {
        name: 'Mountain',
        terrainColor: new THREE.Color(0x5a5a5a),
        fogColor: new THREE.Color(0x7a7a7a),
        fogDensity: 0.035,
        waterLevel: 0,
        treeCount: 40,
        treeDensity: 0.08,
        grassColor: new THREE.Color(0x4a5a3a),
        spawnTables: {
            predators: [
                { species: 'mountain_lion', weight: 0.4 },
                { species: 'bear', weight: 0.3 },
                { species: 'eagle', weight: 0.3 },
            ],
            prey: [
                { species: 'goat', weight: 0.5 },
                { species: 'marmot', weight: 0.3 },
                { species: 'rabbit', weight: 0.2 },
            ],
        },
        ambientSound: 'mountain_ambient',
    },
    scrubland: {
        name: 'Scrubland',
        terrainColor: new THREE.Color(0x6a5a3a),
        fogColor: new THREE.Color(0x8a7a5a),
        fogDensity: 0.02,
        waterLevel: 0,
        treeCount: 25,
        treeDensity: 0.05,
        grassColor: new THREE.Color(0x5a4a2a),
        spawnTables: {
            predators: [
                { species: 'coyote', weight: 0.4 },
                { species: 'bobcat', weight: 0.3 },
                { species: 'fox', weight: 0.3 },
            ],
            prey: [
                { species: 'rabbit', weight: 0.5 },
                { species: 'quail', weight: 0.3 },
                { species: 'lizard', weight: 0.2 },
            ],
        },
        ambientSound: 'scrubland_ambient',
    },
};

// Biome layout: Radial sectors from center
export interface BiomeBounds {
    type: BiomeType;
    center: THREE.Vector2;
    radius: number;
}

export function generateBiomeLayout(): BiomeBounds[] {
    const biomes: BiomeBounds[] = [];
    const biomeTypes: BiomeType[] = ['marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland'];

    // Center biome (marsh - home)
    biomes.push({
        type: 'marsh',
        center: new THREE.Vector2(0, 0),
        radius: 25,
    });

    // Surrounding biomes in a ring
    const angleStep = (Math.PI * 2) / (biomeTypes.length - 1);
    let angle = 0;

    for (let i = 1; i < biomeTypes.length; i++) {
        const distance = 50;
        const center = new THREE.Vector2(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance
        );

        biomes.push({
            type: biomeTypes[i],
            center,
            radius: 30,
        });

        angle += angleStep;
    }

    return biomes;
}

export function getBiomeAtPosition(x: number, z: number, biomes: BiomeBounds[]): BiomeType {
    const pos = new THREE.Vector2(x, z);

    // Find closest biome
    let closestBiome = biomes[0];
    let closestDist = pos.distanceTo(closestBiome.center);

    for (const biome of biomes) {
        const dist = pos.distanceTo(biome.center);
        if (dist < closestDist) {
            closestDist = dist;
            closestBiome = biome;
        }
    }

    return closestBiome.type;
}
