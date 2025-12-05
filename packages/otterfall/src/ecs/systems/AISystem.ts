/**
 * AISystem - Production-quality AI using Yuka library
 * 
 * This system provides:
 * - Battle-tested steering behaviors (Wander, Seek, Flee, Separation, ObstacleAvoidance)
 * - State machine with proper enter/execute/exit lifecycle
 * - CellSpacePartitioning for efficient neighbor queries
 * - Proper integration with Miniplex ECS
 * 
 * @see https://github.com/Mugen87/yuka
 */

import { StateMachine } from 'yuka';
import * as THREE from 'three';
import { world } from '../world';
import {
    getYukaManager,
    initYukaManager,
    disposeYukaManager,
    NPCVehicle,
} from './ai/YukaManager';
import {
    IdleState,
    WanderState,
    FleeState,
    ChaseState,
    AttackState,
    STATE_IDLE,
    STATE_WANDER,
    STATE_FLEE,
    STATE_CHASE,
    STATE_ATTACK,
} from './ai/states';

// Rate limiting - AI doesn't need to run every frame
const AI_UPDATE_RATE = 20; // Hz
const AI_UPDATE_INTERVAL = 1 / AI_UPDATE_RATE;
let aiAccumulator = 0;
let initialized = false;

/**
 * Set up the state machine for an NPC vehicle
 */
function setupStateMachine(vehicle: NPCVehicle): void {
    const stateMachine = new StateMachine(vehicle);
    
    // Register all states
    stateMachine.add(STATE_IDLE, new IdleState());
    stateMachine.add(STATE_WANDER, new WanderState());
    stateMachine.add(STATE_FLEE, new FleeState());
    stateMachine.add(STATE_CHASE, new ChaseState());
    stateMachine.add(STATE_ATTACK, new AttackState());
    
    // Start in idle state
    stateMachine.changeTo(STATE_IDLE);
    
    vehicle.stateMachine = stateMachine;
}

/**
 * Add obstacle avoidance behavior to a vehicle
 * Note: This is called after initial state machine setup, so behaviors
 * will be added/removed by state transitions. We store obstacles for later use.
 */
function addObstacleAvoidance(_vehicle: NPCVehicle): void {
    // Obstacle avoidance is managed by the state machine
    // The YukaManager stores obstacles that states can access
    // This function is a placeholder for future obstacle registration
}

/**
 * Register all existing NPCs with Yuka
 */
function registerExistingNPCs(): void {
    const manager = getYukaManager();
    
    for (const entity of world.with('isNPC', 'transform', 'movement', 'species', 'steering')) {
        const vehicle = manager.registerNPC(entity, setupStateMachine);
        if (vehicle) {
            addObstacleAvoidance(vehicle);
        }
    }
}

/**
 * Check for new NPCs that need to be registered
 */
function registerNewNPCs(): void {
    const manager = getYukaManager();
    
    for (const entity of world.with('isNPC', 'transform', 'movement', 'species', 'steering')) {
        if (entity.id && !manager.getVehicle(entity.id)) {
            const vehicle = manager.registerNPC(entity, setupStateMachine);
            if (vehicle) {
                addObstacleAvoidance(vehicle);
            }
        }
    }
}

/**
 * Main AI system update function
 */
export function AISystem(delta: number): void {
    // Rate limiting - accumulate time
    aiAccumulator += delta;
    
    if (aiAccumulator < AI_UPDATE_INTERVAL) {
        return; // Skip this frame
    }
    
    // Initialize on first run
    if (!initialized) {
        initYukaManager();
        registerExistingNPCs();
        initialized = true;
    }
    
    // Register any new NPCs added since last frame
    registerNewNPCs();
    
    // Update Yuka (handles all steering behaviors and state machines)
    const manager = getYukaManager();
    manager.update(AI_UPDATE_INTERVAL);
    
    // Sync Yuka positions back to Miniplex entities
    manager.syncToMiniplex();
    
    // Reset accumulator (consume one interval)
    aiAccumulator -= AI_UPDATE_INTERVAL;
}

/**
 * Initialize the AI system (call once at startup)
 */
export function initAISystem(): void {
    if (!initialized) {
        initYukaManager();
        registerExistingNPCs();
        initialized = true;
    }
}

/**
 * Dispose of the AI system and all resources
 */
export function disposeAISystem(): void {
    disposeYukaManager();
    initialized = false;
    aiAccumulator = 0;
}

/**
 * Register an obstacle for avoidance (e.g., rocks, trees)
 */
export function registerObstacle(
    position: { x: number; y: number; z: number },
    radius: number
): void {
    const manager = getYukaManager();
    const threePos = new THREE.Vector3(position.x, position.y, position.z);
    manager.registerObstacle(threePos, radius);
}

/**
 * Clear all obstacles
 */
export function clearObstacles(): void {
    getYukaManager().clearObstacles();
}

// Re-export for use by other systems
export { getYukaManager, NPCVehicle } from './ai/YukaManager';
