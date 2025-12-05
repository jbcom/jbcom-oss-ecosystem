/**
 * Memory Monitor
 * Tracks memory usage and triggers garbage collection when needed
 */

export interface MemoryStats {
    usedJSHeapSize: number; // Bytes
    totalJSHeapSize: number; // Bytes
    jsHeapSizeLimit: number; // Bytes
    usedMB: number;
    totalMB: number;
    limitMB: number;
    percentUsed: number;
}

export class MemoryMonitor {
    private readonly threshold = 500; // MB
    private lastGCTime = 0;
    private readonly gcCooldown = 30000; // 30 seconds between GC attempts

    /**
     * Get current memory stats
     * Returns null if performance.memory is not available
     */
    getMemoryStats(): MemoryStats | null {
        // @ts-ignore - performance.memory is non-standard but widely supported
        const memory = performance.memory;
        
        if (!memory) {
            return null;
        }

        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        const totalMB = memory.totalJSHeapSize / (1024 * 1024);
        const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);
        const percentUsed = (usedMB / limitMB) * 100;

        return {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usedMB,
            totalMB,
            limitMB,
            percentUsed,
        };
    }

    /**
     * Check if memory usage exceeds threshold
     */
    isMemoryHigh(): boolean {
        const stats = this.getMemoryStats();
        if (!stats) return false;
        
        return stats.usedMB > this.threshold;
    }

    /**
     * Attempt to trigger garbage collection
     * Note: This is a hint to the browser, not guaranteed
     */
    triggerGC(): boolean {
        const now = Date.now();
        
        // Don't trigger GC too frequently
        if (now - this.lastGCTime < this.gcCooldown) {
            return false;
        }

        const stats = this.getMemoryStats();
        if (!stats || !this.isMemoryHigh()) {
            return false;
        }

        // Log memory state before GC
        console.warn(`Memory usage high: ${stats.usedMB.toFixed(2)}MB / ${this.threshold}MB`);
        console.warn('Attempting garbage collection...');

        // Hint to browser to run GC
        // This doesn't actually force GC, but can help in some browsers
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalObj = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (globalObj && (globalObj as any).gc) {
            // Node.js or browsers with --expose-gc flag
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalObj as any).gc();
        }

        this.lastGCTime = now;
        return true;
    }

    /**
     * Monitor memory and trigger GC if needed
     * Returns true if GC was triggered
     */
    checkAndCleanup(): boolean {
        if (this.isMemoryHigh()) {
            return this.triggerGC();
        }
        return false;
    }

    /**
     * Get formatted memory report
     */
    getReport(): string {
        const stats = this.getMemoryStats();
        if (!stats) {
            return 'Memory monitoring not available';
        }

        return `Memory: ${stats.usedMB.toFixed(2)}MB / ${stats.limitMB.toFixed(2)}MB (${stats.percentUsed.toFixed(1)}%)`;
    }
}

// Singleton instance
let instance: MemoryMonitor | null = null;

export function getMemoryMonitor(): MemoryMonitor {
    if (!instance) {
        instance = new MemoryMonitor();
    }
    return instance;
}
