import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryMonitor } from '../memoryMonitor';

describe('MemoryMonitor', () => {
    let monitor: MemoryMonitor;

    beforeEach(() => {
        monitor = new MemoryMonitor();
        vi.clearAllMocks();
    });

    describe('getMemoryStats', () => {
        it('should return null if performance.memory is not available', () => {
            // @ts-ignore
            const originalMemory = performance.memory;
            // @ts-ignore
            delete performance.memory;

            const stats = monitor.getMemoryStats();
            expect(stats).toBeNull();

            // Restore
            // @ts-ignore
            performance.memory = originalMemory;
        });

        it('should return memory stats when available', () => {
            // Mock performance.memory
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 100 * 1024 * 1024, // 100MB
                totalJSHeapSize: 200 * 1024 * 1024, // 200MB
                jsHeapSizeLimit: 1000 * 1024 * 1024, // 1000MB
            };

            const stats = monitor.getMemoryStats();
            
            expect(stats).not.toBeNull();
            expect(stats!.usedMB).toBeCloseTo(100, 1);
            expect(stats!.totalMB).toBeCloseTo(200, 1);
            expect(stats!.limitMB).toBeCloseTo(1000, 1);
            expect(stats!.percentUsed).toBeCloseTo(10, 1);
        });
    });

    describe('isMemoryHigh', () => {
        it('should return false when memory is below threshold', () => {
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 400 * 1024 * 1024, // 400MB (below 500MB threshold)
                totalJSHeapSize: 500 * 1024 * 1024,
                jsHeapSizeLimit: 1000 * 1024 * 1024,
            };

            expect(monitor.isMemoryHigh()).toBe(false);
        });

        it('should return true when memory exceeds threshold', () => {
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 600 * 1024 * 1024, // 600MB (above 500MB threshold)
                totalJSHeapSize: 700 * 1024 * 1024,
                jsHeapSizeLimit: 1000 * 1024 * 1024,
            };

            expect(monitor.isMemoryHigh()).toBe(true);
        });

        it('should return false if memory stats not available', () => {
            // @ts-ignore
            const originalMemory = performance.memory;
            // @ts-ignore
            delete performance.memory;

            expect(monitor.isMemoryHigh()).toBe(false);

            // Restore
            // @ts-ignore
            performance.memory = originalMemory;
        });
    });

    describe('triggerGC', () => {
        beforeEach(() => {
            // Mock high memory
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 600 * 1024 * 1024,
                totalJSHeapSize: 700 * 1024 * 1024,
                jsHeapSizeLimit: 1000 * 1024 * 1024,
            };
        });

        it('should trigger GC when memory is high', () => {
            const result = monitor.triggerGC();
            expect(result).toBe(true);
        });

        it('should not trigger GC when memory is low', () => {
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 400 * 1024 * 1024,
                totalJSHeapSize: 500 * 1024 * 1024,
                jsHeapSizeLimit: 1000 * 1024 * 1024,
            };

            const result = monitor.triggerGC();
            expect(result).toBe(false);
        });

        it('should respect cooldown period', () => {
            // First trigger should succeed
            const first = monitor.triggerGC();
            expect(first).toBe(true);

            // Immediate second trigger should fail (cooldown)
            const second = monitor.triggerGC();
            expect(second).toBe(false);
        });
    });

    describe('checkAndCleanup', () => {
        it('should trigger GC when memory is high', () => {
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 600 * 1024 * 1024,
                totalJSHeapSize: 700 * 1024 * 1024,
                jsHeapSizeLimit: 1000 * 1024 * 1024,
            };

            const result = monitor.checkAndCleanup();
            expect(result).toBe(true);
        });

        it('should not trigger GC when memory is low', () => {
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 400 * 1024 * 1024,
                totalJSHeapSize: 500 * 1024 * 1024,
                jsHeapSizeLimit: 1000 * 1024 * 1024,
            };

            const result = monitor.checkAndCleanup();
            expect(result).toBe(false);
        });
    });

    describe('getReport', () => {
        it('should return formatted memory report', () => {
            // @ts-ignore
            performance.memory = {
                usedJSHeapSize: 100 * 1024 * 1024,
                totalJSHeapSize: 200 * 1024 * 1024,
                jsHeapSizeLimit: 1000 * 1024 * 1024,
            };

            const report = monitor.getReport();
            expect(report).toContain('100.00MB');
            expect(report).toContain('1000.00MB');
            expect(report).toContain('10.0%');
        });

        it('should return message when memory monitoring not available', () => {
            // @ts-ignore
            const originalMemory = performance.memory;
            // @ts-ignore
            delete performance.memory;

            const report = monitor.getReport();
            expect(report).toBe('Memory monitoring not available');

            // Restore
            // @ts-ignore
            performance.memory = originalMemory;
        });
    });
});
