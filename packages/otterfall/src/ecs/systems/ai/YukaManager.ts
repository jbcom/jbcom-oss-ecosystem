/**
 * YukaManager - Bridges Miniplex ECS entities with Yuka AI library
 * 
 * This module provides production-quality AI using Yuka's battle-tested:
 * - Vehicle class for physics-based movement
 * - Steering behaviors (Wander, Seek, Flee, Separation, ObstacleAvoidance)
 * - State machine with proper enter/execute/exit lifecycle
 * - CellSpacePartitioning for efficient neighbor queries
 */

import {
    EntityManager,
    Vehicle,
    Time,
    Vector3 as YukaVector3,
    CellSpacePartitioning,
    GameEntity,
    StateMachine,
} from 'yuka';
import * as THREE from 'three';
import { Entity } from '../../components';

// World dimensions for spatial partitioning
const WORLD_SIZE = 200; // meters
const CELLS_PER_AXIS = 10; // 10x10x10 grid = 20m cells

/**
 * NPCVehicle extends Yuka's Vehicle to store a reference to the Miniplex entity
 * and includes a state machine for AI decision making.
 */
export class NPCVehicle extends Vehicle {
    public miniplexEntity: Entity | null = null;
    public entityType: 'predator' | 'prey' | 'player' = 'prey';
    public stateMachine: StateMachine | null = null;

    constructor() {
        super();
        this.updateNeighborhood = true; // Enable neighbor tracking for separation
    }

    /**
     * Override update to also update the state machine
     */
    update(delta: number): this {
        // Update state machine first (handles behavior changes)
        if (this.stateMachine) {
            this.stateMachine.update();
        }
        
        // Then update vehicle physics
        return super.update(delta);
    }
}

/**
 * ObstacleEntity represents static obstacles (rocks, trees) for avoidance
 */
export class ObstacleEntity extends GameEntity {
    constructor() {
        super();
    }

    /**
     * Initialize obstacle with position and radius
     */
    init(position: THREE.Vector3, radius: number): this {
        this.position.set(position.x, position.y, position.z);
        this.boundingRadius = radius;
        return this;
    }
}

/**
 * YukaManager singleton that manages all AI entities
 */
class YukaManagerClass {
    private entityManager: EntityManager;
    private time: Time;
    private spatialIndex: CellSpacePartitioning;
    private vehicleMap: Map<number, NPCVehicle> = new Map(); // Miniplex entity ID -> NPCVehicle
    private obstacles: ObstacleEntity[] = [];
    private initialized = false;

    constructor() {
        this.entityManager = new EntityManager();
        this.time = new Time();
        
        // Create spatial index centered at origin
        // Width, Height, Depth, CellsX, CellsY, CellsZ
        this.spatialIndex = new CellSpacePartitioning(
            WORLD_SIZE, 
            50, // Height (mostly 2D game)
            WORLD_SIZE,
            CELLS_PER_AXIS,
            1, // Single layer for Y (2D game)
            CELLS_PER_AXIS
        );
        
        this.entityManager.spatialIndex = this.spatialIndex;
    }

    /**
     * Initialize the Yuka manager
     */
    init(): void {
        if (this.initialized) return;
        this.initialized = true;
    }

    /**
     * Register an NPC entity with Yuka
     * @param entity The Miniplex entity to register
     * @param setupStateMachine Callback to set up the state machine (injected to avoid circular deps)
     */
    registerNPC(
        entity: Entity,
        setupStateMachine?: (vehicle: NPCVehicle) => void
    ): NPCVehicle | null {
        if (!entity.id || !entity.transform || !entity.species || !entity.steering) {
            return null;
        }

        // Check if already registered
        if (this.vehicleMap.has(entity.id)) {
            return this.vehicleMap.get(entity.id)!;
        }

        const vehicle = new NPCVehicle();
        vehicle.miniplexEntity = entity;
        vehicle.entityType = entity.species.type;

        // Set position from Miniplex entity
        vehicle.position.set(
            entity.transform.position.x,
            entity.transform.position.y,
            entity.transform.position.z
        );

        // Configure vehicle physics based on species
        vehicle.maxSpeed = entity.species.speed;
        vehicle.maxForce = entity.species.speed * 2; // Force proportional to speed
        vehicle.mass = 1;
        vehicle.boundingRadius = 0.5; // Default bounding radius

        // Set neighborhood radius for separation behavior
        vehicle.neighborhoodRadius = entity.steering.awarenessRadius;

        // Set up state machine if callback provided
        if (setupStateMachine) {
            setupStateMachine(vehicle);
        }

        // Add to Yuka's entity manager
        this.entityManager.add(vehicle);
        this.vehicleMap.set(entity.id, vehicle);

        return vehicle;
    }

