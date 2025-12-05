/**
 * Stress and Soak Testing
 * 
 * Tests that run the game under stress conditions to find issues
 * that only appear during extended play or heavy load.
 */

import { expect, test, Page } from '@playwright/test';

// Increase timeout for stress tests
test.setTimeout(120000); // 2 minutes

test.describe('Extended Play Stability', () => {
    test('60 second continuous play without crash', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        const startTime = Date.now();
        const duration = 60000; // 60 seconds
        
        // Continuous random input
        while (Date.now() - startTime < duration) {
            const actions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            await page.keyboard.press(action);
            await page.waitForTimeout(100 + Math.random() * 200);
        }
        
        // Game should still be running
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
        
        // No JavaScript errors
        const errors = await page.evaluate(() => (window as any).__JS_ERRORS__ || []);
        expect(errors.length).toBe(0);
    });
});

test.describe('Memory Stress', () => {
    test('memory should stabilize after initial load', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(5000); // Let initial load settle
        
        const measurements: number[] = [];
        
        // Take memory measurements every 5 seconds for 30 seconds
        for (let i = 0; i < 6; i++) {
            const memory = await page.evaluate(() => {
                if ((performance as any).memory) {
                    return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
                }
                return null;
            });
            
            if (memory) measurements.push(memory);
            
            // Random gameplay
            await page.keyboard.down('ArrowUp');
            await page.waitForTimeout(2000);
            await page.keyboard.up('ArrowUp');
            await page.keyboard.press('Space');
            await page.waitForTimeout(3000);
        }
        
        if (measurements.length >= 3) {
            // Memory should not grow linearly (indicates leak)
            const firstHalf = measurements.slice(0, 3);
            const secondHalf = measurements.slice(3);
            
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            
            // Second half shouldn't be more than 50% larger than first half
            expect(secondAvg).toBeLessThan(firstAvg * 1.5);
        }
    });

    test('rapid scene changes should not leak memory', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        const initialMemory = await page.evaluate(() => {
            if ((performance as any).memory) {
                return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
            }
            return null;
        });
        
        // Rapidly move around triggering chunk loads/unloads
        for (let i = 0; i < 20; i++) {
            const direction = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][i % 4];
            await page.keyboard.down(direction);
            await page.waitForTimeout(500);
            await page.keyboard.up(direction);
        }
        
        // Force garbage collection if available
        await page.evaluate(() => {
            if ((window as any).gc) (window as any).gc();
        });
        await page.waitForTimeout(2000);
        
        const finalMemory = await page.evaluate(() => {
            if ((performance as any).memory) {
                return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
            }
            return null;
        });
        
        if (initialMemory && finalMemory) {
            // Memory growth should be less than 100MB
            expect(finalMemory - initialMemory).toBeLessThan(100);
        }
    });
});

test.describe('Input Stress', () => {
    test('rapid key mashing should not cause issues', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        // Mash all movement keys rapidly
        for (let i = 0; i < 100; i++) {
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowLeft');
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('Space');
        }
        
        // Game should still be responsive
        await page.waitForTimeout(1000);
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('holding all keys simultaneously should not crash', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        // Hold all keys at once
        await page.keyboard.down('ArrowUp');
        await page.keyboard.down('ArrowDown');
        await page.keyboard.down('ArrowLeft');
        await page.keyboard.down('ArrowRight');
        await page.keyboard.down('Space');
        await page.keyboard.down('Shift');
        
        await page.waitForTimeout(3000);
        
        // Release all
        await page.keyboard.up('ArrowUp');
        await page.keyboard.up('ArrowDown');
        await page.keyboard.up('ArrowLeft');
        await page.keyboard.up('ArrowRight');
        await page.keyboard.up('Space');
        await page.keyboard.up('Shift');
        
        // Game should still be running
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});

test.describe('Edge Cases', () => {
    test('should handle page visibility changes', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        // Start moving
        await page.keyboard.down('ArrowUp');
        
        // Simulate tab becoming hidden
        await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', { value: true, writable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        
        await page.waitForTimeout(2000);
        
        // Simulate tab becoming visible again
        await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', { value: false, writable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        
        await page.keyboard.up('ArrowUp');
        await page.waitForTimeout(1000);
        
        // Game should resume properly
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should handle window resize', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        // Resize window multiple times
        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(500);
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
        await page.waitForTimeout(500);
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(500);
        
        // Game should handle all resizes
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});
