import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { WeatherType } from '../../components';
import { world } from '../../world';
import { WeatherSystem } from '../WeatherSystem';

describe('WeatherSystem', () => {
    beforeEach(() => {
        // Clear all entities before each test
        for (const entity of world.entities) {
            world.remove(entity);
        }
    });

    // Feature: otterfall-complete, Property 3: Weather Transition Completeness
    // For any weather transition, when transitionProgress reaches 1.0, the current 
    // weather should equal nextWeather and nextWeather should be null.
    it('Property 3: Weather Transition Completeness', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                fc.float({ min: Math.fround(0.9), max: Math.fround(0.99), noNaN: true }),
                (currentWeather, nextWeather, initialProgress) => {
                    // Skip if current and next are the same (no transition needed)
                    if (currentWeather === nextWeather) return;

                    // Setup: Create weather entity in transition
                    const weatherEntity = world.add({
                        weather: {
                            current: currentWeather,
                            nextWeather,
                            intensity: 0.5,
                            visibilityMod: 0.8,
                            windSpeed: 2,
                            transitionProgress: initialProgress,
                            startTime: Date.now() - 60000,
                            durationMinutes: 10,
                        },
                    });

                    // Execute: Run weather system with enough delta to complete transition
                    const remainingProgress = 1.0 - initialProgress;
                    const deltaNeeded = remainingProgress * 30 + 0.2; // 30s transition + buffer
                    
                    // Verify entity still exists before running system
                    expect(weatherEntity.weather).toBeDefined();
                    
                    WeatherSystem(deltaNeeded);

                    // Verify: Transition should be complete
                    // Check if entity still exists (it should)
                    if (weatherEntity.weather) {
                        expect(weatherEntity.weather.current).toBe(nextWeather);
                        expect(weatherEntity.weather.nextWeather).toBeNull();
                        expect(weatherEntity.weather.transitionProgress).toBe(0);
                    }

                    // Cleanup
                    world.remove(weatherEntity);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: otterfall-complete, Property 4: Visibility Bounds
    // For any weather condition, the calculated visibility modifier should be 
    // between 0.0 and 1.0 inclusive.
    it('Property 4: Visibility Bounds', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<WeatherType>('clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'),
                fc.float({ min: 0, max: 1, noNaN: true }),
                (weatherType, transitionProgress) => {
                    // Setup: Create weather entity
                    const weatherEntity = world.add({
                        weather: {
                            current: weatherType,
                            nextWeather: null,
                            intensity: 0.5,
                            visibilityMod: 0.8,
                            windSpeed: 2,
                            transitionProgress,
                            startTime: Date.now(),
                            durationMinutes: 10,
                        },
                    });

                    // Execute: Run weather system
                    WeatherSystem(0.016); // One frame

                    // Verify: Visibility should be in [0, 1]
                    expect(weatherEntity.weather.visibilityMod).toBeGreaterThanOrEqual(0);
                    expect(weatherEntity.weather.visibilityMod).toBeLessThanOrEqual(1);

                    // Cleanup
                    world.remove(weatherEntity);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should handle weather transitions smoothly', () => {
        const weatherEntity = world.add({
            weather: {
                current: 'clear' as WeatherType,
                nextWeather: 'rain' as WeatherType,
                intensity: 0,
                visibilityMod: 1.0,
                windSpeed: 2,
                transitionProgress: 0,
                startTime: Date.now(),
                durationMinutes: 10,
            },
        });

        // Run multiple frames to simulate transition (31 seconds total to ensure completion)
        for (let i = 0; i < 31; i++) {
            WeatherSystem(1.0); // 1 second per frame
            
            // Visibility should always be valid during transition
            if (weatherEntity.weather) {
                expect(weatherEntity.weather.visibilityMod).toBeGreaterThanOrEqual(0);
                expect(weatherEntity.weather.visibilityMod).toBeLessThanOrEqual(1);
            }
        }

        // After 31 seconds, transition should be complete
        // When transition completes, transitionProgress is reset to 0
        expect(weatherEntity.weather.transitionProgress).toBe(0);
        expect(weatherEntity.weather.current).toBe('rain');
        expect(weatherEntity.weather.nextWeather).toBeNull();

        world.remove(weatherEntity);
    });
});
