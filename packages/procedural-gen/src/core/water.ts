/**
 * Water Materials - Core TypeScript (no React)
 * 
 * Pure TypeScript functions for creating water materials
 */

import * as THREE from 'three';
import { 
    waterVertexShader, 
    waterFragmentShader,
    advancedWaterVertexShader,
    advancedWaterFragmentShader
} from '../shaders/water';

export interface WaterMaterialOptions {
    time?: number;
}

export interface AdvancedWaterMaterialOptions {
    waterColor?: THREE.ColorRepresentation;
    deepWaterColor?: THREE.ColorRepresentation;
    foamColor?: THREE.ColorRepresentation;
    causticIntensity?: number;
    time?: number;
}

/**
 * Create simple water material (pure TypeScript)
 */
export function createWaterMaterial(options: WaterMaterialOptions = {}): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
        uniforms: {
            time: { value: options.time || 0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
}

/**
 * Create advanced water material (pure TypeScript)
 */
export function createAdvancedWaterMaterial(options: AdvancedWaterMaterialOptions = {}): THREE.ShaderMaterial {
    const {
        waterColor = 0x2a5a8a,
        deepWaterColor = 0x1a3a5a,
        foamColor = 0x8ab4d4,
        causticIntensity = 0.4,
        time = 0
    } = options;
    
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: time },
            uWaterColor: { value: new THREE.Color(waterColor).toArray() },
            uDeepWaterColor: { value: new THREE.Color(deepWaterColor).toArray() },
            uFoamColor: { value: new THREE.Color(foamColor).toArray() },
            uCausticIntensity: { value: causticIntensity },
        },
        vertexShader: advancedWaterVertexShader,
        fragmentShader: advancedWaterFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
    });
}

/**
 * Create water geometry (pure TypeScript)
 */
export function createWaterGeometry(size: number, segments: number = 32): THREE.PlaneGeometry {
    return new THREE.PlaneGeometry(size, size, segments, segments);
}
