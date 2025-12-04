import { furFragmentShader, furVertexShader } from '@/shaders/fur';
import { useGameStore } from '@/stores/gameStore';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const FUR_LAYERS = 6;
const SKIN_COLOR = 0x3e2723;
const TIP_COLOR = 0x795548;

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
    const rootRef = useRef<THREE.Group>(null!);
    const jointsRef = useRef<JointRefs | null>(null);
    const timeRef = useRef(0);

    const input = useGameStore((s) => s.input);
    const player = useGameStore((s) => s.player);
    const updatePlayer = useGameStore((s) => s.updatePlayer);

    // Fur uniforms (shared, updated each frame)
    const furUniforms = useMemo(() => ({
        layerOffset: { value: 0 },
        spacing: { value: 0.02 },
        colorBase: { value: new THREE.Color(SKIN_COLOR) },
        colorTip: { value: new THREE.Color(TIP_COLOR) },
        time: { value: 0 },
    }), []);

    useFrame((_, delta) => {
        if (!rootRef.current || !jointsRef.current) return;

        timeRef.current += delta;
        furUniforms.time.value = timeRef.current;

        const joints = jointsRef.current;
        const root = rootRef.current;

        // Physics constants
        const GRAVITY = 0.015;
        const JUMP_FORCE = 0.35;
        const MAX_STEP_HEIGHT = 0.5; // Max height we can walk up in one frame/step
        const GROUND_Y = 0;
        const WATER_LEVEL = 0.2; // Water surface height
        const BUOYANCY_FORCE = 0.008;
        const WATER_SPEED_MULT = 0.7; // 30% reduction in water

        // Get rocks from store
        const rocks = useGameStore.getState().rocks;

        // Helper: Calculate ground height at position (Terrain + Rocks)
        const getGroundHeight = (x: number, z: number) => {
            let h = GROUND_Y;

            for (const rock of rocks) {
                // Transform point to rock local space
                // We approximate rock as an ellipsoid with semi-axes matching scale
                // Equation: y = b * sqrt(1 - (x/a)^2 - (z/c)^2)

                const dx = x - rock.position.x;
                const dz = z - rock.position.z;

                // Rotate point (inverse rotation) - simplified to ignore Y rotation for now as rocks are mostly round
                // For perfect accuracy we'd rotate dx,dz by -rock.rotation.y
                const cos = Math.cos(-rock.rotation.y);
                const sin = Math.sin(-rock.rotation.y);
                const rx = dx * cos - dz * sin;
                const rz = dx * sin + dz * cos;

                const a = rock.scale.x; // radius x
                const b = rock.scale.y; // radius y (height)
                const c = rock.scale.z; // radius z

                // Check if inside ellipse footprint
                const sqDist = (rx * rx) / (a * a) + (rz * rz) / (c * c);

                if (sqDist < 1.0) {
                    // Inside footprint, calculate height
                    const rockH = b * Math.sqrt(1.0 - sqDist);
                    // Dodecahedrons sit at y=0, so the shape is roughly a hemisphere/dome from 0 upwards
                    // Actually, instanced mesh usually centers geometry. 
                    // If dodecahedron is centered at (0,0,0), it goes from -b to +b.
                    // But our rocks are placed at y=0. 
                    // Let's assume we want the top surface relative to world y=0.
                    // If the mesh is centered, and we placed it at y=0, it sticks halfway into ground.
                    // So height is rock.position.y + localY.
                    // Let's assume the "Ground Height" is simply the ellipsoid top surface.
                    // Add padding to prevent visual sinking into faceted mesh
                    h = Math.max(h, rockH + 0.1);
                }
            }
            return h;
        };

        // Movement Calculation
        let currentSpeed = 0;
        let nextX = root.position.x;
        let nextZ = root.position.z;

        if (input.active) {
            const dirX = -input.direction.x;
            const dirZ = input.direction.y;

            if (Math.abs(dirX) > 0.1 || Math.abs(dirZ) > 0.1) {
                const targetAngle = Math.atan2(dirX, dirZ);

                // Smooth rotation
                let angleDiff = targetAngle - root.rotation.y;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                root.rotation.y += angleDiff * 0.15;

                // Calculate potential next position with slope-based speed
                const { calculateSlope, getSlopeSpeedMultiplier } = require('@/utils/collision');
                const slopeAngle = calculateSlope(root.position);
                const slopeMultiplier = getSlopeSpeedMultiplier(slopeAngle);
                
                // Check if in water
                const isInWater = root.position.y < WATER_LEVEL;
                const waterMultiplier = isInWater ? WATER_SPEED_MULT : 1.0;
                
                currentSpeed = player.maxSpeed * slopeMultiplier * waterMultiplier;
                nextX += Math.sin(root.rotation.y) * currentSpeed;
                nextZ += Math.cos(root.rotation.y) * currentSpeed;
            }
        }

        // Physics & Collision Loop
        let isJumping = player.isJumping;
        let verticalSpeed = player.verticalSpeed;
        let currentY = root.position.y;
        let fallStartY = player.fallStartY || currentY;

        // 1. Check if we can move to nextX, nextZ
        const nextGroundH = getGroundHeight(nextX, nextZ);
        const currentGroundH = getGroundHeight(root.position.x, root.position.z);

        // Slope check: Can we step up?
        // If we are in air, we just check if we hit a wall (nextGroundH > currentY + step)
        // If on ground, we check if slope is too steep (nextGroundH > currentY + step)

        // Effective "feet" Y. If jumping, it's currentY. If walking, it's currentGroundH.
        const feetY = isJumping ? currentY : currentGroundH;
        const heightDiff = nextGroundH - feetY;

        let canMove = true;
        if (heightDiff > MAX_STEP_HEIGHT) {
            // Too steep/high to walk/fly into
            canMove = false;
        }

        if (canMove) {
            root.position.x = nextX;
            root.position.z = nextZ;
        } else {
            // Slide along wall? For now just stop.
            currentSpeed = 0;
        }

        // 2. Handle Jump Input
        if (input.jump && !isJumping) {
            verticalSpeed = JUMP_FORCE;
            isJumping = true;
            
            // Play jump sound
            const { getAudioManager } = require('@/utils/audioManager');
            const audioManager = getAudioManager();
            if (audioManager) {
                audioManager.playSound('jump', 0.4);
            }
        }

        // 3. Apply Gravity and Vertical Movement
        // Apply buoyancy if in water
        const isInWater = currentY < WATER_LEVEL;
        if (isInWater) {
            verticalSpeed += BUOYANCY_FORCE; // Buoyancy counteracts gravity
        }
        
        verticalSpeed -= GRAVITY;
        currentY += verticalSpeed;

        // 4. Ground Collision / Landing
        // We are at (root.x, root.z) now (either moved or stayed)
        // Recalculate ground height at final position
        const finalGroundH = getGroundHeight(root.position.x, root.position.z);

        if (currentY <= finalGroundH) {
            // Landed - check for fall damage
            const fallDistance = fallStartY - finalGroundH;
            if (fallDistance > 5) {
                // Apply fall damage proportional to distance
                const damage = Math.floor((fallDistance - 5) * 2);
                const damagePlayer = useGameStore.getState().damagePlayer;
                damagePlayer(damage);
                console.log(`Fall damage: ${damage} (fell ${fallDistance.toFixed(1)} units)`);
            }
            
            currentY = finalGroundH;
            verticalSpeed = 0;
            isJumping = false;
            fallStartY = currentY; // Reset fall tracking
        } else {
            // Still in air
            isJumping = true; // Ensure state is correct if we walked off a cliff
            // Track highest point for fall damage
            if (currentY > fallStartY) {
                fallStartY = currentY;
            }
        }

        root.position.y = currentY;

        // Stamina management
        const consumeStamina = useGameStore.getState().consumeStamina;
        const restoreStamina = useGameStore.getState().restoreStamina;
        const stamina = useGameStore.getState().player.stamina;

        if (input.active && canMove && currentSpeed > 0) {
            // Running consumes stamina
            consumeStamina(5 * delta);
        } else if (!input.active) {
            // Idle restores stamina
            restoreStamina(10 * delta);
        }

        updatePlayer({
            position: root.position.clone(),
            rotation: root.rotation.y,
            isMoving: input.active && canMove,
            speed: currentSpeed,
            verticalSpeed,
            isJumping,
            fallStartY
        });

        // Procedural Animation
        const speed = player.speed / player.maxSpeed;
        const isRunning = stamina > 10 && speed > 0.7; // Running if fast and has stamina
        
        // Adjust cycle speed based on movement speed
        const cycleSpeed = isRunning ? 15 : 10;
        const walkCycle = timeRef.current * cycleSpeed;

        if (isJumping) {
            // Jump animation with anticipation and landing
            const jumpPhase = verticalSpeed > 0 ? 'ascending' : 'descending';
            
            if (jumpPhase === 'ascending') {
                // Ascending: legs tucked, arms up
                joints.legL.rotation.x = -0.8;
                joints.legR.rotation.x = -0.8;
                joints.armL.rotation.x = -2.5; // Arms up!
                joints.armR.rotation.x = -2.5;
                joints.tail.rotation.x = -0.3; // Tail up for balance
                joints.hips.position.y = 0.5;
                joints.torso.rotation.x = -0.2; // Lean back slightly
            } else {
                // Descending: legs extending, arms forward for landing
                joints.legL.rotation.x = -0.3;
                joints.legR.rotation.x = -0.3;
                joints.armL.rotation.x = -1.5; // Arms forward
                joints.armR.rotation.x = -1.5;
                joints.tail.rotation.x = -0.8; // Tail down
                joints.hips.position.y = 0.5;
                joints.torso.rotation.x = 0.2; // Lean forward for landing
            }
        } else if (speed > 0.1) {
            // Walk/Run cycle with enhanced arm and leg swing
            const limbSwing = isRunning ? 1.2 : 0.8;
            const armSwing = isRunning ? 0.9 : 0.6;
            
            // Legs: opposite phase, more swing when running
            joints.legL.rotation.x = Math.sin(walkCycle) * limbSwing * speed;
            joints.legR.rotation.x = Math.sin(walkCycle + Math.PI) * limbSwing * speed;
            
            // Arms: opposite to legs for natural gait
            joints.armL.rotation.x = Math.sin(walkCycle + Math.PI) * armSwing * speed;
            joints.armR.rotation.x = Math.sin(walkCycle) * armSwing * speed;
            
            // Add arm side swing for more natural movement
            joints.armL.rotation.z = -0.3 + Math.cos(walkCycle + Math.PI) * 0.2 * speed;
            joints.armR.rotation.z = 0.3 + Math.cos(walkCycle) * 0.2 * speed;

            // Spine bob: more pronounced when running
            const bobAmount = isRunning ? 0.08 : 0.05;
            joints.hips.position.y = 0.5 + Math.sin(walkCycle * 2) * bobAmount * speed;
            
            // Torso rotation for natural movement
            joints.torso.rotation.y = Math.sin(walkCycle) * 0.15 * speed;

            // Tail sway: more dramatic when running
            const tailSway = isRunning ? 0.6 : 0.4;
            joints.tail.rotation.y = Math.cos(walkCycle) * tailSway * speed;
            joints.tail.rotation.x = -1.2; // Reset tail base rotation

            // Tilt body based on slope
            const slope = (finalGroundH - currentGroundH) * 2.0;
            joints.hips.rotation.x = -slope;
            
            // Lean forward more when running
            if (isRunning) {
                joints.torso.rotation.x = 0.15;
            } else {
                joints.torso.rotation.x = 0;
            }

        } else {
            // Idle breathing
            const breath = Math.sin(timeRef.current * 2);
            joints.hips.position.y = 0.5 + breath * 0.005;
            joints.torso.rotation.x = breath * 0.02;
            joints.hips.rotation.x = 0; // Reset slope tilt

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
    });

    return (
        <group ref={rootRef}>
            <OtterBody jointsRef={jointsRef} furUniforms={furUniforms} />
        </group>
    );
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

    // Set up joint refs after mount
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
