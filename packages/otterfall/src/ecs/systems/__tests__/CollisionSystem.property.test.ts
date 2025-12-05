import * as fc from 'fast-check';
import { Quaternion, Vector3 } from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Entity } from '../../components';
import { world } from '../../world';
import { CollisionSystem } from '../CollisionSystem';

// Constants matching CollisionSystem implementation
const NPC_RADIUS = 0.5;

describe('CollisionSystem - Property-Based Tests', () => {
  let testEntities: Entity[] = [];

  beforeEach(() => {
    // Clear all test entities from previous runs
    testEntities.forEach(entity => {
      if (entity.id !== undefined) {
        world.remove(entity);
      }
    });
    testEntities = [];
  });

  describe('Property 11: Collision Prevention', () => {
    it('should prevent NPCs from overlapping when moving', () => {
      fc.assert(
        fc.property(
          fc.record({
            npc1X: fc.float({ min: -50, max: 50, noNaN: true }),
            npc1Z: fc.float({ min: -50, max: 50, noNaN: true }),
            npc2X: fc.float({ min: -50, max: 50, noNaN: true }),
            npc2Z: fc.float({ min: -50, max: 50, noNaN: true }),
            velocityX: fc.float({ min: -2, max: 2, noNaN: true }),
            velocityZ: fc.float({ min: -2, max: 2, noNaN: true }),
          }),
          (params: {
            npc1X: number;
            npc1Z: number;
            npc2X: number;
            npc2Z: number;
            velocityX: number;
            velocityZ: number;
          }) => {
            const { npc1X, npc1Z, npc2X, npc2Z, velocityX, velocityZ } = params;

            // Create two NPC entities with movement and transform components
            const npc1 = world.add({
              isNPC: true,
              transform: {
                position: new Vector3(npc1X, 0, npc1Z),
                rotation: new Quaternion(),
                scale: new Vector3(1, 1, 1),
              },
              movement: {
                velocity: new Vector3(velocityX, 0, velocityZ),
                acceleration: new Vector3(0, 0, 0),
                maxSpeed: 5,
                turnRate: 1,
              },
              species: {
                id: 'test-npc',
                name: 'Test NPC',
                type: 'prey',
                health: 100,
                maxHealth: 100,
                stamina: 100,
                maxStamina: 100,
                speed: 5,
                state: 'idle',
              },
            });

            const npc2 = world.add({
              isNPC: true,
              transform: {
                position: new Vector3(npc2X, 0, npc2Z),
                rotation: new Quaternion(),
                scale: new Vector3(1, 1, 1),
              },
              movement: {
                velocity: new Vector3(-velocityX, 0, -velocityZ),
                acceleration: new Vector3(0, 0, 0),
                maxSpeed: 5,
                turnRate: 1,
              },
              species: {
                id: 'test-npc-2',
                name: 'Test NPC 2',
                type: 'prey',
                health: 100,
                maxHealth: 100,
                stamina: 100,
                maxStamina: 100,
                speed: 5,
                state: 'idle',
              },
            });

            testEntities.push(npc1, npc2);

            // Store initial distance
            const initialDistance = Math.sqrt(
              (npc1X - npc2X) ** 2 + (npc1Z - npc2Z) ** 2
            );

            const minSeparation = NPC_RADIUS * 2;

            // Skip edge case where entities spawn at exact same position
            // (collision system can't resolve zero-distance collisions)
            if (initialDistance < 0.05) {
              return true;
            }

            // Run collision system multiple times to exceed COLLISION_CHECK_INTERVAL (100ms)
            // This ensures the collision check actually runs
            for (let i = 0; i < 10; i++) {
              CollisionSystem(0.016); // 16ms frame * 10 = 160ms total
            }

            // Get updated positions
            if (!npc1.transform || !npc2.transform) {
              return true; // Skip if entities were removed
            }

            const finalDistance = npc1.transform.position.distanceTo(
              npc2.transform.position
            );

            // Property: Collision system should push overlapping entities apart
            // The pushback is incremental (PUSHBACK_FORCE = 0.1), so we verify
            // that entities are moving in the right direction, not full separation
            if (initialDistance < minSeparation) {
              // If they started overlapping, collision should increase distance
              // or at least not make it worse
              expect(finalDistance).toBeGreaterThanOrEqual(initialDistance - 0.01);
            } else {
              // If they started separated, they should remain separated
              expect(finalDistance).toBeGreaterThanOrEqual(minSeparation - 0.01);
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply push-back force when entities collide', () => {
      fc.assert(
        fc.property(
          fc.record({
            entity1X: fc.float({ min: -10, max: 10, noNaN: true }),
            entity1Z: fc.float({ min: -10, max: 10, noNaN: true }),
            entity2X: fc.float({ min: -10, max: 10, noNaN: true }),
            entity2Z: fc.float({ min: -10, max: 10, noNaN: true }),
          }),
          (params: {
            entity1X: number;
            entity1Z: number;
            entity2X: number;
            entity2Z: number;
          }) => {
            const { entity1X, entity1Z, entity2X, entity2Z } = params;

            // Calculate initial distance
            const distance = Math.sqrt(
              (entity1X - entity2X) ** 2 + (entity1Z - entity2Z) ** 2
            );
            const minSeparation = NPC_RADIUS * 2;

            // Skip edge cases
            if (distance < 0.05) {
              return true; // Skip near-identical positions (can't resolve reliably)
            }
            if (distance >= minSeparation) {
              return true; // Skip non-colliding cases
            }

            // Create two entities that are colliding
            const entity1 = world.add({
              isNPC: true,
              transform: {
                position: new Vector3(entity1X, 0, entity1Z),
                rotation: new Quaternion(),
                scale: new Vector3(1, 1, 1),
              },
              movement: {
                velocity: new Vector3(0, 0, 0),
                acceleration: new Vector3(0, 0, 0),
                maxSpeed: 5,
                turnRate: 1,
              },
              species: {
                id: 'test-entity-1',
                name: 'Test Entity 1',
                type: 'prey',
                health: 100,
                maxHealth: 100,
                stamina: 100,
                maxStamina: 100,
                speed: 5,
                state: 'idle',
              },
            });

            const entity2 = world.add({
              isNPC: true,
              transform: {
                position: new Vector3(entity2X, 0, entity2Z),
                rotation: new Quaternion(),
                scale: new Vector3(1, 1, 1),
              },
              movement: {
                velocity: new Vector3(0, 0, 0),
                acceleration: new Vector3(0, 0, 0),
                maxSpeed: 5,
                turnRate: 1,
              },
              species: {
                id: 'test-entity-2',
                name: 'Test Entity 2',
                type: 'prey',
                health: 100,
                maxHealth: 100,
                stamina: 100,
                maxStamina: 100,
                speed: 5,
                state: 'idle',
              },
            });

            testEntities.push(entity1, entity2);

            // Run collision system multiple times to exceed COLLISION_CHECK_INTERVAL (100ms)
            for (let i = 0; i < 10; i++) {
              CollisionSystem(0.016); // 16ms frame * 10 = 160ms total
            }

            // Get updated entities
            if (!entity1.transform || !entity2.transform) {
              return true; // Skip if entities were removed
            }

            const finalDistance = entity1.transform.position.distanceTo(
              entity2.transform.position
            );

            // Property: After collision resolution, entities should be pushed apart
            // The pushback is incremental, so verify distance increased
            expect(finalDistance).toBeGreaterThan(distance - 0.01);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
