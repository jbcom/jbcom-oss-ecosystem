import * as fc from 'fast-check';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherType } from '../../components';
import { world } from '../../world';
import { WeatherSystem, getWeatherMovementMultiplier } from '../WeatherSystem';

describe('WeatherSystem - Property-Based Tests', () => {
    beforeEach(() => {
        // Clear all entities before each test
        world.clear();
        // Reset Date.now mock
        vi.restoreAllMocks();
    });

    describe('Property 3: Weather Transition Completeness', () => {
        it('should complete transition within expected duration', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    fc.float({ min: Math.fround(0.1), max: Math.fround(2), noNaN: true }), // Delta per frame
                    (currentWeather, nextWeather, delta) => {
                        // Skip if same weather (no meaningful transition)
                        fc.pre(currentWeather !== nextWeather);

                        // Setup
                        const startTime = Date.now();
                        const entity = world.add({
                            weather: {
                                current: currentWeather,
                                nextWeather,
                                intensity: 0,
                                visibilityMod: 1,
                                windSpeed: 0,
                                windDirection: [0, 0],
                                startTime,
                                durationMinutes: 10,
                                transitionProgress: 0
                            }
                        });

                        // Execute: Run system until transition completes
                        const TRANSITION_DURATION = 30; // seconds
                        let totalTime = 0;
                        let iterations = 0;
                        // Need enough iterations: 30 seconds / delta
                        const maxIterations = Math.ceil(TRANSITION_DURATION / delta) + 10;

                        // Run until nextWeather becomes null (transition complete)
                        while (entity.weather!.nextWeather !== null && iterations < maxIterations) {
                            WeatherSystem(delta);
                            totalTime += delta;
                            iterations++;
                        }

                        // Verify: Transition should complete
                        expect(entity.weather!.nextWeather).toBeNull();
                        expect(entity.weather!.transitionProgress).toBe(0); // Reset after completion
                        expect(totalTime).toBeGreaterThanOrEqual(TRANSITION_DURATION - 0.1); // Allow small error
                        expect(totalTime).toBeLessThanOrEqual(TRANSITION_DURATION + delta); // Should not overshoot
                        expect(entity.weather!.current).toBe(nextWeather);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it('should interpolate properties smoothly during transition', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }), // Progress
                    (currentWeather, nextWeather, progress) => {
                        // Setup
                        const entity = world.add({
                            weather: {
                                current: currentWeather,
                                nextWeather,
                                intensity: 0,
                                visibilityMod: 1,
                                windSpeed: 0,
                                windDirection: [0, 0],
                                startTime: Date.now(),
                                durationMinutes: 10,
                                transitionProgress: progress
                            }
                        });

                        // Execute
                        WeatherSystem(0.1);

                        const { intensity, visibilityMod, windSpeed } = entity.weather!;

                        // Verify: Properties should be within valid ranges
                        expect(intensity).toBeGreaterThanOrEqual(0);
                        expect(intensity).toBeLessThanOrEqual(1);
                        expect(visibilityMod).toBeGreaterThanOrEqual(0);
                        expect(visibilityMod).toBeLessThanOrEqual(1);
                        expect(windSpeed).toBeGreaterThanOrEqual(0);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should trigger new transition after duration expires', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    fc.float({ min: Math.fround(5), max: Math.fround(20), noNaN: true }), // Duration in minutes
                    (currentWeather, durationMinutes) => {
                        // Setup: Weather that has expired
                        const startTime = Date.now() - (durationMinutes + 1) * 60000; // Expired
                        const entity = world.add({
                            weather: {
                                current: currentWeather,
                                nextWeather: null,
                                intensity: 0,
                                visibilityMod: 1,
                                windSpeed: 0,
                                windDirection: [0, 0],
                                startTime,
                                durationMinutes,
                                transitionProgress: 0
                            }
                        });

                        // Execute
                        WeatherSystem(0.1);

                        // Verify: Should have selected next weather
                        expect(entity.weather!.nextWeather).not.toBeNull();
                        expect(entity.weather!.transitionProgress).toBeGreaterThan(0);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 50 }
            );
        });
    });

    describe('Property 4: Visibility Bounds', () => {
        it('should always keep visibility within [0, 1] range', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    fc.option(fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'), { nil: null }),
                    fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
                    (currentWeather, nextWeather, transitionProgress) => {
                        // Setup
                        const entity = world.add({
                            weather: {
                                current: currentWeather,
                                nextWeather,
                                intensity: 0,
                                visibilityMod: 1,
                                windSpeed: 0,
                                windDirection: [0, 0],
                                startTime: Date.now(),
                                durationMinutes: 10,
                                transitionProgress
                            }
                        });

                        // Execute
                        WeatherSystem(0.1);

                        const { visibilityMod } = entity.weather!;

                        // Verify: Visibility must be clamped to [0, 1]
                        expect(visibilityMod).toBeGreaterThanOrEqual(0);
                        expect(visibilityMod).toBeLessThanOrEqual(1);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should apply correct visibility reduction for each weather type', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    (weatherType) => {
                        // Setup
                        const entity = world.add({
                            weather: {
                                current: weatherType,
                                nextWeather: null,
                                intensity: 0,
                                visibilityMod: 1,
                                windSpeed: 0,
                                windDirection: [0, 0],
                                startTime: Date.now(),
                                durationMinutes: 10,
                                transitionProgress: 0
                            }
                        });

                        // Execute
                        WeatherSystem(0.1);

                        const { visibilityMod } = entity.weather!;

                        // Verify: Visibility matches expected values for each weather type
                        const expectedVisibility: Record<WeatherType, number> = {
                            clear: 1.0,
                            rain: 0.8,
                            fog: 0.5,
                            snow: 0.7,
                            storm: 0.5,
                            sandstorm: 0.3
                        };

                        expect(Math.abs(visibilityMod - expectedVisibility[weatherType])).toBeLessThan(0.01);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it('should maintain intensity bounds [0, 1]', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    fc.option(fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'), { nil: null }),
                    fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
                    (currentWeather, nextWeather, transitionProgress) => {
                        // Setup
                        const entity = world.add({
                            weather: {
                                current: currentWeather,
                                nextWeather,
                                intensity: 0,
                                visibilityMod: 1,
                                windSpeed: 0,
                                windDirection: [0, 0],
                                startTime: Date.now(),
                                durationMinutes: 10,
                                transitionProgress
                            }
                        });

                        // Execute
                        WeatherSystem(0.1);

                        const { intensity } = entity.weather!;

                        // Verify: Intensity must be in [0, 1]
                        expect(intensity).toBeGreaterThanOrEqual(0);
                        expect(intensity).toBeLessThanOrEqual(1);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should return valid movement multiplier', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                    (weatherType) => {
                        // Setup
                        world.add({
                            weather: {
                                current: weatherType,
                                nextWeather: null,
                                intensity: 0,
                                visibilityMod: 1,
                                windSpeed: 0,
                                windDirection: [0, 0],
                                startTime: Date.now(),
                                durationMinutes: 10,
                                transitionProgress: 0
                            }
                        });

                        // Execute
                        const multiplier = getWeatherMovementMultiplier();

                        // Verify: Multiplier should be positive and reasonable
                        expect(multiplier).toBeGreaterThan(0);
                        expect(multiplier).toBeLessThanOrEqual(1.0);

                        // Cleanup
                        world.clear();
                    }
                ),
                { numRuns: 50 }
            );
        });
    });
});
