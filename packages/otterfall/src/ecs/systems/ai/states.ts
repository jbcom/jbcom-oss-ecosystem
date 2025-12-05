/**
 * AI States using Yuka's State class
 * 
 * These states implement the proper enter/execute/exit lifecycle pattern
 * and dynamically manage steering behaviors based on the current state.
 */

import {
    State,
    WanderBehavior,
    SeekBehavior,
    FleeBehavior,
    SeparationBehavior,
    ArriveBehavior,
    Vector3 as YukaVector3,
} from 'yuka';
import { NPCVehicle, getYukaManager } from './YukaManager';

// State IDs
export const STATE_IDLE = 'IDLE';
export const STATE_WANDER = 'WANDER';
export const STATE_FLEE = 'FLEE';
export const STATE_CHASE = 'CHASE';
export const STATE_ATTACK = 'ATTACK';

// Behavior weights
const WANDER_WEIGHT = 1.0;
const SEPARATION_WEIGHT = 1.5;
const FLEE_WEIGHT = 3.0;
const SEEK_WEIGHT = 2.0;
const ARRIVE_WEIGHT = 2.0;

/**
 * Base class for NPC states with common functionality
 */
abstract class NPCState extends State {
    protected separationBehavior: SeparationBehavior | null = null;

    /**
     * Add separation behavior (common to most states)
     */
    protected addSeparation(vehicle: NPCVehicle): void {
        this.separationBehavior = new SeparationBehavior();
        this.separationBehavior.weight = SEPARATION_WEIGHT;
        vehicle.steering.add(this.separationBehavior);
    }

    /**
     * Remove separation behavior
     */
    protected removeSeparation(vehicle: NPCVehicle): void {
        if (this.separationBehavior) {
            vehicle.steering.remove(this.separationBehavior);
            this.separationBehavior = null;
        }
    }

    /**
     * Sync state back to Miniplex entity
     */
    protected syncState(vehicle: NPCVehicle, state: string): void {
        if (vehicle.miniplexEntity?.species) {
            vehicle.miniplexEntity.species.state = state as 'idle' | 'walk' | 'run' | 'flee' | 'chase' | 'attack' | 'dead';
        }
    }
}

/**
 * Idle State - NPC stands still
 */
export class IdleState extends NPCState {
    private idleTimer = 0;
    private idleDuration = 2; // seconds before transitioning to wander

    enter(vehicle: NPCVehicle): void {
        this.idleTimer = 0;
        this.idleDuration = 1 + Math.random() * 3; // 1-4 seconds
        
        // Clear all steering behaviors
        vehicle.steering.clear();
        
        // Add separation to avoid crowding
        this.addSeparation(vehicle);
        
        this.syncState(vehicle, 'idle');
    }

    execute(vehicle: NPCVehicle): void {
        const entity = vehicle.miniplexEntity;
        if (!entity?.species || !entity?.steering) return;

        // Check for threats/targets
        const manager = getYukaManager();
        
        if (entity.species.type === 'prey') {
            // Prey checks for predators
            const predator = manager.findNearestVehicle(vehicle.position, 'predator');
            if (predator) {
                const distSq = vehicle.position.squaredDistanceTo(predator.position);
                if (distSq < entity.steering.awarenessRadius * entity.steering.awarenessRadius) {
                    entity.steering.target = predator.miniplexEntity?.id ?? null;
                    vehicle.stateMachine?.changeTo(STATE_FLEE);
                    return;
                }
            }
        } else if (entity.species.type === 'predator') {
            // Predator checks for prey
            const prey = manager.findNearestVehicle(vehicle.position, 'prey');
            if (prey) {
                const distSq = vehicle.position.squaredDistanceTo(prey.position);
                if (distSq < entity.steering.awarenessRadius * entity.steering.awarenessRadius) {
                    entity.steering.target = prey.miniplexEntity?.id ?? null;
                    vehicle.stateMachine?.changeTo(STATE_CHASE);
                    return;
                }
            }
        }

        // Transition to wander after idle duration
        this.idleTimer += 1 / 60; // Approximate delta
        if (this.idleTimer >= this.idleDuration) {
            vehicle.stateMachine?.changeTo(STATE_WANDER);
        }
    }

