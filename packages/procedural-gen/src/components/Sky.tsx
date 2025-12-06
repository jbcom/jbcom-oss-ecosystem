/**
 * Procedural Sky component
 * 
 * Lifted from Otterfall biome selector diorama.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface TimeOfDayState {
    /** Sun intensity 0-1 */
    sunIntensity: number;
    /** Sun angle in degrees (0=horizon, 90=zenith) */
    sunAngle: number;
    /** Ambient light level 0-1 */
    ambientLight: number;
    /** Star visibility 0-1 */
    starVisibility: number;
    /** Fog density 0-1 */
    fogDensity: number;
}

export interface WeatherState {
    /** Weather intensity 0-1 */
    intensity: number;
}

interface ProceduralSkyProps {
    /** Time of day settings */
    timeOfDay?: Partial<TimeOfDayState>;
    /** Weather settings */
    weather?: Partial<WeatherState>;
    /** Size of the sky plane */
    size?: [number, number];
    /** Distance from camera */
    distance?: number;
}

const defaultTimeOfDay: TimeOfDayState = {
    sunIntensity: 1.0,
    sunAngle: 60,
    ambientLight: 0.8,
    starVisibility: 0,
    fogDensity: 0
};

const defaultWeather: WeatherState = {
    intensity: 0
};

/**
 * Procedural sky with day/night cycle, stars, clouds, and weather effects
 */
export function ProceduralSky({
    timeOfDay: timeOfDayProp = {},
    weather: weatherProp = {},
    size = [200, 100],
    distance = 50
}: ProceduralSkyProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const timeOfDay = { ...defaultTimeOfDay, ...timeOfDayProp };
    const weather = { ...defaultWeather, ...weatherProp };

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uSunIntensity: { value: timeOfDay.sunIntensity },
            uSunAngle: { value: timeOfDay.sunAngle },
            uAmbientLight: { value: timeOfDay.ambientLight },
            uStarVisibility: { value: timeOfDay.starVisibility },
            uFogDensity: { value: timeOfDay.fogDensity },
            uWeatherIntensity: { value: weather.intensity },
            uGyroTilt: { value: new THREE.Vector2(0, 0) },
        }),
        []
    );

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uSunIntensity.value = timeOfDay.sunIntensity;
            material.uniforms.uSunAngle.value = timeOfDay.sunAngle;
            material.uniforms.uAmbientLight.value = timeOfDay.ambientLight;
            material.uniforms.uStarVisibility.value = timeOfDay.starVisibility;
            material.uniforms.uFogDensity.value = timeOfDay.fogDensity;
            material.uniforms.uWeatherIntensity.value = weather.intensity;
            
            // Subtle gyroscopic effect
            const tiltX = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
            const tiltY = Math.cos(state.clock.elapsedTime * 0.15) * 0.02;
            material.uniforms.uGyroTilt.value.set(tiltX, tiltY);
        }
    });

    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        uniform float uSunIntensity;
        uniform float uSunAngle;
        uniform float uAmbientLight;
        uniform float uStarVisibility;
        uniform float uFogDensity;
        uniform float uWeatherIntensity;
        uniform vec2 uGyroTilt;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Simple noise for stars
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        // Sky gradient based on time of day
        vec3 getSkyColor(float height) {
            // Day sky: blue gradient
            vec3 daySkyTop = vec3(0.4, 0.6, 0.9);
            vec3 daySkyHorizon = vec3(0.7, 0.8, 0.95);
            
            // Night sky: dark blue/black
            vec3 nightSkyTop = vec3(0.01, 0.01, 0.05);
            vec3 nightSkyHorizon = vec3(0.1, 0.1, 0.2);
            
            // Interpolate based on sun intensity
            vec3 skyTop = mix(nightSkyTop, daySkyTop, uSunIntensity);
            vec3 skyHorizon = mix(nightSkyHorizon, daySkyHorizon, uSunIntensity);
            
            return mix(skyHorizon, skyTop, height);
        }
        
        void main() {
            // Apply gyroscopic tilt to UV
            vec2 adjustedUv = vUv + uGyroTilt;
            
            // Calculate height with horizon adjustment
            float height = adjustedUv.y;
            
            // Base sky color
            vec3 skyColor = getSkyColor(height);
            
            // Add stars at night
            if (uStarVisibility > 0.0) {
                float starNoise = hash(floor(adjustedUv * 200.0));
                if (starNoise > 0.995) {
                    float starBrightness = (starNoise - 0.995) * 200.0;
                    skyColor += vec3(starBrightness) * uStarVisibility;
                }
            }
            
            // Add sun glow
            if (uSunIntensity > 0.0) {
                float sunY = (uSunAngle / 180.0); // 0 to 1
                float distToSun = distance(adjustedUv, vec2(0.5, sunY));
                float sunGlow = smoothstep(0.2, 0.0, distToSun) * uSunIntensity;
                skyColor += vec3(1.0, 0.9, 0.7) * sunGlow;
            }
            
            // Weather effects (fog/clouds)
            if (uWeatherIntensity > 0.0) {
                float cloudNoise = hash(floor(adjustedUv * 10.0 + vec2(uTime * 0.1)));
                vec3 cloudColor = vec3(0.8, 0.8, 0.85);
                skyColor = mix(skyColor, cloudColor, cloudNoise * uWeatherIntensity * 0.5);
            }
            
            // Apply fog density
            if (uFogDensity > 0.0) {
                vec3 fogColor = vec3(0.9, 0.9, 0.95);
                skyColor = mix(skyColor, fogColor, uFogDensity * (1.0 - height));
            }
            
            // Apply ambient lighting
            skyColor *= (0.5 + uAmbientLight * 0.5);
            
            gl_FragColor = vec4(skyColor, 1.0);
        }
    `;

    return (
        <mesh ref={meshRef} position={[0, 0, -distance]}>
            <planeGeometry args={[size[0], size[1], 1, 1]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

/**
 * Convenience function to create time of day state from hour
 */
export function createTimeOfDay(hour: number): TimeOfDayState {
    // Normalize to 0-24
    const normalizedHour = ((hour % 24) + 24) % 24;
    
    // Sun angle: peaks at noon (90°), 0 at 6am/6pm
    const sunAngle = Math.max(0, Math.sin((normalizedHour - 6) / 12 * Math.PI) * 90);
    
    // Sun intensity based on time
    let sunIntensity = 0;
    if (normalizedHour >= 6 && normalizedHour <= 18) {
        sunIntensity = Math.sin((normalizedHour - 6) / 12 * Math.PI);
    }
    
    // Star visibility (inverse of sun)
    const starVisibility = Math.max(0, 1 - sunIntensity * 2);
    
    // Ambient light
    const ambientLight = 0.2 + sunIntensity * 0.6;
    
    return {
        sunIntensity,
        sunAngle,
        ambientLight,
        starVisibility,
        fogDensity: 0
    };
}
