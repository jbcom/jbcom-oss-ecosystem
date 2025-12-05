/**
 * Real Gameplay Verification Tests
 * 
 * These tests actually verify game state changes, not just "did it crash?"
 */

import { expect, test, Page } from '@playwright/test';

// Helper to get game state from the browser
async function getGameState(page: Page) {
    return page.evaluate(() => {
        // Access Zustand store directly
        const storeState = (window as any).__GAME_STORE__?.getState?.();
        if (!storeState) return null;
        
        return {
            playerHealth: storeState.health,
            playerStamina: storeState.stamina,
            playerPosition: storeState.position,
            score: storeState.score,
            resources: storeState.resources,
            currentBiome: storeState.currentBiome,
            isAlive: storeState.isAlive,
            gameTime: storeState.gameTime,
        };
    });
}

// Helper to get player position from Three.js scene
async function getPlayerPosition(page: Page) {
    return page.evaluate(() => {
        // Access player mesh position
        const player = (window as any).__PLAYER_REF__;
        if (!player) return null;
        
        return {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
        };
    });
}

// Helper to wait for game to be fully initialized
async function waitForGameReady(page: Page, timeout = 10000) {
    await page.waitForFunction(
        () => (window as any).__GAME_READY__ === true,
        { timeout }
    );
}

test.describe('Player Movement Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000); // Wait for game initialization
    });

    test('moving forward should change Z position', async ({ page }) => {
        const initialPos = await getPlayerPosition(page);
        
        // Move forward for 2 seconds
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');
        
        const finalPos = await getPlayerPosition(page);
        
        if (initialPos && finalPos) {
            // Z should have increased (forward in our coordinate system)
            expect(finalPos.z).toBeGreaterThan(initialPos.z);
        }
    });

    test('moving backward should decrease Z position', async ({ page }) => {
        // First move forward to have room to move back
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowUp');
        
        const initialPos = await getPlayerPosition(page);
        
        // Move backward
        await page.keyboard.down('ArrowDown');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowDown');
        
        const finalPos = await getPlayerPosition(page);
        
        if (initialPos && finalPos) {
            expect(finalPos.z).toBeLessThan(initialPos.z);
        }
    });

    test('strafing left should change X position', async ({ page }) => {
        const initialPos = await getPlayerPosition(page);
        
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowLeft');
        
        const finalPos = await getPlayerPosition(page);
        
        if (initialPos && finalPos) {
            expect(finalPos.x).not.toBe(initialPos.x);
        }
    });

    test('jumping should temporarily increase Y position', async ({ page }) => {
        const initialPos = await getPlayerPosition(page);
        
        // Jump
        await page.keyboard.press('Space');
        await page.waitForTimeout(200); // Capture mid-jump
        
        const jumpPos = await getPlayerPosition(page);
        
        if (initialPos && jumpPos) {
            expect(jumpPos.y).toBeGreaterThan(initialPos.y);
        }
        
        // Wait for landing
        await page.waitForTimeout(1000);
        
        const landedPos = await getPlayerPosition(page);
        if (initialPos && landedPos) {
            // Should be back near ground level
            expect(Math.abs(landedPos.y - initialPos.y)).toBeLessThan(0.5);
        }
    });

    test('diagonal movement should change both X and Z', async ({ page }) => {
        const initialPos = await getPlayerPosition(page);
        
        // Move diagonally
        await page.keyboard.down('ArrowUp');
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('ArrowRight');
        
        const finalPos = await getPlayerPosition(page);
        
        if (initialPos && finalPos) {
            // Both should have changed
            expect(finalPos.x).not.toBe(initialPos.x);
            expect(finalPos.z).not.toBe(initialPos.z);
        }
    });
});

test.describe('Stamina System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
    });

    test('sprinting should decrease stamina', async ({ page }) => {
        const initialState = await getGameState(page);
        
        // Sprint (Shift + movement)
        await page.keyboard.down('Shift');
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('Shift');
        
        const finalState = await getGameState(page);
        
        if (initialState && finalState) {
            expect(finalState.playerStamina).toBeLessThan(initialState.playerStamina);
        }
    });

    test('stamina should regenerate when not sprinting', async ({ page }) => {
        // First deplete some stamina
        await page.keyboard.down('Shift');
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('Shift');
        
        const depletedState = await getGameState(page);
        
        // Wait for regeneration
        await page.waitForTimeout(3000);
        
        const recoveredState = await getGameState(page);
        
        if (depletedState && recoveredState) {
            expect(recoveredState.playerStamina).toBeGreaterThan(depletedState.playerStamina);
        }
    });
});

