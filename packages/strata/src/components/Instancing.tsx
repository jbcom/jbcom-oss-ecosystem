/**
 * GPU-Driven Instancing System
 * 
 * Uses drei's Instances component for true GPU-driven instancing
 * with wind animation and LOD calculations performed on the GPU.
 * 
 * Optimized for mobile, web, and desktop with support for thousands
 * of instances with minimal CPU overhead.
 * 
 * Lifted from Otterfall procedural rendering system.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { generateInstanceData as coreGenerateInstanceData, InstanceData, BiomeData } from '../core/instancing';
import { instancingWindVertexShader } from '../shaders/instancing-wind';

// =============================================================================
// TYPES
// =============================================================================

// Re-export types from core
export type { InstanceData, BiomeData } from '../core/instancing';

// =============================================================================
// INSTANCE GENERATION
// =============================================================================
// Core logic moved to core/instancing.ts

// Re-export core function with proper name
export function generateInstanceData(
    count: number,
    areaSize: number,
    heightFunc: (x: number, z: number) => number,
    biomes?: BiomeData[],
    allowedBiomes?: string[],
    seed?: number
): InstanceData[] {
    return coreGenerateInstanceData(
        count,
        areaSize,
        heightFunc,
        biomes,
        allowedBiomes,
        seed,
        getBiomeAt,
        noise3D,
        fbm
    );
}

// Import noise functions from core for use in component
import { noise3D, fbm, getBiomeAt } from '../core/sdf';

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
    
    // Input validation
    if (!geometry) {
        throw new Error('GPUInstancedMesh: geometry is required');
    }
    if (!material) {
        throw new Error('GPUInstancedMesh: material is required');
    }
    if (count <= 0) {
        throw new Error('GPUInstancedMesh: count must be positive');
    }
    if (!instances || instances.length === 0) {
        throw new Error('GPUInstancedMesh: instances array cannot be empty');
    }
    
    const instanceCount = Math.min(instances.length, count);
    
    // Use drei's Instances for simple case, or THREE.InstancedMesh for GPU wind/LOD
    const useGpuWindLod = enableWind || lodDistance < 1000;
    
    // Create instanced mesh with GPU wind/LOD if needed
    const instancedMesh = useMemo(() => {
        if (!useGpuWindLod) return null;
        
        const instanceCount = Math.min(instances.length, count);
        const mesh = new THREE.InstancedMesh(geometry, material, instanceCount);
        
        // Setup instance matrices
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < instanceCount; i++) {
            const instance = instances[i];
            matrix.compose(
                instance.position,
                new THREE.Quaternion().setFromEuler(instance.rotation),
                instance.scale
            );
            mesh.setMatrixAt(i, matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        
        // Setup custom attributes for wind/LOD
        const instanceRandoms = new Float32Array(instanceCount);
        for (let i = 0; i < instanceCount; i++) {
            instanceRandoms[i] = (Math.sin(instances[i].position.x * 127.1 + instances[i].position.z * 437.58) % 1 + 1) % 1;
        }
        geometry.setAttribute('instanceRandom', new THREE.InstancedBufferAttribute(instanceRandoms, 1));
        
        // Create shader material with wind/LOD vertex shader
        const baseMaterial = material instanceof THREE.ShaderMaterial 
            ? material 
            : new THREE.MeshStandardMaterial();
        
        const fragmentShader = material instanceof THREE.ShaderMaterial
            ? material.fragmentShader
            : `
                void main() {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            `;
        
        const shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: instancingWindVertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uCameraPosition: { value: camera.position },
                uWindStrength: { value: enableWind ? windStrength : 0 },
                uLodDistance: { value: lodDistance },
                uEnableWind: { value: enableWind },
                ...(material instanceof THREE.ShaderMaterial ? material.uniforms : {})
            },
            transparent: baseMaterial.transparent,
            side: baseMaterial.side || THREE.FrontSide,
            depthWrite: baseMaterial.depthWrite !== false
        });
        
        mesh.material = shaderMaterial;
        return mesh;
    }, [geometry, material, instances, count, enableWind, windStrength, lodDistance, camera, useGpuWindLod]);
    
    // Update uniforms for GPU wind/LOD
    useFrame((state) => {
        if (instancedMesh && instancedMesh.material instanceof THREE.ShaderMaterial) {
            const uniforms = instancedMesh.material.uniforms;
            if (uniforms) {
                uniforms.uTime.value = state.clock.elapsedTime;
                uniforms.uCameraPosition.value.copy(camera.position);
            }
        }
    });
    
    // Cleanup
    useEffect(() => {
        return () => {
            if (instancedMesh) {
                instancedMesh.dispose();
            }
        };
    }, [instancedMesh]);
    
    // Use drei's Instances for simple case (no wind/LOD)
    if (!useGpuWindLod) {
        const instanceCount = Math.min(instances.length, count);
        return (
            <Instances
                limit={instanceCount}
                range={instanceCount}
                frustumCulled={frustumCulled}
                castShadow={castShadow}
                receiveShadow={receiveShadow}
            >
                <instancedMesh ref={meshRef} args={[geometry, material]} />
                {instances.slice(0, instanceCount).map((instance, i) => (
                    <Instance
                        key={i}
                        position={instance.position}
                        rotation={instance.rotation}
                        scale={instance.scale}
                    />
                ))}
            </Instances>
        );
    }
    
    // Use THREE.InstancedMesh directly for GPU wind/LOD
    return <primitive object={instancedMesh} />;
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
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['marsh', 'forest', 'savanna', 'scrubland'],
            getBiomeAt,
            noise3D,
            fbm
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
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['forest', 'tundra'],
            getBiomeAt,
            noise3D,
            fbm
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
        return coreGenerateInstanceData(
            count,
            areaSize,
            heightFunc,
            biomes,
            ['mountain', 'tundra', 'desert', 'scrubland'],
            getBiomeAt,
            noise3D,
            fbm
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
