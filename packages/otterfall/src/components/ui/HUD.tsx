import { world as ecsWorld } from '@/ecs/world';
import { useGameStore } from '@/stores/gameStore';
import { useEffect, useRef, useState } from 'react';

export function HUD() {
    const health = useGameStore((s) => s.player.health);
    const maxHealth = useGameStore((s) => s.player.maxHealth);
    const stamina = useGameStore((s) => s.player.stamina);
    const maxStamina = useGameStore((s) => s.player.maxStamina);
    const nearbyResource = useGameStore((s) => s.nearbyResource);
    
    const [timeDisplay, setTimeDisplay] = useState({ hour: 8, phase: 'day' });
    const [isPaused, setIsPaused] = useState(false);
    const resumeButtonRef = useRef<HTMLButtonElement>(null);

    // Clamp percentages to 0-100 range to handle edge cases
    const healthPercent = Math.min(100, Math.max(0, (health / maxHealth) * 100));
    const staminaPercent = Math.min(100, Math.max(0, (stamina / maxStamina) * 100));

    // Update time display from ECS
    useEffect(() => {
        const interval = setInterval(() => {
            for (const { time } of ecsWorld.with('time')) {
                setTimeDisplay({
                    hour: Math.floor(time.hour),
                    phase: time.phase
                });
                break;
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Format time as "8:00 AM - Day"
    const formatTime = () => {
        const { hour, phase } = timeDisplay;
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const phaseCapitalized = phase.charAt(0).toUpperCase() + phase.slice(1);
        return `${displayHour}:00 ${period} - ${phaseCapitalized}`;
    };

    // Handle pause menu - use functional update to avoid dependency
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsPaused(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []); // Empty deps - listener only added once

    const handleResume = () => {
        setIsPaused(false);
    };

    // Reusable button style and handlers
    const menuButtonStyle: React.CSSProperties = {
        padding: '12px 40px',
        fontSize: '16px',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: '#fff',
        background: 'rgba(255,255,255,0.1)',
        border: '2px solid rgba(255,255,255,0.5)',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    };

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEntering: boolean) => {
        if (isEntering) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.borderColor = '#fff';
        } else {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
        }
    };

    // Focus management - focus Resume button when pause menu opens
    useEffect(() => {
        if (isPaused && resumeButtonRef.current) {
            resumeButtonRef.current.focus();
        }
    }, [isPaused]);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: isPaused ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 100,
        }}>
            {/* Top HUD */}
            <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
            }}>
                {/* Title */}
                <div style={{
                    textAlign: 'left',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                }}>
                    <h1 style={{
                        color: '#d4af37',
                        fontSize: '1.5em',
                        margin: 0,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontFamily: 'Cinzel, serif',
                    }}>
                        Otterfall
                    </h1>
                    <p style={{
                        color: '#ccc',
                        fontSize: '0.8em',
                        opacity: 0.7,
                        margin: '5px 0 0 0',
                        fontFamily: 'Cinzel, serif',
                    }}>
                        Explore the Riverlands
                    </p>
                </div>

                {/* Time Display - Top Right */}
                <div style={{
                    textAlign: 'right',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                }}>
                    <div style={{
                        color: '#fff',
                        fontSize: '1.2em',
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                    }}>
                        {formatTime()}
                    </div>
                </div>
            </div>

            {/* Health and Stamina Bars */}
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                {/* Health Bar */}
                <div data-testid="health-bar">
                    <div style={{
                        fontSize: '10px',
                        color: '#fff',
                        marginBottom: '4px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        fontFamily: 'sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}>
                        Health
                    </div>
                    <div style={{
                        width: '200px',
                        height: '20px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}>
                        <div
                            data-testid="health-bar-fill"
                            style={{
                                width: `${healthPercent}%`,
                                height: '100%',
                                background: healthPercent > 50 ? '#4ade80' : healthPercent > 25 ? '#fbbf24' : '#ef4444',
                                transition: 'width 0.3s ease, background 0.3s ease',
                            }}
                        />
                    </div>
                </div>

                {/* Stamina Bar */}
                <div data-testid="stamina-bar">
                    <div style={{
                        fontSize: '10px',
                        color: '#fff',
                        marginBottom: '4px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        fontFamily: 'sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}>
                        Stamina
                    </div>
                    <div style={{
                        width: '200px',
                        height: '20px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}>
                        <div
                            data-testid="stamina-bar-fill"
                            style={{
                                width: `${staminaPercent}%`,
                                height: '100%',
                                background: '#60a5fa',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Resource Collection Prompt */}
            {nearbyResource && (
                <div style={{
                    position: 'absolute',
                    bottom: '120px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    <div style={{ fontSize: '24px' }}>{nearbyResource.icon}</div>
                    <div>
                        <div style={{
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '4px',
                        }}>
                            {nearbyResource.name}
                        </div>
                        <div style={{
                            color: '#aaa',
                            fontSize: '11px',
                        }}>
                            Press E to collect
                        </div>
                    </div>
                </div>
            )}

            {/* Tutorial hint */}
            <div style={{
                paddingBottom: '30px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'sans-serif',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                animation: 'pulse 2s infinite',
            }}>
                Arrow Keys to Move • Space to Jump • ESC to Pause
            </div>

            {/* Danger Vignette */}
            {healthPercent < 30 && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, transparent 40%, rgba(255,0,0,0.3) 100%)',
                    animation: 'pulse 1s infinite',
                    pointerEvents: 'none',
                }} />
            )}

            {/* Pause Menu */}
            {isPaused && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pause-menu-title"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                    }}
                >
                    <h2 
                        id="pause-menu-title"
                        style={{
                            color: '#fff',
                            fontSize: '2em',
                            margin: 0,
                            fontFamily: 'Cinzel, serif',
                            letterSpacing: '2px',
                        }}
                    >
                        PAUSED
                    </h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                        <button
                            ref={resumeButtonRef}
                            onClick={handleResume}
                            style={menuButtonStyle}
                            onMouseEnter={(e) => handleButtonHover(e, true)}
                            onMouseLeave={(e) => handleButtonHover(e, false)}
                            aria-label="Resume game"
                        >
                            Resume
                        </button>
                        <button
                            style={menuButtonStyle}
                            onMouseEnter={(e) => handleButtonHover(e, true)}
                            onMouseLeave={(e) => handleButtonHover(e, false)}
                            aria-label="Open settings"
                        >
                            Settings
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
        </div>
    );
}
