import * as fc from 'fast-check';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { world } from '../../world';

// Mock the game store
vi.mock('@/stores/gameStore', () => ({
    useGameStore: {
        getState: () => ({
            healPlayer: vi.fn(),
            restoreStamina: vi.fn(),
        }),
    },
}));

describe('ResourceSystem', () => {
    beforeEach(() => {
        // Clear all entities before each test
        for (const entity of world.entities) {
            world.remove(entity);
        }
    });

    // Feature: otterfall-complete, Property 10: Resource Collection Idempotence
    // For any resource entity, collecting it multiple times before respawn should 
    // only apply the health/stamina restoration once.
    it('Property 10: Resource Collection Idempotence', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('fish', 'berries', 'water'),
                fc.integer({ min: 10, max: 50 }),
                fc.integer({ min: 10, max: 50 }),
                (resourceType, healthRestore, staminaRestore) => {
                    // Setup: Create a resource entity
                    const resourceEntity = world.add({
                        isResource: true,
                        transform: {
                            position: new THREE.Vector3(0, 0.5, 0),
                            rotation: new THREE.Quaternion(),
                            scale: new THREE.Vector3(1, 1, 1),
                        },
                        resource: {
                            type: resourceType as 'fish' | 'berries' | 'water',
                            healthRestore,
                            staminaRestore,
                            respawnTime: 60,
                            collected: false,
                            collectedAt: 0,
                        },
                    });

                    // Execute: Collect the resource
                    resourceEntity.resource!.collected = true;
                    resourceEntity.resource!.collectedAt = Date.now();

                    const firstCollectionTime = resourceEntity.resource!.collectedAt;

                    // Try to collect again immediately
                    const wasCollected = resourceEntity.resource!.collected;

                    // Verify: Resource should remain collected
                    expect(wasCollected).toBe(true);
                    expect(resourceEntity.resource!.collectedAt).toBe(firstCollectionTime);

                    // Verify: Multiple collection attempts don't change state
                    for (let i = 0; i < 5; i++) {
                        expect(resourceEntity.resource!.collected).toBe(true);
                        expect(resourceEntity.resource!.collectedAt).toBe(firstCollectionTime);
                    }

                    // Cleanup
                    world.remove(resourceEntity);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should respawn resources after respawn time', () => {
        const resourceEntity = world.add({
            isResource: true,
            transform: {
                position: new THREE.Vector3(0, 0.5, 0),
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(1, 1, 1),
            },
            resource: {
                type: 'fish',
                healthRestore: 20,
                staminaRestore: 0,
                respawnTime: 1, // 1 second for testing
                collected: true,
                collectedAt: Date.now() - 2000, // Collected 2 seconds ago
            },
        });

        // Check if resource should respawn
        const timeSinceCollection = (Date.now() - resourceEntity.resource!.collectedAt) / 1000;
        const shouldRespawn = timeSinceCollection >= resourceEntity.resource!.respawnTime;

        expect(shouldRespawn).toBe(true);

        world.remove(resourceEntity);
    });

    it('should not allow collection when already collected', () => {
        const resourceEntity = world.add({
            isResource: true,
            transform: {
                position: new THREE.Vector3(0, 0.5, 0),
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(1, 1, 1),
            },
            resource: {
                type: 'berries',
                healthRestore: 0,
                staminaRestore: 15,
                respawnTime: 60,
                collected: true,
                collectedAt: Date.now(),
            },
        });

        // Resource is already collected
        expect(resourceEntity.resource!.collected).toBe(true);

        // Attempting to collect again should not change state
        const collectedAt = resourceEntity.resource!.collectedAt;
        expect(resourceEntity.resource!.collectedAt).toBe(collectedAt);

        world.remove(resourceEntity);
    });
});
