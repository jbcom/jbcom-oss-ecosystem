/**
 * Input Recording and Replay Testing
 * 
 * Record input sequences and replay them to verify deterministic behavior.
 * This is how AAA games test gameplay - record a sequence, replay it,
 * verify the outcome is identical.
 */

import { expect, test, Page } from '@playwright/test';

interface InputEvent {
    type: 'keydown' | 'keyup';
    key: string;
    timestamp: number;
}

interface GameSnapshot {
    position: { x: number; y: number; z: number } | null;
    health: number | null;
    stamina: number | null;
    timestamp: number;
}

// Helper to record inputs
async function startInputRecording(page: Page) {
    await page.evaluate(() => {
        (window as any).__RECORDED_INPUTS__ = [];
        const startTime = Date.now();
        
        const recordEvent = (e: KeyboardEvent) => {
            (window as any).__RECORDED_INPUTS__.push({
                type: e.type,
                key: e.key,
                timestamp: Date.now() - startTime,
            });
        };
        
        document.addEventListener('keydown', recordEvent);
        document.addEventListener('keyup', recordEvent);
        (window as any).__RECORDING_START__ = startTime;
    });
}

async function stopInputRecording(page: Page): Promise<InputEvent[]> {
    return page.evaluate(() => {
        const inputs = (window as any).__RECORDED_INPUTS__ || [];
        return inputs;
    });
}

// Helper to replay inputs
async function replayInputs(page: Page, inputs: InputEvent[]) {
    for (const input of inputs) {
        if (input.type === 'keydown') {
            await page.keyboard.down(input.key);
        } else {
            await page.keyboard.up(input.key);
        }
        
        // Wait until next input timestamp
        const nextInput = inputs[inputs.indexOf(input) + 1];
        if (nextInput) {
            const delay = nextInput.timestamp - input.timestamp;
            if (delay > 0) {
                await page.waitForTimeout(delay);
            }
        }
    }
}

// Helper to take game snapshot
async function takeSnapshot(page: Page): Promise<GameSnapshot> {
    return page.evaluate(() => {
        const store = (window as any).__GAME_STORE__?.getState?.();
        const player = (window as any).__PLAYER_REF__;
        
        return {
            position: player ? {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z,
            } : null,
            health: store?.health ?? null,
            stamina: store?.stamina ?? null,
            timestamp: Date.now(),
        };
    });
}

test.describe('Input Recording and Replay', () => {
    test('basic movement should be reproducible', async ({ page }) => {
        // First run - record inputs
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        await startInputRecording(page);
        
        // Perform a specific movement sequence
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowUp');
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(1000);
        await page.keyboard.up('ArrowRight');
        
        const recordedInputs = await stopInputRecording(page);
        const firstSnapshot = await takeSnapshot(page);
        
        // Second run - replay inputs
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        await replayInputs(page, recordedInputs);
        await page.waitForTimeout(500); // Wait for physics to settle
        
        const secondSnapshot = await takeSnapshot(page);
        
        // Positions should be similar (allowing for physics variance)
        if (firstSnapshot.position && secondSnapshot.position) {
            const tolerance = 2.0; // Allow 2 unit variance for physics
            expect(Math.abs(firstSnapshot.position.x - secondSnapshot.position.x)).toBeLessThan(tolerance);
            expect(Math.abs(firstSnapshot.position.z - secondSnapshot.position.z)).toBeLessThan(tolerance);
        }
    });
});

test.describe('Predefined Test Sequences', () => {
    // Predefined input sequences for regression testing
    const testSequences: Record<string, InputEvent[]> = {
        'walk_forward': [
            { type: 'keydown', key: 'ArrowUp', timestamp: 0 },
            { type: 'keyup', key: 'ArrowUp', timestamp: 2000 },
        ],
        'jump_forward': [
            { type: 'keydown', key: 'ArrowUp', timestamp: 0 },
            { type: 'keydown', key: 'Space', timestamp: 500 },
            { type: 'keyup', key: 'Space', timestamp: 600 },
            { type: 'keyup', key: 'ArrowUp', timestamp: 2000 },
        ],
        'circle_strafe': [
            { type: 'keydown', key: 'ArrowUp', timestamp: 0 },
            { type: 'keydown', key: 'ArrowRight', timestamp: 0 },
            { type: 'keyup', key: 'ArrowUp', timestamp: 1000 },
            { type: 'keydown', key: 'ArrowDown', timestamp: 1000 },
            { type: 'keyup', key: 'ArrowRight', timestamp: 2000 },
            { type: 'keydown', key: 'ArrowLeft', timestamp: 2000 },
            { type: 'keyup', key: 'ArrowDown', timestamp: 3000 },
            { type: 'keydown', key: 'ArrowUp', timestamp: 3000 },
            { type: 'keyup', key: 'ArrowLeft', timestamp: 4000 },
            { type: 'keyup', key: 'ArrowUp', timestamp: 4000 },
        ],
        'bunny_hop': [
            { type: 'keydown', key: 'ArrowUp', timestamp: 0 },
            { type: 'keydown', key: 'Space', timestamp: 100 },
            { type: 'keyup', key: 'Space', timestamp: 200 },
            { type: 'keydown', key: 'Space', timestamp: 800 },
            { type: 'keyup', key: 'Space', timestamp: 900 },
            { type: 'keydown', key: 'Space', timestamp: 1500 },
            { type: 'keyup', key: 'Space', timestamp: 1600 },
            { type: 'keydown', key: 'Space', timestamp: 2200 },
            { type: 'keyup', key: 'Space', timestamp: 2300 },
            { type: 'keyup', key: 'ArrowUp', timestamp: 3000 },
        ],
    };

    for (const [name, sequence] of Object.entries(testSequences)) {
        test(`sequence: ${name} should complete without errors`, async ({ page }) => {
            await page.goto('/');
            await page.waitForTimeout(3000);
            
            // Capture any console errors
            const errors: string[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            await replayInputs(page, sequence);
            await page.waitForTimeout(1000);
            
            // No errors should have occurred
            const gameErrors = errors.filter(e => 
                !e.includes('404') && // Ignore missing assets
                !e.includes('Failed to load') // Ignore load failures
            );
            expect(gameErrors).toHaveLength(0);
            
            // Game should still be running
            const canvas = page.locator('canvas');
            await expect(canvas).toBeVisible();
        });
    }
});

test.describe('Fuzz Testing', () => {
    test('random input sequence should not crash the game', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);
        
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Shift'];
        const heldKeys = new Set<string>();
        
        // Generate 100 random input events
        for (let i = 0; i < 100; i++) {
            const key = keys[Math.floor(Math.random() * keys.length)];
            const shouldPress = Math.random() > 0.5;
            
            if (shouldPress && !heldKeys.has(key)) {
                await page.keyboard.down(key);
                heldKeys.add(key);
            } else if (!shouldPress && heldKeys.has(key)) {
                await page.keyboard.up(key);
                heldKeys.delete(key);
            }
            
            await page.waitForTimeout(50 + Math.random() * 100);
        }
        
        // Release all held keys
        for (const key of heldKeys) {
            await page.keyboard.up(key);
        }
        
        // Game should still be running
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });
});
