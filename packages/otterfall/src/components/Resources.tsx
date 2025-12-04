import { RESOURCES } from '@/ecs/data/resources';
import { world } from '@/ecs/world';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function Resources() {
    useFrame(() => {
        // Trigger re-renders when resources change
    });

    return (
        <group>
            {Array.from(world.with('isResource', 'transform', 'resource').entities).map((entity) => (
                <Resource key={entity.id} entityId={entity.id} />
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

    return (
        <group ref={meshRef}>
            {/* Main resource mesh */}
            <mesh castShadow>
                <sphereGeometry args={[resourceData.size, 8, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>

            {/* Glow effect */}
            <mesh>
                <sphereGeometry args={[resourceData.size * 1.2, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
        </group>
    );
}
