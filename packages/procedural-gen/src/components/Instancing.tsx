/**
 * GPU-Driven Instancing System
 * 
 * Uses GPU compute for instance matrix calculations, providing
 * massive performance gains for vegetation and particle systems.
 * 
 * Lifted from Otterfall procedural rendering system.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// =============================================================================
// NOISE FUNCTIONS (Inlined to avoid circular dependencies)
// =============================================================================

function hash3(x: number, y: number, z: number): number {
    return ((Math.sin(x + y * 157.0 + z * 113.0) * 43758.5453) % 1 + 1) % 1;
}

function noise3D(x: number, y: number, z: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);
    
    const fx = x - ix;
    const fy = y - iy;
    const fz = z - iz;
    
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const uz = fz * fz * (3 - 2 * fz);
    
    const n000 = hash3(ix, iy, iz);
    const n100 = hash3(ix + 1, iy, iz);
    const n010 = hash3(ix, iy + 1, iz);
    const n110 = hash3(ix + 1, iy + 1, iz);
    const n001 = hash3(ix, iy, iz + 1);
    const n101 = hash3(ix + 1, iy, iz + 1);
    const n011 = hash3(ix, iy + 1, iz + 1);
    const n111 = hash3(ix + 1, iy + 1, iz + 1);
    
    const nx00 = n000 * (1 - ux) + n100 * ux;
    const nx10 = n010 * (1 - ux) + n110 * ux;
    const nx01 = n001 * (1 - ux) + n101 * ux;
    const nx11 = n011 * (1 - ux) + n111 * ux;
    
    const nxy0 = nx00 * (1 - uy) + nx10 * uy;
    const nxy1 = nx01 * (1 - uy) + nx11 * uy;
    
    return nxy0 * (1 - uz) + nxy1 * uz;
}

function fbm(x: number, y: number, z: number, octaves: number = 4): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    
    return value / maxValue;
}

// =============================================================================
// TYPES
// =============================================================================

export interface InstanceData {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
}

export interface BiomeData {
    type: string;
    center: THREE.Vector2;
    radius: number;
}

// =============================================================================
// INSTANCE GENERATION
// =============================================================================

function getBiomeAt(x: number, z: number, biomes: BiomeData[]): BiomeData {
    if (biomes.length === 0) {
        throw new Error('getBiomeAt: biomes array cannot be empty');
    }
    
    let closest = biomes[0];
    let closestDist = Infinity;
    
    for (const biome of biomes) {
        const dist = Math.sqrt(
            (x - biome.center.x) ** 2 + 
            (z - biome.center.y) ** 2
        );
        if (dist < closestDist) {
            closestDist = dist;
            closest = biome;
        }
    }
    
    return closest;
}

/**
 * Generate instance data for vegetation/objects
 */
export function generateInstanceData(
    count: number,
    areaSize: number,
    heightFunc: (x: number, z: number) => number,
    biomes?: BiomeData[],
    allowedBiomes?: string[]
): InstanceData[] {
    const instances: InstanceData[] = [];
    
    let attempts = 0;
    const maxAttempts = count * 10;
    
    while (instances.length < count && attempts < maxAttempts) {
        attempts++;
        
        // Random position
        const x = (Math.random() - 0.5) * areaSize;
        const z = (Math.random() - 0.5) * areaSize;
        
        // Check biome if provided
        if (biomes && allowedBiomes) {
            const biome = getBiomeAt(x, z, biomes);
            if (!allowedBiomes.includes(biome.type)) continue;
        }
        
        // Get terrain height
        const y = heightFunc(x, z);
        
        // Skip underwater
        if (y < 0) continue;
        
        // Add some clustering using noise
        const densityNoise = fbm(x * 0.05, 0, z * 0.05, 2);
        if (Math.random() > densityNoise * 1.5) continue;
        
        // Random rotation and scale
        const rotation = new THREE.Euler(
            (Math.random() - 0.5) * 0.2,
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.2
        );
        
        const baseScale = 0.8 + Math.random() * 0.4;
        const scale = new THREE.Vector3(baseScale, baseScale, baseScale);
        
        instances.push({
            position: new THREE.Vector3(x, y, z),
            rotation,
            scale
        });
    }
    
    return instances;
}

// =============================================================================
// INSTANCED MESH COMPONENT
// =============================================================================

interface GPUInstancedMeshProps {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    count: number;
    instances: InstanceData[];
    enableWind?: boolean;
    windStrength?: number;
    lodDistance?: number;
    frustumCulled?: boolean;
    castShadow?: boolean;
    receiveShadow?: boolean;
}

