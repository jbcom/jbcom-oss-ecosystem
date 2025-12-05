import { FollowCamera } from '@/components/Camera';
import { NPCs } from '@/components/NPCs';
import { Player } from '@/components/Player';
import { Resources } from '@/components/Resources';
import { TapToCollect } from '@/components/TapToCollect';
import { GameOver } from '@/components/ui/GameOver';
import { HUD } from '@/components/ui/HUD';
import { Loader } from '@/components/ui/Loader';
import { Tutorial } from '@/components/ui/Tutorial';
import { World } from '@/components/World';
import { VolumetricEffects } from '@/components/VolumetricEffects';
import { GameSystems } from '@/systems/GameSystems';
import { InputZone, useInput } from '@/systems/input';
import { Canvas } from '@react-three/fiber';
import { Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';

function Scene() {
    useInput();

    return (
        <>
            <GameSystems />
            
            {/* Physics world wraps all physical objects */}
            <Physics gravity={[0, -15, 0]} timeStep="vary">
                <World />
                <Player />
                <NPCs />
                <Resources />
            </Physics>
            
            <FollowCamera />
            <TapToCollect />

            {/* Post-processing with volumetric effects */}
            <VolumetricEffects
                enableFog={true}
                enableUnderwater={true}
                fogSettings={{
                    color: new THREE.Color(0.6, 0.7, 0.8),
                    density: 0.015,
                    height: 5
                }}
                underwaterSettings={{
                    waterColor: new THREE.Color(0.0, 0.25, 0.4),
                    density: 0.08,
                    causticStrength: 0.4,
                    waterSurface: 0
                }}
            >
                <Bloom
                    intensity={0.4}
                    luminanceThreshold={0.75}
                    luminanceSmoothing={0.5}
                />
                <Vignette
                    offset={0.25}
                    darkness={0.6}
                />
                <DepthOfField
                    focusDistance={0.01}
                    focalLength={0.02}
                    bokehScale={2}
                />
            </VolumetricEffects>
        </>
    );
}

export default function App() {
    return (
        <>
            <Canvas
                shadows
                camera={{ fov: 50, near: 0.1, far: 500, position: [0, 3.5, -5] }}
                gl={{
                    antialias: false,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 1.5]}
                style={{ background: '#0a0808' }}
            >
                <Scene />
            </Canvas>

            <InputZone />
            <HUD />
            <GameOver />
            <Loader />
            <Tutorial />
        </>
    );
}
