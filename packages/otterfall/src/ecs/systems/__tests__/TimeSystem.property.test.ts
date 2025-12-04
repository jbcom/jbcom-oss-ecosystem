import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { TimePhase } from '../../components';
import { world } from '../../world';
import { TimeSystem } from '../TimeSystem';

// Helper to create a time entity with proper typing
function createTimeEntity(hour: number, phase: TimePhase, timeScale: number = 1) {
    return world.add({
        time: {
            hour,
            phase,
            timeScale,
            sunAngle: 0,
            sunIntensity: phase === 'night' ? 0 : 1,
            ambientLight: phase === 'night' ? 0.2 : phase === 'dawn' || phase === 'dusk' ? 0.5 : 0.8,
            fogDensity: phase === 'dawn' || phase === 'dusk' ? 0.04 : 0.025
        }
    });
}

describe('TimeSystem - Property-Based Tests', () => {
    beforeEach(() => {
        // Clear all entities before each test
        world.clear();
    });

    describe('Property 1: Time Progression Monotonicity', () => {
        it('should always advance time forward with positive delta', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(24), noNaN: true }), // Initial hour
                    fc.float({ min: Math.fround(0.001), max: Math.fround(10), noNaN: true }), // Delta (positive)
                    fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }), // Time scale
                    (initialHour, delta, timeScale) => {
                        // Setup
                        const entity = world.add({
                            time: {
                                hour: initialHour,
                                phase: 'day' as TimePhase,
                                timeScale,
                                sunAngle: 0,
                                sunIntensity: 1,
                                ambientLight: 0.8,
                                fogDensity: 0.025
                            }
                        });

                        const hourBefore = entity.time!.hour;

                        // Execute
                        TimeSystem(delta);

                        const hourAfter = entity.time!.hour;

                        // Calculate expected advancement
                        const expectedAdvancement = (delta * timeScale) / 60;
                        const expectedHour = (hourBefore + expectedAdvancement) % 24;

                        // Verify: Time should advance forward (modulo 24)
                        // Allow small floating point error
                        expect(Math.abs(hourAfter - expectedHour)).toBeLessThan(0.0001);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should wrap around correctly at 24 hours', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(23), max: Math.fround(23.99), noNaN: true }), // Hour near midnight
                    fc.float({ min: Math.fround(0.1), max: Math.fround(2), noNaN: true }), // Delta that will cause wrap
                    (initialHour, delta) => {
                        // Setup
                        const entity = world.add({
                            time: {
                                hour: initialHour,
                                phase: 'night' as TimePhase,
                                timeScale: 1,
                                sunAngle: 0,
                                sunIntensity: 0,
                                ambientLight: 0.2,
                                fogDensity: 0.025
                            }
                        });

                        // Execute
                        TimeSystem(delta);

                        const hourAfter = entity.time!.hour;

                        // Verify: Hour should always be in [0, 24)
                        expect(hourAfter).toBeGreaterThanOrEqual(0);
                        expect(hourAfter).toBeLessThan(24);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should never go backwards with positive delta', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(24), noNaN: true }),
                    fc.float({ min: Math.fround(0.001), max: Math.fround(5), noNaN: true }),
                    (initialHour, delta) => {
                        // Setup
                        const entity = world.add({
                            time: {
                                hour: initialHour,
                                phase: 'day' as TimePhase,
                                timeScale: 1,
                                sunAngle: 0,
                                sunIntensity: 1,
                                ambientLight: 0.8,
                                fogDensity: 0.025
                            }
                        });

                        const hourBefore = entity.time!.hour;

                        // Execute
                        TimeSystem(delta);

                        const hourAfter = entity.time!.hour;

                        // Calculate advancement
                        const advancement = (delta * 1) / 60;

                        // Verify: If advancement is small enough to not wrap, hour should be greater
                        if (hourBefore + advancement < 24) {
                            expect(hourAfter).toBeGreaterThan(hourBefore);
                        } else {
                            // Wrapped around
                            expect(hourAfter).toBeLessThan(hourBefore);
                            expect(hourAfter).toBeGreaterThanOrEqual(0);
                        }

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 2: Phase Transition Consistency', () => {
        it('should always assign correct phase for any hour', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(24), noNaN: true }),
                    (hour) => {
                        // Setup
                        const entity = world.add({
                            time: {
                                hour,
                                phase: 'day' as TimePhase,
                                timeScale: 1,
                                sunAngle: 0,
                                sunIntensity: 1,
                                ambientLight: 0.8,
                                fogDensity: 0.025
                            }
                        });

                        // Execute
                        TimeSystem(0.001); // Tiny delta to trigger phase update

                        const phase = entity.time!.phase;
                        const h = entity.time!.hour % 24;

                        // Verify: Phase matches hour
                        if (h >= 5 && h < 7) {
                            expect(phase).toBe('dawn');
                        } else if (h >= 7 && h < 17) {
                            expect(phase).toBe('day');
                        } else if (h >= 17 && h < 19) {
                            expect(phase).toBe('dusk');
                        } else {
                            expect(phase).toBe('night');
                        }

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain phase boundaries across time progression', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(Math.fround(4.9), Math.fround(6.9), Math.fround(16.9), Math.fround(18.9)), // Just before phase transitions
                    fc.float({ min: Math.fround(0.01), max: Math.fround(0.2), noNaN: true }), // Small delta
                    (initialHour, delta) => {
                        // Setup
                        const entity = world.add({
                            time: {
                                hour: initialHour,
                                phase: 'day' as TimePhase,
                                timeScale: 1,
                                sunAngle: 0,
                                sunIntensity: 1,
                                ambientLight: 0.8,
                                fogDensity: 0.025
                            }
                        });

                        // Execute
                        TimeSystem(delta);

                        const phase = entity.time!.phase;
                        const h = entity.time!.hour % 24;

                        // Verify: Phase is always valid for the hour
                        const isValidPhase =
                            (h >= 5 && h < 7 && phase === 'dawn') ||
                            (h >= 7 && h < 17 && phase === 'day') ||
                            (h >= 17 && h < 19 && phase === 'dusk') ||
                            ((h >= 19 || h < 5) && phase === 'night');

                        expect(isValidPhase).toBe(true);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should update lighting properties consistently with phase', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(0), max: Math.fround(24), noNaN: true }),
                    fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),
                    (initialHour, delta) => {
                        // Setup
                        const entity = world.add({
                            time: {
                                hour: initialHour,
                                phase: 'day' as TimePhase,
                                timeScale: 1,
                                sunAngle: 0,
                                sunIntensity: 1,
                                ambientLight: 0.8,
                                fogDensity: 0.025
                            }
                        });

                        // Execute
                        TimeSystem(delta);

                        const { phase, sunIntensity, ambientLight, fogDensity } = entity.time!;

                        // Verify: Lighting properties match phase
                        if (phase === 'night') {
                            expect(sunIntensity).toBe(0);
                            expect(ambientLight).toBe(0.2);
                        } else if (phase === 'dawn' || phase === 'dusk') {
                            expect(ambientLight).toBe(0.5);
                            expect(fogDensity).toBe(0.04);
                        } else if (phase === 'day') {
                            expect(ambientLight).toBe(0.8);
                            expect(fogDensity).toBe(0.025);
                        }

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
