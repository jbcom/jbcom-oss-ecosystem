import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { BiomeType } from '../../data/biomes';
import { world } from '../../world';
import { BiomeSystem, getBiomeLayout, initializeBiomes } from '../BiomeSystem';

describe('BiomeSystem - Property-Based Tests', () => {
    beforeEach(() => {
        // Clear all entities before each test
        world.clear();
        // Initialize biomes
        initializeBiomes();
    });

    describe('Property 5: Biome Boundary Exclusivity', () => {
        it('should always return exactly one biome for any position', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    (x, z) => {
                        // Setup
                        const entity = world.add({
                            biome: {
                                current: 'marsh' as BiomeType,
                                transitionProgress: 0
                            }
                        });

                        // Execute
                        BiomeSystem(x, z);

                        const biome = entity.biome!.current;

                        // Verify: Should return a valid biome type
                        const validBiomes: BiomeType[] = ['marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland'];
                        expect(validBiomes).toContain(biome);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should return consistent biome for same position', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    (x, z) => {
                        // Setup
                        const entity1 = world.add({
                            biome: {
                                current: 'marsh' as BiomeType,
                                transitionProgress: 0
                            }
                        });

                        // Execute first time
                        BiomeSystem(x, z);
                        const biome1 = entity1.biome!.current;

                        // Clear and execute second time
                        world.remove(entity1);
                        const entity2 = world.add({
                            biome: {
                                current: 'marsh' as BiomeType,
                                transitionProgress: 0
                            }
                        });

                        BiomeSystem(x, z);
                        const biome2 = entity2.biome!.current;

                        // Verify: Same position should return same biome
                        expect(biome2).toBe(biome1);

                        // Cleanup
                        world.remove(entity2);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it('should have marsh biome at origin', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(-10), max: Math.fround(10), noNaN: true }),
                    fc.float({ min: Math.fround(-10), max: Math.fround(10), noNaN: true }),
                    (x, z) => {
                        // Setup
                        const entity = world.add({
                            biome: {
                                current: 'forest' as BiomeType,
                                transitionProgress: 0
                            }
                        });

                        // Execute: Check position near origin (within marsh radius of 25)
                        BiomeSystem(x, z);

                        const biome = entity.biome!.current;

                        // Verify: Should be marsh biome
                        expect(biome).toBe('marsh');

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it('should transition biome when crossing boundaries', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom<BiomeType>('marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland'),
                    fc.constantFrom<BiomeType>('marsh', 'forest', 'desert', 'tundra', 'savanna', 'mountain', 'scrubland'),
                    (startBiome, endBiome) => {
                        // Skip if same biome
                        fc.pre(startBiome !== endBiome);

                        // Setup: Find positions for each biome
                        const layout = getBiomeLayout();
                        const startBounds = layout.find(b => b.type === startBiome);
                        const endBounds = layout.find(b => b.type === endBiome);

                        if (!startBounds || !endBounds) return;

                        const entity = world.add({
                            biome: {
                                current: startBiome,
                                transitionProgress: 0
                            }
                        });

                        // Execute: Move to start biome center
                        BiomeSystem(startBounds.center.x, startBounds.center.y);
                        expect(entity.biome!.current).toBe(startBiome);

                        // Execute: Move to end biome center
                        BiomeSystem(endBounds.center.x, endBounds.center.y);

                        // Verify: Should have transitioned
                        expect(entity.biome!.current).toBe(endBiome);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 50 }
            );
        });

        it('should reset transition progress when entering new biome', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    fc.float({ min: Math.fround(0), max: Math.fround(1), noNaN: true }),
                    (x, z, initialProgress) => {
                        // Setup: Start in a different biome with some transition progress
                        const entity = world.add({
                            biome: {
                                current: 'forest' as BiomeType,
                                transitionProgress: initialProgress
                            }
                        });

                        // Execute: Move to a position
                        BiomeSystem(x, z);
                        const newBiome = entity.biome!.current;

                        // If biome changed, transition progress should reset
                        if (newBiome !== 'forest') {
                            expect(entity.biome!.transitionProgress).toBe(0);
                        }

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should have all 7 biomes accessible', () => {
            // This test verifies that all biome types can be reached
            const layout = getBiomeLayout();
            const biomeTypes = layout.map(b => b.type);

            // Verify: All 7 biomes should be in the layout
            expect(biomeTypes).toContain('marsh');
            expect(biomeTypes).toContain('forest');
            expect(biomeTypes).toContain('desert');
            expect(biomeTypes).toContain('tundra');
            expect(biomeTypes).toContain('savanna');
            expect(biomeTypes).toContain('mountain');
            expect(biomeTypes).toContain('scrubland');
            expect(biomeTypes.length).toBe(7);
        });

        it('should use closest biome center for boundary determination', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    fc.float({ min: Math.fround(-200), max: Math.fround(200), noNaN: true }),
                    (x, z) => {
                        // Setup
                        const entity = world.add({
                            biome: {
                                current: 'marsh' as BiomeType,
                                transitionProgress: 0
                            }
                        });

                        // Execute
                        BiomeSystem(x, z);
                        const biome = entity.biome!.current;

                        // Verify: Find closest biome manually and compare
                        const layout = getBiomeLayout();
                        let closestBiome = layout[0];
                        let closestDist = Math.sqrt(
                            Math.pow(x - closestBiome.center.x, 2) +
                            Math.pow(z - closestBiome.center.y, 2)
                        );

                        for (const b of layout) {
                            const dist = Math.sqrt(
                                Math.pow(x - b.center.x, 2) +
                                Math.pow(z - b.center.y, 2)
                            );
                            if (dist < closestDist) {
                                closestDist = dist;
                                closestBiome = b;
                            }
                        }

                        expect(biome).toBe(closestBiome.type);

                        // Cleanup
                        world.remove(entity);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
