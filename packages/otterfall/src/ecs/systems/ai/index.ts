/**
 * AI System exports
 * 
 * This module provides production-quality AI using the Yuka library.
 */

export {
    getYukaManager,
    initYukaManager,
    disposeYukaManager,
    NPCVehicle,
    ObstacleEntity,
} from './YukaManager';

export {
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
} from './states';
