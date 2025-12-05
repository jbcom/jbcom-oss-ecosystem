import { expect, test } from '@playwright/test';

test.describe('Player Movement', () => {
    test('should respond to keyboard input', async ({ page }) => {
        await page.goto('/');

        // Wait for game to load
        await page.waitForTimeout(2000);

        // Press arrow keys to move
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(100);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(100);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);

        // Press space to jump
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        // Game should still be running (no crashes)
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle continuous movement', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Hold down a key for continuous movement
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowUp');

        // Game should still be responsive
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle multiple simultaneous key presses', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        // Press multiple keys at once (diagonal movement)
        await page.keyboard.down('ArrowUp');
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(500);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('ArrowRight');

        // Game should handle it gracefully
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});
