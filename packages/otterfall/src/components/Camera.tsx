import { useGameStore } from '@/stores/gameStore';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const BASE_CAMERA_OFFSET = new THREE.Vector3(0, 3.5, -5);
const LOOK_OFFSET = new THREE.Vector3(0, 0.5, 0);
const SMOOTHING = 0.05;
const MIN_ZOOM = 0.5; // Closer
const MAX_ZOOM = 2.0; // Further
const DEFAULT_ZOOM = 1.0;

export function FollowCamera() {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
    const player = useGameStore((s) => s.player);
    const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
    const lastPinchDistanceRef = useRef<number | null>(null);

    // Pinch-to-zoom gesture handling
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault(); // Prevent default pinch behavior

                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // Calculate distance between two touches
                const dx = touch2.clientX - touch1.clientX;
                const dy = touch2.clientY - touch1.clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastPinchDistanceRef.current !== null) {
                    // Calculate zoom delta
                    const delta = distance - lastPinchDistanceRef.current;
                    const zoomDelta = delta * 0.01; // Sensitivity

                    setZoomLevel(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev - zoomDelta)));
                }

                lastPinchDistanceRef.current = distance;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (e.touches.length < 2) {
                lastPinchDistanceRef.current = null;
            }
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    useFrame(({ camera }) => {
        // Apply zoom to camera offset
        const CAMERA_OFFSET = BASE_CAMERA_OFFSET.clone().multiplyScalar(zoomLevel);

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
