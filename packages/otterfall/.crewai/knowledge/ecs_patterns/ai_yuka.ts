/**
 * AI System Patterns with Yuka.js - Rivermarsh/Otterfall
 *
 * Yuka.js provides professional game AI including:
 * - Steering behaviors (seek, flee, wander, pursue, evade, separate)
 * - State machines for complex behavior logic
 * - Entity management with Time/Vehicle abstractions
 *
 * Pattern: Each NPC has a paired Yuka Vehicle that syncs with ECS Transform
 */

import { Vector3 } from 'three';
import {
    EntityManager,
    Vehicle,
    SeekBehavior,
    FleeBehavior,
    WanderBehavior,
    SeparationBehavior,
    ObstacleAvoidanceBehavior,
    StateMachine,
    State,
} from 'yuka';
import { Entity } from '../otterfall_patterns/components';

// ============================================================================
// YUKA ENTITY MANAGER SETUP
// ============================================================================

/**
 * Create the Yuka EntityManager for managing all AI vehicles
 *
 * Usage: Call entityManager.update(deltaTime) each frame
 */
export function createYukaEntityManager(): EntityManager {
    const manager = new EntityManager();
    return manager;
}

// ============================================================================
// VEHICLE CREATION
// ============================================================================

/**
 * Create a Yuka Vehicle paired with an ECS entity
 *
 * @param entity - The ECS entity with transform and species components
 * @returns Yuka Vehicle configured for the entity
 */
export function createYukaVehicle(entity: Entity): Vehicle {
    const vehicle = new Vehicle();

    // Sync initial position from ECS
    if (entity.transform) {
        vehicle.position.set(
            entity.transform.position.x,
            entity.transform.position.y,
            entity.transform.position.z
        );
    }

    // Configure based on species
    if (entity.species) {
        // Max speed varies by state
        vehicle.maxSpeed = entity.movement?.maxSpeed || 5;

        // Turn rate for steering
        vehicle.maxTurnRate = Math.PI; // radians per second

        // Mass affects momentum
        vehicle.mass = entity.species.size === 'large' ? 2 : entity.species.size === 'small' ? 0.5 : 1;
    }

    return vehicle;
}

// ============================================================================
// STEERING BEHAVIORS
// ============================================================================

/**
 * Add wander behavior for idle/patrol state
 *
 * Entities will meander randomly when not actively chasing or fleeing
 */
export function addWanderBehavior(vehicle: Vehicle, weight: number = 1.0): WanderBehavior {
    const wander = new WanderBehavior();
    wander.weight = weight;
    wander.jitter = 20; // Random direction change intensity
    wander.radius = 5; // Circle radius for wander target
    wander.distance = 10; // Distance ahead for wander circle
    vehicle.steering.add(wander);
    return wander;
}

/**
 * Add seek behavior for chasing a target
 *
 * Entity moves directly toward target position
 */
export function addSeekBehavior(vehicle: Vehicle, target: Vehicle, weight: number = 1.0): SeekBehavior {
    const seek = new SeekBehavior(target.position);
    seek.weight = weight;
    vehicle.steering.add(seek);
    return seek;
}

/**
 * Add flee behavior for escaping threats
 *
 * Entity moves directly away from threat position
 */
export function addFleeBehavior(vehicle: Vehicle, threat: Vehicle, panicDistance: number = 10): FleeBehavior {
    const flee = new FleeBehavior(threat.position);
    flee.weight = 2.0; // High priority when fleeing
    flee.panicDistance = panicDistance;
    vehicle.steering.add(flee);
    return flee;
}

/**
 * Add separation behavior to prevent clustering
 *
 * Entities maintain distance from nearby entities of same type
 */
export function addSeparationBehavior(vehicle: Vehicle, neighbors: Vehicle[], weight: number = 0.5): SeparationBehavior {
    const separation = new SeparationBehavior();
    separation.weight = weight;
    // Note: Yuka handles neighbor detection internally
    vehicle.steering.add(separation);
    return separation;
}

/**
 * Add obstacle avoidance for terrain/rocks
 */
export function addObstacleAvoidance(vehicle: Vehicle, obstacles: any[]): ObstacleAvoidanceBehavior {
    const avoidance = new ObstacleAvoidanceBehavior(obstacles);
    avoidance.weight = 1.5; // High priority
    avoidance.dBoxMinLength = 3;
    vehicle.steering.add(avoidance);
    return avoidance;
}

