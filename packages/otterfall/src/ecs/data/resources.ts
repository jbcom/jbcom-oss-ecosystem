import * as THREE from 'three';

export type ResourceType = 'fish' | 'berries' | 'water';

export interface ResourceData {
    name: string;
    healthRestore: number;
    staminaRestore: number;
    respawnTime: number; // seconds
    color: THREE.Color;
    size: number;
    biomes: string[]; // Which biomes this resource spawns in
}

export const RESOURCES: Record<ResourceType, ResourceData> = {
    fish: {
        name: 'Fish',
        healthRestore: 20,
        staminaRestore: 0,
        respawnTime: 60,
        color: new THREE.Color(0x5a6a4a),
        size: 0.3,
        biomes: ['marsh', 'forest'], // Near water
    },
    berries: {
        name: 'Berries',
        healthRestore: 0,
        staminaRestore: 15,
        respawnTime: 45,
        color: new THREE.Color(0x8a2a4a),
        size: 0.2,
        biomes: ['forest', 'scrubland', 'savanna'],
    },
    water: {
        name: 'Water',
        healthRestore: 0,
        staminaRestore: 25,
        respawnTime: 30,
        color: new THREE.Color(0x4a7a9a),
        size: 0.4,
        biomes: ['marsh', 'forest', 'tundra'],
    },
};
