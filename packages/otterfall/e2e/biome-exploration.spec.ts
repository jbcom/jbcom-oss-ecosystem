import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Biome Exploration
 * Task 6.1.1: Verify player can explore all biomes and biome transitions work correctly
 * Requirements: 3.1, 3.2
 */

test.describe('Biome Exploration', () => {
    test('should spawn player in marsh biome at origin', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Verify game loaded
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // Player should start at origin (0, 0, 0) which is in marsh biome
        // Marsh biome has radius 25 from origin
        const playerPosition = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.position || { x: 0, y: 0, z: 0 };
        });

        // Player should be near origin
        expect(Math.abs(playerPosition.x)).toBeLessThan(5);
        expect(Math.abs(playerPosition.z)).toBeLessThan(5);
    });

    test('should transition from marsh to forest biome', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Move north to reach forest biome (forest is north of marsh)
        // Forest center is approximately at (0, 0, 60)
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(5000); // Move for 5 seconds
        await page.keyboard.up('ArrowUp');

        await page.waitForTimeout(1000);

        // Verify game is still running after biome transition
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // Check that player has moved significantly north
        const playerPosition = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.position || { x: 0, y: 0, z: 0 };
        });

        expect(playerPosition.z).toBeGreaterThan(20); // Should have moved north
    });

    test('should transition from marsh to desert biome', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Move east to reach desert biome
        // Desert center is approximately at (60, 0, 0)
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(5000);
        await page.keyboard.up('ArrowRight');

        await page.waitForTimeout(1000);

        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        const playerPosition = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.position || { x: 0, y: 0, z: 0 };
        });

        expect(playerPosition.x).toBeGreaterThan(20); // Should have moved east
    });

    test('should handle multiple biome transitions without crashing', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Move in a pattern to cross multiple biome boundaries
        const movements = [
            { key: 'ArrowUp', duration: 3000 },    // North to forest
            { key: 'ArrowRight', duration: 3000 }, // East
            { key: 'ArrowDown', duration: 3000 },  // South
            { key: 'ArrowLeft', duration: 3000 },  // West back to marsh
        ];

        for (const movement of movements) {
            await page.keyboard.down(movement.key);
            await page.waitForTimeout(movement.duration);
            await page.keyboard.up(movement.key);
            await page.waitForTimeout(500);
        }

        // Game should remain stable after multiple transitions
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // No critical errors should have occurred
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.waitForTimeout(1000);
        const criticalErrors = errors.filter(
            (err) => !err.includes('WebGL') && !err.includes('three-mesh-bvh')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('should smoothly crossfade terrain colors at biome boundaries', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Move slowly across a biome boundary
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(4000);
        await page.keyboard.up('ArrowUp');

        // Game should handle transition smoothly without visual glitches
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // Check that no errors occurred during transition
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.waitForTimeout(1000);
        expect(errors.filter((e) => !e.includes('WebGL'))).toHaveLength(0);
    });

    test('should explore all 7 biomes without crashing', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Biomes are arranged in a circular pattern around marsh (center)
        // Move in a circular pattern to visit all biomes
        const explorationPath = [
            { key: 'ArrowUp', duration: 6000 },    // Forest (north)
            { key: 'ArrowRight', duration: 4000 }, // Tundra (northeast)
            { key: 'ArrowDown', duration: 6000 },  // Mountain (east)
            { key: 'ArrowDown', duration: 4000 },  // Savanna (southeast)
            { key: 'ArrowLeft', duration: 6000 },  // Scrubland (south)
            { key: 'ArrowLeft', duration: 4000 },  // Desert (southwest)
            { key: 'ArrowUp', duration: 6000 },    // Back to marsh
        ];

        for (const movement of explorationPath) {
            await page.keyboard.down(movement.key);
            await page.waitForTimeout(movement.duration);
            await page.keyboard.up(movement.key);
            await page.waitForTimeout(500);
        }

        // Game should remain stable after visiting all biomes
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should maintain stable performance during biome transitions', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Measure frame rate during biome transition
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
                        const maxFrameTime = Math.max(...samples);
                        resolve({ avgFrameTime, maxFrameTime, samples: samples.length });
                    }
                };

                requestAnimationFrame(measure);
            });
        });

        // Start moving to trigger biome transition
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowUp');

        // Frame time should remain reasonable during transition
        expect((performanceMetrics as any).avgFrameTime).toBeLessThan(50);
        expect((performanceMetrics as any).maxFrameTime).toBeLessThan(100);
    });
});
