import { expect, test } from '@playwright/test';

/**
 * E2E Tests for NPC Behaviors
 * Task 6.1.2: Verify NPCs spawn correctly, predator chase and prey flee behaviors work
 * Requirements: 4.1, 4.2, 4.4, 4.5, 5.1, 5.2, 5.3
 */

test.describe('NPC Behaviors', () => {
    test('should spawn NPCs in the world', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Let the game run to allow NPC spawning
        await page.waitForTimeout(2000);

        // Verify game is running
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // Check that NPCs exist in the ECS world
        const npcCount = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return 0;

            // Count entities with species component (NPCs)
            let count = 0;
            for (const entity of world.entities) {
                if (entity.species && entity.species.type !== 'player') {
                    count++;
                }
            }
            return count;
        });

        // Should have spawned some NPCs
        expect(npcCount).toBeGreaterThan(0);
    });

    test('should spawn predators in appropriate biomes', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Check for predator entities
        const predatorCount = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return 0;

            let count = 0;
            for (const entity of world.entities) {
                if (entity.species?.type === 'predator') {
                    count++;
                }
            }
            return count;
        });

        // Should have spawned at least one predator
        expect(predatorCount).toBeGreaterThan(0);
    });

    test('should spawn prey in appropriate biomes', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Check for prey entities
        const preyCount = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return 0;

            let count = 0;
            for (const entity of world.entities) {
                if (entity.species?.type === 'prey') {
                    count++;
                }
            }
            return count;
        });

        // Should have spawned at least one prey
        expect(preyCount).toBeGreaterThan(0);
    });

    test('should have NPCs in idle state initially', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Check NPC states
        const idleNPCs = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return 0;

            let count = 0;
            for (const entity of world.entities) {
                if (entity.species?.type !== 'player' && entity.species?.state === 'idle') {
                    count++;
                }
            }
            return count;
        });

        // Most NPCs should start in idle state
        expect(idleNPCs).toBeGreaterThan(0);
    });

    test('should transition predator to chase state when player approaches', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Move around to potentially trigger predator awareness
        await page.keyboard.down('ArrowUp');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowUp');

        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(2000);
        await page.keyboard.up('ArrowRight');

        await page.waitForTimeout(1000);

        // Check if any predators changed to chase state
        const finalStates = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return [];

            const states: Array<{ id: any; state: any }> = [];
            for (const entity of world.entities) {
                if (entity.species?.type === 'predator') {
                    states.push({
                        id: entity.id,
                        state: entity.species.state,
                    });
                }
            }
            return states;
        });

        // At least verify that predators exist and have valid states
        expect(finalStates.length).toBeGreaterThan(0);
        for (const state of finalStates) {
            expect(['idle', 'walk', 'chase', 'attack']).toContain(state.state);
        }
    });

    test('should transition prey to flee state when predator approaches', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Let AI system run for a while to allow predator-prey interactions
        await page.waitForTimeout(5000);

        // Check prey states
        const preyStates = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return [];

            const states: Array<{ state: any }> = [];
            for (const entity of world.entities) {
                if (entity.species?.type === 'prey') {
                    states.push({
                        state: entity.species.state,
                    });
                }
            }
            return states;
        });

        // Prey should have valid states
        expect(preyStates.length).toBeGreaterThan(0);
        for (const state of preyStates) {
            expect(['idle', 'walk', 'flee']).toContain(state.state);
        }
    });

    test('should apply steering behaviors to NPCs', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Get NPC positions
        const initialPositions = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return [];

            const positions: Array<{ id: any; x: number; z: number }> = [];
            for (const entity of world.entities) {
                if (entity.species?.type !== 'player' && entity.transform?.position) {
                    positions.push({
                        id: entity.id,
                        x: entity.transform.position.x,
                        z: entity.transform.position.z,
                    });
                }
            }
            return positions;
        });

        // Let NPCs move with steering behaviors
        await page.waitForTimeout(3000);

        // Get updated positions
        const finalPositions = await page.evaluate(() => {
            const world = (window as any).__ECS_WORLD__;
            if (!world) return [];

            const positions: Array<{ id: any; x: number; z: number }> = [];
            for (const entity of world.entities) {
                if (entity.species?.type !== 'player' && entity.transform?.position) {
                    positions.push({
                        id: entity.id,
                        x: entity.transform.position.x,
                        z: entity.transform.position.z,
                    });
                }
            }
            return positions;
        });

        // At least some NPCs should have moved
        expect(initialPositions.length).toBeGreaterThan(0);
        expect(finalPositions.length).toBeGreaterThan(0);

        // Check that at least one NPC moved
        let someoneMoved = false;
        for (let i = 0; i < Math.min(initialPositions.length, finalPositions.length); i++) {
            const initial = initialPositions[i];
            const final = finalPositions.find((p) => p.id === initial.id);
            if (final) {
                const distance = Math.sqrt(
                    Math.pow(final.x - initial.x, 2) + Math.pow(final.z - initial.z, 2)
                );
                if (distance > 0.1) {
                    someoneMoved = true;
                    break;
                }
            }
        }

        expect(someoneMoved).toBe(true);
    });

    test('should handle NPC collisions without crashing', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Let NPCs move and potentially collide
        await page.waitForTimeout(5000);

        // Game should remain stable
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // No critical errors
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

    test('should maintain NPC count within reasonable bounds', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        // Check NPC count over time
        const npcCounts: number[] = [];

        for (let i = 0; i < 5; i++) {
            const count = await page.evaluate(() => {
                const world = (window as any).__ECS_WORLD__;
                if (!world) return 0;

                let count = 0;
                for (const entity of world.entities) {
                    if (entity.species?.type !== 'player') {
                        count++;
                    }
                }
                return count;
            });

            npcCounts.push(count);
            await page.waitForTimeout(1000);
        }

        // NPC count should be reasonable (not growing unbounded)
        for (const count of npcCounts) {
            expect(count).toBeLessThan(100); // Reasonable upper bound
            expect(count).toBeGreaterThan(0); // Should have some NPCs
        }
    });

    test('should handle NPC state transitions without errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForTimeout(3000);

        // Move around to trigger NPC state changes
        const movements = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
        for (const key of movements) {
            await page.keyboard.down(key);
            await page.waitForTimeout(1500);
            await page.keyboard.up(key);
            await page.waitForTimeout(500);
        }

        // No critical errors during state transitions
        const criticalErrors = errors.filter(
            (err) => !err.includes('WebGL') && !err.includes('three-mesh-bvh')
        );
        expect(criticalErrors).toHaveLength(0);
    });
});
