import { RESOURCES } from '@/ecs/data/resources';
import { world } from '@/ecs/world';
import { useFrame } from '@react-three/fiber';
import { Detailed } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export function Resources() {
    useFrame(() => {
        // Trigger re-renders when resources change
    });

    return (
        <group>
            {Array.from(world.with('isResource', 'transform', 'resource').entities)
                .filter(entity => entity.id !== undefined)
                .map((entity) => (
                    <Resource key={entity.id} entityId={entity.id!} />
                ))}
        </group>
    );
}

interface ResourceProps {
    entityId: number;
}

function Resource({ entityId }: ResourceProps) {
    const meshRef = useRef<THREE.Group>(null!);

    useFrame(() => {
        const entity = world.entity(entityId);
        if (!entity || !entity.transform || !meshRef.current) return;

        // Update position from ECS
        meshRef.current.position.copy(entity.transform.position);

        // Hide if collected
        if (entity.resource?.collected) {
            meshRef.current.visible = false;
        } else {
            meshRef.current.visible = true;
            // Gentle bobbing animation
            meshRef.current.position.y = entity.transform.position.y + Math.sin(Date.now() * 0.002) * 0.1;
            // Slow rotation
            meshRef.current.rotation.y += 0.01;
        }
    });

    const entity = world.entity(entityId);
    if (!entity || !entity.resource) return null;

    const resourceData = RESOURCES[entity.resource.type];
    const color = resourceData.color;
    const size = resourceData.size;

    return (
        <group ref={meshRef}>
            <Detailed distances={[0, 30, 60, 100]}>
                {/* FULL detail - with glow effect */}
                <group>
                    <mesh castShadow>
                        <sphereGeometry args={[size, 16, 16]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[size * 1.2, 16, 16]} />
                        <meshBasicMaterial color={color} transparent opacity={0.2} />
                    </mesh>
                </group>
                
                {/* MEDIUM detail - no glow */}
                <mesh castShadow>
                    <sphereGeometry args={[size, 8, 8]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
                </mesh>
                
                {/* LOW detail - simpler */}
                <mesh>
                    <sphereGeometry args={[size, 4, 4]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                
                {/* CULLED */}
                <group />
            </Detailed>
        </group>
    );
}
