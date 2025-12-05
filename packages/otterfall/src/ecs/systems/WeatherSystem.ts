import { WeatherType } from '../components';
import { world } from '../world';

const WEATHER_TYPES: WeatherType[] = ['clear', 'rain', 'fog', 'snow', 'storm', 'sandstorm'];

const WEATHER_CONFIG = {
    clear: {
        intensity: 0,
        visibilityMod: 1.0,
        windSpeedMult: 1.0,
        movementSpeedMult: 1.0,
    },
    rain: {
        intensity: 0.7,
        visibilityMod: 0.8, // 20% reduction
        windSpeedMult: 1.5,
        movementSpeedMult: 1.0,
    },
    fog: {
        intensity: 0.5,
        visibilityMod: 0.5, // 50% reduction
        windSpeedMult: 0.5,
        movementSpeedMult: 1.0,
    },
    snow: {
        intensity: 0.6,
        visibilityMod: 0.7,
        windSpeedMult: 1.2,
        movementSpeedMult: 0.85, // 15% reduction
    },
    storm: {
        intensity: 1.0,
        visibilityMod: 0.5,
        windSpeedMult: 4.0, // 300% increase
        movementSpeedMult: 0.9,
    },
    sandstorm: {
        intensity: 0.9,
        visibilityMod: 0.3, // 70% reduction
        windSpeedMult: 5.0, // 400% increase
        movementSpeedMult: 0.8,
    },
} as const;

const TRANSITION_DURATION = 30; // seconds

export function WeatherSystem(delta: number) {
    for (const { weather } of world.with('weather')) {
        const now = Date.now();
        const elapsedMinutes = (now - weather.startTime) / 60000;

        // Check if we need to transition to new weather
        if (elapsedMinutes > weather.durationMinutes && !weather.nextWeather) {
            // Select next weather
            const nextIndex = Math.floor(Math.random() * WEATHER_TYPES.length);
            weather.nextWeather = WEATHER_TYPES[nextIndex];
            weather.transitionProgress = 0;
        }

        // Handle weather transition
        if (weather.nextWeather) {
            weather.transitionProgress += delta / TRANSITION_DURATION;

            if (weather.transitionProgress >= 1.0) {
                // Transition complete
                weather.current = weather.nextWeather;
                weather.nextWeather = null;
                weather.transitionProgress = 0;
                weather.startTime = now;
                weather.durationMinutes = 5 + Math.random() * 15; // 5-20 mins
                
                // Apply new weather properties immediately
                const config = WEATHER_CONFIG[weather.current];
                weather.intensity = config.intensity;
                weather.visibilityMod = config.visibilityMod;
                weather.windSpeed = 2 * config.windSpeedMult;
            } else {
                // Interpolate weather properties during transition
                const currentConfig = WEATHER_CONFIG[weather.current];
                const nextConfig = WEATHER_CONFIG[weather.nextWeather];
                const t = weather.transitionProgress;

                weather.intensity = currentConfig.intensity * (1 - t) + nextConfig.intensity * t;
                weather.visibilityMod = currentConfig.visibilityMod * (1 - t) + nextConfig.visibilityMod * t;
                weather.windSpeed = 2 * (currentConfig.windSpeedMult * (1 - t) + nextConfig.windSpeedMult * t);
            }
        } else {
            // Apply current weather properties
            const config = WEATHER_CONFIG[weather.current];
            weather.intensity = config.intensity;
            weather.visibilityMod = config.visibilityMod;
            weather.windSpeed = 2 * config.windSpeedMult;
        }

        // Clamp visibility to [0, 1]
        weather.visibilityMod = Math.max(0, Math.min(1, weather.visibilityMod));
    }
}

// Export for use in other systems (e.g., player movement)
export function getWeatherMovementMultiplier(): number {
    for (const { weather } of world.with('weather')) {
        const config = WEATHER_CONFIG[weather.current];
        return config.movementSpeedMult;
    }
    return 1.0;
}
