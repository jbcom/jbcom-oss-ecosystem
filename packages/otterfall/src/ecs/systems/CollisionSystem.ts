import { useGameStore } from '@/stores/gameStore';
import * as THREE from 'three';
import { PREDATOR_SPECIES } from '../data/species';
import { world } from '../world';

const PLAYER_RADIUS = 0.5;
const NPC_RADIUS = 0.5;
const COLLISION_CHECK_INTERVAL = 0.1; // Check every 100ms for performance
const PUSHBACK_FORCE = 0.1;

let lastCheckTime = 0;

export function CollisionSystem(delta: number) {
    lastCheckTime += delta;

    if (lastCheckTime < COLLISION_CHECK_INTERVAL) {
        return;
    }

    lastCheckTime = 0;

    const playerPos = useGameStore.getState().player.position;
    const damagePlayer = useGameStore.getState().damagePlayer;

    // Check collisions with predator NPCs for damage
    for (const entity of world.with('isNPC', 'transform', 'species')) {
        if (!entity.transform || !entity.species) continue;

        // Only check predators
        if (entity.species.type !== 'predator') continue;

        // Skip if predator is not in attack/chase state
        if (entity.species.state !== 'chase' && entity.species.state !== 'attack') continue;

        const distance = playerPos.distanceTo(entity.transform.position);
        const collisionDistance = PLAYER_RADIUS + NPC_RADIUS;

        if (distance < collisionDistance) {
            // Collision detected - apply damage
            const speciesData = PREDATOR_SPECIES[entity.species.id as keyof typeof PREDATOR_SPECIES];
            if (speciesData) {
                damagePlayer(speciesData.damage);
                console.log(`Hit by ${speciesData.name}! Damage: ${speciesData.damage}`);
            }
        }
    }

    // Check entity-entity collisions for pushback
    const entities = Array.from(world.with('transform', 'movement'));
    
    for (let i = 0; i < entities.length; i++) {
        const entityA = entities[i];
        if (!entityA.transform || !entityA.movement) continue;

        for (let j = i + 1; j < entities.length; j++) {
            const entityB = entities[j];
            if (!entityB.transform || !entityB.movement) continue;

            const distance = entityA.transform.position.distanceTo(entityB.transform.position);
            const collisionDistance = NPC_RADIUS * 2;

            if (distance < collisionDistance && distance > 0) {
                // Calculate pushback direction
                const pushDir = new THREE.Vector3()
                    .subVectors(entityA.transform.position, entityB.transform.position)
                    .normalize();

                // Apply pushback force
                const pushAmount = (collisionDistance - distance) * PUSHBACK_FORCE;
                
                entityA.transform.position.add(pushDir.clone().multiplyScalar(pushAmount));
                entityB.transform.position.sub(pushDir.clone().multiplyScalar(pushAmount));
            }
        }
    }
}
