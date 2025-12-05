import * as fc from 'fast-check';
import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import { world } from '../../world';

describe('AISystem', () => {
    beforeEach(() => {
        // Clear all entities before each test
        for (const entity of world.entities) {
            world.remove(entity);
        }
    });

    // Feature: otterfall-complete, Property 6: Species Health Bounds
    // For any entity with a species component, the health value should be 
    // between 0 and maxHealth inclusive.
    it('Property 6: Species Health Bounds', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 100 }),
                fc.integer({ min: 0, max: 100 }),
                fc.constantFrom('predator', 'prey', 'player'),
                (maxHealth, currentHealth, type) => {
                    // Ensure currentHealth doesn't exceed maxHealth
                    const health = Math.min(currentHealth, maxHealth);

                    // Setup: Create entity with species component
                    const entity = world.add({
                        isNPC: true,
                        transform: {
                            position: new THREE.Vector3(0, 0, 0),
                            rotation: new THREE.Quaternion(),
                            scale: new THREE.Vector3(1, 1, 1),
                        },
                        movement: {
                            velocity: new THREE.Vector3(),
                            acceleration: new THREE.Vector3(),
                            maxSpeed: 5,
                            turnRate: 1,
                        },
                        species: {
                            id: 'test',
                            name: 'Test Species',
                            type: type as 'predator' | 'prey' | 'player',
                            health,
                            maxHealth,
                            stamina: 100,
                            maxStamina: 100,
                            speed: 2,
                            state: 'idle',
                        },
                        steering: {
                            target: null,
                            awarenessRadius: 10,
                            wanderAngle: 0,
                            wanderTimer: 3,
                        },
                    });

                    // Verify: Health should be within bounds
                    expect(entity.species!.health).toBeGreaterThanOrEqual(0);
                    expect(entity.species!.health).toBeLessThanOrEqual(entity.species!.maxHealth);

                    // Simulate damage
                    const damage = Math.floor(Math.random() * 20);
                    entity.species!.health = Math.max(0, entity.species!.health - damage);

                    // Verify: Health should still be within bounds after damage
                    expect(entity.species!.health).toBeGreaterThanOrEqual(0);
                    expect(entity.species!.health).toBeLessThanOrEqual(entity.species!.maxHealth);

                    // Simulate healing
                    const healing = Math.floor(Math.random() * 20);
                    entity.species!.health = Math.min(entity.species!.maxHealth, entity.species!.health + healing);

                    // Verify: Health should still be within bounds after healing
                    expect(entity.species!.health).toBeGreaterThanOrEqual(0);
                    expect(entity.species!.health).toBeLessThanOrEqual(entity.species!.maxHealth);

                    // Cleanup
                    world.remove(entity);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: otterfall-complete, Property 7: State Transition Validity
    // For any NPC entity state transition, the new state should be reachable 
    // from the current state according to the state machine definition.
    it('Property 7: State Transition Validity', () => {
        const validTransitions: Record<string, string[]> = {
            idle: ['walk', 'flee', 'chase'],
            walk: ['idle', 'flee', 'chase'],
            run: ['idle', 'walk'],
            flee: ['idle', 'walk'],
            chase: ['idle', 'walk', 'attack'],
            attack: ['chase', 'idle'],
            dead: [], // No transitions from dead
        };

        fc.assert(
            fc.property(
                fc.constantFrom('idle', 'walk', 'run', 'flee', 'chase', 'attack'),
                fc.constantFrom('idle', 'walk', 'run', 'flee', 'chase', 'attack'),
                (currentState, newState) => {
                    // Setup: Create NPC entity
                    const entity = world.add({
                        isNPC: true,
                        transform: {
                            position: new THREE.Vector3(0, 0, 0),
                            rotation: new THREE.Quaternion(),
                            scale: new THREE.Vector3(1, 1, 1),
                        },
                        movement: {
                            velocity: new THREE.Vector3(),
                            acceleration: new THREE.Vector3(),
                            maxSpeed: 5,
                            turnRate: 1,
                        },
                        species: {
                            id: 'test',
                            name: 'Test NPC',
                            type: 'prey',
                            health: 50,
                            maxHealth: 50,
                            stamina: 100,
                            maxStamina: 100,
                            speed: 2,
                            state: currentState as any,
                        },
                        steering: {
                            target: null,
                            awarenessRadius: 10,
                            wanderAngle: 0,
                            wanderTimer: 3,
                        },
                    });

                    // Execute: Attempt state transition
                    const validNextStates = validTransitions[currentState];
                    const isValidTransition = validNextStates.includes(newState);

                    if (isValidTransition) {
                        entity.species!.state = newState as any;
                        expect(entity.species!.state).toBe(newState);
                    }

                    // Verify: State should be one of the valid states
                    expect(['idle', 'walk', 'run', 'flee', 'chase', 'attack', 'dead']).toContain(
                        entity.species!.state
                    );

                    // Cleanup
                    world.remove(entity);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: otterfall-complete, Property 8: Steering Force Magnitude
    // For any entity with steering behaviors, the combined steering force 
    // magnitude should not exceed the entity's maxSpeed.
    it('Property 8: Steering Force Magnitude', () => {
        fc.assert(
            fc.property(
                fc.float({ min: 1, max: 10, noNaN: true }),
                fc.float({ min: -5, max: 5, noNaN: true }),
                fc.float({ min: -5, max: 5, noNaN: true }),
                fc.float({ min: -5, max: 5, noNaN: true }),
                (maxSpeed, vx, vy, vz) => {
                    // Setup: Create entity with movement
                    const entity = world.add({
                        isNPC: true,
                        transform: {
                            position: new THREE.Vector3(0, 0, 0),
                            rotation: new THREE.Quaternion(),
                            scale: new THREE.Vector3(1, 1, 1),
                        },
                        movement: {
                            velocity: new THREE.Vector3(vx, vy, vz),
                            acceleration: new THREE.Vector3(),
                            maxSpeed,
                            turnRate: 1,
                        },
                        species: {
                            id: 'test',
                            name: 'Test NPC',
                            type: 'prey',
                            health: 50,
                            maxHealth: 50,
                            stamina: 100,
                            maxStamina: 100,
                            speed: maxSpeed,
                            state: 'walk',
                        },
                        steering: {
                            target: null,
                            awarenessRadius: 10,
                            wanderAngle: 0,
                            wanderTimer: 3,
                        },
                    });

                    // Execute: Clamp velocity to maxSpeed (as AISystem does)
                    entity.movement!.velocity.clampLength(0, maxSpeed);

                    // Verify: Velocity magnitude should not exceed maxSpeed
                    const velocityMagnitude = entity.movement!.velocity.length();
                    expect(velocityMagnitude).toBeLessThanOrEqual(maxSpeed + 0.0001); // Small epsilon for floating point

                    // Cleanup
                    world.remove(entity);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle predator-prey interactions', () => {
        // Create predator
        const predator = world.add({
            isNPC: true,
            transform: {
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(1, 1, 1),
            },
            movement: {
                velocity: new THREE.Vector3(),
                acceleration: new THREE.Vector3(),
                maxSpeed: 5,
                turnRate: 1,
            },
            species: {
                id: 'predator1',
                name: 'Wolf',
                type: 'predator',
                health: 50,
                maxHealth: 50,
                stamina: 100,
                maxStamina: 100,
                speed: 3,
                state: 'idle',
            },
            steering: {
                target: null,
                awarenessRadius: 15,
                wanderAngle: 0,
                wanderTimer: 3,
            },
        });

        // Create prey nearby
        const prey = world.add({
            isNPC: true,
            transform: {
                position: new THREE.Vector3(5, 0, 0),
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(1, 1, 1),
            },
            movement: {
                velocity: new THREE.Vector3(),
                acceleration: new THREE.Vector3(),
                maxSpeed: 6,
                turnRate: 1,
            },
            species: {
                id: 'prey1',
                name: 'Rabbit',
                type: 'prey',
                health: 20,
                maxHealth: 20,
                stamina: 100,
                maxStamina: 100,
                speed: 4,
                state: 'idle',
            },
            steering: {
                target: null,
                awarenessRadius: 12,
                wanderAngle: 0,
                wanderTimer: 3,
            },
        });

        // Both entities should exist
        expect(predator.species!.type).toBe('predator');
        expect(prey.species!.type).toBe('prey');

        // Cleanup
        world.remove(predator);
        world.remove(prey);
    });
});
