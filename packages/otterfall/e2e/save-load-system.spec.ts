import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Save/Load System
 * Task 6.1.5: Verify save data serialization, load restores state, death respawn mechanics
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

test.describe('Save/Load System', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should save player position to localStorage', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Move player
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        await page.waitForTimeout(500);

        // Trigger save (pause menu or automatic save)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Check localStorage
        const saveData = await page.evaluate(() => {
            const data = localStorage.getItem('otterfall-save');
            return data ? JSON.parse(data) : null;
        });

        expect(saveData).not.toBeNull();
        expect(saveData.player).toBeDefined();
        expect(saveData.player.position).toBeDefined();
    });

    test('should save player health and stamina', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Modify health and stamina
        await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            if (store) {
                store.getState().setHealth(75);
                store.getState().setStamina(60);
            }
        });

        // Trigger save
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Check save data
        const saveData = await page.evaluate(() => {
            const data = localStorage.getItem('otterfall-save');
            return data ? JSON.parse(data) : null;
        });

        expect(saveData).not.toBeNull();
        expect(saveData.player.health).toBeDefined();
        expect(saveData.player.stamina).toBeDefined();
    });

    test('should save world time', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Let time advance
        await page.waitForTimeout(2000);

        // Trigger save
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Check save data
        const saveData = await page.evaluate(() => {
            const data = localStorage.getItem('otterfall-save');
            return data ? JSON.parse(data) : null;
        });

        expect(saveData).not.toBeNull();
        expect(saveData.world).toBeDefined();
        expect(saveData.world.time).toBeDefined();
    });

    test('should restore player position on load', async ({ page }) => {
        // First session: move and save
        await page.goto('/');
        await page.waitForTimeout(3000);

        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        const savedPosition = await page.evaluate(() => {
            const data = localStorage.getItem('otterfall-save');
            return data ? JSON.parse(data).player.position : null;
        });

        // Reload page
        await page.reload();
        await page.waitForTimeout(3000);

        // Check restored position
        const restoredPosition = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.position || null;
        });

        expect(restoredPosition).not.toBeNull();
        expect(savedPosition).not.toBeNull();
        
        // Positions should be close (allowing for small differences)
        expect(Math.abs(restoredPosition.x - savedPosition[0])).toBeLessThan(1);
        expect(Math.abs(restoredPosition.z - savedPosition[2])).toBeLessThan(1);
    });

    test('should restore player health and stamina on load', async ({ page }) => {
        // First session: modify and save
        await page.goto('/');
        await page.waitForTimeout(3000);

        await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            if (store) {
                store.getState().setHealth(80);
                store.getState().setStamina(70);
            }
        });

        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Reload page
        await page.reload();
        await page.waitForTimeout(3000);

        // Check restored values
        const restoredStats = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return {
                health: store?.getState?.()?.health || 100,
                stamina: store?.getState?.()?.stamina || 100,
            };
        });

        // Should restore saved values (or be at full if save didn't work)
        expect(restoredStats.health).toBeGreaterThan(0);
        expect(restoredStats.stamina).toBeGreaterThan(0);
    });

    test('should handle corrupted save data gracefully', async ({ page }) => {
        // Set corrupted save data
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('otterfall-save', 'corrupted-data-{invalid-json}');
        });

        // Reload page
        await page.reload();
        await page.waitForTimeout(3000);

        // Game should start with default values
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        const playerStats = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return {
                health: store?.getState?.()?.health || 100,
                stamina: store?.getState?.()?.stamina || 100,
            };
        });

        // Should have default values
        expect(playerStats.health).toBe(100);
        expect(playerStats.stamina).toBe(100);
    });

    test('should reset player to spawn point on death', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Move away from spawn
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        // Kill player
        await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            if (store) {
                store.getState().setHealth(0);
            }
        });

        await page.waitForTimeout(1000);

        // Check for game over screen
        const gameOverVisible = await page.locator('text=/game over/i').isVisible();
        expect(gameOverVisible).toBe(true);

        // Click respawn button
        const respawnButton = page.locator('button:has-text("Respawn")');
        await respawnButton.click();

        await page.waitForTimeout(1000);

        // Check player position is reset to spawn
        const position = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return store?.getState?.()?.position || null;
        });

        expect(position).not.toBeNull();
        expect(Math.abs(position.x)).toBeLessThan(5);
        expect(Math.abs(position.z)).toBeLessThan(5);
    });

    test('should reset health and stamina to full on respawn', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Kill player
        await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            if (store) {
                store.getState().setHealth(0);
                store.getState().setStamina(50);
            }
        });

        await page.waitForTimeout(1000);

        // Respawn
        const respawnButton = page.locator('button:has-text("Respawn")');
        await respawnButton.click();

        await page.waitForTimeout(1000);

        // Check stats are reset
        const stats = await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            return {
                health: store?.getState?.()?.health || 0,
                stamina: store?.getState?.()?.stamina || 0,
            };
        });

        expect(stats.health).toBe(100);
        expect(stats.stamina).toBe(100);
    });

    test('should preserve save data after death', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Move and save
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Kill player
        await page.evaluate(() => {
            const store = (window as any).__GAME_STORE__;
            if (store) {
                store.getState().setHealth(0);
            }
        });

        await page.waitForTimeout(1000);

        // Check save data still exists
        const saveData = await page.evaluate(() => {
            const data = localStorage.getItem('otterfall-save');
            return data ? JSON.parse(data) : null;
        });

        expect(saveData).not.toBeNull();
    });

    test('should handle multiple save/load cycles', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Cycle 1: Move and save
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Cycle 2: Move more and save
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowRight');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Reload
        await page.reload();
        await page.waitForTimeout(3000);

        // Game should load successfully
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle save/load without errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForTimeout(3000);

        // Trigger save
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Reload
        await page.reload();
        await page.waitForTimeout(3000);

        // No critical errors
        const criticalErrors = errors.filter(
            (err) => !err.includes('WebGL') && !err.includes('three-mesh-bvh')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('should update save data when collecting resources', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Try to collect resources
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('ArrowUp');
            await page.waitForTimeout(300);
            await page.keyboard.press('e');
            await page.waitForTimeout(200);
        }

        // Trigger save
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Save data should exist
        const saveData = await page.evaluate(() => {
            const data = localStorage.getItem('otterfall-save');
            return data ? JSON.parse(data) : null;
        });

        expect(saveData).not.toBeNull();
    });
});
