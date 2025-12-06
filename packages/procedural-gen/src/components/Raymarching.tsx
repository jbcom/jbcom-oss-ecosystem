/**
 * Ray marching component for GPU-based SDF rendering
 * 
 * Uses marching.js patterns for efficient ray marching
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { raymarchingVertexShader, raymarchingFragmentShader } from '../shaders/raymarching';

interface RaymarchingProps {
    sdfFunction: string; // GLSL code for sceneSDF function
    maxSteps?: number;
    maxDistance?: number;
    minDistance?: number;
    backgroundColor?: THREE.ColorRepresentation;
    fogStrength?: number;
    fogColor?: THREE.ColorRepresentation;
}

export function Raymarching({
    sdfFunction,
    maxSteps = 100,
    maxDistance = 20.0,
    minDistance = 0.001,
    backgroundColor = 0x000000,
    fogStrength = 0.1,
    fogColor = 0x000000
}: RaymarchingProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera, size, gl } = useThree();
    
    const material = useMemo(() => {
        // Inject SDF function into fragment shader
        const fragmentShader = raymarchingFragmentShader.replace(
            'float sceneSDF(vec3 p);',
            sdfFunction
        );
        
        return new THREE.ShaderMaterial({
            vertexShader: raymarchingVertexShader,
            fragmentShader,
            uniforms: {
                uCameraPosition: { value: camera.position },
                uCameraMatrix: { value: camera.matrixWorld },
                uResolution: { value: new THREE.Vector2(size.width, size.height) },
                uTime: { value: 0 },
                uMaxSteps: { value: maxSteps },
                uMaxDistance: { value: maxDistance },
                uMinDistance: { value: minDistance },
                uBackgroundColor: { value: new THREE.Color(backgroundColor) },
                uFogStrength: { value: fogStrength },
                uFogColor: { value: new THREE.Color(fogColor) }
            }
        });
    }, [sdfFunction, maxSteps, maxDistance, minDistance, backgroundColor, fogStrength, fogColor, camera, size]);
    
    useFrame((state) => {
        if (!material.uniforms) return;
        
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uCameraPosition.value.copy(camera.position);
        material.uniforms.uCameraMatrix.value.copy(camera.matrixWorld);
        material.uniforms.uResolution.value.set(size.width, size.height);
    });
    
    // Fullscreen quad geometry
    const geometry = useMemo(() => {
        return new THREE.PlaneGeometry(2, 2);
    }, []);
    
    return (
        <mesh ref={meshRef} geometry={geometry} material={material} />
    );
}
