/**
 * TypeScript declarations for the Yuka AI library
 * @see https://github.com/Mugen87/yuka
 */

declare module 'yuka' {
    // Math
    export class Vector3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number);
        set(x: number, y: number, z: number): this;
        copy(v: Vector3): this;
        add(v: Vector3): this;
        sub(v: Vector3): this;
        subVectors(a: Vector3, b: Vector3): this;
        multiplyScalar(s: number): this;
        divideScalar(s: number): this;
        normalize(): this;
        length(): number;
        squaredLength(): number;
        squaredDistanceTo(v: Vector3): number;
        distanceTo(v: Vector3): number;
        clone(): Vector3;
        applyMatrix4(m: Matrix4): this;
        applyRotation(q: Quaternion): this;
        toArray(array: number[]): number[];
        fromArray(array: number[]): this;
        clamp(min: Vector3, max: Vector3): this;
        addScalar(s: number): this;
        subScalar(s: number): this;
    }

    export class Quaternion {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number);
    }

    export class Matrix4 {
        elements: number[];
        constructor();
        getInverse(m: Matrix4): this;
    }

    export class Ray {
        origin: Vector3;
        direction: Vector3;
        constructor(origin?: Vector3, direction?: Vector3);
        intersectBoundingSphere(sphere: BoundingSphere, result: Vector3): Vector3 | null;
    }

    export class BoundingSphere {
        center: Vector3;
        radius: number;
        constructor(center?: Vector3, radius?: number);
    }

    export class AABB {
        min: Vector3;
        max: Vector3;
        constructor(min?: Vector3, max?: Vector3);
        fromPoints(points: Vector3[]): this;
    }

    // Core
    export class EventDispatcher {
        addEventListener(type: string, listener: (event: any) => void): this;
        removeEventListener(type: string, listener: (event: any) => void): this;
        hasEventListener(type: string, listener: (event: any) => void): boolean;
        dispatchEvent(event: { type: string }): this;
    }

    export class GameEntity extends EventDispatcher {
        uuid: string;
        name: string;
        active: boolean;
        children: GameEntity[];
        parent: GameEntity | null;
        neighbors: GameEntity[];
        neighborhoodRadius: number;
        updateNeighborhood: boolean;
        position: Vector3;
        rotation: Quaternion;
        scale: Vector3;
        forward: Vector3;
        up: Vector3;
        boundingRadius: number;
        maxTurnRate: number;
        canActivateTrigger: boolean;
        worldMatrix: Matrix4;
        manager: EntityManager | null;

        constructor();
        start(): this;
        update(delta: number): this;
        add(entity: GameEntity): this;
        remove(entity: GameEntity): this;
        getDirection(result: Vector3): Vector3;
        lookAt(target: Vector3): this;
        getWorldPosition(result: Vector3): Vector3;
        setRenderComponent(renderComponent: any, callback: (entity: GameEntity, renderComponent: any) => void): this;
        sendMessage(receiver: GameEntity, message: string, delay?: number, data?: any): this;
        handleMessage(telegram: Telegram): boolean;
        lineOfSightTest(target: Vector3, obstacles: GameEntity[]): GameEntity | null;
        rotateTo(target: Vector3, delta: number, tolerance?: number): boolean;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class MovingEntity extends GameEntity {
        velocity: Vector3;
        maxSpeed: number;
        updateOrientation: boolean;

        constructor();
        getSpeed(): number;
        getSpeedSquared(): number;
    }

    export class Time {
        _previousTime: number;
        _currentTime: number;
        
        constructor();
        update(): this;
        getDelta(): number;
        getElapsed(): number;
    }

    export class Telegram {
        sender: GameEntity;
        receiver: GameEntity;
        message: string;
        delay: number;
        data: any;
    }

    export class MessageDispatcher {
        constructor();
        dispatch(sender: GameEntity, receiver: GameEntity, message: string, delay: number, data: any): this;
        dispatchDelayedMessages(delta: number): this;
        clear(): this;
        toJSON(): object;
        fromJSON(json: object): this;
    }

    export class Logger {
        static setLevel(level: string): void;
        static log(...args: any[]): void;
        static warn(...args: any[]): void;
        static error(...args: any[]): void;
    }

    export class Regulator {
        updateFrequency: number;
        constructor(updateFrequency?: number);
        ready(): boolean;
    }

    // Entity Manager
    export class EntityManager {
        entities: GameEntity[];
        spatialIndex: CellSpacePartitioning | null;

        constructor();
        add(entity: GameEntity): this;
        remove(entity: GameEntity): this;
        clear(): this;
        getEntityByName(name: string): GameEntity | null;
        update(delta: number): this;
        updateEntity(entity: GameEntity, delta: number): this;
        updateNeighborhood(entity: GameEntity): this;
        processTrigger(trigger: Trigger): this;
        sendMessage(sender: GameEntity, receiver: GameEntity, message: string, delay: number, data: any): this;
        toJSON(): object;
        fromJSON(json: object): this;
        registerType(type: string, constructor: new () => GameEntity): this;
    }

    // FSM
    export class State {
        enter(owner: GameEntity): void;
        execute(owner: GameEntity): void;
        exit(owner: GameEntity): void;
        onMessage(owner: GameEntity, telegram: Telegram): boolean;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class StateMachine {
        owner: GameEntity | null;
        currentState: State | null;
        previousState: State | null;
        globalState: State | null;
        states: Map<string, State>;

        constructor(owner?: GameEntity);
        update(): this;
        add(id: string, state: State): this;
        remove(id: string): this;
        get(id: string): State | undefined;
        changeTo(id: string): this;
        revert(): this;
        in(id: string): boolean;
        handleMessage(telegram: Telegram): boolean;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
        registerType(type: string, constructor: new () => State): this;
    }

    // Steering
    export class Vehicle extends MovingEntity {
        mass: number;
        maxForce: number;
        steering: SteeringManager;
        smoother: Smoother | null;

        constructor();
    }

    export class SteeringManager {
        vehicle: Vehicle;
        behaviors: SteeringBehavior[];

        constructor(vehicle: Vehicle);
        add(behavior: SteeringBehavior): this;
        remove(behavior: SteeringBehavior): this;
        clear(): this;
        calculate(delta: number, result: Vector3): Vector3;
        toJSON(): object;
        fromJSON(json: object): this;
        registerType(type: string, constructor: new () => SteeringBehavior): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class SteeringBehavior {
        active: boolean;
        weight: number;

        constructor();
        calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class SeekBehavior extends SteeringBehavior {
        target: Vector3;
        constructor(target?: Vector3);
    }

    export class FleeBehavior extends SteeringBehavior {
        target: Vector3;
        panicDistance: number;
        constructor(target?: Vector3, panicDistance?: number);
    }

    export class ArriveBehavior extends SteeringBehavior {
        target: Vector3;
        deceleration: number;
        tolerance: number;
        constructor(target?: Vector3, deceleration?: number, tolerance?: number);
    }

    export class PursuitBehavior extends SteeringBehavior {
        evader: Vehicle | null;
        predictionFactor: number;
        constructor(evader?: Vehicle, predictionFactor?: number);
    }

    export class EvadeBehavior extends SteeringBehavior {
        pursuer: Vehicle | null;
        panicDistance: number;
        predictionFactor: number;
        constructor(pursuer?: Vehicle, panicDistance?: number, predictionFactor?: number);
    }

    export class WanderBehavior extends SteeringBehavior {
        radius: number;
        distance: number;
        jitter: number;
        constructor(radius?: number, distance?: number, jitter?: number);
    }

    export class SeparationBehavior extends SteeringBehavior {
        constructor();
    }

    export class AlignmentBehavior extends SteeringBehavior {
        constructor();
    }

    export class CohesionBehavior extends SteeringBehavior {
        constructor();
    }

    export class ObstacleAvoidanceBehavior extends SteeringBehavior {
        obstacles: GameEntity[];
        brakingWeight: number;
        dBoxMinLength: number;
        constructor(obstacles?: GameEntity[]);
    }

    export class FollowPathBehavior extends SteeringBehavior {
        path: Path;
        nextWaypointDistance: number;
        constructor(path?: Path, nextWaypointDistance?: number);
    }

    export class InterposeBehavior extends SteeringBehavior {
        entity1: Vehicle | null;
        entity2: Vehicle | null;
        deceleration: number;
        constructor(entity1?: Vehicle, entity2?: Vehicle, deceleration?: number);
    }

    export class OffsetPursuitBehavior extends SteeringBehavior {
        leader: Vehicle | null;
        offset: Vector3;
        constructor(leader?: Vehicle, offset?: Vector3);
    }

    export class OnPathBehavior extends SteeringBehavior {
        path: Path;
        radius: number;
        predictionFactor: number;
        constructor(path?: Path, radius?: number, predictionFactor?: number);
    }

    export class Path {
        loop: boolean;

        constructor();
        add(waypoint: Vector3): this;
        clear(): this;
        finished(): boolean;
        advance(): this;
        current(): Vector3;
    }

    export class Smoother {
        count: number;
        constructor(count?: number);
        calculate(value: Vector3, average: Vector3): Vector3;
        toJSON(): object;
        fromJSON(json: object): this;
    }

    // Partitioning
    export class Cell {
        aabb: AABB;
        entries: GameEntity[];

        constructor(aabb?: AABB);
        add(entry: GameEntity): this;
        remove(entry: GameEntity): this;
        makeEmpty(): this;
        empty(): boolean;
        intersects(aabb: AABB): boolean;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class CellSpacePartitioning {
        cells: Cell[];
        width: number;
        height: number;
        depth: number;
        cellsX: number;
        cellsY: number;
        cellsZ: number;

        constructor(width: number, height: number, depth: number, cellsX: number, cellsY: number, cellsZ: number);
        updateEntity(entity: GameEntity, currentIndex?: number): number;
        addEntityToPartition(entity: GameEntity, index: number): this;
        removeEntityFromPartition(entity: GameEntity, index: number): this;
        getIndexForPosition(position: Vector3): number;
        query(position: Vector3, radius: number, result: GameEntity[]): GameEntity[];
        makeEmpty(): this;
        addPolygon(polygon: any): this;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    // Triggers
    export class Trigger extends GameEntity {
        region: TriggerRegion | null;

        constructor(region?: TriggerRegion);
        check(entity: GameEntity): this;
        execute(entity: GameEntity): void;
        updateRegion(): this;
        toJSON(): object;
        fromJSON(json: object): this;
    }

    export class TriggerRegion {
        constructor();
        touching(position: Vector3): boolean;
        toJSON(): object;
        fromJSON(json: object): this;
    }

    export class SphericalTriggerRegion extends TriggerRegion {
        radius: number;
        constructor(radius?: number);
    }

    export class RectangularTriggerRegion extends TriggerRegion {
        size: Vector3;
        constructor(size?: Vector3);
    }

    // Goal
    export class Goal {
        owner: GameEntity | null;
        status: string;

        constructor(owner?: GameEntity);
        activate(): void;
        execute(): void;
        terminate(): void;
        handleMessage(telegram: Telegram): boolean;
        active(): boolean;
        inactive(): boolean;
        completed(): boolean;
        failed(): boolean;
        addSubgoal(goal: Goal): this;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class CompositeGoal extends Goal {
        subgoals: Goal[];
        constructor(owner?: GameEntity);
    }

    export class Think extends CompositeGoal {
        evaluators: GoalEvaluator[];
        constructor(owner?: GameEntity);
        addEvaluator(evaluator: GoalEvaluator): this;
        removeEvaluator(evaluator: GoalEvaluator): this;
        arbitrate(): this;
    }

    export class GoalEvaluator {
        characterBias: number;
        constructor(characterBias?: number);
        calculateDesirability(owner: GameEntity): number;
        setGoal(owner: GameEntity): void;
        toJSON(): object;
        fromJSON(json: object): this;
    }

    // Perception
    export class Vision {
        owner: GameEntity | null;
        fieldOfView: number;
        range: number;

        constructor(owner?: GameEntity);
        visible(target: Vector3): boolean;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class MemoryRecord {
        entity: GameEntity | null;
        timeBecameVisible: number;
        timeLastSensed: number;
        lastSensedPosition: Vector3;
        visible: boolean;

        constructor(entity?: GameEntity);
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    export class MemorySystem {
        owner: GameEntity | null;
        records: Map<GameEntity, MemoryRecord>;
        memorySpan: number;

        constructor(owner?: GameEntity);
        getRecord(entity: GameEntity): MemoryRecord | undefined;
        hasRecord(entity: GameEntity): boolean;
        createRecord(entity: GameEntity): this;
        deleteRecord(entity: GameEntity): this;
        getValidMemoryRecords(currentTime: number): MemoryRecord[];
        clear(): this;
        toJSON(): object;
        fromJSON(json: object): this;
        resolveReferences(entities: Map<string, GameEntity>): this;
    }

    // Fuzzy (keeping minimal for now)
    export class FuzzyModule {
        constructor();
    }

    export class FuzzyVariable {
        constructor();
    }

    export class FuzzySet {
        constructor();
    }

    export class FuzzyRule {
        constructor();
    }

    // Graph
    export class Graph {
        constructor();
    }

    export class Node {
        constructor();
    }

    export class Edge {
        constructor();
    }

    // Navigation
    export class NavMesh {
        constructor();
    }

    export class NavMeshLoader {
        constructor();
    }
}
