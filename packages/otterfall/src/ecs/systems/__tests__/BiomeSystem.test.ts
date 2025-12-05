import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { getBiomeAtPosition } from '../../data/biomes';
import { getBiomeLayout, initializeBiomes } from '../BiomeSystem';

describe('BiomeSystem', () => {
    beforeEach(() => {
        initializeBiomes();
    });

    // Feature: otterfall-complete, Property 5: Biome Boundary Exclusivity
    // For any position in the world, the position should be contained within 
    // exactly one biome's bounds (determined by closest biome center).
    it('Property 5: Biome Boundary Exclusivity', () => {
        fc.assert(
            fc.property(
                fc.float({ min: -100, max: 100, noNaN: true }),
                fc.float({ min: -100, max: 100, noNaN: true }),
                (x, z) => {
                    const biomeLayout = getBiomeLayout();
                    const biome = getBiomeAtPosition(x, z, biomeLayout);

                    // Verify: Should get exactly one biome
                    expect(biome).toBeDefined();
                    expect(['marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland']).toContain(
                        biome
                    );

                    // Verify: The returned biome should be the closest one
                    const biomeBounds = biomeLayout.find((b) => b.type === biome);
                    expect(biomeBounds).toBeDefined();

                    // Verify: No other biome should be closer
                    if (biomeBounds) {
                        const pos = { x, z };
                        const distToAssignedBiome = Math.sqrt(
                            Math.pow(x - biomeBounds.center.x, 2) + Math.pow(z - biomeBounds.center.y, 2)
                        );

                        for (const otherBiome of biomeLayout) {
                            if (otherBiome.type === biome) continue;
                            const distToOther = Math.sqrt(
                                Math.pow(x - otherBiome.center.x, 2) + Math.pow(z - otherBiome.center.y, 2)
                            );
                            expect(distToAssignedBiome).toBeLessThanOrEqual(distToOther + 0.0001); // Small epsilon for floating point
                        }
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should have distinct biome centers', () => {
        const biomeLayout = getBiomeLayout();

        // Check that all biome centers are distinct
        for (let i = 0; i < biomeLayout.length; i++) {
            for (let j = i + 1; j < biomeLayout.length; j++) {
                const biome1 = biomeLayout[i];
                const biome2 = biomeLayout[j];

                // Centers should be different
                const sameCenter =
                    biome1.center.x === biome2.center.x &&
                    biome1.center.y === biome2.center.y;

                expect(sameCenter).toBe(false);
            }
        }
    });

    it('should cover the entire playable area', () => {
        const biomeLayout = getBiomeLayout();

        // Test grid of positions
        for (let x = -100; x <= 100; x += 10) {
            for (let z = -100; z <= 100; z += 10) {
                const biome = getBiomeAtPosition(x, z, biomeLayout);
                expect(biome).toBeDefined();
                expect(['marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland']).toContain(biome);
            }
        }
    });
});
