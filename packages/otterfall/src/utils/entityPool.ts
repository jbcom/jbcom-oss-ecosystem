/**
 * Entity Pool
 * Reuses entity objects to reduce garbage collection pressure
 */

export class EntityPool<T> {
    private pool: T[] = [];
    private active: Set<T> = new Set();
    private factory: () => T;
    private reset: (entity: T) => void;
    private maxSize: number;

    constructor(factory: () => T, reset: (entity: T) => void, maxSize: number = 100) {
        this.factory = factory;
        this.reset = reset;
        this.maxSize = maxSize;
    }

    /**
     * Get an entity from the pool or create a new one
     */
    acquire(): T {
        let entity: T;

        if (this.pool.length > 0) {
            entity = this.pool.pop()!;
        } else {
            entity = this.factory();
        }

        this.active.add(entity);
        return entity;
    }

    /**
     * Return an entity to the pool
     */
    release(entity: T): void {
        if (!this.active.has(entity)) {
            console.warn('Attempting to release entity not in active set');
            return;
        }

        this.active.delete(entity);
        this.reset(entity);

        // Only keep up to maxSize entities in pool
        if (this.pool.length < this.maxSize) {
            this.pool.push(entity);
        }
    }

    /**
     * Get count of active entities
     */
    getActiveCount(): number {
        return this.active.size;
    }

    /**
     * Get count of pooled entities
     */
    getPooledCount(): number {
        return this.pool.length;
    }

    /**
     * Get total count (active + pooled)
     */
    getTotalCount(): number {
        return this.active.size + this.pool.length;
    }

    /**
     * Clear the pool
     */
    clear(): void {
        this.pool = [];
        this.active.clear();
    }

    /**
     * Pre-warm the pool with entities
     */
    prewarm(count: number): void {
        for (let i = 0; i < count; i++) {
            if (this.pool.length < this.maxSize) {
                this.pool.push(this.factory());
            }
        }
    }
}

/**
 * Simple object pool for generic objects
 */
export function createObjectPool<T extends object>(
    initializer: () => T,
    maxSize: number = 100
): EntityPool<T> {
    return new EntityPool(
        initializer,
        () => {}, // No reset needed for simple objects
        maxSize
    );
}