    exit(vehicle: NPCVehicle): void {
        this.removeSeparation(vehicle);
    }
}

/**
 * Wander State - NPC moves randomly
 */
export class WanderState extends NPCState {
    private wanderBehavior: WanderBehavior | null = null;
    private wanderTimer = 0;
    private wanderDuration = 5;

    enter(vehicle: NPCVehicle): void {
        this.wanderTimer = 0;
        this.wanderDuration = 3 + Math.random() * 4; // 3-7 seconds
        
        // Clear steering and add wander
        vehicle.steering.clear();
        
        // Add wander behavior
        this.wanderBehavior = new WanderBehavior(
            1.5,  // radius - size of wander circle
            3,    // distance - how far ahead the circle is projected
            2     // jitter - randomness per frame
        );
        this.wanderBehavior.weight = WANDER_WEIGHT;
        vehicle.steering.add(this.wanderBehavior);
        
        // Add separation
        this.addSeparation(vehicle);
        
        this.syncState(vehicle, 'walk');
    }

    execute(vehicle: NPCVehicle): void {
        const entity = vehicle.miniplexEntity;
        if (!entity?.species || !entity?.steering) return;

        const manager = getYukaManager();
        
        // Check for threats/targets
        if (entity.species.type === 'prey') {
            const predator = manager.findNearestVehicle(vehicle.position, 'predator');
            if (predator) {
                const distSq = vehicle.position.squaredDistanceTo(predator.position);
                if (distSq < entity.steering.awarenessRadius * entity.steering.awarenessRadius) {
                    entity.steering.target = predator.miniplexEntity?.id ?? null;
                    vehicle.stateMachine?.changeTo(STATE_FLEE);
                    return;
                }
            }
        } else if (entity.species.type === 'predator') {
            const prey = manager.findNearestVehicle(vehicle.position, 'prey');
            if (prey) {
                const distSq = vehicle.position.squaredDistanceTo(prey.position);
                if (distSq < entity.steering.awarenessRadius * entity.steering.awarenessRadius) {
                    entity.steering.target = prey.miniplexEntity?.id ?? null;
                    vehicle.stateMachine?.changeTo(STATE_CHASE);
                    return;
                }
            }
        }

        // Return to idle after wandering
        this.wanderTimer += 1 / 60;
        if (this.wanderTimer >= this.wanderDuration) {
            vehicle.stateMachine?.changeTo(STATE_IDLE);
        }
    }

    exit(vehicle: NPCVehicle): void {
        if (this.wanderBehavior) {
            vehicle.steering.remove(this.wanderBehavior);
            this.wanderBehavior = null;
        }
        this.removeSeparation(vehicle);
    }
}

/**
 * Flee State - Prey flees from predator
 */
export class FleeState extends NPCState {
    private fleeBehavior: FleeBehavior | null = null;
    private threatPosition: YukaVector3 = new YukaVector3();
    private fleeTimer = 0;
    private maxFleeDuration = 10; // Max time to flee before calming down

    enter(vehicle: NPCVehicle): void {
        this.fleeTimer = 0;
        
        // Get threat position
        const entity = vehicle.miniplexEntity;
        const targetId = entity?.steering?.target;
        if (targetId !== null && targetId !== undefined) {
            const targetVehicle = getYukaManager().getVehicle(targetId);
            if (targetVehicle) {
                this.threatPosition.copy(targetVehicle.position);
            }
        }
        
        // Clear steering and add flee
        vehicle.steering.clear();
        
        // Add flee behavior
        this.fleeBehavior = new FleeBehavior(
            this.threatPosition,
            entity?.steering?.awarenessRadius ?? 15 // Panic distance
        );
        this.fleeBehavior.weight = FLEE_WEIGHT;
        vehicle.steering.add(this.fleeBehavior);
        
        // Increase speed while fleeing
        vehicle.maxSpeed = (entity?.species?.speed ?? 4) * 1.5;
        
        this.syncState(vehicle, 'flee');
    }

