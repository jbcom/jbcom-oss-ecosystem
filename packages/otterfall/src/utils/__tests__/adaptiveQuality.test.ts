import { beforeEach, describe, expect, it } from 'vitest';
import { AdaptiveQualityManager } from '../adaptiveQuality';

describe('AdaptiveQualityManager', () => {
    let manager: AdaptiveQualityManager;

    beforeEach(() => {
        manager = new AdaptiveQualityManager();
    });

    describe('Frame time recording', () => {
        it('should record frame times', () => {
            manager.recordFrameTime(16.67);
            manager.recordFrameTime(17.0);
            manager.recordFrameTime(16.5);

            const avg = manager.getAverageFrameTime();
            expect(avg).toBeCloseTo(16.72, 1);
        });

        it('should limit samples to window size', () => {
            // Record 100 frames
            for (let i = 0; i < 100; i++) {
                manager.recordFrameTime(16.67);
            }

            // Average should still be calculated from last 60 frames
            const avg = manager.getAverageFrameTime();
            expect(avg).toBeCloseTo(16.67, 1);
        });

        it('should return 0 for average with no samples', () => {
            expect(manager.getAverageFrameTime()).toBe(0);
        });
    });

    describe('Quality adjustment - Particle reduction', () => {
        it('should reduce particles when frame time exceeds 20ms', () => {
            // Record 30 frames above threshold
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(22);
            }

            const changed = manager.updateQuality();
            const settings = manager.getSettings();

            expect(changed).toBe(true);
            expect(settings.particleMultiplier).toBe(0.5);
        });

        it('should restore particles when performance improves', () => {
            // First degrade
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(22);
            }
            manager.updateQuality();

            // Then improve - add more good frames to shift the average
            for (let i = 0; i < 60; i++) {
                manager.recordFrameTime(15);
            }

            const changed = manager.updateQuality();
            const settings = manager.getSettings();

            expect(changed).toBe(true);
            expect(settings.particleMultiplier).toBe(1.0);
        });

        it('should not change settings with insufficient samples', () => {
            // Only 20 frames (need 30)
            for (let i = 0; i < 20; i++) {
                manager.recordFrameTime(25);
            }

            const changed = manager.updateQuality();
            expect(changed).toBe(false);
        });
    });

    describe('Quality adjustment - Shadow reduction', () => {
        it('should reduce shadow quality when frame time exceeds 25ms', () => {
            // Record 30 frames above critical threshold
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(27);
            }

            const changed = manager.updateQuality();
            const settings = manager.getSettings();

            expect(changed).toBe(true);
            expect(settings.shadowQuality).toBe('low');
            expect(settings.shadowMapSize).toBe(512);
        });

        it('should restore shadow quality when performance improves', () => {
            // First degrade
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(27);
            }
            manager.updateQuality();

            // Then improve - add more good frames to shift the average
            for (let i = 0; i < 60; i++) {
                manager.recordFrameTime(15);
            }

            const changed = manager.updateQuality();
            const settings = manager.getSettings();

            expect(changed).toBe(true);
            expect(settings.shadowQuality).toBe('high');
            expect(settings.shadowMapSize).toBe(2048);
        });
    });

    describe('Combined degradation', () => {
        it('should reduce both particles and shadows at critical performance', () => {
            // Record 30 frames at critical threshold
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(28);
            }

            manager.updateQuality();
            const settings = manager.getSettings();

            expect(settings.particleMultiplier).toBe(0.5);
            expect(settings.shadowQuality).toBe('low');
        });

        it('should restore settings gradually as performance improves', () => {
            // Degrade to critical
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(28);
            }
            manager.updateQuality();

            // Improve to moderate (restore shadows but keep particles reduced)
            manager.reset();
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(21);
            }
            manager.updateQuality();
            let settings = manager.getSettings();

            expect(settings.particleMultiplier).toBe(0.5); // Still reduced
            expect(settings.shadowQuality).toBe('high'); // Restored

            // Improve to good (restore everything)
            manager.reset();
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(15);
            }
            manager.updateQuality();
            settings = manager.getSettings();

            expect(settings.particleMultiplier).toBe(1.0);
            expect(settings.shadowQuality).toBe('high');
        });
    });

    describe('Performance status', () => {
        it('should report good performance when meeting target', () => {
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(15);
            }

            expect(manager.isPerformanceGood()).toBe(true);
            expect(manager.isPerformancePoor()).toBe(false);
        });

        it('should report poor performance when exceeding threshold', () => {
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(25);
            }

            expect(manager.isPerformanceGood()).toBe(false);
            expect(manager.isPerformancePoor()).toBe(true);
        });

        it('should require sufficient samples for status', () => {
            for (let i = 0; i < 20; i++) {
                manager.recordFrameTime(15);
            }

            expect(manager.isPerformanceGood()).toBe(false);
            expect(manager.isPerformancePoor()).toBe(false);
        });
    });

    describe('Reset', () => {
        it('should reset to default settings', () => {
            // Degrade quality
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(28);
            }
            manager.updateQuality();

            // Reset
            manager.reset();
            const settings = manager.getSettings();

            expect(settings.particleMultiplier).toBe(1.0);
            expect(settings.shadowQuality).toBe('high');
            expect(settings.shadowMapSize).toBe(2048);
            expect(manager.getAverageFrameTime()).toBe(0);
        });
    });

    describe('Edge cases', () => {
        it('should handle exactly at threshold values', () => {
            // Exactly 20ms (high threshold)
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(20);
            }
            manager.updateQuality();
            let settings = manager.getSettings();
            expect(settings.particleMultiplier).toBe(1.0); // Should not reduce yet

            // Exactly 20.01ms (just over threshold)
            manager.reset();
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(20.01);
            }
            manager.updateQuality();
            settings = manager.getSettings();
            expect(settings.particleMultiplier).toBe(0.5); // Should reduce
        });

        it('should not change settings if already at target level', () => {
            // Already at reduced particles
            for (let i = 0; i < 30; i++) {
                manager.recordFrameTime(22);
            }
            manager.updateQuality();

            // Try to update again with same performance
            const changed = manager.updateQuality();
            expect(changed).toBe(false);
        });
    });
});
