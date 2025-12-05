import { RESOURCES } from '@/ecs/data/resources';
import { world } from '@/ecs/world';
import { useGameStore } from '@/stores/gameStore';
import { calculateLODLevel, getGeometryDetail, LODLevel } from '@/utils/lod';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
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
    const playerPos = useGameStore((s) => s.player.position);
    const [lodLevel, setLodLevel] = useState<LODLevel>(LODLevel.FULL);

    useFrame(() => {
        const entity = world.entity(entityId);
        if (!entity || !entity.transform || !meshRef.current) return;

        // Update position from ECS
        meshRef.current.position.copy(entity.transform.position);

        // Calculate LOD level
        const newLodLevel = calculateLODLevel(entity.transform.position, playerPos);
        if (newLodLevel !== lodLevel) {
            setLodLevel(newLodLevel);
        }

        // Hide if collected or culled
        if (entity.resource?.collected || newLodLevel === LODLevel.CULLED) {
            meshRef.current.visible = false;
        } else {
            meshRef.current.visible = true;
            // Gentle bobbing animation (only at FULL and MEDIUM detail)
            if (newLodLevel === LODLevel.FULL || newLodLevel === LODLevel.MEDIUM) {
                meshRef.current.position.y = entity.transform.position.y + Math.sin(Date.now() * 0.002) * 0.1;
                // Slow rotation
                meshRef.current.rotation.y += 0.01;
            }
        }
    });

    const entity = world.entity(entityId);
    if (!entity || !entity.resource) return null;

    const resourceData = RESOURCES[entity.resource.type];
    const color = resourceData.color;
    const detail = getGeometryDetail(lodLevel);

    return (
        <group ref={meshRef}>
            {/* Main resource mesh */}
            <mesh castShadow={detail.castShadow}>
                <sphereGeometry args={[resourceData.size, detail.segments, detail.segments]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>

            {/* Glow effect - only at FULL detail */}
            {lodLevel === LODLevel.FULL && (
                <mesh>
                    <sphereGeometry args={[resourceData.size * 1.2, detail.segments, detail.segments]} />
                    <meshBasicMaterial color={color} transparent opacity={0.2} />
                </mesh>
            )}
        </group>
    );
}
