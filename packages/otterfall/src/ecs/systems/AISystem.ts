import * as THREE from 'three';
import { Entity } from '../components';
import { world } from '../world';

const WANDER_CHANGE_INTERVAL = 3; // seconds
const SEPARATION_RADIUS = 2.0;
const AI_UPDATE_RATE = 20; // Hz - already limits calculations to every ~3 frames
const AI_UPDATE_INTERVAL = 1 / AI_UPDATE_RATE;
const GRID_CELL_SIZE = 10; // Spatial partitioning grid size for O(1) neighbor lookups

// Performance optimization state
let aiAccumulator = 0;
const spatialGrid = new Map<string, Entity[]>();

export function AISystem(delta: number) {
    // Update at 20Hz instead of 60Hz
    aiAccumulator += delta;
    
    if (aiAccumulator < AI_UPDATE_INTERVAL) {
        return; // Skip this frame
    }
    
    aiAccumulator -= AI_UPDATE_INTERVAL;
    frameCount++;
    
    // Rebuild spatial grid
    buildSpatialGrid();
    
    // Update all NPCs
    for (const entity of world.with('isNPC', 'transform', 'movement', 'species', 'steering')) {
        updateNPCBehavior(entity, AI_UPDATE_INTERVAL);
    }
    
    // Clean old cache entries
    if (frameCount % 10 === 0) {
        cleanSteeringCache();
    }
}

function updateNPCBehavior(entity: Entity, delta: number) {
    const { transform, movement, species, steering } = entity;
    if (!transform || !movement || !species || !steering) return;

    // Update wander timer
    steering.wanderTimer -= delta;
    if (steering.wanderTimer <= 0) {
        steering.wanderTimer = WANDER_CHANGE_INTERVAL + Math.random() * 2;
        steering.wanderAngle = Math.random() * Math.PI * 2;
    }

    // Detect threats/targets
    const nearbyEntities = getNearbyEntities(entity, steering.awarenessRadius);

    // State machine
    switch (species.state) {
        case 'idle':
        case 'walk':
            // Check for threats (if prey) or targets (if predator)
            if (species.type === 'prey') {
                const threat = findNearestPredator(nearbyEntities);
                if (threat) {
                    species.state = 'flee';
                    steering.target = threat.id ?? null;
                } else {
                    // Wander
                    applyWanderBehavior(entity, steering);
                    species.state = 'walk';
                }
            } else if (species.type === 'predator') {
                const target = findNearestPrey(nearbyEntities);
                if (target) {
                    species.state = 'chase';
                    steering.target = target.id ?? null;
                } else {
                    // Wander
                    applyWanderBehavior(entity, steering);
                    species.state = 'walk';
                }
            }
            break;

        case 'flee':
            if (steering.target !== null) {
                const threat = world.entity(steering.target);
                if (threat && threat.transform) {
                    applyFleeBehavior(entity, threat.transform.position);
                } else {
                    // Threat gone
                    species.state = 'idle';
                    steering.target = null;
                }
            }
            break;

        case 'chase':
            if (steering.target !== null) {
                const target = world.entity(steering.target);
                if (target && target.transform) {
                    const distance = transform.position.distanceTo(target.transform.position);
                    if (distance < 1.5) {
                        // Attack range
                        species.state = 'attack';
                    } else if (distance > steering.awarenessRadius * 1.5) {
                        // Lost target
                        species.state = 'idle';
                        steering.target = null;
                    } else {
                        applySeekBehavior(entity, target.transform.position);
                    }
                } else {
                    // Target gone
                    species.state = 'idle';
                    steering.target = null;
                }
            }
            break;

        case 'attack':
            // Attack animation/logic would go here
            // For now, just return to chase
            species.state = 'chase';
            break;
    }

    // Apply separation from nearby NPCs
    applySeparation(entity, nearbyEntities);

    // Apply obstacle avoidance (rocks)
    // TODO: Implement when rock data is accessible

    // Update velocity based on state
    const maxSpeed = species.state === 'run' || species.state === 'flee' || species.state === 'chase'
        ? species.speed * 1.5
        : species.speed;

    movement.velocity.clampLength(0, maxSpeed);

    // Update position
    transform.position.add(movement.velocity.clone().multiplyScalar(delta));

    // Update rotation to face movement direction
    if (movement.velocity.lengthSq() > 0.01) {
        const angle = Math.atan2(movement.velocity.x, movement.velocity.z);
        transform.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    }
}

