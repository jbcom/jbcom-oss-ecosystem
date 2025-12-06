/**
 * ECS Systems Pattern - Rivermarsh/Otterfall
 *
 * Systems are functions that operate on entities with specific components.
 * They run each frame and implement game logic.
 *
 * Pattern: Systems query the world for entities matching their archetype,
 * then iterate and update component data.
 */

import { World } from 'miniplex';
import { Entity } from './components';

// ============================================================================
// SYSTEM INTERFACE
// ============================================================================

/**
 * Base system interface - all systems implement this pattern
 */
export interface GameSystem {
    /** System name for debugging */
    name: string;
    /** Execution priority (lower runs first) */
    priority: number;
    /** Update function called each frame */
    update(world: World<Entity>, deltaTime: number): void;
}

// ============================================================================
// MOVEMENT SYSTEM EXAMPLE
// ============================================================================

/**
 * Movement System - Updates entity positions based on velocity
 *
 * Archetype: entities with both transform AND movement components
 */
export function createMovementSystem(): GameSystem {
    return {
        name: 'MovementSystem',
        priority: 20, // Runs after Input (10), before Collision (30)

        update(world: World<Entity>, deltaTime: number) {
            // Query entities with transform AND movement
            const movingEntities = world.with('transform', 'movement');

            for (const entity of movingEntities) {
                const { transform, movement } = entity;

                // Apply velocity to position
                transform.position.x += movement.velocity.x * deltaTime;
                transform.position.y += movement.velocity.y * deltaTime;
                transform.position.z += movement.velocity.z * deltaTime;

                // Apply acceleration to velocity
                movement.velocity.x += movement.acceleration.x * deltaTime;
                movement.velocity.y += movement.acceleration.y * deltaTime;
                movement.velocity.z += movement.acceleration.z * deltaTime;

                // Clamp to max speed
                const speed = movement.velocity.length();
                if (speed > movement.maxSpeed) {
                    movement.velocity.normalize().multiplyScalar(movement.maxSpeed);
                }

                // Apply friction/drag
                movement.velocity.multiplyScalar(0.98);
            }
        },
    };
}

// ============================================================================
// STAMINA SYSTEM EXAMPLE
// ============================================================================

/**
 * Stamina System - Regenerates stamina when not running
 *
 * Demonstrates accessing player state from Zustand
 */
export function createStaminaSystem(getPlayerState: () => { isRunning: boolean }): GameSystem {
    return {
        name: 'StaminaSystem',
        priority: 25,

        update(world: World<Entity>, deltaTime: number) {
            const players = world.with('isPlayer', 'combat');

            for (const entity of players) {
                const { combat } = entity;
                const { isRunning } = getPlayerState();

                if (isRunning) {
                    // Drain stamina while running (5 per second)
                    combat.stamina = Math.max(0, combat.stamina - 5 * deltaTime);
                } else {
                    // Regenerate based on archetype
                    // Tank: 8/sec, Agile: 15/sec, Balanced: 10/sec
                    const regenRate = combat.staminaRegenRate || 10;
                    combat.stamina = Math.min(combat.maxStamina, combat.stamina + regenRate * deltaTime);
                }
            }
        },
    };
}

// ============================================================================
// HEALTH REGENERATION SYSTEM
// ============================================================================

/**
 * Health System - Handles damage-over-time and regeneration
 */
export function createHealthSystem(): GameSystem {
    return {
        name: 'HealthSystem',
        priority: 40,

        update(world: World<Entity>, deltaTime: number) {
            const combatEntities = world.with('combat');

            for (const entity of combatEntities) {
                const { combat } = entity;

                // Check for stun expiration
                if (combat.isStunned && Date.now() >= combat.stunEndTime) {
                    combat.isStunned = false;
                }

                // Health bounds check
                combat.health = Math.max(0, Math.min(combat.maxHealth, combat.health));

                // Check for death
                if (combat.health <= 0 && entity.species?.state !== 'dead') {
                    entity.species!.state = 'dead';
                    // Death handling would trigger animations, drops, etc.
                }
            }
        },
    };
}

