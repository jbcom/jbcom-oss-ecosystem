import { useGameStore } from '@/stores/gameStore';
import { useFrame } from '@react-three/fiber';
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

    useFrame((_, delta) => {
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
