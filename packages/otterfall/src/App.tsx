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
import { GameSystems } from '@/systems/GameSystems';
import { InputZone, useInput } from '@/systems/input';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';

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

            {/* Post-processing for atmospheric polish */}
            <EffectComposer>
                <Bloom
                    intensity={0.3}
                    luminanceThreshold={0.8}
                    luminanceSmoothing={0.4}
                />
                <Vignette
                    offset={0.3}
                    darkness={0.7}
                />
            </EffectComposer>
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
