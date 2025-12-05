import { useGameStore } from '@/stores/gameStore';

export function GameOver() {
    const gameOver = useGameStore((s) => s.gameOver);
    const respawn = useGameStore((s) => s.respawn);

    if (!gameOver) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            pointerEvents: 'all',
        }}>
            <h1 style={{
                color: '#ef4444',
                fontSize: '3em',
                margin: 0,
                fontFamily: 'Cinzel, serif',
                textShadow: '0 4px 20px rgba(239,68,68,0.5)',
                animation: 'fadeIn 0.5s ease',
            }}>
                GAME OVER
            </h1>

            <p style={{
                color: '#ccc',
                fontSize: '1.2em',
                margin: '20px 0 40px 0',
                fontFamily: 'Cinzel, serif',
            }}>
                You have fallen in the Riverlands
            </p>

            <button
                onClick={respawn}
                style={{
                    padding: '15px 40px',
                    fontSize: '1.2em',
                    fontFamily: 'Cinzel, serif',
                    color: '#fff',
                    background: '#d4af37',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
                    transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5c048';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#d4af37';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                Respawn
            </button>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
