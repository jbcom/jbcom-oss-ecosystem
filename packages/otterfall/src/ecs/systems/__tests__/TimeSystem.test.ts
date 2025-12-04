import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { world } from '../../world';
import { TimeSystem } from '../TimeSystem';

describe('TimeSystem', () => {
    beforeEach(() => {
        // Clear all entities before each test
        for (const entity of world.entities) {
            world.remove(entity);
        }
    });

    // Feature: otterfall-complete, Property 1: Time Progression Monotonicity
    // For any game frame with positive deltaTime, advancing time should increase 
    // the hour value, and when hour reaches 24.0, it should wrap to 0.0 while 
    // maintaining continuity.
    it('Property 1: Time Progression Monotonicity', () => {
        fc.assert(
            fc.property(
                fc.float({ min: 0, max: Math.fround(23.99), noNaN: true }),
                fc.float({ min: Math.fround(0.001), max: 1.0, noNaN: true }),
                (initialHour, deltaTime) => {
                    // Setup: Create time entity
                    const timeEntity = world.add({
                        time: {
                            hour: initialHour,
                            phase: 'day' as const,
                            timeScale: 1,
                            sunAngle: 0,
                            sunIntensity: 1,
                            ambientLight: 0.8,
                            fogDensity: 0.025,
                        },
                    });

                    const hourBefore = timeEntity.time.hour;

                    // Execute: Run time system
                    TimeSystem(deltaTime);

                    const hourAfter = timeEntity.time.hour;

                    // Verify: Hour should increase (with wrap-around)
                    const expectedIncrease = (deltaTime * 1) / 60; // timeScale = 1
                    const expectedHour = (hourBefore + expectedIncrease) % 24;

                    // Allow small floating point error
                    expect(Math.abs(hourAfter - expectedHour)).toBeLessThan(0.0001);

                    // Verify: Hour should always be in [0, 24)
                    expect(hourAfter).toBeGreaterThanOrEqual(0);
                    expect(hourAfter).toBeLessThan(24);

                    // Cleanup
                    world.remove(timeEntity);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: otterfall-complete, Property 2: Phase Transition Consistency
    // For any hour value, the calculated time phase should match exactly one of 
    // the four defined phases (dawn, day, dusk, night) based on the hour ranges.
    it('Property 2: Phase Transition Consistency', () => {
        fc.assert(
            fc.property(fc.float({ min: 0, max: Math.fround(23.99), noNaN: true }), (hour) => {
                // Setup: Create time entity with specific hour
                const timeEntity = world.add({
                    time: {
                        hour,
                        phase: 'day' as const,
                        timeScale: 1,
                        sunAngle: 0,
                        sunIntensity: 1,
                        ambientLight: 0.8,
                        fogDensity: 0.025,
                    },
                });

                // Execute: Run time system (with zero delta to just update phase)
                TimeSystem(0);

                const phase = timeEntity.time.phase;

                // Verify: Phase should be one of the four valid phases
                expect(['dawn', 'day', 'dusk', 'night']).toContain(phase);

                // Verify: Phase should match hour range
                const h = hour % 24;
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
                world.remove(timeEntity);
            }),
            { numRuns: 100 }
        );
    });

    it('should handle boundary hours correctly', () => {
        const boundaryHours = [4.99, 5.0, 5.01, 6.99, 7.0, 7.01, 16.99, 17.0, 17.01, 18.99, 19.0, 19.01];

        boundaryHours.forEach((hour) => {
            const timeEntity = world.add({
                time: {
                    hour,
                    phase: 'day' as const,
                    timeScale: 1,
                    sunAngle: 0,
                    sunIntensity: 1,
                    ambientLight: 0.8,
                    fogDensity: 0.025,
                },
            });

            TimeSystem(0);

            const phase = timeEntity.time.phase;
            expect(['dawn', 'day', 'dusk', 'night']).toContain(phase);

            world.remove(timeEntity);
        });
    });
});
