import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityPool, createObjectPool } from '../entityPool';

describe('EntityPool', () => {
    interface TestEntity {
        id: number;
        active: boolean;
    }

    let pool: EntityPool<TestEntity>;
    let idCounter: number;

    beforeEach(() => {
        idCounter = 0;
        pool = new EntityPool<TestEntity>(
            () => ({ id: idCounter++, active: false }),
            (entity) => { entity.active = false; },
            10 // maxSize
        );
    });

    describe('acquire', () => {
        it('should create new entity when pool is empty', () => {
            const entity = pool.acquire();
            
            expect(entity).toBeDefined();
            expect(entity.id).toBe(0);
            expect(pool.getActiveCount()).toBe(1);
            expect(pool.getPooledCount()).toBe(0);
        });

        it('should reuse entity from pool', () => {
            // Acquire and release an entity
            const first = pool.acquire();
            first.active = true;
            pool.release(first);

            // Acquire again - should get the same entity
            const second = pool.acquire();
            expect(second.id).toBe(first.id);
            expect(second.active).toBe(false); // Should be reset
            expect(pool.getActiveCount()).toBe(1);
        });

        it('should track active entities', () => {
            pool.acquire();
            pool.acquire();
            pool.acquire();

            expect(pool.getActiveCount()).toBe(3);
        });
    });

    describe('release', () => {
        it('should return entity to pool', () => {
            const entity = pool.acquire();
            pool.release(entity);

            expect(pool.getActiveCount()).toBe(0);
            expect(pool.getPooledCount()).toBe(1);
        });

        it('should reset entity when released', () => {
            const entity = pool.acquire();
            entity.active = true;
            
            pool.release(entity);
            
            expect(entity.active).toBe(false);
        });

        it('should not exceed max pool size', () => {
            // Create more entities than maxSize
            const entities: TestEntity[] = [];
            for (let i = 0; i < 15; i++) {
                entities.push(pool.acquire());
            }

            // Release all
            entities.forEach(e => pool.release(e));

            // Pool should be capped at maxSize (10)
            expect(pool.getPooledCount()).toBe(10);
        });

        it('should warn when releasing non-active entity', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const entity = { id: 999, active: false };
            
            pool.release(entity);
            
            expect(consoleSpy).toHaveBeenCalledWith('Attempting to release entity not in active set');
            consoleSpy.mockRestore();
        });
    });

    describe('counts', () => {
        it('should track active count correctly', () => {
            expect(pool.getActiveCount()).toBe(0);
            
            const e1 = pool.acquire();
            expect(pool.getActiveCount()).toBe(1);
            
            pool.acquire();
            expect(pool.getActiveCount()).toBe(2);
            
            pool.release(e1);
            expect(pool.getActiveCount()).toBe(1);
        });

        it('should track pooled count correctly', () => {
            expect(pool.getPooledCount()).toBe(0);
            
            const entity = pool.acquire();
            expect(pool.getPooledCount()).toBe(0);
            
            pool.release(entity);
            expect(pool.getPooledCount()).toBe(1);
        });

        it('should calculate total count correctly', () => {
            const e1 = pool.acquire();
            pool.acquire();
            pool.release(e1);

            expect(pool.getTotalCount()).toBe(2); // 1 active + 1 pooled
        });
    });

    describe('clear', () => {
        it('should clear all entities', () => {
            const e1 = pool.acquire();
            pool.acquire();
            pool.release(e1);

            pool.clear();

            expect(pool.getActiveCount()).toBe(0);
            expect(pool.getPooledCount()).toBe(0);
            expect(pool.getTotalCount()).toBe(0);
        });
    });

    describe('prewarm', () => {
        it('should pre-create entities', () => {
            pool.prewarm(5);

            expect(pool.getPooledCount()).toBe(5);
            expect(pool.getActiveCount()).toBe(0);
        });

        it('should respect max size when prewarming', () => {
            pool.prewarm(20); // More than maxSize (10)

            expect(pool.getPooledCount()).toBe(10);
        });

        it('should allow acquiring prewarmed entities', () => {
            pool.prewarm(3);
            
            pool.acquire();
            pool.acquire();

            expect(pool.getActiveCount()).toBe(2);
            expect(pool.getPooledCount()).toBe(1);
        });
    });

    describe('reuse pattern', () => {
        it('should efficiently reuse entities', () => {
            // Simulate game loop with entity spawning/despawning
            const entities: TestEntity[] = [];

            // Spawn 5 entities
            for (let i = 0; i < 5; i++) {
                entities.push(pool.acquire());
            }
            expect(pool.getActiveCount()).toBe(5);

            // Despawn 3 entities
            for (let i = 0; i < 3; i++) {
                pool.release(entities[i]);
            }
            expect(pool.getActiveCount()).toBe(2);
            expect(pool.getPooledCount()).toBe(3);

            // Spawn 3 more - should reuse pooled entities
            for (let i = 0; i < 3; i++) {
                entities.push(pool.acquire());
            }
            expect(pool.getActiveCount()).toBe(5);
            expect(pool.getPooledCount()).toBe(0);
        });
    });
});

describe('createObjectPool', () => {
    it('should create a simple object pool', () => {
        const pool = createObjectPool(() => ({ value: 0 }), 5);

        const obj = pool.acquire();
        expect(obj).toBeDefined();
        expect(obj.value).toBe(0);

        pool.release(obj);
        expect(pool.getPooledCount()).toBe(1);
    });
});
