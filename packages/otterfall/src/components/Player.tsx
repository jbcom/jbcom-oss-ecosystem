import { furFragmentShader, furVertexShader } from '@/shaders/fur';
import { useGameStore } from '@/stores/gameStore';
import { getAudioManager } from '@/utils/audioManager';
import { setPlayerRef } from '@/utils/testHooks';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { RapierRigidBody } from '@react-three/rapier';

const FUR_LAYERS = 6;
const SKIN_COLOR = 0x3e2723;
const TIP_COLOR = 0x795548;

// Physics constants
const MOVE_FORCE = 50;
const JUMP_IMPULSE = 8;
const MAX_SPEED = 8;
const WATER_LEVEL = 0.2;
const BUOYANCY_FORCE = 12;

interface JointRefs {
    hips: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
    armL: THREE.Group;
    armR: THREE.Group;
    tail: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
}

export function Player() {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const meshRef = useRef<THREE.Group>(null!);
    const jointsRef = useRef<JointRefs | null>(null);
    const timeRef = useRef(0);
    const isGroundedRef = useRef(true);
    const lastJumpTime = useRef(0);

    const input = useGameStore((s) => s.input);
    const player = useGameStore((s) => s.player);
    const updatePlayer = useGameStore((s) => s.updatePlayer);
    const damagePlayer = useGameStore.getState().damagePlayer;

    // Fur uniforms (shared, updated each frame)
    const furUniforms = useMemo(() => ({
        layerOffset: { value: 0 },
        spacing: { value: 0.02 },
        colorBase: { value: new THREE.Color(SKIN_COLOR) },
        colorTip: { value: new THREE.Color(TIP_COLOR) },
        time: { value: 0 },
    }), []);

    useFrame((_, delta) => {
        if (!rigidBodyRef.current || !meshRef.current) return;

        const rb = rigidBodyRef.current;
        timeRef.current += delta;
        furUniforms.time.value = timeRef.current;

        // Get current physics state
        const position = rb.translation();
        const velocity = rb.linvel();
        const isInWater = position.y < WATER_LEVEL;

        // Simple ground check: if Y position is near ground and vertical velocity is low
        // This works because Rapier physics will stop us at the ground
        const isGrounded = position.y < 0.8 && Math.abs(velocity.y) < 0.5;
        isGroundedRef.current = isGrounded;

        // Movement input
        if (input.active) {
            const dirX = -input.direction.x;
            const dirZ = input.direction.y;

            if (Math.abs(dirX) > 0.1 || Math.abs(dirZ) > 0.1) {
                // Calculate target rotation
                const targetAngle = Math.atan2(dirX, dirZ);
                
                // Smooth rotation on mesh (visual only)
                let angleDiff = targetAngle - meshRef.current.rotation.y;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                meshRef.current.rotation.y += angleDiff * 0.15;

                // Apply movement force
                const waterMultiplier = isInWater ? 0.7 : 1.0;
                const force = {
                    x: dirX * MOVE_FORCE * waterMultiplier,
                    y: 0,
                    z: dirZ * MOVE_FORCE * waterMultiplier
                };
                
                // Clamp horizontal velocity
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
                if (speed < MAX_SPEED * waterMultiplier) {
                    rb.applyImpulse(force, true);
                }
            }
        }

        // Apply buoyancy in water
        if (isInWater) {
            const depth = WATER_LEVEL - position.y;
            const buoyancy = Math.min(depth * BUOYANCY_FORCE, BUOYANCY_FORCE);
            rb.applyImpulse({ x: 0, y: buoyancy * delta * 60, z: 0 }, true);
        }

        // Jump
        const now = Date.now();
        if (input.jump && isGrounded && now - lastJumpTime.current > 300) {
            lastJumpTime.current = now;
            rb.applyImpulse({ x: 0, y: JUMP_IMPULSE, z: 0 }, true);
            
            const audioManager = getAudioManager();
            if (audioManager) {
                audioManager.playSound('jump', 0.4);
            }
        }

        // Apply drag to prevent sliding
        if (isGrounded && !input.active) {
            rb.setLinvel(
                { x: velocity.x * 0.9, y: velocity.y, z: velocity.z * 0.9 },
                true
            );
        }

        // Fall damage check
        if (isGrounded && velocity.y < -15) {
            const damage = Math.floor(Math.abs(velocity.y + 15) * 2);
            if (damage > 0) {
                damagePlayer(damage);
                console.log(`Fall damage: ${damage}`);
            }
        }

        // Update mesh position to follow rigid body
        meshRef.current.position.set(position.x, position.y, position.z);

        // Stamina management
        const consumeStamina = useGameStore.getState().consumeStamina;
        const restoreStamina = useGameStore.getState().restoreStamina;

        const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        if (input.active && speed > 0.5) {
            consumeStamina(5 * delta);
        } else if (!input.active) {
            restoreStamina(10 * delta);
        }

        // Update game store
        updatePlayer({
            position: new THREE.Vector3(position.x, position.y, position.z),
            rotation: meshRef.current.rotation.y,
            isMoving: speed > 0.5,
            speed: speed / MAX_SPEED,
            verticalSpeed: velocity.y,
            isJumping: !isGrounded,
        });

        // Procedural Animation
        if (jointsRef.current) {
            animateOtter(jointsRef.current, speed, velocity.y, isGrounded, timeRef.current, player.stamina);
        }
    });

    // Expose player ref for E2E testing
    useEffect(() => {
        if (meshRef.current) {
            setPlayerRef(meshRef.current);
        }
        return () => setPlayerRef(null);
    }, []);

    return (
        <>
            {/* Physics body */}
            <RigidBody
                ref={rigidBodyRef}
                type="dynamic"
                position={[0, 2, 0]}
                colliders={false}
                mass={1}
                linearDamping={0.5}
                angularDamping={1}
                lockRotations
                enabledRotations={[false, false, false]}
            >
                <CapsuleCollider args={[0.3, 0.4]} position={[0, 0.7, 0]} />
            </RigidBody>

            {/* Visual mesh (follows rigid body) */}
            <group ref={meshRef}>
                <OtterBody jointsRef={jointsRef} furUniforms={furUniforms} />
            </group>
        </>
    );
}

