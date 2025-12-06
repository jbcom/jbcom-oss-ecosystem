/**
 * GPU-Driven Instancing System
 * 
 * True GPU-driven instancing with wind animation and LOD calculations
 * performed entirely on the GPU using custom vertex shaders and
 * InstancedBufferAttributes for maximum performance.
 * 
 * Optimized for mobile, web, and desktop with support for thousands
 * of instances with minimal CPU overhead.
 * 
 * Lifted from Otterfall procedural rendering system.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { instancingVertexShader, instancingFragmentShader } from '../shaders/instancing';

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
        if (biomes && allowedBiomes && biomes.length > 0) {
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
    const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
    const { camera, gl } = useThree();
    
    // Create GPU-driven shader material
    const shaderMaterial = useMemo(() => {
        // If material is already a ShaderMaterial, we can extend it
        // Otherwise create a new one that uses the base material's properties
        const baseColor = (material as any).color || new THREE.Color(0xffffff);
        const baseRoughness = (material as any).roughness ?? 0.5;
        const baseMetalness = (material as any).metalness ?? 0.0;
        
        return new THREE.ShaderMaterial({
            vertexShader: instancingVertexShader,
            fragmentShader: material instanceof THREE.ShaderMaterial 
                ? (material as THREE.ShaderMaterial).fragmentShader
                : instancingFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uCameraPosition: { value: camera.position },
                uWindStrength: { value: enableWind ? windStrength : 0 },
                uLodDistance: { value: lodDistance },
                uEnableWind: { value: enableWind },
                // Pass through material properties if needed
                ...(material instanceof THREE.ShaderMaterial ? material.uniforms : {})
            },
            // Preserve material properties
            transparent: (material as any).transparent || false,
            side: (material as any).side || THREE.FrontSide,
            depthWrite: (material as any).depthWrite !== false,
        });
    }, [material, enableWind, windStrength, lodDistance, camera]);
    
    shaderMaterialRef.current = shaderMaterial;
    
    // Setup InstancedBufferAttributes for GPU-driven rendering
    useEffect(() => {
        if (!meshRef.current || !geometry) return;
        
        const mesh = meshRef.current;
        const instanceCount = Math.min(instances.length, count);
        
        // Create instance data arrays
        const instancePositions = new Float32Array(instanceCount * 3);
        const instanceRotations = new Float32Array(instanceCount * 4); // quaternions
        const instanceScales = new Float32Array(instanceCount * 3);
        const instanceRandoms = new Float32Array(instanceCount);
        
        const quaternion = new THREE.Quaternion();
        
        for (let i = 0; i < instanceCount; i++) {
            const instance = instances[i];
            const idx = i * 3;
            const rotIdx = i * 4;
            
            // Position
            instancePositions[idx] = instance.position.x;
            instancePositions[idx + 1] = instance.position.y;
            instancePositions[idx + 2] = instance.position.z;
            
            // Rotation (quaternion)
            quaternion.setFromEuler(instance.rotation);
            instanceRotations[rotIdx] = quaternion.x;
            instanceRotations[rotIdx + 1] = quaternion.y;
            instanceRotations[rotIdx + 2] = quaternion.z;
            instanceRotations[rotIdx + 3] = quaternion.w;
            
            // Scale
            instanceScales[idx] = instance.scale.x;
            instanceScales[idx + 1] = instance.scale.y;
            instanceScales[idx + 2] = instance.scale.z;
            
            // Random value for wind variation (use position hash)
            instanceRandoms[i] = (Math.sin(instance.position.x * 127.1 + instance.position.z * 437.58) % 1 + 1) % 1;
        }
        
        // Set instance attributes
        geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3));
        geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(instanceRotations, 4));
        geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScales, 3));
        geometry.setAttribute('instanceRandom', new THREE.InstancedBufferAttribute(instanceRandoms, 1));
        
        mesh.count = instanceCount;
        mesh.instanceMatrix.needsUpdate = false; // We're not using instanceMatrix anymore
        
    }, [instances, count, geometry]);
    
    // Update uniforms on each frame (minimal CPU overhead)
    useFrame((state) => {
        if (!shaderMaterialRef.current) return;
        
        const uniforms = shaderMaterialRef.current.uniforms;
        uniforms.uTime.value = state.clock.elapsedTime;
        uniforms.uCameraPosition.value.copy(camera.position);
    });
    
    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, shaderMaterial, count]}
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
