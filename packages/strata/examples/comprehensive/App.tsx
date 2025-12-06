/**
 * Comprehensive Strata Example
 * 
 * Demonstrates all features of Strata in a single application:
 * - Background layer: Sky, terrain, volumetrics
 * - Midground layer: Water, vegetation, instancing
 * - Foreground layer: Character with fur, molecular structures
 * 
 * This example is similar to the original POC but uses Strata presets.
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Strata imports
import { 
  ProceduralSky,
  Water,
  GPUInstancedMesh,
  VolumetricEffects,
  Raymarching
} from '@jbcom/strata/components';

import {
  createCharacter,
  animateCharacter,
  createFurSystem,
  createWaterMolecule,
  createParticleSystem,
  createDecal,
  createBillboard,
  createShadowSystem,
  createPostProcessingPipeline,
  createReflectionProbe,
  ReflectionProbeManager
} from '@jbcom/strata/presets';

import {
  generateInstanceData,
  createTerrainGeometry,
  createSkyMaterial
} from '@jbcom/strata/core';

function Terrain() {
  // Simplified terrain - in real app, use marching cubes
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 64, 64]} />
      <meshStandardMaterial color={0x2a5a3a} />
    </mesh>
  );
}

function Vegetation() {
  const instances = useRef(
    generateInstanceData(8000, 100, [
      { type: 'forest', center: new THREE.Vector2(0, 0), radius: 50 }
    ])
  );

  const grassGeometry = new THREE.ConeGeometry(0.05, 0.4, 3);
  const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x335522 });

  return (
    <GPUInstancedMesh
      geometry={grassGeometry}
      material={grassMaterial}
      count={8000}
      instances={instances.current}
      enableWind={true}
      windStrength={0.5}
      lodDistance={100}
    />
  );
}

function Character() {
  const characterRef = useRef(
    createCharacter({
      skinColor: 0x3e2723,
      scale: 1.0,
      furOptions: {
        baseColor: 0x3e2723,
        tipColor: 0x795548,
        layerCount: 6
      }
    })
  );

  useFrame((state) => {
    const character = characterRef.current;
    
    // Simple movement
    character.state.speed = 0.1;
    character.root.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 5;
    character.root.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 5;
    
    animateCharacter(character, state.clock.elapsedTime);
  });

  return <primitive object={characterRef.current.root} />;
}

function Molecules() {
  const molecules = useRef([
    createWaterMolecule(new THREE.Vector3(-5, 2, -5), 0.5),
    createWaterMolecule(new THREE.Vector3(5, 2, 5), 0.5),
    createWaterMolecule(new THREE.Vector3(0, 2, 0), 0.5)
  ]);

  useFrame((state) => {
    molecules.current.forEach((mol, i) => {
      mol.rotation.y = state.clock.elapsedTime * 0.5 + i;
    });
  });

  return (
    <>
      {molecules.current.map((mol, i) => (
        <primitive key={i} object={mol} />
      ))}
    </>
  );
}

function Scene() {
    const { scene, camera, gl } = useThree();
    
    // Shadow system
    const shadowLight = useRef(new THREE.DirectionalLight(0xffffff, 1.5));
    shadowLight.current.position.set(50, 40, 50);
    const shadowSystem = useRef(
        createShadowSystem({
            light: shadowLight.current,
            camera,
            cascades: 3,
            enableSoftShadows: true
        })
    );

    // Post-processing (optional - can be disabled for performance)
    const enablePostProcessing = false; // Set to true to enable
    const postProcessing = useRef<ReturnType<typeof createPostProcessingPipeline> | null>(null);
    
    useEffect(() => {
        if (enablePostProcessing) {
            postProcessing.current = createPostProcessingPipeline({
                renderer: gl,
                scene,
                camera,
                effects: [
                    { type: 'bloom', threshold: 0.8, intensity: 1.0 },
                    { type: 'ssao', radius: 0.5, intensity: 1.0 },
                    { type: 'vignette', offset: 0.5, darkness: 0.5 }
                ]
            });
        }
        
        return () => {
            if (postProcessing.current) {
                postProcessing.current.dispose();
            }
            shadowSystem.current.dispose();
        };
    }, [gl, scene, camera, enablePostProcessing]);

    // Reflection probe manager
    const probeManager = useRef(new ReflectionProbeManager(gl, scene));
    useEffect(() => {
        probeManager.current.addProbe('main', {
            position: new THREE.Vector3(0, 5, 0),
            resolution: 256,
            updateRate: 1 // Update once per second for performance
        });
        
        return () => {
            probeManager.current.dispose();
        };
    }, []);

    // Particles
    const fireParticles = useRef(
        createParticleSystem({
            maxParticles: 200,
            rate: 50,
            lifetime: 2.0,
            shape: 'point',
            velocity: {
                min: new THREE.Vector3(-0.5, 0, -0.5),
                max: new THREE.Vector3(0.5, 2, 0.5)
            },
            color: {
                start: new THREE.Color(1, 0.5, 0),
                end: new THREE.Color(1, 0, 0)
            }
        })
    );

    useEffect(() => {
        return () => {
            fireParticles.current.dispose();
        };
    }, []);

    useFrame((state, delta) => {
        // Update shadow system
        shadowSystem.current.update(camera, scene);
        
        // Update post-processing
        if (postProcessing.current) {
            postProcessing.current.render(delta);
        }
        
        // Update reflection probes
        probeManager.current.update();
        
        // Update particles
        fireParticles.current.update(delta);
    });

    return (
        <>
            {/* Background Layer */}
            <ProceduralSky
                timeOfDay={{
                    sunIntensity: 1.0,
                    sunAngle: 60,
                    ambientLight: 0.8
                }}
            />
            <Terrain />
            <VolumetricEffects fogEnabled={true} />

            {/* Midground Layer */}
            <Water size={100} />
            <Vegetation />

            {/* Foreground Layer */}
            <Character />
            <Molecules />
            <primitive object={fireParticles.current.group} position={[0, 1, 0]} />

            {/* Lighting */}
            <primitive object={shadowLight.current} />
            <ambientLight intensity={0.6} />
        </>
    );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 3, -5], fov: 50 }}
        shadows
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
