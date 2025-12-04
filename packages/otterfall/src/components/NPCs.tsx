import { PREDATOR_SPECIES, PREY_SPECIES } from '@/ecs/data/species';
import { world } from '@/ecs/world';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function NPCs() {
    useFrame(() => {
        // This component just triggers re-renders when NPCs change
        // Actual rendering happens in NPC component below
    });

    return (
        <group>
            {Array.from(world.with('isNPC', 'transform', 'species').entities).map((entity) => (
                <NPC key={entity.id} entityId={entity.id} />
            ))}
        </group>
    );
}

interface NPCProps {
    entityId: number;
}

function NPC({ entityId }: NPCProps) {
    const meshRef = useRef<THREE.Group>(null!);
    const { camera } = useThree();
    const playerPos = useGameStore((s) => s.player.position);
    const [lodLevel, setLodLevel] = useState<LODLevel>(LODLevel.FULL);

    useFrame(() => {
        const entity = world.entity(entityId);
        if (!entity || !entity.transform || !meshRef.current) return;

        // Update position and rotation from ECS
        meshRef.current.position.copy(entity.transform.position);
        meshRef.current.quaternion.copy(entity.transform.rotation);

        // Calculate LOD level based on distance to player
        const newLodLevel = calculateLODLevel(entity.transform.position, playerPos);
        if (newLodLevel !== lodLevel) {
            setLodLevel(newLodLevel);
        }

        // Cull if too far
        meshRef.current.visible = newLodLevel !== LODLevel.CULLED;
    });

    const entity = world.entity(entityId);
    if (!entity || !entity.species) return null;

    const speciesData = entity.species.type === 'predator'
        ? PREDATOR_SPECIES[entity.species.id as keyof typeof PREDATOR_SPECIES]
        : PREY_SPECIES[entity.species.id as keyof typeof PREY_SPECIES];

    if (!speciesData) return null;

    // Simple procedural mesh based on size
    const sizeScale = speciesData.size === 'huge' ? 2.0
        : speciesData.size === 'large' ? 1.5
        : speciesData.size === 'medium' ? 1.0
        : speciesData.size === 'small' ? 0.7
        : 0.4; // tiny

    const color = speciesData.primaryColor;
    const detail = getGeometryDetail(lodLevel);

    // Simplified rendering for LOW LOD - just a single sphere
    if (lodLevel === LODLevel.LOW) {
        return (
            <group ref={meshRef}>
                <mesh>
                    <sphereGeometry args={[0.3 * sizeScale, detail.segments, detail.segments]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={meshRef}>
            {/* Body */}
            <mesh castShadow={detail.castShadow} position={[0, 0.3 * sizeScale, 0]}>
                <capsuleGeometry args={[0.2 * sizeScale, 0.4 * sizeScale, 4, detail.segments]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Head */}
            <mesh castShadow={detail.castShadow} position={[0, 0.6 * sizeScale, 0.2 * sizeScale]}>
                <sphereGeometry args={[0.15 * sizeScale, detail.segments, detail.segments]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Legs (simple) - only render at FULL detail */}
            {lodLevel === LODLevel.FULL && (
                <>
                    <mesh castShadow position={[0.1 * sizeScale, 0.1 * sizeScale, 0]}>
                        <cylinderGeometry args={[0.05 * sizeScale, 0.05 * sizeScale, 0.2 * sizeScale]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh castShadow position={[-0.1 * sizeScale, 0.1 * sizeScale, 0]}>
                        <cylinderGeometry args={[0.05 * sizeScale, 0.05 * sizeScale, 0.2 * sizeScale]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                </>
            )}
        </group>
    );
}
