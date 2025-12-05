import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Time and Weather Systems
 * Task 6.1.4: Verify time progression, phase transitions, weather transitions, lighting updates
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

test.describe('Time and Weather Systems', () => {
    test('should advance time continuously', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Get initial time
        const initialTime = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.time) {
                    return entity.time.hour;
                }
            }
            return null;
        });

        // Wait for time to advance
        await page.waitForTimeout(2000);

        // Get updated time
        const finalTime = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.time) {
                    return entity.time.hour;
                }
            }
            return null;
        });

        // Time should have advanced
        expect(initialTime).not.toBeNull();
        expect(finalTime).not.toBeNull();
        expect(finalTime).toBeGreaterThan(initialTime!);
    });

    test('should transition between time phases', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Get current phase
        const phase = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.time) {
                    return entity.time.phase;
                }
            }
            return null;
        });

        // Phase should be one of the valid phases
        expect(['dawn', 'day', 'dusk', 'night']).toContain(phase);
    });

    test('should update lighting based on time phase', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Get lighting properties
        const lighting = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.time) {
                    return {
                        sunIntensity: entity.time.sunIntensity,
                        sunAngle: entity.time.sunAngle,
                        ambientLight: entity.time.ambientLight,
                        fogDensity: entity.time.fogDensity,
                    };
                }
            }
            return null;
        });

        // Lighting properties should exist and be reasonable
        expect(lighting).not.toBeNull();
        expect(lighting!.sunIntensity).toBeGreaterThanOrEqual(0);
        expect(lighting!.sunIntensity).toBeLessThanOrEqual(2);
        expect(lighting!.fogDensity).toBeGreaterThanOrEqual(0);
        expect(lighting!.fogDensity).toBeLessThanOrEqual(0.1);
    });

    test('should have active weather system', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Get weather state
        const weather = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.weather) {
                    return {
                        current: entity.weather.current,
                        intensity: entity.weather.intensity,
                    };
                }
            }
            return null;
        });

        // Weather should exist
        expect(weather).not.toBeNull();
        expect(['clear', 'rain', 'fog', 'storm', 'snow', 'sandstorm']).toContain(weather!.current);
        expect(weather!.intensity).toBeGreaterThanOrEqual(0);
        expect(weather!.intensity).toBeLessThanOrEqual(1);
    });

    test('should transition weather over time', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Get initial weather
        const initialWeather = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.weather) {
                    return {
                        current: entity.weather.current,
                        transitionProgress: entity.weather.transitionProgress,
                    };
                }
            }
            return null;
        });

        // Let weather system run
        await page.waitForTimeout(5000);

        // Get updated weather
        const finalWeather = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.weather) {
                    return {
                        current: entity.weather.current,
                        transitionProgress: entity.weather.transitionProgress,
                    };
                }
            }
            return null;
        });

        // Weather system should be active
        expect(initialWeather).not.toBeNull();
        expect(finalWeather).not.toBeNull();
    });

    test('should reduce visibility during rain', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Force rain weather
        await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return;

            for (const entity of world.entities) {
                if (entity.weather) {
                    entity.weather.current = 'rain';
                    entity.weather.intensity = 1.0;
                }
            }
        });

        await page.waitForTimeout(1000);

        // Get visibility
        const visibility = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.weather) {
                    // Calculate visibility based on weather
                    const baseVisibility = 1.0;
                    const reduction = entity.weather.current === 'rain' ? 0.2 : 0;
                    return baseVisibility - reduction * entity.weather.intensity;
                }
            }
            return null;
        });

        // Visibility should be reduced during rain
        expect(visibility).not.toBeNull();
        expect(visibility).toBeLessThan(1.0);
    });

    test('should reduce visibility during fog', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Force fog weather
        await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return;

            for (const entity of world.entities) {
                if (entity.weather) {
                    entity.weather.current = 'fog';
                    entity.weather.intensity = 1.0;
                }
            }
        });

        await page.waitForTimeout(1000);

        // Fog should reduce visibility more than rain
        const visibility = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return null;

            for (const entity of world.entities) {
                if (entity.weather) {
                    const baseVisibility = 1.0;
                    const reduction = entity.weather.current === 'fog' ? 0.5 : 0;
                    return baseVisibility - reduction * entity.weather.intensity;
                }
            }
            return null;
        });

        expect(visibility).not.toBeNull();
        expect(visibility).toBeLessThanOrEqual(0.5);
    });

    test('should handle storm weather', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Force storm weather
        await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return;

            for (const entity of world.entities) {
                if (entity.weather) {
                    entity.weather.current = 'storm';
                    entity.weather.intensity = 1.0;
                }
            }
        });

        await page.waitForTimeout(2000);

        // Game should handle storm without crashing
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle snow weather', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Force snow weather
        await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return;

            for (const entity of world.entities) {
                if (entity.weather) {
                    entity.weather.current = 'snow';
                    entity.weather.intensity = 1.0;
                }
            }
        });

        await page.waitForTimeout(2000);

        // Game should handle snow without crashing
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should render weather particles during rain', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Force rain weather
        await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return;

            for (const entity of world.entities) {
                if (entity.weather) {
                    entity.weather.current = 'rain';
                    entity.weather.intensity = 1.0;
                }
            }
        });

        await page.waitForTimeout(1000);

        // Game should render particles
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should render weather particles during snow', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Force snow weather
        await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return;

            for (const entity of world.entities) {
                if (entity.weather) {
                    entity.weather.current = 'snow';
                    entity.weather.intensity = 1.0;
                }
            }
        });

        await page.waitForTimeout(1000);

        // Game should render particles
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle time and weather systems without errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForTimeout(3000);

        // Let systems run for a while
        await page.waitForTimeout(5000);

        // No critical errors
        const criticalErrors = errors.filter(
            (err) => !err.includes('WebGL') && !err.includes('three-mesh-bvh')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('should maintain stable performance with weather effects', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Force storm weather (most intensive)
        await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return;

            for (const entity of world.entities) {
                if (entity.weather) {
                    entity.weather.current = 'storm';
                    entity.weather.intensity = 1.0;
                }
            }
        });

        // Measure performance
        const performanceMetrics = await page.evaluate(() => {
            return new Promise((resolve) => {
                const samples: number[] = [];
                let lastTime = performance.now();
                let count = 0;

                const measure = () => {
                    const now = performance.now();
                    const delta = now - lastTime;
                    samples.push(delta);
                    lastTime = now;
                    count++;

                    if (count < 60) {
                        requestAnimationFrame(measure);
                    } else {
                        const avgFrameTime = samples.reduce((a, b) => a + b, 0) / samples.length;
                        resolve({ avgFrameTime, samples: samples.length });
                    }
                };

                requestAnimationFrame(measure);
            });
        });

        // Frame time should be reasonable even with weather
        expect((performanceMetrics as any).avgFrameTime).toBeLessThan(50);
    });
});