// ============================================================================
// STATE MACHINE PATTERNS
// ============================================================================

/**
 * Base state class with common functionality
 */
abstract class NPCState extends State<Vehicle> {
    abstract name: string;

    enter(vehicle: Vehicle): void {
        console.log(`[${this.name}] Entering state`);
    }

    exit(vehicle: Vehicle): void {
        console.log(`[${this.name}] Exiting state`);
    }

    abstract execute(vehicle: Vehicle): void;
}

// ============================================================================
// PREDATOR STATE MACHINE
// ============================================================================

/**
 * Predator Idle State - Wander around territory
 */
class PredatorIdleState extends NPCState {
    name = 'idle';
    private wanderBehavior: WanderBehavior | null = null;

    enter(vehicle: Vehicle): void {
        super.enter(vehicle);
        vehicle.steering.clear();
        this.wanderBehavior = addWanderBehavior(vehicle, 1.0);
        vehicle.maxSpeed = 2; // Slow wander speed
    }

    execute(vehicle: Vehicle): void {
        // Check for nearby prey (handled by AI system)
    }

    exit(vehicle: Vehicle): void {
        super.exit(vehicle);
        if (this.wanderBehavior) {
            vehicle.steering.remove(this.wanderBehavior);
        }
    }
}

/**
 * Predator Chase State - Pursue detected prey
 */
class PredatorChaseState extends NPCState {
    name = 'chase';
    private target: Vehicle | null = null;
    private seekBehavior: SeekBehavior | null = null;

    setTarget(target: Vehicle): void {
        this.target = target;
    }

    enter(vehicle: Vehicle): void {
        super.enter(vehicle);
        vehicle.steering.clear();
        if (this.target) {
            this.seekBehavior = addSeekBehavior(vehicle, this.target, 1.5);
        }
        vehicle.maxSpeed = 8; // Fast chase speed
    }

    execute(vehicle: Vehicle): void {
        // Update seek target position (prey may be moving)
        if (this.target && this.seekBehavior) {
            this.seekBehavior.target = this.target.position;
        }
    }

    exit(vehicle: Vehicle): void {
        super.exit(vehicle);
        if (this.seekBehavior) {
            vehicle.steering.remove(this.seekBehavior);
        }
    }
}

/**
 * Predator Attack State - Close enough to attack
 */
class PredatorAttackState extends NPCState {
    name = 'attack';

    enter(vehicle: Vehicle): void {
        super.enter(vehicle);
        vehicle.steering.clear();
        vehicle.velocity.set(0, 0, 0); // Stop for attack
    }

    execute(vehicle: Vehicle): void {
        // Attack logic handled by combat system
    }
}

/**
 * Predator Eat State - Consuming killed prey
 */
class PredatorEatState extends NPCState {
    name = 'eat';
    private eatDuration = 10; // seconds
    private eatTimer = 0;

    enter(vehicle: Vehicle): void {
        super.enter(vehicle);
        vehicle.steering.clear();
        vehicle.velocity.set(0, 0, 0);
        this.eatTimer = 0;
    }

    execute(vehicle: Vehicle): void {
        this.eatTimer += 0.016; // Approximate delta
        // After eat duration, return to idle
    }
}

/**
 * Create predator state machine
 */
export function createPredatorStateMachine(vehicle: Vehicle): StateMachine<Vehicle> {
    const stateMachine = new StateMachine(vehicle);

    const idleState = new PredatorIdleState();
    const chaseState = new PredatorChaseState();
    const attackState = new PredatorAttackState();
    const eatState = new PredatorEatState();

    stateMachine.add('idle', idleState);
    stateMachine.add('chase', chaseState);
    stateMachine.add('attack', attackState);
    stateMachine.add('eat', eatState);

    // Start in idle
    stateMachine.changeTo('idle');

    return stateMachine;
}

// ============================================================================
// PREY STATE MACHINE
// ============================================================================

/**
 * Prey Graze State - Peaceful wandering/eating
 */
class PreyGrazeState extends NPCState {
    name = 'graze';
    private wanderBehavior: WanderBehavior | null = null;

    enter(vehicle: Vehicle): void {
        super.enter(vehicle);
        vehicle.steering.clear();
        this.wanderBehavior = addWanderBehavior(vehicle, 0.5);
        vehicle.maxSpeed = 1.5; // Very slow grazing
    }