export function GPUInstancedMesh({
    geometry,
    material,
    count,
    instances,
    enableWind = true,
    windStrength = 0.5,
    lodDistance = 100,
    frustumCulled = true,
    castShadow = true,
    receiveShadow = true
}: GPUInstancedMeshProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { camera } = useThree();
    
    // Initialize instance matrices
    useEffect(() => {
        if (!meshRef.current) return;
        
        const mesh = meshRef.current;
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        
        for (let i = 0; i < Math.min(instances.length, count); i++) {
            const instance = instances[i];
            quaternion.setFromEuler(instance.rotation);
            matrix.compose(instance.position, quaternion, instance.scale);
            mesh.setMatrixAt(i, matrix);
        }
        
        mesh.instanceMatrix.needsUpdate = true;
        mesh.count = Math.min(instances.length, count);
    }, [instances, count]);
    
    // Animate wind
    useFrame((state) => {
        if (!meshRef.current || !enableWind) return;
        
        const mesh = meshRef.current;
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        const tempQuaternion = new THREE.Quaternion();
        const time = state.clock.elapsedTime;
        
        for (let i = 0; i < mesh.count; i++) {
            mesh.getMatrixAt(i, matrix);
            matrix.decompose(position, quaternion, scale);
            
            // Calculate wind effect
            const windPhase = time * 2 + position.x * 0.1 + position.z * 0.1;
            const windNoise = noise3D(position.x * 0.05, time * 0.5, position.z * 0.05);
            
            const bendAngle = Math.sin(windPhase) * windStrength * 0.3 * (0.5 + 0.5 * windNoise);
            const bendAxis = new THREE.Vector3(-Math.cos(windPhase), 0, Math.sin(windPhase)).normalize();
            
            // Apply bend rotation
            tempQuaternion.setFromAxisAngle(bendAxis, bendAngle);
            
            // Get original rotation from instance data
            // Get original rotation from instance data
            if (i >= instances.length) continue;
            const originalQuaternion = new THREE.Quaternion().setFromEuler(instances[i].rotation);
            quaternion.copy(tempQuaternion).multiply(originalQuaternion);
            
            // LOD scaling
            const dist = position.distanceTo(camera.position);
            const lodScale = 1 - Math.max(0, Math.min(1, (dist - lodDistance * 0.5) / (lodDistance * 0.5)));
            
            if (lodScale < 0.01) {
                // Completely hidden
                scale.set(0, 0, 0);
            } else {
            } else {
                if (i < instances.length) {
                    scale.copy(instances[i].scale).multiplyScalar(lodScale);
                } else {
                    scale.set(lodScale, lodScale, lodScale);
                }
            }
            
            matrix.compose(position, quaternion, scale);
            mesh.setMatrixAt(i, matrix);
        }
        
        mesh.instanceMatrix.needsUpdate = true;
    });
    
    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, count]}
            frustumCulled={frustumCulled}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        />
    );
}

// =============================================================================
// VEGETATION COMPONENTS
// =============================================================================

interface VegetationProps {
    count?: number;
    areaSize?: number;
    biomes?: BiomeData[];
    heightFunc?: (x: number, z: number) => number;
}

const DEFAULT_BIOMES: BiomeData[] = [
    { type: 'marsh', center: new THREE.Vector2(0, 0), radius: 30 },
    { type: 'forest', center: new THREE.Vector2(50, 0), radius: 40 },
    { type: 'savanna', center: new THREE.Vector2(60, 60), radius: 50 },
];

/**
 * Instanced grass blades
 */
export function GrassInstances({
    count = 10000,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0
}: VegetationProps) {
    const geometry = useMemo(() => {
        // Grass blade geometry - tapered quad
        const geo = new THREE.BufferGeometry();
        
        const positions = new Float32Array([
            // Two triangles forming a tapered blade
            -0.05, 0, 0,
            0.05, 0, 0,
            0, 1, 0,
            
            0.05, 0, 0,
            0.03, 1, 0,
            0, 1, 0,
        ]);
        
        const normals = new Float32Array([
            0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1,
        ]);
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        
        return geo;
    }, []);
    
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x4a7c23,
            roughness: 0.8,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
    }, []);
    
    const instances = useMemo(() => {
        return generateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['marsh', 'forest', 'savanna', 'scrubland']
        );
    }, [count, areaSize, biomes, heightFunc]);
    
    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);
    
    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={true}
            windStrength={0.3}
            lodDistance={80}
            castShadow={false}
            receiveShadow={true}
        />
    );
}

/**
 * Instanced trees
 */
export function TreeInstances({
    count = 500,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0
}: VegetationProps) {
    const geometry = useMemo(() => {
        // Simple tree geometry - cone for foliage
        return new THREE.ConeGeometry(1, 3, 6);
    }, []);
    
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.85,
            metalness: 0.0
        });
    }, []);
    
    const instances = useMemo(() => {
        return generateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['forest', 'tundra']
        );
    }, [count, areaSize, biomes, heightFunc]);
    
    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);
    
    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={true}
            windStrength={0.15}
            lodDistance={150}
            castShadow={true}
            receiveShadow={true}
        />
    );
}

/**
 * Instanced rocks
 */
export function RockInstances({
    count = 200,
    areaSize = 100,
    biomes = DEFAULT_BIOMES,
    heightFunc = () => 0
}: VegetationProps) {
    const geometry = useMemo(() => {
        // Irregular rock geometry
        return new THREE.DodecahedronGeometry(0.5, 0);
    }, []);
    
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.9,
            metalness: 0.1
        });
    }, []);
    
    const instances = useMemo(() => {
        return generateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['mountain', 'tundra', 'desert', 'scrubland']
        );
    }, [count, areaSize, biomes, heightFunc]);
    
    // Cleanup
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);
    
    return (
        <GPUInstancedMesh
            geometry={geometry}
            material={material}
            count={count}
            instances={instances}
            enableWind={false}
            lodDistance={120}
            castShadow={true}
            receiveShadow={true}
        />
    );
}
