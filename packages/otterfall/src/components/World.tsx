import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Fireflies } from './Fireflies';
import { Water } from './Water';
import { WeatherParticles } from './WeatherParticles';
import { SDFTerrain, DEFAULT_BIOMES, useTerrainHeight } from './SDFTerrain';
import { GrassInstances, TreeInstances, RockInstances } from './GPUInstancing';
import { world as ecsWorld } from '@/ecs/world';
import { useFrame } from '@react-three/fiber';

export function World() {
    const getHeight = useTerrainHeight(DEFAULT_BIOMES);
    
    return (
        <group>
            <MarshWaterFeatures />
            
            {/* SDF-based terrain with caves and overhangs */}
            <SDFTerrain 
                chunkSize={32}
                resolution={24}
                viewDistance={3}
                biomes={DEFAULT_BIOMES}
            />
            
            {/* GPU-driven vegetation */}
            <GrassInstances 
                count={12000} 
                areaSize={150}
                biomes={DEFAULT_BIOMES}
                heightFunc={getHeight}
            />
            <TreeInstances 
                count={600}
                areaSize={150}
                biomes={DEFAULT_BIOMES}
                heightFunc={getHeight}
            />
            <RockInstances 
                count={250}
                areaSize={150}
                biomes={DEFAULT_BIOMES}
                heightFunc={getHeight}
            />
            
            <Fireflies count={80} radius={25} />
            <WeatherParticles />
            <Lighting />
            <Atmosphere />
        </group>
    );
}

function MarshWaterFeatures() {
    const [waterPools, setWaterPools] = useState<Array<{ position: [number, number, number]; size: number }>>([]);

    useEffect(() => {
        const { getBiomeLayout } = require('@/ecs/systems/BiomeSystem');
        const layout = getBiomeLayout();
        
        // Find marsh biome
        const marshBiome = layout.find((b: any) => b.type === 'marsh');
        if (!marshBiome) return;
        
        // Generate water pools in marsh area
        const pools: typeof waterPools = [];
        const poolCount = 8;
        
        for (let i = 0; i < poolCount; i++) {
            const angle = (i / poolCount) * Math.PI * 2;
            const radius = 5 + Math.random() * 15;
            const x = marshBiome.center.x + Math.cos(angle) * radius;
            const z = marshBiome.center.y + Math.sin(angle) * radius;
            const size = 8 + Math.random() * 12;
            
            pools.push({
                position: [x, -0.2, z],
                size,
            });
        }
        
        // Add central pond
        pools.push({
            position: [marshBiome.center.x, -0.2, marshBiome.center.y],
            size: 20,
        });
        
        setWaterPools(pools);
    }, []);

    return (
        <>
            {waterPools.map((pool, i) => (
                <Water key={i} position={pool.position} size={pool.size} />
            ))}
        </>
    );
}

function Lighting() {
    const sunRef = useRef<THREE.DirectionalLight>(null!);
    const ambientRef = useRef<THREE.AmbientLight>(null!);
    const currentAmbientColor = useRef(new THREE.Color('#333344'));
    const targetAmbientColor = useRef(new THREE.Color('#333344'));

    useFrame(() => {
        // Read time data from ECS
        for (const { time } of ecsWorld.with('time')) {
            if (sunRef.current) {
                // Update sun intensity based on TimeSystem calculation
                sunRef.current.intensity = time.sunIntensity * 1.5;

                // Update sun position based on angle from TimeSystem
                const angleRad = (time.sunAngle * Math.PI) / 180;
                const sunDistance = 50;
                sunRef.current.position.set(
                    Math.sin(angleRad) * sunDistance,
                    Math.cos(angleRad) * sunDistance,
                    sunDistance
                );

                // Update sun color based on phase
                if (time.phase === 'dawn' || time.phase === 'dusk') {
                    sunRef.current.color.setHex(0xff8844); // Orange
                } else if (time.phase === 'day') {
                    sunRef.current.color.setHex(0xffaa77); // Warm white
                } else {
                    sunRef.current.color.setHex(0x4466aa); // Cool moonlight
                }
            }

            if (ambientRef.current) {
                // Update ambient light intensity from TimeSystem
                ambientRef.current.intensity = time.ambientLight * 0.6;

                // Update ambient light color based on time phase
                if (time.phase === 'dawn') {
                    targetAmbientColor.current.setHex(0x6688aa); // Cool morning blue
                } else if (time.phase === 'day') {
                    targetAmbientColor.current.setHex(0x8899aa); // Bright day blue
                } else if (time.phase === 'dusk') {
                    targetAmbientColor.current.setHex(0x664433); // Warm evening
                } else {
                    targetAmbientColor.current.setHex(0x222244); // Dark night blue
                }

                // Smooth transition to target color
                currentAmbientColor.current.lerp(targetAmbientColor.current, 0.02);
                ambientRef.current.color.copy(currentAmbientColor.current);
            }
        }
    });

    return (
        <>
            {/* Main sun */}
            <directionalLight
                ref={sunRef}
                position={[50, 40, 50]}
                intensity={1.5}
                color="#ffaa77"
                castShadow
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
                shadow-mapSize={[1024, 1024]}
            />

            {/* Ambient fill */}
            <ambientLight ref={ambientRef} intensity={0.6} color="#333344" />

            {/* Rim light for fur highlight */}
            <directionalLight position={[-20, 10, -20]} intensity={0.8} color="#4488ff" />
        </>
    );
}

function Atmosphere() {
    const fogRef = useRef<THREE.FogExp2>(null!);
    const currentFogColor = useRef(new THREE.Color('#0a0808'));
    const targetFogColor = useRef(new THREE.Color('#0a0808'));
    const baseBiomeFogColor = useRef(new THREE.Color('#0a0808'));
    const timeFogModifier = useRef(new THREE.Color('#ffffff'));

    useFrame(() => {
        // Read time data from ECS and update fog density
        for (const { time } of ecsWorld.with('time')) {
            if (fogRef.current) {
                // Update fog density from TimeSystem
                fogRef.current.density = time.fogDensity;

                // Calculate time-based fog color modifier
                if (time.phase === 'dawn') {
                    timeFogModifier.current.setHex(0xffaa88); // Warm dawn
                } else if (time.phase === 'day') {
                    timeFogModifier.current.setHex(0xaabbcc); // Clear day
                } else if (time.phase === 'dusk') {
                    timeFogModifier.current.setHex(0xff8866); // Orange dusk
                } else {
                    timeFogModifier.current.setHex(0x1a1a2a); // Dark night
                }
            }
        }

        // Update fog color based on current biome and time
        for (const { biome } of ecsWorld.with('biome')) {
            const { BIOMES } = require('@/ecs/data/biomes');
            const biomeData = BIOMES[biome.current];
            
            if (biomeData && fogRef.current) {
                // Store base biome fog color
                baseBiomeFogColor.current.copy(biomeData.fogColor);
                
                // Blend biome color with time modifier
                targetFogColor.current.copy(baseBiomeFogColor.current);
                targetFogColor.current.multiply(timeFogModifier.current);
                
                // Smooth transition to target color
                currentFogColor.current.lerp(targetFogColor.current, 0.02);
                fogRef.current.color.copy(currentFogColor.current);
            }
        }
    });

    return (
        <fogExp2 ref={fogRef} attach="fog" args={['#0a0808', 0.025]} />
    );
}
