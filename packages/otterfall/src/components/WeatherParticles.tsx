import { world } from '@/ecs/world';
import { getAdaptiveQualityManager } from '@/utils/adaptiveQuality';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const RAIN_COUNT = 500;
const SNOW_COUNT = 300;
const PARTICLE_RANGE = 30;

export function WeatherParticles() {
    const rainRef = useRef<THREE.Points>(null!);
    const snowRef = useRef<THREE.Points>(null!);
    const [particleMultiplier, setParticleMultiplier] = useState(1.0);
    const qualityManager = useRef(getAdaptiveQualityManager());

    const rainGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(RAIN_COUNT * 3);
        const velocities = new Float32Array(RAIN_COUNT);

        for (let i = 0; i < RAIN_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * PARTICLE_RANGE * 2;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_RANGE * 2;
            velocities[i] = 0.3 + Math.random() * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        return geometry;
    }, []);

    const snowGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(SNOW_COUNT * 3);
        const velocities = new Float32Array(SNOW_COUNT);

        for (let i = 0; i < SNOW_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * PARTICLE_RANGE * 2;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_RANGE * 2;
            velocities[i] = 0.05 + Math.random() * 0.05;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        return geometry;
    }, []);

    const rainMaterial = useMemo(() => {
        return new THREE.PointsMaterial({
            color: 0x88aacc,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    const snowMaterial = useMemo(() => {
        return new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.15,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    useFrame((state, delta) => {
        // Update particle multiplier from adaptive quality
        const settings = qualityManager.current.getSettings();
        if (settings.particleMultiplier !== particleMultiplier) {
            setParticleMultiplier(settings.particleMultiplier);
        }

        // Get weather from ECS
        let weatherType = 'clear';
        let intensity = 0;

        for (const { weather } of world.with('weather')) {
            weatherType = weather.current;
            intensity = weather.intensity;
        }

        // Calculate active particle count based on quality
        const activeRainCount = Math.floor(RAIN_COUNT * particleMultiplier);
        const activeSnowCount = Math.floor(SNOW_COUNT * particleMultiplier);

        // Update rain
        if (rainRef.current) {
            const isRaining = weatherType === 'rain' || weatherType === 'storm';
            rainRef.current.visible = isRaining;

            if (isRaining) {
                const positions = rainGeometry.attributes.position.array as Float32Array;
                const velocities = rainGeometry.attributes.velocity.array as Float32Array;

                for (let i = 0; i < activeRainCount; i++) {
                    positions[i * 3 + 1] -= velocities[i] * intensity * 60 * delta;

                    // Reset if below ground
                    if (positions[i * 3 + 1] < 0) {
                        positions[i * 3 + 1] = 50;
                        positions[i * 3] = (Math.random() - 0.5) * PARTICLE_RANGE * 2 + state.camera.position.x;
                        positions[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_RANGE * 2 + state.camera.position.z;
                    }
                }

                rainGeometry.attributes.position.needsUpdate = true;
            }
        }

        // Update snow
        if (snowRef.current) {
            const isSnowing = weatherType === 'snow';
            snowRef.current.visible = isSnowing;

            if (isSnowing) {
                const positions = snowGeometry.attributes.position.array as Float32Array;
                const velocities = snowGeometry.attributes.velocity.array as Float32Array;

                for (let i = 0; i < activeSnowCount; i++) {
                    positions[i * 3 + 1] -= velocities[i] * intensity * 30 * delta;
                    // Drift
                    positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.01;
                    positions[i * 3 + 2] += Math.cos(Date.now() * 0.001 + i) * 0.01;

                    // Reset if below ground
                    if (positions[i * 3 + 1] < 0) {
                        positions[i * 3 + 1] = 50;
                        positions[i * 3] = (Math.random() - 0.5) * PARTICLE_RANGE * 2 + state.camera.position.x;
                        positions[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_RANGE * 2 + state.camera.position.z;
                    }
                }

                snowGeometry.attributes.position.needsUpdate = true;
            }
        }
    });

    return (
        <group>
            <points ref={rainRef} geometry={rainGeometry} material={rainMaterial} />
            <points ref={snowRef} geometry={snowGeometry} material={snowMaterial} />
        </group>
    );
}