    execute(vehicle: NPCVehicle): void {
        const entity = vehicle.miniplexEntity;
        if (!entity?.steering) return;

        // Update threat position if target still exists
        if (entity.steering.target !== null) {
            const targetVehicle = getYukaManager().getVehicle(entity.steering.target);
            if (targetVehicle) {
                this.threatPosition.copy(targetVehicle.position);
                
                // Check if we're far enough away
                const distSq = vehicle.position.squaredDistanceTo(targetVehicle.position);
                const safeDistance = (entity.steering.awarenessRadius ?? 15) * 2;
                
                if (distSq > safeDistance * safeDistance) {
                    // We've escaped!
                    entity.steering.target = null;
                    vehicle.stateMachine?.changeTo(STATE_IDLE);
                    return;
                }
            } else {
                // Threat is gone
                entity.steering.target = null;
                vehicle.stateMachine?.changeTo(STATE_IDLE);
                return;
            }
        }

        // Don't flee forever
        this.fleeTimer += 1 / 60;
        if (this.fleeTimer >= this.maxFleeDuration) {
            entity.steering.target = null;
            vehicle.stateMachine?.changeTo(STATE_IDLE);
        }
    }

    exit(vehicle: NPCVehicle): void {
        if (this.fleeBehavior) {
            vehicle.steering.remove(this.fleeBehavior);
            this.fleeBehavior = null;
        }
        
        // Restore normal speed
        const entity = vehicle.miniplexEntity;
        vehicle.maxSpeed = entity?.species?.speed ?? 4;
    }
}

/**
 * Chase State - Predator chases prey
 */
export class ChaseState extends NPCState {
    private seekBehavior: SeekBehavior | null = null;
    private targetPosition: YukaVector3 = new YukaVector3();
    private chaseTimer = 0;
    private maxChaseDuration = 15; // Max time to chase before giving up

    enter(vehicle: NPCVehicle): void {
        this.chaseTimer = 0;
        
        // Get target position
        const entity = vehicle.miniplexEntity;
        const targetId = entity?.steering?.target;
        if (targetId !== null && targetId !== undefined) {
            const targetVehicle = getYukaManager().getVehicle(targetId);
            if (targetVehicle) {
                this.targetPosition.copy(targetVehicle.position);
            }
        }
        
        // Clear steering and add seek
        vehicle.steering.clear();
        
        // Add seek behavior
        this.seekBehavior = new SeekBehavior(this.targetPosition);
        this.seekBehavior.weight = SEEK_WEIGHT;
        vehicle.steering.add(this.seekBehavior);
        
        // Increase speed while chasing
        vehicle.maxSpeed = (entity?.species?.speed ?? 4) * 1.5;
        
        this.syncState(vehicle, 'chase');
    }

    execute(vehicle: NPCVehicle): void {
        const entity = vehicle.miniplexEntity;
        if (!entity?.steering) return;

        // Update target position
        if (entity.steering.target !== null) {
            const targetVehicle = getYukaManager().getVehicle(entity.steering.target);
            if (targetVehicle && targetVehicle.miniplexEntity?.species?.state !== 'dead') {
                this.targetPosition.copy(targetVehicle.position);
                
                // Check distance
                const distSq = vehicle.position.squaredDistanceTo(targetVehicle.position);
                
                // Attack range
                if (distSq < 2.25) { // 1.5^2
                    vehicle.stateMachine?.changeTo(STATE_ATTACK);
                    return;
                }
                
                // Lost target (too far)
                const lostDistance = (entity.steering.awarenessRadius ?? 15) * 2;
                if (distSq > lostDistance * lostDistance) {
                    entity.steering.target = null;
                    vehicle.stateMachine?.changeTo(STATE_IDLE);
                    return;
                }
            } else {
                // Target is gone or dead
                entity.steering.target = null;
                vehicle.stateMachine?.changeTo(STATE_IDLE);
                return;
            }
        }

        // Give up after max chase time
        this.chaseTimer += 1 / 60;
        if (this.chaseTimer >= this.maxChaseDuration) {
            entity.steering.target = null;
            vehicle.stateMachine?.changeTo(STATE_IDLE);
        }
    }

