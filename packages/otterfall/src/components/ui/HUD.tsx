import { useGameStore } from '@/stores/gameStore';

export function HUD() {
    const health = useGameStore((s) => s.player.health);
    const maxHealth = useGameStore((s) => s.player.maxHealth);
    const stamina = useGameStore((s) => s.player.stamina);
    const maxStamina = useGameStore((s) => s.player.maxStamina);

    const healthPercent = (health / maxHealth) * 100;
    const staminaPercent = (stamina / maxStamina) * 100;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 100,
        }}>
            {/* Top HUD */}
            <div style={{
                padding: '20px',
                textAlign: 'center',
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
                    The Epiphany
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
                Arrow Keys to Move • Space to Jump
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

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
        </div>
    );
}