function applyWanderBehavior(entity: Entity, steering: any) {
    const { movement } = entity;
    if (!movement) return;

    const wanderForce = new THREE.Vector3(
        Math.cos(steering.wanderAngle),
        0,
        Math.sin(steering.wanderAngle)
    ).multiplyScalar(0.5);

    movement.acceleration.add(wanderForce);
}

function applySeekBehavior(entity: Entity, targetPos: THREE.Vector3) {
    const { transform, movement } = entity;
    if (!transform || !movement) return;

    const desired = targetPos.clone().sub(transform.position).normalize();
    const steer = desired.sub(movement.velocity).clampLength(0, 0.1);
    movement.acceleration.add(steer);
}

function applyFleeBehavior(entity: Entity, threatPos: THREE.Vector3) {
    const { transform, movement } = entity;
    if (!transform || !movement) return;

    const desired = transform.position.clone().sub(threatPos).normalize();
    const steer = desired.sub(movement.velocity).clampLength(0, 0.1);
    movement.acceleration.add(steer);
}

function applySeparation(entity: Entity, nearbyEntities: Entity[]) {
    const { transform, movement } = entity;
    if (!transform || !movement) return;

    const separationForce = new THREE.Vector3();
    let count = 0;

    for (const other of nearbyEntities) {
        if (other.id === entity.id || !other.transform) continue;

        const distance = transform.position.distanceTo(other.transform.position);
        if (distance < SEPARATION_RADIUS && distance > 0) {
            const diff = transform.position.clone().sub(other.transform.position);
            diff.normalize().divideScalar(distance); // Weight by distance
            separationForce.add(diff);
            count++;
        }
    }

    if (count > 0) {
        separationForce.divideScalar(count);
        separationForce.normalize().multiplyScalar(0.05);
        movement.acceleration.add(separationForce);
    }
}

function buildSpatialGrid() {
    spatialGrid.clear();
    
    for (const entity of world.with('transform')) {
        if (!entity.transform) continue;
        
        const cellKey = getCellKey(entity.transform.position);
        if (!spatialGrid.has(cellKey)) {
            spatialGrid.set(cellKey, []);
        }
        spatialGrid.get(cellKey)!.push(entity);
    }
}

function getCellKey(position: THREE.Vector3): string {
    const x = Math.floor(position.x / GRID_CELL_SIZE);
    const z = Math.floor(position.z / GRID_CELL_SIZE);
    return `${x},${z}`;
}

function getNearbyCells(position: THREE.Vector3): string[] {
    const x = Math.floor(position.x / GRID_CELL_SIZE);
    const z = Math.floor(position.z / GRID_CELL_SIZE);
    
    // Return current cell and 8 surrounding cells
    const cells: string[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            cells.push(`${x + dx},${z + dz}`);
        }
    }
    return cells;
}

function getNearbyEntities(entity: Entity, radius: number): Entity[] {
    const { transform } = entity;
    if (!transform) return [];

    const nearby: Entity[] = [];
    const searchRadius = radius * 2; // Search 2x awareness radius
    const cells = getNearbyCells(transform.position);
    
    for (const cellKey of cells) {
        const cellEntities = spatialGrid.get(cellKey);
        if (!cellEntities) continue;
        
        for (const other of cellEntities) {
            if (other.id === entity.id || !other.transform) continue;

            const distance = transform.position.distanceTo(other.transform.position);
            if (distance < searchRadius) {
                nearby.push(other);
            }
        }
    }

    return nearby;
}

function cleanSteeringCache() {
    const cutoffFrame = frameCount - CACHE_FRAMES;
    for (const [entityId, cache] of steeringCache.entries()) {
        if (cache.frame < cutoffFrame) {
            steeringCache.delete(entityId);
        }
    }
}

function findNearestPredator(entities: Entity[]): Entity | null {
    for (const entity of entities) {
        if (entity.species?.type === 'predator') {
            return entity;
        }
    }
    return null;
}

function findNearestPrey(entities: Entity[]): Entity | null {
    for (const entity of entities) {
        if (entity.species?.type === 'prey') {
            return entity;
        }
    }
    return null;
}
