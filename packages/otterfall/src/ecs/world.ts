import { World } from 'miniplex';
import { Entity } from './components';

// Create the global world instance
export const world = new World<Entity>();

// Create the singleton world entity for global state (Time, Weather, Biome)
export const globalEntity = world.add({
    isWorld: true,
    time: {
        hour: 8, // Start at 8 AM
        phase: 'day',
        sunIntensity: 1.0,
        sunAngle: 30,
        ambientLight: 1.0,
        fogDensity: 0,
        timeScale: 1.0 // Real-time for now, can speed up
    },
    weather: {
        current: 'clear',
        intensity: 0,
        transitionProgress: 0,
        nextWeather: null,
        windSpeed: 2,
        windDirection: [1, 0],
        visibilityMod: 1.0,
        startTime: Date.now(),
        durationMinutes: 60
    },
    biome: {
        current: 'marsh',
        transitionProgress: 0
    }
});

// Helper to get the global entity (if we need to access it safely, though export is fine)
export const getGlobalState = () => globalEntity;
