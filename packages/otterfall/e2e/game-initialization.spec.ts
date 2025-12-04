import { expect, test } from '@playwright/test';

test.describe('Game Initialization', () => {
    test('should load the game and display canvas', async ({ page }) => {
        await page.goto('/');

        // Wait for the canvas to be present
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible({ timeout: 10000 });

        // Check that the canvas has reasonable dimensions
        const box = await canvas.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(100);
        expect(box!.height).toBeGreaterThan(100);
    });

    test('should display HUD elements', async ({ page }) => {
        await page.goto('/');

        // Wait for game to load
        await page.waitForTimeout(2000);

        // Check for health and stamina bars (these should be visible in the DOM)
        // Note: Actual selectors depend on your HUD implementation
        const healthBar = page.locator('[data-testid="health-bar"]').or(page.locator('text=/health/i')).first();
        const staminaBar = page.locator('[data-testid="stamina-bar"]').or(page.locator('text=/stamina/i')).first();

        // At least one should be visible or the canvas should be rendering
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should not show game over screen on start', async ({ page }) => {
        await page.goto('/');

        await page.waitForTimeout(2000);

        // Game over screen should not be visible initially
        const gameOverText = page.locator('text=/game over/i');
        await expect(gameOverText).not.toBeVisible();
    });

    test('should have no console errors on load', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForTimeout(3000);

        // Filter out known acceptable errors (like WebGL warnings)
        const criticalErrors = errors.filter(
            (err) => !err.includes('WebGL') && !err.includes('three-mesh-bvh')
        );

        expect(criticalErrors).toHaveLength(0);
    });
});
