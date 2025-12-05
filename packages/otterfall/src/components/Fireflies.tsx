import { world as ecsWorld } from '@/ecs/world';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface FirefliesProps {
    count?: number;
    radius?: number;
}

export function Fireflies({ count = 100, radius = 30 }: FirefliesProps) {
    const pointsRef = useRef<THREE.Points>(null!);
    const timeRef = useRef(0);
    const [visible, setVisible] = useState(false);

    const { positions, phases, speeds } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const pha = new Float32Array(count);
        const spd = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Random position in a cylinder around player
            const angle = Math.random() * Math.PI * 2;
            const r = 5 + Math.random() * radius;
            const height = 0.5 + Math.random() * 2;

            pos[i * 3] = Math.cos(angle) * r;
            pos[i * 3 + 1] = height;
            pos[i * 3 + 2] = Math.sin(angle) * r;

            // Random phase and speed for twinkling
            pha[i] = Math.random() * Math.PI * 2;
            spd[i] = 0.5 + Math.random() * 2;
        }

        return { positions: pos, phases: pha, speeds: spd };
    }, [count, radius]);

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xffee88) },
            },
            vertexShader: /* glsl */ `
        attribute float phase;
        attribute float speed;
        uniform float time;
        varying float vBrightness;
        
        void main() {
          // Twinkling brightness
          vBrightness = 0.3 + 0.7 * (0.5 + 0.5 * sin(time * speed + phase));
          
          // Gentle floating motion
          vec3 pos = position;
          pos.y += sin(time * 0.5 + phase) * 0.2;
          pos.x += cos(time * 0.3 + phase) * 0.1;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = vBrightness * 20.0 * (200.0 / -mvPosition.z);
        }
      `,
            fragmentShader: /* glsl */ `
        uniform vec3 color;
        varying float vBrightness;
        
        void main() {
          // Soft circular point
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.1, dist) * vBrightness;
          gl_FragColor = vec4(color * vBrightness, alpha);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    useFrame((_, delta) => {
        timeRef.current += delta;
        material.uniforms.time.value = timeRef.current;

        // Check time phase from ECS - only show fireflies during night
        for (const { time } of ecsWorld.with('time')) {
            const shouldBeVisible = time.phase === 'night';
            if (shouldBeVisible !== visible) {
                setVisible(shouldBeVisible);
            }
        }
    });

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
        return geo;
    }, [positions, phases, speeds]);

    if (!visible) return null;

    return (
        <points ref={pointsRef} geometry={geometry} material={material} />
    );
}
