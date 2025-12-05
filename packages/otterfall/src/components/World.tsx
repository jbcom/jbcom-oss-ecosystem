import { terrainFragmentShader, terrainVertexShader } from '@/shaders/terrain';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Fireflies } from './Fireflies';
import { Water } from './Water';
import { WeatherParticles } from './WeatherParticles';

const GRASS_COUNT = 8000;
const ROCK_COUNT = 150;

export function World() {
    return (
        <group>
            <MarshWaterFeatures />
            <Terrain />
            <Grass />
            <Rocks />
            <Trees />
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


function Terrain() {
    const [, setTexturesLoaded] = useState(false);
    // Track loaded textures for proper cleanup on unmount
    const loadedTextures = useRef<THREE.Texture[]>([]);
    const material = useMemo(() => {
        const mat = new THREE.ShaderMaterial({
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms: {
                biomeColors: { value: [] },
                biomeCenters: { value: [] },
                biomeRadii: { value: [] },
                biomeTypes: { value: [] },
                useTextures: { value: false },
                // Marsh textures
                marshAlbedo: { value: null },
                marshNormal: { value: null },
                marshRoughness: { value: null },
                marshAO: { value: null },
                // Forest textures
                forestAlbedo: { value: null },
                forestNormal: { value: null },
                forestRoughness: { value: null },
                forestAO: { value: null },
                // Desert textures
                desertAlbedo: { value: null },
                desertNormal: { value: null },
                desertRoughness: { value: null },
                desertAO: { value: null },
                // Tundra textures
                tundraAlbedo: { value: null },
                tundraNormal: { value: null },
                tundraRoughness: { value: null },
                tundraAO: { value: null },
                // Mountain textures
                mountainAlbedo: { value: null },
                mountainNormal: { value: null },
                mountainRoughness: { value: null },
                mountainAO: { value: null },
            },
        });
        return mat;
    }, []);

    // Load textures
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        const biomes = ['marsh', 'forest', 'desert', 'tundra', 'mountain'];
        const maps = ['albedo', 'normal', 'roughness', 'ao'];
        
        let loadedCount = 0;
        const totalTextures = biomes.length * maps.length;
        let mounted = true;
        
        biomes.forEach(biome => {
            maps.forEach(map => {
                const path = `/textures/terrain/${biome}/${map}.jpg`;
                loader.load(
                    path,
                    (texture) => {
                        // Track texture for cleanup
                        loadedTextures.current.push(texture);
                        
                        // Apply texture compression settings
                        texture.format = THREE.RGBAFormat;
                        texture.minFilter = THREE.LinearMipmapLinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        texture.generateMipmaps = true;
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        
                        // Set uniform
                        const uniformName = `${biome}${map.charAt(0).toUpperCase() + map.slice(1)}`;
                        if (material.uniforms[uniformName]) {
                            material.uniforms[uniformName].value = texture;
                        }
                        
                        loadedCount++;
                        if (loadedCount === totalTextures && mounted) {
                            material.uniforms.useTextures.value = true;
                            setTexturesLoaded(true);
                            console.log('All terrain textures loaded');
                        }
                    },
                    undefined,
                    (error) => {
                        console.warn(`Failed to load texture ${path}:`, error);
                        loadedCount++;
                        if (loadedCount === totalTextures && mounted) {
                            // Even if some failed, mark as loaded (will use procedural fallback)
                            setTexturesLoaded(true);
                        }
                    }
                );
            });
        });

        // Cleanup function to dispose textures and material on unmount
        return () => {
            mounted = false;
            // Dispose all loaded textures
            loadedTextures.current.forEach((texture) => {
                texture.dispose();
            });
            loadedTextures.current = [];
            // Dispose the material
            material.dispose();
        };
    }, [material]);

    // Update biome data
    useEffect(() => {
        const { getBiomeLayout } = require('@/ecs/systems/BiomeSystem');
        const { BIOMES } = require('@/ecs/data/biomes');
        const layout = getBiomeLayout();
        
        // Map biome type strings to integers for shader
        const biomeTypeMap: Record<string, number> = {
            marsh: 0,
            forest: 1,
            desert: 2,
            tundra: 3,
            savanna: 4,
            mountain: 5,
            scrubland: 6,
        };
        
        const colors = layout.map((b: any) => BIOMES[b.type].terrainColor);
        const centers = layout.map((b: any) => [b.center.x, b.center.y]);
        const radii = layout.map((b: any) => b.radius);
        const types = layout.map((b: any) => biomeTypeMap[b.type] || 0);
        
        material.uniforms.biomeColors.value = colors;
        material.uniforms.biomeCenters.value = centers;
        material.uniforms.biomeRadii.value = radii;
        material.uniforms.biomeTypes.value = types;
    }, [material]);

    return (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[200, 200, 128, 128]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

function Grass() {
    const meshRef = useRef<THREE.InstancedMesh>(null!);

    const matrices = useMemo(() => {
        const dummy = new THREE.Object3D();
        const mats: THREE.Matrix4[] = [];



        for (let i = 0; i < GRASS_COUNT; i++) {
            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;

            // Clear center area for player spawn
            if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;

            dummy.position.set(x, 0, z);
            // Restrict rotation to mostly Y axis (yaw) to match physics assumptions
            // Slight X/Z tilt for variety, but keep "up" mostly "up"
            dummy.rotation.set(
                (Math.random() - 0.5) * 0.2, // Slight X tilt
                Math.random() * Math.PI * 2, // Full Y rotation
                (Math.random() - 0.5) * 0.2  // Slight Z tilt
            );
            dummy.scale.setScalar(0.5 + Math.random() * 0.5);
            dummy.updateMatrix();
            mats.push(dummy.matrix.clone());
        }

        return mats;
    }, []);

    useEffect(() => {
        if (meshRef.current) {
            matrices.forEach((mat, i) => {
                meshRef.current.setMatrixAt(i, mat);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [matrices]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, matrices.length]} receiveShadow>
            <coneGeometry args={[0.05, 0.4, 3]} />
            <meshLambertMaterial color="#335522" />
        </instancedMesh>
    );
}

function Trees() {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const [trees, setTrees] = useState<Array<{ position: THREE.Vector3; scale: THREE.Vector3; rotation: THREE.Euler; biome: string }>>([]);

    // Generate trees based on biome layout
    useEffect(() => {
        const { getBiomeLayout } = require('@/ecs/systems/BiomeSystem');
        const { BIOMES } = require('@/ecs/data/biomes');
        const layout = getBiomeLayout();
        
        const generatedTrees: typeof trees = [];
        
        layout.forEach((biomeBounds: any) => {
            const biomeData = BIOMES[biomeBounds.type];
            const treeCount = biomeData.treeCount;
            
            for (let i = 0; i < treeCount; i++) {
                // Random position within biome radius
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * biomeBounds.radius * 0.8;
                const x = biomeBounds.center.x + Math.cos(angle) * radius;
                const z = biomeBounds.center.y + Math.sin(angle) * radius;
                
                // Skip if too close to center spawn
                if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
                
                const position = new THREE.Vector3(x, 0, z);
                
                // Biome-specific scaling
                let scale: THREE.Vector3;
                if (biomeBounds.type === 'desert') {
                    // Cacti - tall and thin
                    scale = new THREE.Vector3(0.3 + Math.random() * 0.2, 2 + Math.random() * 2, 0.3 + Math.random() * 0.2);
                } else if (biomeBounds.type === 'tundra') {
                    // Small shrubs
                    scale = new THREE.Vector3(0.5 + Math.random() * 0.3, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.3);
                } else {
                    // Normal trees
                    scale = new THREE.Vector3(1 + Math.random() * 0.5, 3 + Math.random() * 2, 1 + Math.random() * 0.5);
                }
                
                const rotation = new THREE.Euler(0, Math.random() * Math.PI * 2, 0);
                
                generatedTrees.push({ position, scale, rotation, biome: biomeBounds.type });
            }
        });
        
        setTrees(generatedTrees);
    }, []);

    // Update instances when trees data changes
    useEffect(() => {
        if (meshRef.current && trees.length > 0) {
            const dummy = new THREE.Object3D();
            trees.forEach((tree, i) => {
                dummy.position.copy(tree.position);
                dummy.scale.copy(tree.scale);
                dummy.rotation.copy(tree.rotation);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [trees]);

    if (trees.length === 0) return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
            <coneGeometry args={[0.5, 2, 6]} />
            <meshStandardMaterial color="#2a4a1a" roughness={0.9} />
        </instancedMesh>
    );
}

import { useGameStore } from '@/stores/gameStore';

function Rocks() {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const setRocks = useGameStore((s) => s.setRocks);
    const rocks = useGameStore((s) => s.rocks);

    // Generate rocks once on mount
    useEffect(() => {
        const generatedRocks = [];
        for (let i = 0; i < ROCK_COUNT; i++) {
            const r = 10 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;

            const position = new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r);
            const scale = new THREE.Vector3(1 + Math.random() * 2, 0.5 + Math.random(), 1 + Math.random() * 2);
            // Restrict rotation to mostly Y axis (yaw) to match physics assumptions
            const rotation = new THREE.Euler(
                (Math.random() - 0.5) * 0.2, // Slight X tilt
                Math.random() * Math.PI * 2, // Full Y rotation
                (Math.random() - 0.5) * 0.2  // Slight Z tilt
            );

            // Approximate radius for collision (using max horizontal scale)
            const radius = Math.max(scale.x, scale.z) * 0.8; // 0.8 factor for dodecahedron shape

            generatedRocks.push({ position, scale, rotation, radius });
        }
        setRocks(generatedRocks);
    }, [setRocks]);

    // Update instances when rocks data changes
    useEffect(() => {
        if (meshRef.current && rocks.length > 0) {
            const dummy = new THREE.Object3D();
            rocks.forEach((rock, i) => {
                dummy.position.copy(rock.position);
                dummy.scale.copy(rock.scale);
                dummy.rotation.copy(rock.rotation);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [rocks]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, ROCK_COUNT]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#555555" roughness={0.8} />
        </instancedMesh>
    );
}

import { world as ecsWorld } from '@/ecs/world';
import { useFrame } from '@react-three/fiber';

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

