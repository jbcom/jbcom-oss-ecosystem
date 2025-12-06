# React Three Fiber Rendering Patterns - Otterfall

This document contains actual working R3F component patterns used in the Otterfall game.
Note: Some code may reference "Rivermarsh" which was an earlier internal name for the game.
Use these patterns when generating new rendering code.

## Core Principles

1. **useRef for mesh references** - Access THREE objects via refs
2. **useFrame for animation loops** - Frame-rate independent updates
3. **useMemo for expensive computations** - Positions, geometries
4. **Instanced meshes for many objects** - Performance critical
5. **Custom shaders via ShaderMaterial** - For water, effects

## Player Component Pattern (src/components/Player.tsx)

```tsx
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useRivermarsh } from "@/lib/stores/useRivermarsh";
import { useControlsStore } from "@/stores/useControlsStore";
import * as THREE from "three";

export function Player() {
  const playerRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3());
  
  // Zustand stores for state management
  const { updatePlayerPosition, player, isPaused } = useRivermarsh();
  const movementInput = useControlsStore((state) => state.movement);
  const actions = useControlsStore((state) => state.actions);

  const speed = 5;
  const gravity = -20;
  const groundY = 1;

  useFrame((state, delta) => {
    if (!playerRef.current || isPaused) return;
    
    // Movement calculation
    const movement = new THREE.Vector3();
    movement.x = movementInput.x * speed;
    movement.z = movementInput.y * speed;

    // Apply gravity
    velocityRef.current.y += gravity * delta;

    // Update position
    const newPosition = playerRef.current.position.clone();
    newPosition.add(velocityRef.current.clone().multiplyScalar(delta));

    // Ground collision
    if (newPosition.y <= groundY) {
      newPosition.y = groundY;
      velocityRef.current.y = 0;
    }

    playerRef.current.position.copy(newPosition);
    updatePlayerPosition([newPosition.x, newPosition.y, newPosition.z]);
  });

  return (
    <mesh ref={playerRef} position={player.position} castShadow>
      <boxGeometry args={[0.6, 0.8, 1]} />
      <meshStandardMaterial color="#8B6914" />
    </mesh>
  );
}
```

## Water Shader Pattern

```tsx
function Water() {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current) {
      const time = state.clock.getElapsedTime();
      (waterRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    }
  });

  const waterMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0x4a90e2) },
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          varying float vElevation;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            
            // Wave animation
            float wave1 = sin(pos.x * 0.5 + uTime) * 0.1;
            float wave2 = sin(pos.y * 0.3 + uTime * 1.5) * 0.1;
            pos.z += wave1 + wave2;
            
            vElevation = pos.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec2 vUv;
          varying float vElevation;
          
          void main() {
            vec3 color = uColor + vElevation * 0.2;
            gl_FragColor = vec4(color, 0.7);
          }
        `,
        transparent: true,
      }),
    []
  );

  return (
    <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 10, 10]} />
      <primitive object={waterMaterial} />
    </mesh>
  );
}
```

## Instanced Mesh Pattern (CRITICAL FOR PERFORMANCE)

```tsx
function InstancedGrass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 500;

  // Pre-calculate positions (expensive, do once)
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      const y = 0.3;
      const scale = 0.3 + Math.random() * 0.4;
      const rotation = Math.random() * Math.PI * 2;
      pos.push({ x, y, z, scale, rotation });
    }
    return pos;
  }, []);

  // Set instance matrices (do once after mount)
  useMemo(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.rotation.y = pos.rotation;
      dummy.scale.set(pos.scale, pos.scale, pos.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <coneGeometry args={[0.1, 0.8, 3]} />
      <meshStandardMaterial color="#3d5c2a" />
    </instancedMesh>
  );
}
```

## Terrain Component Pattern

```tsx
function Ground({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 50, 50]} />
      <meshStandardMaterial map={texture} color="#4a7c3a" />
    </mesh>
  );
}
```

## Tree/Prop Pattern

```tsx
function Trees() {
  const treePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      
      // Avoid spawning in center area
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      
      positions.push([x, 0, z]);
    }
    return positions;
  }, []);

  return (
    <>
      {treePositions.map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 3.5, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 8]} />
            <meshStandardMaterial color="#2d4a1e" />
          </mesh>
        </group>
      ))}
    </>
  );
}
```

## Complete Scene Pattern (RivermarshGame.tsx)

```tsx
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Sky } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";

export function RivermarshGame() {
  const isMobile = useIsMobile();

  const keyMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "back", keys: ["ArrowDown", "KeyS"] },
    { name: "left", keys: ["ArrowLeft", "KeyA"] },
    { name: "right", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ position: [0, 15, 15], fov: 50, near: 0.1, far: 1000 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#87CEEB"]} />
          
          <Sky distance={450000} sunPosition={[100, 20, 100]} />

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[50, 50, 25]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          <fog attach="fog" args={["#7ab8d4", 30, 120]} />

          <Player />
          <MarshlandTerrain />

          <EffectComposer>
            <Bloom intensity={0.6} luminanceThreshold={0.8} />
            <DepthOfField focusDistance={0.015} focalLength={0.08} bokehScale={2.5} />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
```

## Key Patterns Summary

1. **Always use refs** - `useRef<THREE.Mesh>(null)` for THREE object access
2. **useFrame for animation** - Use delta for frame-rate independence
3. **useMemo for expensive ops** - Position arrays, geometries, materials
4. **InstancedMesh for >10 objects** - Critical performance optimization
5. **Shader uniforms for animation** - Update via `uniforms.uTime.value = time`
6. **castShadow/receiveShadow** - Enable on appropriate meshes
7. **Post-processing at scene level** - Bloom, DoF for visual quality
8. **KeyboardControls wrapper** - For input handling with @react-three/drei