function animateOtter(
    joints: JointRefs,
    speed: number,
    verticalSpeed: number,
    isGrounded: boolean,
    time: number,
    stamina: number
) {
    const normalizedSpeed = Math.min(speed / MAX_SPEED, 1);
    const isRunning = stamina > 10 && normalizedSpeed > 0.7;
    const isJumping = !isGrounded;
    
    const cycleSpeed = isRunning ? 15 : 10;
    const walkCycle = time * cycleSpeed;

    if (isJumping) {
        // Jump animation
        const jumpPhase = verticalSpeed > 0 ? 'ascending' : 'descending';
        
        if (jumpPhase === 'ascending') {
            joints.legL.rotation.x = -0.8;
            joints.legR.rotation.x = -0.8;
            joints.armL.rotation.x = -2.5;
            joints.armR.rotation.x = -2.5;
            joints.tail.rotation.x = -0.3;
            joints.hips.position.y = 0.5;
            joints.torso.rotation.x = -0.2;
        } else {
            joints.legL.rotation.x = -0.3;
            joints.legR.rotation.x = -0.3;
            joints.armL.rotation.x = -1.5;
            joints.armR.rotation.x = -1.5;
            joints.tail.rotation.x = -0.8;
            joints.hips.position.y = 0.5;
            joints.torso.rotation.x = 0.2;
        }
    } else if (normalizedSpeed > 0.1) {
        // Walk/Run cycle
        const limbSwing = isRunning ? 1.2 : 0.8;
        const armSwing = isRunning ? 0.9 : 0.6;
        
        joints.legL.rotation.x = Math.sin(walkCycle) * limbSwing * normalizedSpeed;
        joints.legR.rotation.x = Math.sin(walkCycle + Math.PI) * limbSwing * normalizedSpeed;
        joints.armL.rotation.x = Math.sin(walkCycle + Math.PI) * armSwing * normalizedSpeed;
        joints.armR.rotation.x = Math.sin(walkCycle) * armSwing * normalizedSpeed;
        joints.armL.rotation.z = -0.3 + Math.cos(walkCycle + Math.PI) * 0.2 * normalizedSpeed;
        joints.armR.rotation.z = 0.3 + Math.cos(walkCycle) * 0.2 * normalizedSpeed;

        const bobAmount = isRunning ? 0.08 : 0.05;
        joints.hips.position.y = 0.5 + Math.sin(walkCycle * 2) * bobAmount * normalizedSpeed;
        joints.torso.rotation.y = Math.sin(walkCycle) * 0.15 * normalizedSpeed;

        const tailSway = isRunning ? 0.6 : 0.4;
        joints.tail.rotation.y = Math.cos(walkCycle) * tailSway * normalizedSpeed;
        joints.tail.rotation.x = -1.2;

        joints.torso.rotation.x = isRunning ? 0.15 : 0;
        joints.hips.rotation.x = 0;
    } else {
        // Idle breathing
        const breath = Math.sin(time * 2);
        joints.hips.position.y = 0.5 + breath * 0.005;
        joints.torso.rotation.x = breath * 0.02;
        joints.hips.rotation.x = 0;

        // Lerp limbs back to rest
        joints.legL.rotation.x *= 0.9;
        joints.legR.rotation.x *= 0.9;
        joints.armL.rotation.x *= 0.9;
        joints.armR.rotation.x *= 0.9;
        joints.armL.rotation.z = joints.armL.rotation.z * 0.9 - 0.3 * 0.1;
        joints.armR.rotation.z = joints.armR.rotation.z * 0.9 + 0.3 * 0.1;
        joints.tail.rotation.x = -1.2;
        joints.tail.rotation.y *= 0.9;
    }
}

interface OtterBodyProps {
    jointsRef: React.MutableRefObject<JointRefs | null>;
    furUniforms: Record<string, { value: unknown }>;
}

