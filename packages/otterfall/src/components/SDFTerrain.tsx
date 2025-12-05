/**
 * SDF-based Terrain System
 * 
 * Uses Signed Distance Fields and Marching Cubes to generate
 * terrain with caves, overhangs, and complex topology.
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, TrimeshCollider } from '@react-three/rapier';
import * as THREE from 'three';
import {
    sdTerrain,
    BiomeData,
    getBiomeAt,
    noise3D
} from '../utils/sdf';
import {
    marchingCubes,
    createGeometryFromMarchingCubes
} from '../utils/marchingCubes';

// Default biome layout for the world
const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'desert', center: new THREE.Vector2(-50, 30), radius: 35 },
    { type: 'tundra', center: new THREE.Vector2(0, -60), radius: 45 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
    { type: 'mountain', center: new THREE.Vector2(-60, -60), radius: 55 },
    { type: 'scrubland', center: new THREE.Vector2(80, -40), radius: 30 },
];

interface SDFTerrainProps {
    chunkSize?: number;
    resolution?: number;
    viewDistance?: number;
    biomes?: BiomeData[];
}

interface ChunkData {
    key: string;
    geometry: THREE.BufferGeometry;
    position: THREE.Vector3;
    vertices: Float32Array;
    indices: Uint32Array;
}

/**
 * Unified terrain material with vertex colors for biome blending
 */
function createTerrainMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.85,
        metalness: 0.05,
        flatShading: false
    });
}

/**
 * Generate vertex colors based on biome
 */
function generateVertexColors(
    vertices: Float32Array,
    biomes: BiomeData[]
): Float32Array {
    const colors = new Float32Array(vertices.length);
    const biomeColors: Record<string, THREE.Color> = {
        marsh: new THREE.Color(0x4a5d23),
        forest: new THREE.Color(0x2d5a27),
        desert: new THREE.Color(0xc2b280),
        tundra: new THREE.Color(0x8b9dc3),
        savanna: new THREE.Color(0xb8860b),
        mountain: new THREE.Color(0x696969),
        scrubland: new THREE.Color(0x9b7653)
    };
    
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        
        // Get dominant biome
        const biome = getBiomeAt(x, z, biomes);
        const color = biomeColors[biome.type] || biomeColors.scrubland;
        
        // Add some variation based on height and noise
        const heightFactor = Math.max(0, Math.min(1, (y + 5) / 20));
        const noiseFactor = noise3D(x * 0.1, y * 0.1, z * 0.1) * 0.2;
        
        // Blend towards gray at higher elevations (rock)
        const rockColor = new THREE.Color(0x696969);
        const finalColor = color.clone().lerp(rockColor, heightFactor * 0.5 + noiseFactor);
        
        colors[i] = finalColor.r;
        colors[i + 1] = finalColor.g;
        colors[i + 2] = finalColor.b;
    }
    
    return colors;
}

/**
 * Single terrain chunk component
 */
function TerrainChunk({ data, material }: { data: ChunkData; material: THREE.MeshStandardMaterial }) {
    return (
        <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
            <mesh geometry={data.geometry} material={material} receiveShadow castShadow />
            <TrimeshCollider
                args={[data.vertices, data.indices]}
            />
        </RigidBody>
    );
}

/**
 * Main SDF Terrain component
 * 
 * Features:
 * - Marching cubes mesh generation from SDF
 * - Caves and overhangs
 * - Chunk-based loading
 * - Rapier physics integration
 * - Biome-based coloring
 */
