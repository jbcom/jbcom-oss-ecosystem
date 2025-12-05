import { useGameStore } from '@/stores/gameStore';
import { useEffect, useState } from 'react';

export function Loader() {
    const loaded = useGameStore((s) => s.loaded);
    const setLoaded = useGameStore((s) => s.setLoaded);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Simulate asset loading (in real scenario, track actual loads)
        const timer = setTimeout(() => {
            setLoaded(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [setLoaded]);

    useEffect(() => {
        if (loaded) {
            // Fade out then remove
            const timer = setTimeout(() => setVisible(false), 500);
            return () => clearTimeout(timer);
        }
    }, [loaded]);

    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#050404',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: loaded ? 0 : 1,
            transition: 'opacity 0.5s',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(212, 175, 55, 0.2)',
                borderTop: '3px solid #d4af37',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{
                marginTop: '15px',
                color: '#888',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'Cinzel, serif',
            }}>
                Generating Open World...
            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
