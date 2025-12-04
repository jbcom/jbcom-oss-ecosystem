import { useGameStore } from '@/stores/gameStore';
import * as THREE from 'three';
import { RESOURCES, ResourceType } from '../data/resources';
import { world } from '../world';
import { getCurrentBiome } from './BiomeSystem';

const MAX_RESOURCES = 20;
const SPAWN_RADIUS = 50;
const MIN_SPAWN_DISTANCE = 10;
const COLLECTION_DISTANCE = 1.5;

let initialized = false;

export function initializeResources(playerPos: THREE.Vector3) {
    if (initialized) return;

    const biome = getCurrentBiome();
    const resourceTypes: ResourceType[] = ['fish', 'berries', 'water'];

    // Spawn resources appropriate for current biome
    for (const type of resourceTypes) {
        const resourceData = RESOURCES[type];
        if (!resourceData.biomes.includes(biome)) continue;

        const count = Math.floor(Math.random() * 3) + 2; // 2-4 of each type
        for (let i = 0; i < count; i++) {
            spawnResource(type, playerPos);
        }
    }

    initialized = true;
}

function spawnResource(type: ResourceType, playerPos: THREE.Vector3) {
    const resourceData = RESOURCES[type];

    // Find spawn position away from player
    let spawnPos: THREE.Vector3;
    let attempts = 0;
    do {
        const angle = Math.random() * Math.PI * 2;
        const distance = MIN_SPAWN_DISTANCE + Math.random() * (SPAWN_RADIUS - MIN_SPAWN_DISTANCE);
        spawnPos = new THREE.Vector3(
            playerPos.x + Math.cos(angle) * distance,
            0.5, // Slightly above ground
            playerPos.z + Math.sin(angle) * distance
        );
        attempts++;
    } while (spawnPos.distanceTo(playerPos) < MIN_SPAWN_DISTANCE && attempts < 10);

    world.add({
        isResource: true,
        transform: {
            position: spawnPos,
            rotation: new THREE.Quaternion(),
            scale: new THREE.Vector3(resourceData.size, resourceData.size, resourceData.size),
        },
        resource: {
            type,
            healthRestore: resourceData.healthRestore,
            staminaRestore: resourceData.staminaRestore,
            respawnTime: resourceData.respawnTime,
            collected: false,
            collectedAt: 0,
        },
    });
}

export function ResourceSystem(playerPos: THREE.Vector3, delta: number) {
    // Initialize resources on first call
    if (!initialized) {
        initializeResources(playerPos);
    }

    const healPlayer = useGameStore.getState().healPlayer;
    const restoreStamina = useGameStore.getState().restoreStamina;

    // Check for resource collection
    for (const entity of world.with('isResource', 'transform', 'resource')) {
        if (!entity.transform || !entity.resource) continue;

        // Handle respawn
        if (entity.resource.collected) {
            const timeSinceCollection = (Date.now() - entity.resource.collectedAt) / 1000;
            if (timeSinceCollection >= entity.resource.respawnTime) {
                entity.resource.collected = false;
                entity.resource.collectedAt = 0;
            }
            continue;
        }

        // Check collection distance
        const distance = playerPos.distanceTo(entity.transform.position);
        if (distance < COLLECTION_DISTANCE) {
            // Collect resource
            entity.resource.collected = true;
            entity.resource.collectedAt = Date.now();

            // Apply effects
            if (entity.resource.healthRestore > 0) {
                healPlayer(entity.resource.healthRestore);
            }
            if (entity.resource.staminaRestore > 0) {
                restoreStamina(entity.resource.staminaRestore);
            }

            // Play collection sound
            const { getAudioManager } = require('@/utils/audioManager');
            const audioManager = getAudioManager();
            if (audioManager) {
                audioManager.playSound('collect', 0.6);
            }

            console.log(`Collected ${entity.resource.type}!`);
        }
    }

    // Spawn more resources if needed
    const resourceCount = world.with('isResource').entities.length;
    if (resourceCount < MAX_RESOURCES) {
        const biome = getCurrentBiome();
        const resourceTypes: ResourceType[] = ['fish', 'berries', 'water'];
        const validTypes = resourceTypes.filter(type => RESOURCES[type].biomes.includes(biome));

        if (validTypes.length > 0) {
            const randomType = validTypes[Math.floor(Math.random() * validTypes.length)];
            spawnResource(randomType, playerPos);
        }
    }
}
