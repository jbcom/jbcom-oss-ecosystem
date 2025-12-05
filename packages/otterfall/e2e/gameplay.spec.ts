import { expect, test } from '@playwright/test';

test.describe('Gameplay Features', () => {
    test('should allow player to explore the world', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Simulate exploration by moving in different directions
        const movements = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

        for (const direction of movements) {
            await page.keyboard.down(direction);
            await page.waitForTimeout(1000);
            await page.keyboard.up(direction);
            await page.waitForTimeout(200);
        }

        // Game should remain stable after exploration
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle jumping', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Jump multiple times
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);
        }

        // Game should handle jumping without issues
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should run for extended period without memory leaks', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Get initial memory usage
        const initialMetrics = await page.evaluate(() => {
            if ((performance as any).memory) {
                return (performance as any).memory.usedJSHeapSize;
            }
            return null;
        });

        // Run game for 10 seconds with activity
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('ArrowUp');
            await page.waitForTimeout(500);
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(500);
        }

        // Check memory hasn't grown excessively
        const finalMetrics = await page.evaluate(() => {
            if ((performance as any).memory) {
                return (performance as any).memory.usedJSHeapSize;
            }
            return null;
        });

        if (initialMetrics && finalMetrics) {
            const growth = finalMetrics - initialMetrics;
            const growthMB = growth / (1024 * 1024);

            // Memory growth should be reasonable (< 100MB for 10 seconds)
            expect(growthMB).toBeLessThan(100);
        }

        // Game should still be running
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle rapid input changes', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Rapidly change directions
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowLeft');
            await page.keyboard.press('ArrowRight');
        }

        // Game should handle rapid input without crashing
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should maintain game state during gameplay', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Play for a bit
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        // Check that game state is maintained (no crashes, canvas still visible)
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // Move some more
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1000);

        // Game should still be running
        await expect(canvas).toBeVisible();
    });
});
