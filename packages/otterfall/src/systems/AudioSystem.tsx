import { getBiomeAtPosition } from '@/ecs/data/biomes';
import { getBiomeLayout } from '@/ecs/systems/BiomeSystem';
import { world as ecsWorld } from '@/ecs/world';
import { useGameStore } from '@/stores/gameStore';
import { getAudioManager, initAudioManager } from '@/utils/audioManager';
import { getBiomeAmbience, initBiomeAmbience } from '@/utils/biomeAmbience';
import { getEnvironmentalAudio, initEnvironmentalAudio } from '@/utils/environmentalAudio';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

/**
 * AudioSystem - Manages game audio including footsteps and biome ambient sounds
 */
export function AudioSystem() {
    const { camera } = useThree();
    const currentBiome = useRef<string>('marsh');
    const currentWeather = useRef<string>('clear');
    const lastFootstepTime = useRef<number>(0);
    const lastThunderTime = useRef<number>(0);
    const initialized = useRef(false);

    // Initialize audio manager, environmental audio, and biome ambience once
    useEffect(() => {
        if (!initialized.current) {
            initAudioManager(camera);
            initEnvironmentalAudio().catch(console.error);
            initBiomeAmbience().catch(console.error);
            initialized.current = true;
        }
    }, [camera]);

    useFrame((_, delta) => {
        const audioManager = getAudioManager();
        if (!audioManager) return;

        const player = useGameStore.getState().player;
        const isMoving = player.isMoving;
        const isRunning = player.stamina > 10 && player.speed / player.maxSpeed > 0.7;

        // Read current biome from ECS and handle biome ambient soundscapes
        const biomeAmbience = getBiomeAmbience();
        for (const { biome } of ecsWorld.with('biome')) {
            if (biome.current !== currentBiome.current) {
                // Biome changed - crossfade ambient soundscapes
                const prevBiome = currentBiome.current;
                currentBiome.current = biome.current;
                
                // Crossfade: fade out previous biome, fade in new biome
                if (biomeAmbience) {
                    biomeAmbience.setVolume(prevBiome as any, 0);
                    biomeAmbience.setVolume(biome.current as any, 1);
                }
                
                // Also play ambient from audio manager (for loaded audio files)
                audioManager.playAmbient(biome.current);
            }
        }

        // Read current weather from ECS and play synthesized environmental audio
        const envAudio = getEnvironmentalAudio();
        for (const { weather } of ecsWorld.with('weather')) {
            if (weather.current !== currentWeather.current) {
                // Weather changed - update environmental sounds
                const prevWeather = currentWeather.current;
                currentWeather.current = weather.current;

                // Stop previous weather sounds
                if (envAudio) {
                    if (prevWeather === 'rain' || prevWeather === 'storm') {
                        envAudio.stopRain();
                    }
                    if (prevWeather === 'storm') {
                        envAudio.stopWind();
                    }
                }
            }

            // Play synthesized weather sounds based on current weather and intensity
            if (envAudio) {
                if (weather.current === 'rain') {
                    envAudio.startRain(weather.intensity);
                } else if (weather.current === 'storm') {
                    envAudio.startRain(weather.intensity);
                    envAudio.startWind(weather.intensity);
                    
                    // Random thunder at intervals
                    const currentTime = Date.now() / 1000;
                    const thunderInterval = 5 + Math.random() * 10; // 5-15 seconds
                    if (currentTime - lastThunderTime.current >= thunderInterval) {
                        lastThunderTime.current = currentTime;
                        envAudio.playThunder();
                    }
                } else {
                    // Clear weather - ensure sounds are stopped
                    if (currentWeather.current === 'clear') {
                        envAudio.stopRain();
                        envAudio.stopWind();
                    }
                }
            }
        }

        // Update ambient crossfade
        audioManager.updateAmbientCrossfade(delta);

        // Play footstep sounds at animation cycle intervals
        if (isMoving && !player.isJumping) {
            const cycleSpeed = isRunning ? 15 : 10;
            const stepInterval = (Math.PI * 2) / cycleSpeed; // Time between steps
            const currentTime = Date.now() / 1000;

            if (currentTime - lastFootstepTime.current >= stepInterval) {
                lastFootstepTime.current = currentTime;

                // Determine terrain type at player position
                const biomeLayout = getBiomeLayout();
                const biomeType = getBiomeAtPosition(player.position.x, player.position.z, biomeLayout);
                
                let terrainType: 'grass' | 'rock' | 'water' | 'snow' = 'grass';
                
                // Determine terrain type based on biome and player height
                if (player.position.y < 0.2) {
                    terrainType = 'water';
                } else if (biomeType === 'tundra') {
                    terrainType = 'snow';
                } else if (biomeType === 'mountain' || biomeType === 'desert') {
                    terrainType = 'rock';
                }

                audioManager.playFootstep(player.position, terrainType);
            }
        }

        // Handle NPC sounds based on state
        // This would be triggered by NPC AI system events
        // For now, we'll add the infrastructure
        for (const entity of ecsWorld.with('species', 'transform')) {
            const { species } = entity;
            
            // Play sounds based on NPC state changes
            if (species.state === 'chase' && envAudio) {
                // Predators growl when chasing (throttled)
                if (species.type === 'predator' && Math.random() < 0.01) {
                    envAudio.playPredatorGrowl();
                }
            } else if (species.state === 'flee' && envAudio) {
                // Prey chirp when fleeing (throttled)
                if (species.type === 'prey' && Math.random() < 0.01) {
                    envAudio.playPreyChirp();
                }
            }
        }
    });

    return null;
}
