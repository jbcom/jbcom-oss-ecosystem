/**
 * GPU-Driven Instancing - Core TypeScript (no React)
 * 
 * Pure TypeScript functions for instancing that work with any framework
 */

import * as THREE from 'three';

export interface InstanceData {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
}

/**
 * Biome data for instancing
 * Compatible with SDF BiomeData but used for instance placement
 */
export interface BiomeData {
    type: string; // Biome type identifier
    center: THREE.Vector2;
    radius: number;
}

export interface InstancingOptions {
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

/**
 * Generate instance data for vegetation/objects
 * Pure TypeScript - no React dependencies
 */
export function generateInstanceData(
    count: number,
    areaSize: number,
    heightFunc: (x: number, z: number) => number,
    biomes?: BiomeData[],
    allowedBiomes?: string[],
    getBiomeAt?: (x: number, z: number, biomes: BiomeData[]) => BiomeData,
    noise3D?: (x: number, y: number, z: number) => number,
    fbm?: (x: number, y: number, z: number, octaves?: number) => number
): InstanceData[] {
    const instances: InstanceData[] = [];
    
    // Default implementations if not provided
    const defaultGetBiomeAt = getBiomeAt || ((x: number, z: number, biomes: BiomeData[]) => {
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
    });
    
    const defaultFbm = fbm || ((x: number, y: number, z: number, octaves: number = 4) => {
        // Simple FBM fallback
        let value = 0;
        let amplitude = 0.5;
        let frequency = 1;
        for (let i = 0; i < octaves; i++) {
            value += amplitude * Math.sin(x * frequency) * Math.cos(z * frequency);
            amplitude *= 0.5;
            frequency *= 2;
        }
        return value;
    });
    
    let attempts = 0;
    const maxAttempts = count * 10;
    
    while (instances.length < count && attempts < maxAttempts) {
        attempts++;
        
        // Random position
        const x = (Math.random() - 0.5) * areaSize;
        const z = (Math.random() - 0.5) * areaSize;
        
        // Check biome if provided
        if (biomes && allowedBiomes && biomes.length > 0) {
            const biome = defaultGetBiomeAt(x, z, biomes);
            if (!allowedBiomes.includes(biome.type)) continue;
        }
        
        // Get terrain height
        const y = heightFunc(x, z);
        
        // Skip underwater
        if (y < 0) continue;
        
        // Add some clustering using noise
        const densityNoise = defaultFbm(x * 0.05, 0, z * 0.05, 2);
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

/**
 * Create instanced mesh with instance matrices (pure TypeScript)
 * Returns THREE.InstancedMesh ready for use with any framework
 */
export function createInstancedMesh(options: InstancingOptions): THREE.InstancedMesh {
    const {
        geometry,
        material,
        count,
        instances,
        frustumCulled = true,
        castShadow = true,
        receiveShadow = true
    } = options;
    
    const instanceCount = Math.min(instances.length, count);
    const mesh = new THREE.InstancedMesh(geometry, material, instanceCount);
    
    mesh.frustumCulled = frustumCulled;
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    
    // Set instance matrices
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    
    for (let i = 0; i < instanceCount; i++) {
        const instance = instances[i];
        quaternion.setFromEuler(instance.rotation);
        matrix.compose(instance.position, quaternion, instance.scale);
        mesh.setMatrixAt(i, matrix);
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    mesh.count = instanceCount;
    
    return mesh;
}
