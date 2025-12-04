import { useGameStore } from '@/stores/gameStore';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const CAMERA_OFFSET = new THREE.Vector3(0, 3.5, -5);
const LOOK_OFFSET = new THREE.Vector3(0, 0.5, 0);
const SMOOTHING = 0.05;

export function FollowCamera() {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
    const player = useGameStore((s) => s.player);

    useFrame(({ camera }) => {
        // Target position: behind and above player
        const idealPos = new THREE.Vector3(
            player.position.x + CAMERA_OFFSET.x,
            player.position.y + CAMERA_OFFSET.y,
            player.position.z + CAMERA_OFFSET.z
        );

        // Smooth lag follow
        camera.position.lerp(idealPos, SMOOTHING);

        // Look at player center
        const lookTarget = new THREE.Vector3(
            player.position.x + LOOK_OFFSET.x,
            player.position.y + LOOK_OFFSET.y,
            player.position.z + LOOK_OFFSET.z
        );
        camera.lookAt(lookTarget);
    });

    return null;
}
