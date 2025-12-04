import { TimePhase } from '../components';
import { world } from '../world';

const TIME_PHASES = {
    dawn: { start: 5, end: 7 },
    day: { start: 7, end: 17 },
    dusk: { start: 17, end: 19 },
    night: { start: 19, end: 5 }
} as const;

function getPhaseFromHour(hour: number): TimePhase {
    const h = hour % 24;
    if (h >= TIME_PHASES.dawn.start && h < TIME_PHASES.dawn.end) return 'dawn';
    if (h >= TIME_PHASES.day.start && h < TIME_PHASES.day.end) return 'day';
    if (h >= TIME_PHASES.dusk.start && h < TIME_PHASES.dusk.end) return 'dusk';
    return 'night';
}

export function TimeSystem(delta: number) {
    // Get the global entity
    // Since we know there's only one world entity with time, we can iterate
    // In Miniplex, we usually query.
    for (const { time } of world.with('time')) {
        // Advance time
        // delta is in seconds. 
        // Let's say 1 real second = 1 game minute (60x speed)
        // So 1 real second = 1/60 game hour
        const gameHoursPassed = (delta * time.timeScale) / 60;

        time.hour = (time.hour + gameHoursPassed) % 24;
        time.phase = getPhaseFromHour(time.hour);

        // Update lighting props based on time
        // Sun angle: 6am = 0, 12pm = 90, 6pm = 180
        // Night: -1 (off)
        if (time.phase === 'night') {
            time.sunIntensity = 0;
            time.ambientLight = 0.2; // Moonlight
        } else {
            // Day/Dawn/Dusk
            const dayProgress = (time.hour - 6) / 12; // 0 at 6am, 1 at 6pm
            time.sunAngle = dayProgress * 180;
            time.sunIntensity = Math.sin(dayProgress * Math.PI);

            if (time.phase === 'dawn' || time.phase === 'dusk') {
                time.ambientLight = 0.5;
                time.fogDensity = 0.04; // Foggy mornings
            } else {
                time.ambientLight = 0.8;
                time.fogDensity = 0.025; // Clear day
            }
        }
    }
}
