import { PREDATOR_SPECIES, PREY_SPECIES } from '@/ecs/data/species';
import { world } from '@/ecs/world';
import { useFrame } from '@react-three/fiber';
import { Detailed } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { RapierRigidBody } from '@react-three/rapier';

export function NPCs() {
    useFrame(() => {
        // This component triggers re-renders when NPCs change
    });

    return (
        <group>
            {Array.from(world.with('isNPC', 'transform', 'species').entities)
                .filter(entity => entity.id !== undefined)
                .map((entity) => (
                    <NPC key={entity.id} entityId={entity.id!} />
                ))}
        </group>
    );
}

interface NPCProps {
    entityId: number;
}

function NPC({ entityId }: NPCProps) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const meshRef = useRef<THREE.Group>(null!);

    const entity = world.entity(entityId);
    
    const speciesData = useMemo(() => {
        if (!entity?.species) return null;
        return entity.species.type === 'predator'
            ? PREDATOR_SPECIES[entity.species.id as keyof typeof PREDATOR_SPECIES]
            : PREY_SPECIES[entity.species.id as keyof typeof PREY_SPECIES];
    }, [entity?.species?.id, entity?.species?.type]);

    const sizeScale = useMemo(() => {
        if (!speciesData) return 1;
        return speciesData.size === 'huge' ? 2.0
            : speciesData.size === 'large' ? 1.5
            : speciesData.size === 'medium' ? 1.0
            : speciesData.size === 'small' ? 0.7
            : 0.4; // tiny
    }, [speciesData]);

    useFrame(() => {
        const currentEntity = world.entity(entityId);
        if (!currentEntity?.transform || !rigidBodyRef.current) return;

        // Sync Rapier body position with Yuka AI position
        const pos = currentEntity.transform.position;
        rigidBodyRef.current.setTranslation(
            { x: pos.x, y: pos.y + 0.3 * sizeScale, z: pos.z },
            true
        );

        // Update visual mesh rotation
        if (meshRef.current) {
            meshRef.current.quaternion.copy(currentEntity.transform.rotation);
        }
    });

    if (!entity || !entity.species || !speciesData) return null;

    const color = speciesData.primaryColor;
    const initialPos = entity.transform?.position || new THREE.Vector3(0, 0, 0);

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="kinematicPosition"
            position={[initialPos.x, initialPos.y + 0.3 * sizeScale, initialPos.z]}
            colliders={false}
        >
            <CapsuleCollider args={[0.2 * sizeScale, 0.15 * sizeScale]} />
            
            <group ref={meshRef}>
                {/* LOD using drei's Detailed component */}
                <Detailed distances={[0, 30, 60, 100]}>
                    {/* FULL detail - closest */}
                    <NPCFullDetail sizeScale={sizeScale} color={color} />
                    
                    {/* MEDIUM detail */}
                    <NPCMediumDetail sizeScale={sizeScale} color={color} />
                    
                    {/* LOW detail - farthest visible */}
                    <NPCLowDetail sizeScale={sizeScale} color={color} />
                    
                    {/* CULLED - beyond 100 units */}
                    <group />
                </Detailed>
            </group>
        </RigidBody>
    );
}

interface NPCDetailProps {
    sizeScale: number;
    color: string;
}

function NPCFullDetail({ sizeScale, color }: NPCDetailProps) {
    return (
        <group>
            {/* Body */}
            <mesh castShadow position={[0, 0, 0]}>
                <capsuleGeometry args={[0.2 * sizeScale, 0.4 * sizeScale, 4, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Head */}
            <mesh castShadow position={[0, 0.3 * sizeScale, 0.2 * sizeScale]}>
                <sphereGeometry args={[0.15 * sizeScale, 16, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Legs */}
            <mesh castShadow position={[0.1 * sizeScale, -0.2 * sizeScale, 0]}>
                <cylinderGeometry args={[0.05 * sizeScale, 0.05 * sizeScale, 0.2 * sizeScale]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh castShadow position={[-0.1 * sizeScale, -0.2 * sizeScale, 0]}>
                <cylinderGeometry args={[0.05 * sizeScale, 0.05 * sizeScale, 0.2 * sizeScale]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}

function NPCMediumDetail({ sizeScale, color }: NPCDetailProps) {
    return (
        <group>
            {/* Body */}
            <mesh castShadow position={[0, 0, 0]}>
                <capsuleGeometry args={[0.2 * sizeScale, 0.4 * sizeScale, 4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.3 * sizeScale, 0.2 * sizeScale]}>
                <sphereGeometry args={[0.15 * sizeScale, 8, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}

function NPCLowDetail({ sizeScale, color }: NPCDetailProps) {
    return (
        <mesh>
            <sphereGeometry args={[0.3 * sizeScale, 4, 4]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}
