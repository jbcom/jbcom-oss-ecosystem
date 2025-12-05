import { waterFragmentShader, waterVertexShader } from '@/shaders/water';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface WaterProps {
    position?: [number, number, number];
    size?: number;
}

export function Water({ position = [0, -0.2, 0], size = 100 }: WaterProps) {
    const meshRef = useRef<THREE.Mesh>(null!);

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            uniforms: {
                time: { value: 0 },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
    }, []);

    useFrame((_, delta) => {
        material.uniforms.time.value += delta;
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={-1}
        >
            <planeGeometry args={[size, size, 32, 32]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
