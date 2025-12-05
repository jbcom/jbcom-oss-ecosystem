/**
 * CollisionSystem - Handles game-logic collision events
 * 
 * Physics collisions are now handled by Rapier (@react-three/rapier).
 * This system only handles game logic like damage from predators.
 */

import { useGameStore } from '@/stores/gameStore';
import { PREDATOR_SPECIES } from '../data/species';
import { world } from '../world';

const PLAYER_RADIUS = 0.5;
const NPC_RADIUS = 0.5;
const COLLISION_CHECK_INTERVAL = 0.1; // Check every 100ms for performance

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

        // Only check predators in attack state
        if (entity.species.type !== 'predator') continue;
        if (entity.species.state !== 'attack') continue;

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
    
    // Note: Entity-entity physics collisions are now handled by Rapier
}