    /**
     * Unregister an NPC entity from Yuka
     */
    unregisterNPC(entityId: number): void {
        const vehicle = this.vehicleMap.get(entityId);
        if (vehicle) {
            this.entityManager.remove(vehicle);
            this.vehicleMap.delete(entityId);
        }
    }

    /**
     * Get the Yuka vehicle for a Miniplex entity
     */
    getVehicle(entityId: number): NPCVehicle | undefined {
        return this.vehicleMap.get(entityId);
    }

    /**
     * Register an obstacle for avoidance
     */
    registerObstacle(position: THREE.Vector3, radius: number): ObstacleEntity {
        const obstacle = new ObstacleEntity();
        obstacle.init(position, radius);
        this.entityManager.add(obstacle);
        this.obstacles.push(obstacle);
        return obstacle;
    }

    /**
     * Get all registered obstacles
     */
    getObstacles(): ObstacleEntity[] {
        return this.obstacles;
    }

    /**
     * Clear all obstacles
     */
    clearObstacles(): void {
        for (const obstacle of this.obstacles) {
            this.entityManager.remove(obstacle);
        }
        this.obstacles = [];
    }

    /**
     * Update all Yuka entities - called from AISystem
     */
    update(delta: number): void {
        // Update Yuka time (converts seconds to Yuka's internal time format)
        this.time._previousTime = this.time._currentTime;
        this.time._currentTime += delta * 1000; // Yuka uses milliseconds internally

        // Update all entities via Yuka's EntityManager
        this.entityManager.update(delta);
    }

    /**
     * Sync Yuka vehicle positions back to Miniplex entities
     */
    syncToMiniplex(): void {
        for (const vehicle of this.vehicleMap.values()) {
            const entity = vehicle.miniplexEntity;
            if (!entity || !entity.transform || !entity.movement) continue;

            // Update position
            entity.transform.position.set(
                vehicle.position.x,
                vehicle.position.y,
                vehicle.position.z
            );

            // Update velocity
            entity.movement.velocity.set(
                vehicle.velocity.x,
                vehicle.velocity.y,
                vehicle.velocity.z
            );

            // Update rotation to face movement direction
            if (vehicle.velocity.squaredLength() > 0.01) {
                const angle = Math.atan2(vehicle.velocity.x, vehicle.velocity.z);
                entity.transform.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            }
        }
    }

    /**
     * Find nearby vehicles of a specific type
     */
    findNearbyVehicles(
        position: YukaVector3 | THREE.Vector3,
        radius: number,
        type?: 'predator' | 'prey' | 'player'
    ): NPCVehicle[] {
        const result: NPCVehicle[] = [];
        
        for (const vehicle of this.vehicleMap.values()) {
            if (type && vehicle.entityType !== type) continue;
            
            const dx = vehicle.position.x - position.x;
            const posY = 'y' in position ? position.y : 0;
            const dy = vehicle.position.y - posY;
            const dz = vehicle.position.z - position.z;
            const distSq = dx * dx + dy * dy + dz * dz;
            
            if (distSq <= radius * radius) {
                result.push(vehicle);
            }
        }
        
        return result;
    }

    /**
     * Find the nearest vehicle of a specific type
     */
    findNearestVehicle(
        position: YukaVector3 | THREE.Vector3,
        type: 'predator' | 'prey' | 'player'
    ): NPCVehicle | null {
        let nearest: NPCVehicle | null = null;
        let nearestDistSq = Infinity;
        
        for (const vehicle of this.vehicleMap.values()) {
            if (vehicle.entityType !== type) continue;
            
            const dx = vehicle.position.x - position.x;
            const dz = vehicle.position.z - position.z;
            const distSq = dx * dx + dz * dz;
            
            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearest = vehicle;
            }
        }
        
        return nearest;
    }

    /**
     * Get the Yuka EntityManager for advanced usage
     */
    getEntityManager(): EntityManager {
        return this.entityManager;
    }

    /**
     * Dispose of all resources
     */
    dispose(): void {
        this.entityManager.clear();
        this.vehicleMap.clear();
        this.obstacles = [];
        this.initialized = false;
    }
}

// Singleton instance
let yukaManagerInstance: YukaManagerClass | null = null;

/**
 * Get the YukaManager singleton
 */
export function getYukaManager(): YukaManagerClass {
    if (!yukaManagerInstance) {
        yukaManagerInstance = new YukaManagerClass();
    }
    return yukaManagerInstance;
}

/**
 * Initialize the YukaManager
 */
export function initYukaManager(): void {
    getYukaManager().init();
}

/**
 * Dispose of the YukaManager
 */
export function disposeYukaManager(): void {
    if (yukaManagerInstance) {
        yukaManagerInstance.dispose();
        yukaManagerInstance = null;
    }
}
