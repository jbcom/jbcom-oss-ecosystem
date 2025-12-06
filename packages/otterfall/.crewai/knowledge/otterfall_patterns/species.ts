// Attack types available to predators
export type AttackType = 'bite' | 'claw' | 'tail_whip' | 'headbutt' | 'pounce' | 'roll_crush';

// Combat archetypes
export type CombatArchetype = 'tank' | 'agile' | 'balanced';

// Size categories
export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large';

// Biome types
export type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

// Predator species interface
export interface PredatorSpecies {
    displayName: string;
    size: SizeCategory;
    archetype: CombatArchetype;
    health: number;
    stamina: number;
    armor: number; // Percentage (0-100)
    dodge: number; // Percentage (0-100)
    attacks: AttackType[];
    nativeBiome: BiomeType;
    meshyPrompt: string;
}

// Prey species interface
export interface PreySpecies {
    displayName: string;
    size: SizeCategory;
    health: number;
    fleeSpeed: number; // m/s
    awarenessRadius: number; // units
    dropItems: DropItem[];
    dropChance: number; // Percentage (0-100)
    habitat: 'land' | 'water';
    meshyPrompt: string;
}

// Drop item interface
export interface DropItem {
    itemId: string;
    minQuantity: number;
    maxQuantity: number;
    healthRestore: number;
    staminaRestore: number;
}

/**
 * PREDATOR SPECIES DATA
 * Based on Requirements 1.1, 1.2
 * 13 playable predator species with combat stats
 */
export const PREDATOR_SPECIES: Record<string, PredatorSpecies> = {
    otter: {
        displayName: 'River Otter',
        size: 'medium',
        archetype: 'balanced',
        health: 100,
        stamina: 100,
        armor: 15,
        dodge: 20,
        attacks: ['bite', 'claw', 'tail_whip'],
        nativeBiome: 'marsh',
        meshyPrompt: 'realistic river otter, brown fur, sleek body, webbed paws, playful expression, sculpture style'
    },
    fox: {
        displayName: 'Red Fox',
        size: 'medium',
        archetype: 'balanced',
        health: 100,
        stamina: 100,
        armor: 15,
        dodge: 20,
        attacks: ['bite', 'claw', 'pounce'],
        nativeBiome: 'forest',
        meshyPrompt: 'realistic red fox, orange-red fur, white chest, bushy tail, alert ears, sculpture style'
    },
    badger: {
        displayName: 'European Badger',
        size: 'medium',
        archetype: 'tank',
        health: 150,
        stamina: 80,
        armor: 30,
        dodge: 10,
        attacks: ['bite', 'headbutt'],
        nativeBiome: 'forest',
        meshyPrompt: 'realistic european badger, black and white striped face, gray body, stocky build, powerful claws, sculpture style'
    },
    wolf: {
        displayName: 'Gray Wolf',
        size: 'large',
        archetype: 'tank',
        health: 150,
        stamina: 80,
        armor: 30,
        dodge: 10,
        attacks: ['bite', 'pounce'],
        nativeBiome: 'tundra',
        meshyPrompt: 'realistic gray wolf, gray fur, muscular build, sharp teeth, intense eyes, sculpture style'
    },
    raccoon: {
        displayName: 'Raccoon',
        size: 'small',
        archetype: 'balanced',
        health: 100,
        stamina: 100,
        armor: 15,
        dodge: 20,
        attacks: ['claw', 'bite'],
        nativeBiome: 'marsh',
        meshyPrompt: 'realistic raccoon, gray fur, black mask, ringed tail, dexterous paws, sculpture style'
    },
    pangolin: {
        displayName: 'Pangolin',
        size: 'medium',
        archetype: 'balanced',
        health: 100,
        stamina: 100,
        armor: 15,
        dodge: 20,
        attacks: ['tail_whip', 'roll_crush'],
        nativeBiome: 'savanna',
        meshyPrompt: 'realistic pangolin, brown scales, armored body, long tail, small head, sculpture style'
    },
    mongoose: {
        displayName: 'Mongoose',
        size: 'small',
        archetype: 'agile',
        health: 80,
        stamina: 120,
        armor: 5,
        dodge: 35,
        attacks: ['bite', 'claw', 'pounce'],
        nativeBiome: 'savanna',
        meshyPrompt: 'realistic mongoose, tan fur, slender body, quick movements, alert posture, sculpture style'
    },
    coati: {
        displayName: 'Coati',
        size: 'medium',
        archetype: 'agile',
        health: 80,
        stamina: 120,
        armor: 5,
        dodge: 35,
        attacks: ['claw', 'bite'],
        nativeBiome: 'scrubland',
        meshyPrompt: 'realistic coati, brown fur, long snout, ringed tail, climbing posture, sculpture style'
    },
    meerkat: {
        displayName: 'Meerkat',
        size: 'tiny',
        archetype: 'agile',
        health: 80,
        stamina: 120,
        armor: 5,
        dodge: 35,
        attacks: ['claw', 'bite'],
        nativeBiome: 'desert',
        meshyPrompt: 'realistic meerkat, tan fur, standing upright, alert expression, small size, sculpture style'
    },
    honey_badger: {
        displayName: 'Honey Badger',
        size: 'medium',
        archetype: 'balanced',
        health: 100,
        stamina: 100,
        armor: 15,
        dodge: 20,
        attacks: ['bite', 'claw'],
        nativeBiome: 'desert',
        meshyPrompt: 'realistic honey badger, black and white fur, stocky build, fierce expression, powerful jaws, sculpture style'
    },
    red_panda: {
        displayName: 'Red Panda',
        size: 'small',
        archetype: 'agile',
        health: 80,
        stamina: 120,
        armor: 5,
        dodge: 35,
        attacks: ['claw', 'bite'],
        nativeBiome: 'mountain',
        meshyPrompt: 'realistic red panda, reddish-brown fur, white face markings, bushy tail, tree-climbing, sculpture style'
    },
    wombat: {
        displayName: 'Wombat',
        size: 'medium',
        archetype: 'tank',
        health: 150,
        stamina: 80,
        armor: 30,
        dodge: 10,
        attacks: ['bite', 'headbutt'],
        nativeBiome: 'scrubland',
        meshyPrompt: 'realistic wombat, brown fur, stocky build, short legs, powerful digger, sculpture style'
    },
    tasmanian_devil: {
        displayName: 'Tasmanian Devil',
        size: 'medium',
        archetype: 'tank',
        health: 150,
        stamina: 80,
        armor: 30,
        dodge: 10,
        attacks: ['bite', 'claw'],
        nativeBiome: 'scrubland',
        meshyPrompt: 'realistic tasmanian devil, black fur, white chest patch, powerful jaws, aggressive stance, sculpture style'
    }
} as const;