export function SDFTerrain({
    chunkSize = 32,
    resolution = 32,
    viewDistance = 3,
    biomes = DEFAULT_BIOMES
}: SDFTerrainProps) {
    const { camera } = useThree();
    const [chunks, setChunks] = useState<Map<string, ChunkData>>(new Map());
    const loadingRef = useRef<Set<string>>(new Set());
    const material = useMemo(() => createTerrainMaterial(), []);
    
    // SDF function for terrain
    const terrainSDF = useMemo(() => {
        return (p: THREE.Vector3) => sdTerrain(p, biomes);
    }, [biomes]);
    
    // Generate chunk key from position
    const getChunkKey = (cx: number, cz: number) => `${cx},${cz}`;
    
    // Generate a single chunk
    const generateChunk = (cx: number, cz: number): ChunkData | null => {
        const chunkWorldX = cx * chunkSize;
        const chunkWorldZ = cz * chunkSize;
        
        const bounds = {
            min: new THREE.Vector3(
                chunkWorldX - chunkSize / 2,
                -20, // Depth for caves
                chunkWorldZ - chunkSize / 2
            ),
            max: new THREE.Vector3(
                chunkWorldX + chunkSize / 2,
                40, // Max height
                chunkWorldZ + chunkSize / 2
            )
        };
        
        try {
            const result = marchingCubes(terrainSDF, { resolution, bounds });
            
            // Skip empty chunks
            if (result.vertices.length === 0) {
                return null;
            }
            
            const geometry = createGeometryFromMarchingCubes(result);
            
            // Add vertex colors
            const colors = generateVertexColors(result.vertices, biomes);
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            return {
                key: getChunkKey(cx, cz),
                geometry,
                position: new THREE.Vector3(chunkWorldX, 0, chunkWorldZ),
                vertices: result.vertices,
                indices: result.indices
            };
        } catch (error) {
            console.error(`Failed to generate chunk ${cx},${cz}:`, error);
            return null;
        }
    };
    
    // Update chunks based on camera position
    useFrame(() => {
        const camX = Math.floor(camera.position.x / chunkSize);
        const camZ = Math.floor(camera.position.z / chunkSize);
        
        const newChunks = new Map(chunks);
        let hasChanges = false;
        
        // Generate nearby chunks
        for (let dx = -viewDistance; dx <= viewDistance; dx++) {
            for (let dz = -viewDistance; dz <= viewDistance; dz++) {
                const cx = camX + dx;
                const cz = camZ + dz;
                const key = getChunkKey(cx, cz);
                
                // Skip if already loaded or loading
                if (newChunks.has(key) || loadingRef.current.has(key)) {
                    continue;
                }
                
                // Mark as loading
                loadingRef.current.add(key);
                
                // Generate chunk (in real app, would use Web Worker)
                const chunk = generateChunk(cx, cz);
                
                loadingRef.current.delete(key);
                
                if (chunk) {
                    newChunks.set(key, chunk);
                    hasChanges = true;
                }
            }
        }
        
        // Remove distant chunks
        for (const [key, chunk] of newChunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dist = Math.max(Math.abs(cx - camX), Math.abs(cz - camZ));
            
            if (dist > viewDistance + 1) {
                chunk.geometry.dispose();
                newChunks.delete(key);
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            setChunks(newChunks);
        }
    });
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            chunks.forEach(chunk => chunk.geometry.dispose());
            material.dispose();
        };
    }, []);
    
    return (
        <group name="sdf-terrain">
            {Array.from(chunks.values()).map(chunk => (
                <TerrainChunk key={chunk.key} data={chunk} material={material} />
            ))}
        </group>
    );
}

/**
 * Utility hook to query terrain height at a position
 */
export function useTerrainHeight(biomes: BiomeData[] = DEFAULT_BIOMES) {
    return useMemo(() => {
        const terrainSDF = (p: THREE.Vector3) => sdTerrain(p, biomes);
        
        return (x: number, z: number): number => {
            // Binary search for surface
            let low = -20;
            let high = 50;
            const point = new THREE.Vector3(x, 0, z);
            
            for (let i = 0; i < 20; i++) {
                const mid = (low + high) / 2;
                point.y = mid;
                
                if (terrainSDF(point) < 0) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            
            return (low + high) / 2;
        };
    }, [biomes]);
}

export { DEFAULT_BIOMES };
