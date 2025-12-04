import { useEffect, useState } from 'react';

interface TooltipProps {
    text: string;
    position: { x: number; y: number };
    visible: boolean;
    icon?: string;
}

export function Tooltip({ text, position, visible, icon }: TooltipProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            setShow(true);
        } else {
            // Fade out animation
            const timeout = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [visible]);

    if (!show) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -100%)',
                background: 'rgba(0,0,0,0.9)',
                border: '2px solid rgba(212,175,55,0.5)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'sans-serif',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 1500,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}
        >
            {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
            <span>{text}</span>
        </div>
    );
}

interface TooltipManagerProps {
    children: React.ReactNode;
}

export function TooltipManager({ children }: TooltipManagerProps) {
    return <>{children}</>;
}