/**
 * PREY SPECIES DATA
 * Based on Requirements 2.1, 2.2
 * 15 prey species with flee behaviors and drop tables
 */
export const PREY_SPECIES: Record<string, PreySpecies> = {
    rabbit: {
        displayName: 'Rabbit',
        size: 'small',
        health: 20,
        fleeSpeed: 8,
        awarenessRadius: 15,
        dropItems: [{
            itemId: 'rabbit_meat',
            minQuantity: 1,
            maxQuantity: 2,
            healthRestore: 15,
            staminaRestore: 0
        }],
        dropChance: 80,
        habitat: 'land',
        meshyPrompt: 'realistic rabbit, brown fur, long ears, fluffy tail, alert posture, sculpture style'
    },
    deer: {
        displayName: 'Deer',
        size: 'large',
        health: 50,
        fleeSpeed: 10,
        awarenessRadius: 18,
        dropItems: [{
            itemId: 'deer_meat',
            minQuantity: 2,
            maxQuantity: 4,
            healthRestore: 25,
            staminaRestore: 0
        }],
        dropChance: 90,
        habitat: 'land',
        meshyPrompt: 'realistic deer, brown fur, white spots, antlers, graceful build, sculpture style'
    },
    grouse: {
        displayName: 'Grouse',
        size: 'small',
        health: 15,
        fleeSpeed: 7,
        awarenessRadius: 12,
        dropItems: [{
            itemId: 'bird_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 12,
            staminaRestore: 0
        }],
        dropChance: 70,
        habitat: 'land',
        meshyPrompt: 'realistic grouse, brown feathers, plump body, ground bird, sculpture style'
    },
    vole: {
        displayName: 'Vole',
        size: 'tiny',
        health: 10,
        fleeSpeed: 6,
        awarenessRadius: 10,
        dropItems: [{
            itemId: 'small_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 8,
            staminaRestore: 0
        }],
        dropChance: 60,
        habitat: 'land',
        meshyPrompt: 'realistic vole, gray fur, small rodent, round body, sculpture style'
    },
    capybara: {
        displayName: 'Capybara',
        size: 'large',
        health: 60,
        fleeSpeed: 6,
        awarenessRadius: 15,
        dropItems: [{
            itemId: 'capybara_meat',
            minQuantity: 3,
            maxQuantity: 5,
            healthRestore: 20,
            staminaRestore: 0
        }],
        dropChance: 95,
        habitat: 'water',
        meshyPrompt: 'realistic capybara, brown fur, large rodent, semi-aquatic, calm expression, sculpture style'
    },
    wallaby: {
        displayName: 'Wallaby',
        size: 'medium',
        health: 35,
        fleeSpeed: 9,
        awarenessRadius: 16,
        dropItems: [{
            itemId: 'wallaby_meat',
            minQuantity: 2,
            maxQuantity: 3,
            healthRestore: 18,
            staminaRestore: 0
        }],
        dropChance: 85,
        habitat: 'land',
        meshyPrompt: 'realistic wallaby, gray-brown fur, kangaroo-like, long tail, hopping posture, sculpture style'
    },
    fish_bass: {
        displayName: 'Bass',
        size: 'small',
        health: 15,
        fleeSpeed: 5,
        awarenessRadius: 8,
        dropItems: [{
            itemId: 'bass_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 20,
            staminaRestore: 0
        }],
        dropChance: 100,
        habitat: 'water',
        meshyPrompt: 'realistic bass fish, green scales, streamlined body, fins, underwater, sculpture style'
    },
    fish_trout: {
        displayName: 'Trout',
        size: 'small',
        health: 12,
        fleeSpeed: 6,
        awarenessRadius: 8,
        dropItems: [{
            itemId: 'trout_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 18,
            staminaRestore: 0
        }],
        dropChance: 100,
        habitat: 'water',
        meshyPrompt: 'realistic trout fish, silver scales with spots, streamlined body, sculpture style'
    },
    crayfish: {
        displayName: 'Crayfish',
        size: 'tiny',
        health: 8,
        fleeSpeed: 3,
        awarenessRadius: 6,
        dropItems: [{
            itemId: 'crayfish_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 10,
            staminaRestore: 15
        }],
        dropChance: 85,
        habitat: 'water',
        meshyPrompt: 'realistic crayfish, red-brown shell, claws, segmented body, sculpture style'
    },
    frog: {
        displayName: 'Frog',
        size: 'tiny',
        health: 10,
        fleeSpeed: 4,
        awarenessRadius: 8,
        dropItems: [{
            itemId: 'frog_legs',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 12,
            staminaRestore: 10
        }],
        dropChance: 75,
        habitat: 'water',
        meshyPrompt: 'realistic frog, green skin, webbed feet, sitting posture, sculpture style'
    },
    beetle: {
        displayName: 'Beetle',
        size: 'tiny',
        health: 5,
        fleeSpeed: 2,
        awarenessRadius: 5,
        dropItems: [{
            itemId: 'insect_protein',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 8,
            staminaRestore: 0
        }],
        dropChance: 70,
        habitat: 'land',
        meshyPrompt: 'realistic beetle, black shell, six legs, antennae, sculpture style'
    },
    salmon: {
        displayName: 'Salmon',
        size: 'medium',
        health: 25,
        fleeSpeed: 7,
        awarenessRadius: 10,
        dropItems: [{
            itemId: 'salmon_meat',
            minQuantity: 1,
            maxQuantity: 2,
            healthRestore: 25,
            staminaRestore: 0
        }],
        dropChance: 90,
        habitat: 'water',
        meshyPrompt: 'realistic salmon, silver-pink scales, streamlined body, powerful swimmer, sculpture style'
    },
    duck: {
        displayName: 'Duck',
        size: 'small',
        health: 18,
        fleeSpeed: 6,
        awarenessRadius: 12,
        dropItems: [{
            itemId: 'duck_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 15,
            staminaRestore: 0
        }],
        dropChance: 75,
        habitat: 'water',
        meshyPrompt: 'realistic duck, brown feathers, webbed feet, swimming posture, sculpture style'
    },
    squirrel: {
        displayName: 'Squirrel',
        size: 'tiny',
        health: 12,
        fleeSpeed: 7,
        awarenessRadius: 10,
        dropItems: [{
            itemId: 'squirrel_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 10,
            staminaRestore: 0
        }],
        dropChance: 65,
        habitat: 'land',
        meshyPrompt: 'realistic squirrel, red-brown fur, bushy tail, climbing posture, sculpture style'
    },
    lizard: {
        displayName: 'Lizard',
        size: 'tiny',
        health: 8,
        fleeSpeed: 5,
        awarenessRadius: 8,
        dropItems: [{
            itemId: 'lizard_meat',
            minQuantity: 1,
            maxQuantity: 1,
            healthRestore: 8,
            staminaRestore: 0
        }],
        dropChance: 60,
        habitat: 'land',
        meshyPrompt: 'realistic lizard, green-brown scales, long tail, basking posture, sculpture style'
    }
} as const;

