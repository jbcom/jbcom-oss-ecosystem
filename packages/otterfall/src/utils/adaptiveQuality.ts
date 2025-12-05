/**
 * Adaptive Quality System
 * Monitors frame time and adjusts rendering quality to maintain target FPS
 */

export interface QualitySettings {
    particleMultiplier: number; // 0.5 = 50% particles, 1.0 = 100%
    shadowQuality: 'high' | 'medium' | 'low';
    shadowMapSize: number;
}

export class AdaptiveQualityManager {
    private frameTimeSamples: number[] = [];
    private readonly sampleSize = 60; // Track last 60 frames (~1 second at 60fps)
    private readonly targetFrameTime = 16.67; // 60 FPS target
    private readonly highThreshold = 20; // Reduce particles if > 20ms
    private readonly criticalThreshold = 25; // Reduce shadows if > 25ms
    
    private currentSettings: QualitySettings = {
        particleMultiplier: 1.0,
        shadowQuality: 'high',
        shadowMapSize: 2048,
    };

    /**
     * Record a frame time sample
     * @param deltaTime Frame time in milliseconds
     */
    recordFrameTime(deltaTime: number): void {
        this.frameTimeSamples.push(deltaTime);
        
        // Keep only last N samples
        if (this.frameTimeSamples.length > this.sampleSize) {
            this.frameTimeSamples.shift();
        }
    }

    /**
     * Get average frame time from recent samples
     */
    getAverageFrameTime(): number {
        if (this.frameTimeSamples.length === 0) return 0;
        
        const sum = this.frameTimeSamples.reduce((a, b) => a + b, 0);
        return sum / this.frameTimeSamples.length;
    }

    /**
     * Update quality settings based on performance
     * Returns true if settings changed
     */
    updateQuality(): boolean {
        const avgFrameTime = this.getAverageFrameTime();
        
        // Need enough samples to make a decision
        if (this.frameTimeSamples.length < 30) return false;
        
        let changed = false;
        const newSettings = { ...this.currentSettings };

        // Reduce particle count if frame time exceeds high threshold
        if (avgFrameTime > this.highThreshold) {
            if (newSettings.particleMultiplier > 0.5) {
                newSettings.particleMultiplier = 0.5;
                changed = true;
            }
        } else if (avgFrameTime < this.targetFrameTime) {
            // Restore particles if performance is good
            if (newSettings.particleMultiplier < 1.0) {
                newSettings.particleMultiplier = 1.0;
                changed = true;
            }
        }

        // Reduce shadow quality if frame time exceeds critical threshold
        if (avgFrameTime > this.criticalThreshold) {
            if (newSettings.shadowQuality !== 'low') {
                newSettings.shadowQuality = 'low';
                newSettings.shadowMapSize = 512;
                changed = true;
            }
        } else if (avgFrameTime < this.highThreshold) {
            // Restore shadow quality if performance is good
            if (newSettings.shadowQuality !== 'high') {
                newSettings.shadowQuality = 'high';
                newSettings.shadowMapSize = 2048;
                changed = true;
            }
        }

        if (changed) {
            this.currentSettings = newSettings;
        }

        return changed;
    }

    /**
     * Get current quality settings
     */
    getSettings(): QualitySettings {
        return { ...this.currentSettings };
    }

    /**
     * Reset to default quality
     */
    reset(): void {
        this.frameTimeSamples = [];
        this.currentSettings = {
            particleMultiplier: 1.0,
            shadowQuality: 'high',
            shadowMapSize: 2048,
        };
    }

    /**
     * Check if performance is good (meeting target FPS)
     */
    isPerformanceGood(): boolean {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime < this.targetFrameTime && this.frameTimeSamples.length >= 30;
    }

    /**
     * Check if performance is poor (below target FPS)
     */
    isPerformancePoor(): boolean {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > this.highThreshold && this.frameTimeSamples.length >= 30;
    }
}

// Singleton instance
let instance: AdaptiveQualityManager | null = null;

export function getAdaptiveQualityManager(): AdaptiveQualityManager {
    if (!instance) {
        instance = new AdaptiveQualityManager();
    }
    return instance;
}
