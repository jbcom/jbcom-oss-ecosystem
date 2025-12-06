/**
 * Volumetric Effects Component
 * 
 * Provides raymarched volumetric fog, underwater effects, and atmospheric scattering
 * using shader-based post-processing.
 * 
 * Lifted from Otterfall procedural rendering system.
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// =============================================================================
// ENHANCED FOG
// =============================================================================

/**
 * Simple fog implementation using Three.js built-in fog with enhanced visuals
 */
export function EnhancedFog({
    color = new THREE.Color(0.7, 0.8, 0.9),
    density = 0.02
}: {
    color?: THREE.Color;
    density?: number;
}) {
    const { scene } = useThree();
    
    useEffect(() => {
        scene.fog = new THREE.FogExp2(color.getHex(), density);
        return () => {
            scene.fog = null;
        };
    }, [scene, color, density]);
    
    return null;
}

// =============================================================================
// UNDERWATER OVERLAY
// =============================================================================

interface UnderwaterOverlayProps {
    waterColor?: THREE.Color;
    density?: number;
    causticStrength?: number;
    waterSurface?: number;
}

export function UnderwaterOverlay({
    waterColor = new THREE.Color(0.0, 0.3, 0.5),
    density = 0.1,
    causticStrength = 0.3,
    waterSurface = 0
}: UnderwaterOverlayProps) {
    const { camera } = useThree();
    const overlayRef = useRef<THREE.Mesh>(null);
    
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uWaterColor: { value: waterColor.toArray() },
                uDensity: { value: density },
                uCausticStrength: { value: causticStrength },
                uWaterSurface: { value: waterSurface },
                uCameraY: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uWaterColor;
                uniform float uDensity;
                uniform float uCausticStrength;
                uniform float uWaterSurface;
                uniform float uCameraY;
                
                varying vec2 vUv;
                
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                float caustics(vec2 uv, float time) {
                    float c = 0.0;
                    for (int i = 0; i < 3; i++) {
                        float fi = float(i);
                        vec2 p = uv * (2.0 + fi) + time * (0.1 + fi * 0.05);
                        c += abs(sin(p.x * 8.0 + sin(p.y * 6.0 + time)) * 
                                 sin(p.y * 10.0 + sin(p.x * 7.0 - time * 0.8)));
                    }
                    return c / 3.0;
                }
                
                void main() {
                    // Only show underwater effect when camera is below water
                    if (uCameraY >= uWaterSurface) {
                        discard;
                    }
                    
                    float depth = (uWaterSurface - uCameraY) * uDensity;
                    float opacity = clamp(depth * 0.3, 0.0, 0.6);
                    
                    // Caustics
                    float c = caustics(vUv * 3.0, uTime) * uCausticStrength;
                    
                    vec3 color = uWaterColor + vec3(c * 0.2);
                    
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending
        });
    }, [waterColor, density, causticStrength, waterSurface]);
    
    useFrame((state) => {
        if (material) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uCameraY.value = camera.position.y;
        }
    });
    
    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);
    
    return (
        <mesh ref={overlayRef} renderOrder={999}>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

// =============================================================================
// VOLUMETRIC FOG MESH
// =============================================================================

interface VolumetricFogMeshProps {
    color?: THREE.Color;
    density?: number;
    height?: number;
    size?: number;
}

export function VolumetricFogMesh({
    color = new THREE.Color(0.7, 0.8, 0.9),
    density = 0.02,
    height = 10,
    size = 200
}: VolumetricFogMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();
    
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uFogColor: { value: color.toArray() },
                uFogDensity: { value: density },
                uFogHeight: { value: height },
                uCameraPosition: { value: [0, 0, 0] }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec3 vViewDirection;
                
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    vViewDirection = normalize(worldPos.xyz - cameraPosition);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uFogColor;
                uniform float uFogDensity;
                uniform float uFogHeight;
                uniform vec3 uCameraPosition;
                
                varying vec3 vWorldPosition;
                varying vec3 vViewDirection;
                
                float hash(vec3 p) {
                    p = fract(p * vec3(443.897, 441.423, 437.195));
                    p += dot(p, p.yxz + 19.19);
                    return fract((p.x + p.y) * p.z);
                }
                
                float noise(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    
                    return mix(
                        mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
                        f.z
                    );
                }
                
                float fbm(vec3 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    for (int i = 0; i < 4; i++) {
                        value += amplitude * noise(p);
                        p *= 2.0;
                        amplitude *= 0.5;
                    }
                    return value;
                }
                
                void main() {
                    // Height-based density
                    float heightFactor = exp(-max(0.0, vWorldPosition.y) / uFogHeight);
                    
                    // Animated noise for volumetric appearance
                    vec3 noisePos = vWorldPosition * 0.02 + vec3(uTime * 0.02, 0.0, uTime * 0.01);
                    float noiseVal = fbm(noisePos);
                    
                    float fogAmount = uFogDensity * heightFactor * (0.5 + 0.5 * noiseVal);
                    
                    // Fade near edges
                    float dist = length(vWorldPosition.xz - uCameraPosition.xz);
                    float edgeFade = smoothstep(80.0, 40.0, dist);
                    
                    fogAmount *= edgeFade;
                    
                    gl_FragColor = vec4(uFogColor, fogAmount);
                }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending
        });
    }, [color, density, height]);
    
    useFrame((state) => {
        if (material && meshRef.current) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uCameraPosition.value = camera.position.toArray();
            meshRef.current.position.set(camera.position.x, 0, camera.position.z);
        }
    });
    
    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);
    
    return (
        <mesh ref={meshRef} position={[0, height / 2, 0]}>
            <boxGeometry args={[size, height, size, 1, 8, 1]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

// =============================================================================
// COMBINED EFFECTS COMPONENT
// =============================================================================

interface VolumetricFogSettings {
    color?: THREE.Color;
    density?: number;
    height?: number;
}

interface UnderwaterSettings {
    waterColor?: THREE.Color;
    density?: number;
    causticStrength?: number;
    waterSurface?: number;
}

interface VolumetricEffectsProps {
    enableFog?: boolean;
    enableUnderwater?: boolean;
    fogSettings?: VolumetricFogSettings;
    underwaterSettings?: UnderwaterSettings;
}

export function VolumetricEffects({
    enableFog = true,
    enableUnderwater = true,
    fogSettings = {},
    underwaterSettings = {}
}: VolumetricEffectsProps) {
    return (
        <>
            {/* World-space volumetric fog */}
            {enableFog && (
                <VolumetricFogMesh
                    color={fogSettings.color}
                    density={fogSettings.density}
                    height={fogSettings.height}
                />
            )}
            
            {/* Enhanced scene fog */}
            {enableFog && (
                <EnhancedFog
                    color={fogSettings.color}
                    density={fogSettings.density || 0.02}
                />
            )}
            
            {/* Underwater overlay */}
            {enableUnderwater && (
                <UnderwaterOverlay
                    waterColor={underwaterSettings.waterColor}
                    density={underwaterSettings.density}
                    causticStrength={underwaterSettings.causticStrength}
                    waterSurface={underwaterSettings.waterSurface}
                />
            )}
        </>
    );
}
