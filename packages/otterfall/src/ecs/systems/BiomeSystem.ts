import { BiomeBounds, BIOMES, BiomeType, generateBiomeLayout, getBiomeAtPosition } from '../data/biomes';
import { world } from '../world';

let biomeLayout: BiomeBounds[] | null = null;

export function initializeBiomes() {
    if (!biomeLayout) {
        biomeLayout = generateBiomeLayout();
    }
}

export function BiomeSystem(playerX: number, playerZ: number) {
    if (!biomeLayout) {
        initializeBiomes();
    }

    const newBiome = getBiomeAtPosition(playerX, playerZ, biomeLayout!);

    // Update global biome state
    for (const { biome } of world.with('biome')) {
        if (newBiome !== biome.current) {
            console.log(`Entered biome: ${BIOMES[newBiome].name}`);
            biome.current = newBiome;
            biome.transitionProgress = 0;
        }
    }
}

export function getCurrentBiome(): BiomeType {
    for (const { biome } of world.with('biome')) {
        return biome.current;
    }
    return 'marsh';
}

export function getBiomeLayout(): BiomeBounds[] {
    if (!biomeLayout) {
        initializeBiomes();
    }
    return biomeLayout!;
}
