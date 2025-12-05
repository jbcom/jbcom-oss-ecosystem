import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface ObjectiveMarkerProps {
    targetPosition: THREE.Vector3;
    playerPosition: THREE.Vector3;
    cameraPosition: THREE.Vector3;
    visible: boolean;
    label?: string;
}

const OBJECTIVE_STORAGE_KEY = 'otterfall_first_resource_collected';

export function ObjectiveMarker({
    targetPosition,
    playerPosition,
    cameraPosition,
    visible,
    label = 'Collect Resource',
}: ObjectiveMarkerProps) {
    const [show, setShow] = useState(false);
    const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 });
    const [distance, setDistance] = useState(0);

    // Check if first resource has been collected
    useEffect(() => {
        try {
            const collected = localStorage.getItem(OBJECTIVE_STORAGE_KEY);
            if (!collected && visible) {
                setShow(true);
            }
        } catch (e) {
            console.error('Failed to check objective status:', e);
        }
    }, [visible]);

    // Update screen position based on target and camera
    useEffect(() => {
        if (!show) return;

        const updatePosition = () => {
            // Calculate direction from player to target
            const direction = new THREE.Vector3()
                .subVectors(targetPosition, playerPosition)
                .normalize();

            // Calculate distance
            const dist = playerPosition.distanceTo(targetPosition);
            setDistance(Math.floor(dist));

            // Project to screen space (simplified)
            // In a real implementation, you'd use camera.project()
            const screenX = window.innerWidth / 2 + direction.x * 100;
            const screenY = window.innerHeight / 2 - direction.z * 100;

            setScreenPosition({ x: screenX, y: screenY });
        };

        updatePosition();
        const interval = setInterval(updatePosition, 100);
        return () => clearInterval(interval);
    }, [show, targetPosition, playerPosition, cameraPosition]);

    if (!show) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${screenPosition.x}px`,
                top: `${screenPosition.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000,
            }}
        >
            {/* Pulsing marker */}
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.3)',
                    border: '3px solid #d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                }}
            >
                <div
                    style={{
                        fontSize: '20px',
                    }}
                >
                    ⭐
                </div>
            </div>

            {/* Label */}
            <div
                style={{
                    position: 'absolute',
                    top: '50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    border: '2px solid rgba(212,175,55,0.5)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    color: '#d4af37',
                    fontSize: '12px',
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                }}
            >
                <div>{label}</div>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                    {distance}m away
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
}

export function markFirstResourceCollected() {
    try {
        localStorage.setItem(OBJECTIVE_STORAGE_KEY, 'true');
    } catch (e) {
        console.error('Failed to mark first resource collected:', e);
    }
}

export function hasCollectedFirstResource(): boolean {
    try {
        return localStorage.getItem(OBJECTIVE_STORAGE_KEY) === 'true';
    } catch (e) {
        console.error('Failed to check first resource status:', e);
        return false;
    }
}
