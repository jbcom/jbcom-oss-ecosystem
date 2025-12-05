import { useGameStore } from '@/stores/gameStore';
import { getAdaptiveQualityManager } from '@/utils/adaptiveQuality';
import { getMemoryMonitor } from '@/utils/memoryMonitor';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AISystem } from '../ecs/systems/AISystem';
import { BiomeSystem } from '../ecs/systems/BiomeSystem';
import { CollisionSystem } from '../ecs/systems/CollisionSystem';
import { ResourceSystem } from '../ecs/systems/ResourceSystem';
import { SpawnSystem } from '../ecs/systems/SpawnSystem';
import { TimeSystem } from '../ecs/systems/TimeSystem';
import { WeatherSystem } from '../ecs/systems/WeatherSystem';
import { AudioSystem } from './AudioSystem';

export function GameSystems() {
    const playerPos = useGameStore((s) => s.player.position);
    const qualityManager = useRef(getAdaptiveQualityManager());
    const memoryMonitor = useRef(getMemoryMonitor());
    const lastQualityCheck = useRef(0);
    const lastMemoryCheck = useRef(0);

    useFrame((_, delta) => {
        // Monitor frame time for adaptive quality
        const frameTimeMs = delta * 1000;
        qualityManager.current.recordFrameTime(frameTimeMs);

        // Check quality every 60 frames (~1 second)
        lastQualityCheck.current++;
        if (lastQualityCheck.current >= 60) {
            const changed = qualityManager.current.updateQuality();
            if (changed) {
                const settings = qualityManager.current.getSettings();
                console.log('Adaptive quality adjusted:', settings);
            }
            lastQualityCheck.current = 0;
        }

        // Check memory every 300 frames (~5 seconds)
        lastMemoryCheck.current++;
        if (lastMemoryCheck.current >= 300) {
            const gcTriggered = memoryMonitor.current.checkAndCleanup();
            if (gcTriggered) {
                console.log('Memory cleanup triggered');
            }
            lastMemoryCheck.current = 0;
        }

        // Run ECS systems in order
        TimeSystem(delta);
        WeatherSystem(delta);
        BiomeSystem(playerPos.x, playerPos.z);
        SpawnSystem(playerPos);
        AISystem(delta);
        CollisionSystem(delta);
        ResourceSystem(playerPos, delta);
    });

    return <AudioSystem />;
}
