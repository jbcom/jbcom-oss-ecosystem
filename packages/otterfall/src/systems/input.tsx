
import { useGameStore } from '@/stores/gameStore';
import nipplejs, { JoystickManager } from 'nipplejs';
import { useEffect, useRef } from 'react';

export function useInput() {
    const setInput = useGameStore((s) => s.setInput);
    const joystickRef = useRef<JoystickManager | null>(null);
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

    useEffect(() => {
        // Keyboard state
        const keys: Record<string, number> = {
            arrowup: 0, arrowdown: 0, arrowleft: 0, arrowright: 0,
            w: 0, a: 0, s: 0, d: 0,
            " ": 0
        };

        const updateInput = () => {
            // Support both WASD and Arrow keys
            const x = (keys.arrowright || keys.d) - (keys.arrowleft || keys.a);
            const y = (keys.arrowup || keys.w) - (keys.arrowdown || keys.s);
            const jump = keys[" "] === 1;

            if (x !== 0 || y !== 0 || jump) {
                setInput(x, y, true, jump);
            } else if (!joystickRef.current?.ids.length) {
                setInput(0, 0, false, false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k in keys) {
                keys[k] = 1;
                updateInput();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k in keys) {
                keys[k] = 0;
                updateInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Touch handling for Swipe Up (Jump)
        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.changedTouches[0];
            touchStartRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current) return;

            const touch = e.changedTouches[0];
            const deltaY = touchStartRef.current.y - touch.clientY; // Positive is UP
            const deltaTime = Date.now() - touchStartRef.current.time;

            // Swipe Up detection (min distance 50px, max time 300ms)
            if (deltaY > 50 && deltaTime < 300) {
                setInput(0, 0, true, true); // Trigger jump
                setTimeout(() => {
                    // Reset jump after short delay
                    const currentInput = useGameStore.getState().input;
                    setInput(currentInput.direction.x, currentInput.direction.y, currentInput.active, false);
                }, 100);
            }

            touchStartRef.current = null;
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        // Joystick
        const zone = document.getElementById('joystick-zone');
        if (zone) {
            joystickRef.current = nipplejs.create({
                zone,
                mode: 'dynamic',
                color: '#d4af37',
                size: 100,
            });

            joystickRef.current.on('move', (_evt, data) => {
                if (data.angle) {
                    const angle = data.angle.radian;
                    setInput(Math.cos(angle), Math.sin(angle), true, false);
                }
            });

            joystickRef.current.on('end', () => {
                // Only reset if no keys are pressed
                const anyKey = Object.values(keys).some(v => v);
                if (!anyKey) {
                    setInput(0, 0, false, false);
                }
            });
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            joystickRef.current?.destroy();
        };
    }, [setInput]);
}

export function InputZone() {
    return (
        <div
            id="joystick-zone"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                touchAction: 'none',
                pointerEvents: 'auto',
                zIndex: 10,
            }}
        />
    );
}
