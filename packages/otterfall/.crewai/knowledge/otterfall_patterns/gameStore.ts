import * as THREE from 'three';
import { create } from 'zustand';
import { loadGame as loadGameUtil, saveGame as saveGameUtil } from '../utils/save';

interface InputState {
    direction: { x: number; y: number };
    active: boolean;
    jump: boolean;
}

interface PlayerState {
    position: THREE.Vector3;
    rotation: number;
    speed: number;
    maxSpeed: number;
    verticalSpeed: number;
    isMoving: boolean;
    isJumping: boolean;
    fallStartY?: number;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    invulnerable: boolean;
    invulnerableUntil: number;
    speciesId: string; // Selected species (e.g., 'otter', 'fox')
    armor: number; // Armor percentage
    dodge: number; // Dodge percentage
}

interface RockData {
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Euler;
    radius: number; // Simplified collision radius
}

interface NearbyResource {
    name: string;
    icon: string;
    type: string;
}

interface GameState {
    loaded: boolean;
    time: number;
    input: InputState;
    player: PlayerState;
    rocks: RockData[];
    gameOver: boolean;
    nearbyResource: NearbyResource | null;

    // Actions
    setLoaded: (loaded: boolean) => void;
    updateTime: (delta: number) => void;
    setInput: (x: number, y: number, active: boolean, jump: boolean) => void;
    updatePlayer: (updates: Partial<PlayerState>) => void;
    setRocks: (rocks: RockData[]) => void;
    damagePlayer: (amount: number) => void;
    healPlayer: (amount: number) => void;
    restoreStamina: (amount: number) => void;
    consumeStamina: (amount: number) => void;
    setGameOver: (gameOver: boolean) => void;
    setNearbyResource: (resource: NearbyResource | null) => void;
    respawn: () => void;
    saveGame: () => void;
    loadGame: () => void;
    setPlayerSpecies: (speciesId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
    loaded: false,
    time: 0,
    input: { direction: { x: 0, y: 0 }, active: false, jump: false },
    player: {
        position: new THREE.Vector3(0, 0, 0),
        rotation: 0,
        speed: 0,
        maxSpeed: 0.15,
        verticalSpeed: 0,
        isMoving: false,
        isJumping: false,
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        invulnerable: false,
        invulnerableUntil: 0,
        speciesId: 'otter', // Default species
        armor: 15, // Balanced archetype default
        dodge: 20, // Balanced archetype default
    },
    rocks: [],
    gameOver: false,
    nearbyResource: null,

    setLoaded: (loaded) => set({ loaded }),
    updateTime: (delta) => set((state) => ({ time: state.time + delta })),
    setInput: (x, y, active, jump) => set({ input: { direction: { x, y }, active, jump } }),
    updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates },
    })),
    setRocks: (rocks) => set({ rocks }),
    damagePlayer: (amount) => set((state) => {
        if (state.player.invulnerable || Date.now() < state.player.invulnerableUntil) {
            return state;
        }
        const newHealth = Math.max(0, state.player.health - amount);
        const gameOver = newHealth <= 0;
        
        // Play damage sound (optional, may not be available in tests)
        try {
            const { getAudioManager } = require('@/utils/audioManager');
            const audioManager = getAudioManager();
            if (audioManager) {
                audioManager.playSound('damage', 0.5);
            }
        } catch (e) {
            // Audio manager not available (e.g., in tests)
        }
        
        return {
            player: {
                ...state.player,
                health: newHealth,
                invulnerableUntil: Date.now() + 1000, // 1 second invulnerability
            },
            gameOver,
        };
    }),
    healPlayer: (amount) => set((state) => ({
        player: {
            ...state.player,
            health: Math.min(state.player.maxHealth, state.player.health + amount),
        },
    })),
    restoreStamina: (amount) => set((state) => ({
        player: {
            ...state.player,
            stamina: Math.min(state.player.maxStamina, state.player.stamina + amount),
        },
    })),
    consumeStamina: (amount) => set((state) => ({
        player: {
            ...state.player,
            stamina: Math.max(0, state.player.stamina - amount),
        },
    })),
    setGameOver: (gameOver) => set({ gameOver }),
    setNearbyResource: (resource) => set({ nearbyResource: resource }),
    respawn: () => set((state) => ({
        player: {
            ...state.player,
            position: new THREE.Vector3(0, 0, 0),
            health: state.player.maxHealth,
            stamina: state.player.maxStamina,
            verticalSpeed: 0,
            isJumping: false,
        },
        gameOver: false,
    })),
    saveGame: () => {
        const state = useGameStore.getState();
        saveGameUtil({
            position: state.player.position,
            health: state.player.health,
            stamina: state.player.stamina,
        });
    },
    loadGame: () => {
        const saveData = loadGameUtil();
        if (!saveData) return;

        set((state) => ({
            player: {
                ...state.player,
                position: new THREE.Vector3(...saveData.player.position),
                health: saveData.player.health,
                stamina: saveData.player.stamina,
            },
        }));
    },
    setPlayerSpecies: (speciesId: string) => {
        // Import species data dynamically to avoid circular dependencies
        const { getPredatorSpecies } = require('@/ecs/data/species');
        const species = getPredatorSpecies(speciesId);
        
        if (!species) {
            console.error(`Unknown species: ${speciesId}`);
            return;
        }
        
        set((state) => ({
            player: {
                ...state.player,
                speciesId,
                health: species.health,
                maxHealth: species.health,
                stamina: species.stamina,
                maxStamina: species.stamina,
                armor: species.armor,
                dodge: species.dodge,
            },
        }));
    },
}));