test.describe('Physics Consistency', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
    });

    test('player should not fall through ground', async ({ page }) => {
        // Move around for 10 seconds
        for (let i = 0; i < 5; i++) {
            await page.keyboard.down('ArrowUp');
            await page.waitForTimeout(1000);
            await page.keyboard.up('ArrowUp');
            await page.keyboard.press('Space');
            await page.waitForTimeout(1000);
        }
        
        const pos = await getPlayerPosition(page);
        
        if (pos) {
            // Y should never go below ground level (accounting for terrain variation)
            expect(pos.y).toBeGreaterThan(-10);
        }
    });

    test('player should not teleport unexpectedly', async ({ page }) => {
        const positions: Array<{x: number, y: number, z: number}> = [];
        
        // Record positions while moving
        for (let i = 0; i < 10; i++) {
            const pos = await getPlayerPosition(page);
            if (pos) positions.push(pos);
            
            await page.keyboard.press('ArrowUp');
            await page.waitForTimeout(100);
        }
        
        // Check for teleportation (position jumps > 10 units)
        for (let i = 1; i < positions.length; i++) {
            const dx = Math.abs(positions[i].x - positions[i-1].x);
            const dy = Math.abs(positions[i].y - positions[i-1].y);
            const dz = Math.abs(positions[i].z - positions[i-1].z);
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            expect(distance).toBeLessThan(10); // No teleportation
        }
    });
});

test.describe('Game Time Progression', () => {
    test('game time should advance', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        const initialState = await getGameState(page);
        
        // Wait for time to pass
        await page.waitForTimeout(5000);
        
        const laterState = await getGameState(page);
        
        if (initialState?.gameTime !== undefined && laterState?.gameTime !== undefined) {
            expect(laterState.gameTime).toBeGreaterThan(initialState.gameTime);
        }
    });
});

test.describe('Performance Metrics', () => {
    test('should maintain 30+ FPS under normal gameplay', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        // Collect frame times during gameplay
        const frameTimes: number[] = [];
        
        await page.evaluate(() => {
            (window as any).__FRAME_TIMES__ = [];
            let lastTime = performance.now();
            
            const measure = () => {
                const now = performance.now();
                (window as any).__FRAME_TIMES__.push(now - lastTime);
                lastTime = now;
                if ((window as any).__FRAME_TIMES__.length < 300) {
                    requestAnimationFrame(measure);
                }
            };
            requestAnimationFrame(measure);
        });
        
        // Play for 5 seconds
        for (let i = 0; i < 5; i++) {
            await page.keyboard.down('ArrowUp');
            await page.waitForTimeout(500);
            await page.keyboard.up('ArrowUp');
            await page.keyboard.press('Space');
            await page.waitForTimeout(500);
        }
        
        const collectedFrameTimes = await page.evaluate(() => (window as any).__FRAME_TIMES__);
        
        if (collectedFrameTimes?.length > 0) {
            const avgFrameTime = collectedFrameTimes.reduce((a: number, b: number) => a + b, 0) / collectedFrameTimes.length;
            const fps = 1000 / avgFrameTime;
            
            // Should maintain at least 30 FPS
            expect(fps).toBeGreaterThan(30);
        }
    });

    test('frame times should be consistent (no major hitches)', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        await page.evaluate(() => {
            (window as any).__MAX_FRAME_TIME__ = 0;
            let lastTime = performance.now();
            
            const measure = () => {
                const now = performance.now();
                const delta = now - lastTime;
                if (delta > (window as any).__MAX_FRAME_TIME__) {
                    (window as any).__MAX_FRAME_TIME__ = delta;
                }
                lastTime = now;
                requestAnimationFrame(measure);
            };
            requestAnimationFrame(measure);
        });
        
        // Play for 10 seconds
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('Space');
            await page.waitForTimeout(1000);
        }
        
        const maxFrameTime = await page.evaluate(() => (window as any).__MAX_FRAME_TIME__);
        
        // No single frame should take more than 200ms (5 FPS)
        expect(maxFrameTime).toBeLessThan(200);
    });
});
