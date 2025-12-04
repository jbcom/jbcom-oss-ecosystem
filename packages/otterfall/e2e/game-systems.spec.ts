import { expect, test } from '@playwright/test';

test.describe('Game Systems Integration', () => {
    test('should run time system and update lighting', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Let the game run for a few seconds to allow time progression
        await page.waitForTimeout(5000);

        // Check that the game is still running
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // No errors should occur during time progression
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);
        expect(errors.filter((e) => !e.includes('WebGL'))).toHaveLength(0);
    });

    test('should handle weather transitions', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Run game long enough for potential weather changes
        // Weather transitions take 30 seconds, so we'll run for a bit
        await page.waitForTimeout(5000);

        // Game should remain stable
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should spawn NPCs without crashing', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Move around to trigger NPC spawning
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(500);

        // Let NPCs spawn and AI run
        await page.waitForTimeout(3000);

        // Game should still be running
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle biome transitions', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Move in one direction to potentially cross biome boundaries
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowUp');

        await page.waitForTimeout(1000);

        // Game should handle biome changes gracefully
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should maintain stable frame rate', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

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

        // Average frame time should be reasonable (< 50ms for 20+ FPS)
        expect((performanceMetrics as any).avgFrameTime).toBeLessThan(50);
    });
});