/**
 * Helper function to get predator species by ID
 */
export function getPredatorSpecies(speciesId: string): PredatorSpecies | undefined {
    return PREDATOR_SPECIES[speciesId];
}

/**
 * Helper function to get prey species by ID
 */
export function getPreySpecies(speciesId: string): PreySpecies | undefined {
    return PREY_SPECIES[speciesId];
}

/**
 * Get all predator species IDs
 */
export function getAllPredatorIds(): string[] {
    return Object.keys(PREDATOR_SPECIES);
}

/**
 * Get all prey species IDs
 */
export function getAllPreyIds(): string[] {
    return Object.keys(PREY_SPECIES);
}

/**
 * Get predators by archetype
 */
export function getPredatorsByArchetype(archetype: CombatArchetype): Array<[string, PredatorSpecies]> {
    return Object.entries(PREDATOR_SPECIES).filter(([_, species]) => species.archetype === archetype);
}

/**
 * Get predators by native biome
 */
export function getPredatorsByBiome(biome: BiomeType): Array<[string, PredatorSpecies]> {
    return Object.entries(PREDATOR_SPECIES).filter(([_, species]) => species.nativeBiome === biome);
}

/**
 * Get prey by habitat
 */
export function getPreyByHabitat(habitat: 'land' | 'water'): Array<[string, PreySpecies]> {
    return Object.entries(PREY_SPECIES).filter(([_, species]) => species.habitat === habitat);
}