function OtterBody({ jointsRef, furUniforms }: OtterBodyProps) {
    const hipsRef = useRef<THREE.Group>(null!);
    const legLRef = useRef<THREE.Group>(null!);
    const legRRef = useRef<THREE.Group>(null!);
    const armLRef = useRef<THREE.Group>(null!);
    const armRRef = useRef<THREE.Group>(null!);
    const tailRef = useRef<THREE.Group>(null!);
    const torsoRef = useRef<THREE.Group>(null!);
    const headRef = useRef<THREE.Group>(null!);

    useFrame(() => {
        if (!jointsRef.current && hipsRef.current) {
            jointsRef.current = {
                hips: hipsRef.current,
                legL: legLRef.current,
                legR: legRRef.current,
                armL: armLRef.current,
                armR: armRRef.current,
                tail: tailRef.current,
                torso: torsoRef.current,
                head: headRef.current,
            };
        }
    });

    return (
        <group ref={hipsRef} position={[0, 0.5, 0]}>
            {/* Hips */}
            <FurryMesh geometry={<sphereGeometry args={[0.35, 16, 16]} />} scale={[1, 1.1, 1]} furUniforms={furUniforms} />

            {/* Torso */}
            <group ref={torsoRef} position={[0, 0.3, 0]}>
                <FurryMesh geometry={<capsuleGeometry args={[0.32, 0.6, 4, 8]} />} position={[0, 0.3, 0]} furUniforms={furUniforms} />

                {/* Head */}
                <group ref={headRef} position={[0, 0.7, 0]}>
                    <FurryMesh geometry={<sphereGeometry args={[0.25, 16, 16]} />} furUniforms={furUniforms} />

                    {/* Muzzle */}
                    <mesh position={[0, -0.05, 0.2]} scale={[1, 0.8, 1.2]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshStandardMaterial color={0x5d4037} />
                    </mesh>

                    {/* Nose */}
                    <mesh position={[0, -0.05, 0.38]}>
                        <sphereGeometry args={[0.05]} />
                        <meshBasicMaterial color={0x111111} />
                    </mesh>
                </group>

                {/* Arms */}
                <group ref={armLRef} position={[0.3, 0.5, 0.1]}>
                    <FurryMesh
                        geometry={<capsuleGeometry args={[0.08, 0.35, 4, 8]} />}
                        position={[0, -0.15, 0]}
                        rotation={[0, 0, -0.3]}
                        furUniforms={furUniforms}
                    />
                </group>
                <group ref={armRRef} position={[-0.3, 0.5, 0.1]}>
                    <FurryMesh
                        geometry={<capsuleGeometry args={[0.08, 0.35, 4, 8]} />}
                        position={[0, -0.15, 0]}
                        rotation={[0, 0, 0.3]}
                        furUniforms={furUniforms}
                    />
                </group>
            </group>

            {/* Legs */}
            <group ref={legLRef} position={[0.2, 0, 0]}>
                <FurryMesh geometry={<capsuleGeometry args={[0.12, 0.4, 4, 8]} />} position={[0, -0.25, 0]} furUniforms={furUniforms} />
            </group>
            <group ref={legRRef} position={[-0.2, 0, 0]}>
                <FurryMesh geometry={<capsuleGeometry args={[0.12, 0.4, 4, 8]} />} position={[0, -0.25, 0]} furUniforms={furUniforms} />
            </group>

            {/* Tail */}
            <group ref={tailRef} position={[0, 0, -0.3]}>
                <FurryMesh
                    geometry={<coneGeometry args={[0.15, 0.8, 8]} />}
                    position={[0, -0.2, 0]}
                    rotation={[-1.2, 0, 0]}
                    furUniforms={furUniforms}
                />
            </group>
        </group>
    );
}

interface FurryMeshProps {
    geometry: React.ReactElement;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    furUniforms: Record<string, { value: unknown }>;
}

function FurryMesh({ geometry, position, rotation, scale, furUniforms }: FurryMeshProps) {
    const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN_COLOR }), []);

    const furMaterials = useMemo(() => {
        const mats: THREE.ShaderMaterial[] = [];
        for (let i = 1; i < FUR_LAYERS; i++) {
            const mat = new THREE.ShaderMaterial({
                vertexShader: furVertexShader,
                fragmentShader: furFragmentShader,
                uniforms: {
                    layerOffset: { value: i / FUR_LAYERS },
                    spacing: { value: furUniforms.spacing.value },
                    colorBase: { value: furUniforms.colorBase.value },
                    colorTip: { value: furUniforms.colorTip.value },
                    time: furUniforms.time,
                },
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
            });
            mats.push(mat);
        }
        return mats;
    }, [furUniforms]);

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Base mesh */}
            <mesh castShadow material={skinMat}>
                {geometry}
            </mesh>

            {/* Fur shells */}
            {furMaterials.map((mat, i) => (
                <mesh key={i} material={mat}>
                    {geometry}
                </mesh>
            ))}
        </group>
    );
}