    execute(vehicle: Vehicle): void {
        // Check for threats (handled by AI system)
    }

    exit(vehicle: Vehicle): void {
        super.exit(vehicle);
        if (this.wanderBehavior) {
            vehicle.steering.remove(this.wanderBehavior);
        }
    }
}

/**
 * Prey Alert State - Detected potential threat
 */
class PreyAlertState extends NPCState {
    name = 'alert';

    enter(vehicle: Vehicle): void {
        super.enter(vehicle);
        vehicle.steering.clear();
        vehicle.velocity.set(0, 0, 0); // Stop and look
    }

    execute(vehicle: Vehicle): void {
        // Assess threat, decide to flee or return to graze
    }
}

/**
 * Prey Flee State - Running from predator
 */
class PreyFleeState extends NPCState {
    name = 'flee';
    private threat: Vehicle | null = null;
    private fleeBehavior: FleeBehavior | null = null;

    setThreat(threat: Vehicle): void {
        this.threat = threat;
    }

    enter(vehicle: Vehicle): void {
        super.enter(vehicle);
        vehicle.steering.clear();
        if (this.threat) {
            this.fleeBehavior = addFleeBehavior(vehicle, this.threat, 25);
        }
        vehicle.maxSpeed = 10; // Maximum flee speed
    }

    execute(vehicle: Vehicle): void {
        // Update flee direction based on threat position
        if (this.threat && this.fleeBehavior) {
            this.fleeBehavior.target = this.threat.position;
        }
    }

    exit(vehicle: Vehicle): void {
        super.exit(vehicle);
        if (this.fleeBehavior) {
            vehicle.steering.remove(this.fleeBehavior);
        }
    }
}

/**
 * Create prey state machine
 */
export function createPreyStateMachine(vehicle: Vehicle): StateMachine<Vehicle> {
    const stateMachine = new StateMachine(vehicle);

    const grazeState = new PreyGrazeState();
    const alertState = new PreyAlertState();
    const fleeState = new PreyFleeState();

    stateMachine.add('graze', grazeState);
    stateMachine.add('alert', alertState);
    stateMachine.add('flee', fleeState);

    // Start grazing
    stateMachine.changeTo('graze');

    return stateMachine;
}

// ============================================================================
// AI SYSTEM INTEGRATION
// ============================================================================

/**
 * AI System - Updates all Yuka vehicles and syncs to ECS
 *
 * Call this system at priority 15 (after input, before movement)
 */
export function updateAISystem(
    entityManager: EntityManager,
    ecsEntities: Entity[],
    deltaTime: number
): void {
    // Update Yuka entity manager (runs steering behaviors)
    entityManager.update(deltaTime);

    // Sync Yuka positions back to ECS transforms
    for (const entity of ecsEntities) {
        if (entity.steering?.yukaVehicle && entity.transform) {
            const vehicle = entity.steering.yukaVehicle;

            // Copy Yuka position to ECS
            entity.transform.position.set(
                vehicle.position.x,
                vehicle.position.y,
                vehicle.position.z
            );

            // Copy Yuka velocity to ECS movement
            if (entity.movement) {
                entity.movement.velocity.set(
                    vehicle.velocity.x,
                    vehicle.velocity.y,
                    vehicle.velocity.z
                );
            }
        }
    }
}

// ============================================================================
// THREAT DETECTION HELPERS
// ============================================================================

/**
 * Check if a threat is within awareness radius
 */
export function isThreatInRange(
    entityPos: Vector3,
    threatPos: Vector3,
    awarenessRadius: number
): boolean {
    const dx = entityPos.x - threatPos.x;
    const dz = entityPos.z - threatPos.z;
    const distSq = dx * dx + dz * dz;
    return distSq <= awarenessRadius * awarenessRadius;
}

/**
 * Find nearest threat within range
 */
export function findNearestThreat(
    entityPos: Vector3,
    threats: { position: Vector3; entity: Entity }[],
    maxRange: number
): Entity | null {
    let nearest: Entity | null = null;
    let nearestDistSq = maxRange * maxRange;

    for (const threat of threats) {
        const dx = entityPos.x - threat.position.x;
        const dz = entityPos.z - threat.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < nearestDistSq) {
            nearestDistSq = distSq;
            nearest = threat.entity;
        }
    }

    return nearest;
}
