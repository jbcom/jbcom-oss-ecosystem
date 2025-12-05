import { world } from '@/ecs/world';
import * as THREE from 'three';

export interface SaveData {
    version: string;
    timestamp: number;
    player: {
        position: [number, number, number];
        health: number;
        stamina: number;
    };
    world: {
        time: number;
        weather: string;
    };
    resources: {
        id: number;
        collected: boolean;
        collectedAt: number;
    }[];
}

const SAVE_KEY = 'otterfall_save';
const SAVE_VERSION = '1.0.0';

export function saveGame(playerState: {
    position: THREE.Vector3;
    health: number;
    stamina: number;
}): void {
    try {
        // Get world state from ECS
        let timeHour = 8;
        let weatherType = 'clear';

        for (const { time, weather } of world.with('time', 'weather')) {
            timeHour = time.hour;
            weatherType = weather.current;
        }

        // Get resource states
        const resources = Array.from(world.with('isResource', 'resource').entities)
            .filter(entity => entity.id !== undefined)
            .map(entity => ({
                id: entity.id!,
                collected: entity.resource?.collected || false,
                collectedAt: entity.resource?.collectedAt || 0,
            }));

        const saveData: SaveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            player: {
                position: [playerState.position.x, playerState.position.y, playerState.position.z],
                health: playerState.health,
                stamina: playerState.stamina,
            },
            world: {
                time: timeHour,
                weather: weatherType,
            },
            resources,
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log('Game saved successfully');
    } catch (error) {
        console.error('Failed to save game:', error);
    }
}

export function loadGame(): SaveData | null {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) return null;

        const data = JSON.parse(savedData) as SaveData;

        // Version check
        if (data.version !== SAVE_VERSION) {
            console.warn('Save data version mismatch, ignoring save');
            return null;
        }

        return data;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
}

export function deleteSave(): void {
    try {
        localStorage.removeItem(SAVE_KEY);
        console.log('Save data deleted');
    } catch (error) {
        console.error('Failed to delete save:', error);
    }
}

export function hasSaveData(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
}