    exit(vehicle: NPCVehicle): void {
        if (this.seekBehavior) {
            vehicle.steering.remove(this.seekBehavior);
            this.seekBehavior = null;
        }
        
        // Restore normal speed
        const entity = vehicle.miniplexEntity;
        vehicle.maxSpeed = entity?.species?.speed ?? 4;
    }
}

/**
 * Attack State - Predator attacks prey
 */
export class AttackState extends NPCState {
    private arriveBehavior: ArriveBehavior | null = null;
    private targetPosition: YukaVector3 = new YukaVector3();
    private attackCooldown = 0;
    private readonly ATTACK_INTERVAL = 1.0; // seconds between attacks
    private readonly ATTACK_DAMAGE = 10;

    enter(vehicle: NPCVehicle): void {
        this.attackCooldown = 0;
        
        // Get target position
        const entity = vehicle.miniplexEntity;
        const targetId = entity?.steering?.target;
        if (targetId !== null && targetId !== undefined) {
            const targetVehicle = getYukaManager().getVehicle(targetId);
            if (targetVehicle) {
                this.targetPosition.copy(targetVehicle.position);
            }
        }
        
        // Use arrive behavior to stop at target
        vehicle.steering.clear();
        
        this.arriveBehavior = new ArriveBehavior(this.targetPosition, 1.5, 0.5);
        this.arriveBehavior.weight = ARRIVE_WEIGHT;
        vehicle.steering.add(this.arriveBehavior);
        
        // Slow down during attack
        vehicle.maxSpeed = (entity?.species?.speed ?? 4) * 0.5;
        
        this.syncState(vehicle, 'attack');
    }

    execute(vehicle: NPCVehicle): void {
        const entity = vehicle.miniplexEntity;
        if (!entity?.steering || !entity?.species) return;

        // Update target position and deal damage
        if (entity.steering.target !== null) {
            const targetVehicle = getYukaManager().getVehicle(entity.steering.target);
            if (targetVehicle && targetVehicle.miniplexEntity?.species) {
                const targetEntity = targetVehicle.miniplexEntity;
                this.targetPosition.copy(targetVehicle.position);
                
                const distSq = vehicle.position.squaredDistanceTo(targetVehicle.position);
                
                // Still in attack range
                if (distSq < 2.25) {
                    this.attackCooldown += 1 / 60;
                    
                    if (this.attackCooldown >= this.ATTACK_INTERVAL) {
                        this.attackCooldown = 0;
                        
                        // Deal damage
                        if (targetEntity.species) {
                            targetEntity.species.health = Math.max(
                                0,
                                targetEntity.species.health - this.ATTACK_DAMAGE
                            );
                            
                            // Target died
                            if (targetEntity.species.health <= 0) {
                                targetEntity.species.state = 'dead';
                                entity.steering.target = null;
                                vehicle.stateMachine?.changeTo(STATE_IDLE);
                                return;
                            }
                        }
                    }
                } else {
                    // Target escaped, resume chase
                    vehicle.stateMachine?.changeTo(STATE_CHASE);
                    return;
                }
            } else {
                // Target gone
                entity.steering.target = null;
                vehicle.stateMachine?.changeTo(STATE_IDLE);
                return;
            }
        } else {
            vehicle.stateMachine?.changeTo(STATE_IDLE);
        }
    }

    exit(vehicle: NPCVehicle): void {
        if (this.arriveBehavior) {
            vehicle.steering.remove(this.arriveBehavior);
            this.arriveBehavior = null;
        }
        
        // Restore normal speed
        const entity = vehicle.miniplexEntity;
        vehicle.maxSpeed = entity?.species?.speed ?? 4;
    }
}
