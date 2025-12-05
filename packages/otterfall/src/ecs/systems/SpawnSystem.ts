import * as THREE from 'three';
import { BIOMES } from '../data/biomes';
import { PREDATOR_SPECIES, PREY_SPECIES } from '../data/species';
import { world } from '../world';
import { getCurrentBiome } from './BiomeSystem';

const MAX_NPCS = 30;
const SPAWN_RADIUS = 60;
const MIN_SPAWN_DISTANCE = 15; // From player

let initialized = false;

export function initializeSpawns(playerPos: THREE.Vector3) {
    if (initialized) return;

    const biome = getCurrentBiome();
    const biomeData = BIOMES[biome];

    // Spawn predators
    const predatorCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < predatorCount; i++) {
        const species = selectSpecies(biomeData.spawnTables.predators);
        if (species) {
            spawnNPC(species, 'predator', playerPos);
        }
    }

    // Spawn prey
    const preyCount = Math.floor(Math.random() * 10) + 8;
    for (let i = 0; i < preyCount; i++) {
        const species = selectSpecies(biomeData.spawnTables.prey);
        if (species) {
            spawnNPC(species, 'prey', playerPos);
        }
    }

    initialized = true;
}

function selectSpecies(spawnTable: { species: string; weight: number }[]): string | null {
    const totalWeight = spawnTable.reduce((sum, entry) => sum + entry.weight, 0);
    let random = Math.random() * totalWeight;

    for (const entry of spawnTable) {
        random -= entry.weight;
        if (random <= 0) {
            return entry.species;
        }
    }

    return spawnTable[0]?.species || null;
}

function spawnNPC(speciesId: string, type: 'predator' | 'prey', playerPos: THREE.Vector3) {
    const speciesData = type === 'predator'
        ? PREDATOR_SPECIES[speciesId as keyof typeof PREDATOR_SPECIES]
        : PREY_SPECIES[speciesId as keyof typeof PREY_SPECIES];

    if (!speciesData) return;

    // Find spawn position away from player
    let spawnPos: THREE.Vector3;
    let attempts = 0;
    do {
        const angle = Math.random() * Math.PI * 2;
        const distance = MIN_SPAWN_DISTANCE + Math.random() * (SPAWN_RADIUS - MIN_SPAWN_DISTANCE);
        spawnPos = new THREE.Vector3(
            playerPos.x + Math.cos(angle) * distance,
            0,
            playerPos.z + Math.sin(angle) * distance
        );
        attempts++;
    } while (spawnPos.distanceTo(playerPos) < MIN_SPAWN_DISTANCE && attempts < 10);

    // Create entity
    world.add({
        isNPC: true,
        transform: {
            position: spawnPos,
            rotation: new THREE.Quaternion(),
            scale: new THREE.Vector3(1, 1, 1),
        },
        movement: {
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            maxSpeed: speciesData.runSpeed,
            turnRate: 0.1,
        },
        species: {
            id: speciesId,
            name: speciesData.name,
            type,
            health: speciesData.baseHealth,
            maxHealth: speciesData.baseHealth,
            stamina: 100,
            maxStamina: 100,
            speed: speciesData.walkSpeed,
            state: 'idle',
        },
        steering: {
            target: null,
            awarenessRadius: speciesData.awarenessRadius,
            wanderAngle: Math.random() * Math.PI * 2,
            wanderTimer: Math.random() * 3,
        },
    });
}

export function SpawnSystem(playerPos: THREE.Vector3) {
    // Initialize spawns on first call
    if (!initialized) {
        initializeSpawns(playerPos);
    }

    // Check if we need to spawn more NPCs
    const npcCount = world.with('isNPC').entities.length;

    if (npcCount < MAX_NPCS) {
        // Spawn more based on biome
        const biome = getCurrentBiome();
        const biomeData = BIOMES[biome];

        // Randomly spawn predator or prey
        if (Math.random() < 0.3) {
            const species = selectSpecies(biomeData.spawnTables.predators);
            if (species) {
                spawnNPC(species, 'predator', playerPos);
            }
        } else {
            const species = selectSpecies(biomeData.spawnTables.prey);
            if (species) {
                spawnNPC(species, 'prey', playerPos);
            }
        }
    }

    // Remove dead NPCs
    for (const entity of world.with('isNPC', 'species')) {
        if (entity.species && entity.species.state === 'dead') {
            world.remove(entity);
        }
    }
}