// ============================================================================
// TIME SYSTEM EXAMPLE
// ============================================================================

/**
 * Time System - Advances day/night cycle
 *
 * Updates the global time singleton entity
 */
export function createTimeSystem(timeScale: number = 60): GameSystem {
    return {
        name: 'TimeSystem',
        priority: 5, // Runs very early

        update(world: World<Entity>, deltaTime: number) {
            // Find the world singleton entity
            const worldEntities = world.with('isWorld', 'time');
            const worldEntity = worldEntities.first;

            if (!worldEntity?.time) return;

            const time = worldEntity.time;

            // Advance hour (timeScale: 60 = 1 real second = 1 game minute)
            time.hour += (deltaTime * timeScale) / 60;

            // Wrap at 24 hours
            if (time.hour >= 24) {
                time.hour -= 24;
            }

            // Calculate phase
            if (time.hour >= 5 && time.hour < 7) {
                time.phase = 'dawn';
            } else if (time.hour >= 7 && time.hour < 17) {
                time.phase = 'day';
            } else if (time.hour >= 17 && time.hour < 19) {
                time.phase = 'dusk';
            } else {
                time.phase = 'night';
            }

            // Update lighting based on phase
            switch (time.phase) {
                case 'dawn':
                    time.sunIntensity = 0.3 + ((time.hour - 5) / 2) * 0.7;
                    time.sunAngle = -10 + ((time.hour - 5) / 2) * 30;
                    break;
                case 'day':
                    time.sunIntensity = 1.0;
                    time.sunAngle = 20 + ((time.hour - 7) / 10) * 140;
                    break;
                case 'dusk':
                    time.sunIntensity = 1.0 - ((time.hour - 17) / 2) * 0.9;
                    time.sunAngle = 160 + ((time.hour - 17) / 2) * 20;
                    break;
                case 'night':
                    time.sunIntensity = 0.1;
                    time.sunAngle = 180;
                    break;
            }
        },
    };
}

// ============================================================================
// SYSTEM RUNNER
// ============================================================================

/**
 * System Runner - Executes all systems in priority order
 *
 * Usage in React component:
 * ```tsx
 * useFrame((state, delta) => {
 *     systemRunner.update(delta);
 * });
 * ```
 */
export class SystemRunner {
    private systems: GameSystem[] = [];
    private world: World<Entity>;

    constructor(world: World<Entity>) {
        this.world = world;
    }

    addSystem(system: GameSystem): void {
        this.systems.push(system);
        this.systems.sort((a, b) => a.priority - b.priority);
    }

    removeSystem(name: string): void {
        this.systems = this.systems.filter((s) => s.name !== name);
    }

    update(deltaTime: number): void {
        for (const system of this.systems) {
            system.update(this.world, deltaTime);
        }
    }
}

// ============================================================================
// SYSTEM PRIORITIES (Reference)
// ============================================================================

/**
 * Standard system execution order:
 *
 * 5   - TimeSystem (global state updates first)
 * 10  - InputSystem (capture player input)
 * 15  - AISystem (NPC decision making)
 * 20  - MovementSystem (apply velocities)
 * 25  - StaminaSystem (resource management)
 * 30  - CollisionSystem (resolve collisions)
 * 35  - CombatSystem (damage resolution)
 * 40  - HealthSystem (death checks)
 * 45  - SpawnSystem (entity creation)
 * 50  - RenderSystem (visual updates)
 */
export const SYSTEM_PRIORITIES = {
    TIME: 5,
    INPUT: 10,
    AI: 15,
    MOVEMENT: 20,
    STAMINA: 25,
    COLLISION: 30,
    COMBAT: 35,
    HEALTH: 40,
    SPAWN: 45,
    RENDER: 50,
} as const;
