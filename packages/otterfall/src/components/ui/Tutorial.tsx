import { useEffect, useState } from 'react';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    icon: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'movement',
        title: 'Movement',
        description: 'Tap anywhere on the screen to move your otter. The virtual joystick will appear where you touch.',
        icon: '🎮',
    },
    {
        id: 'jump',
        title: 'Jump',
        description: 'Swipe up quickly to jump over obstacles and reach higher ground.',
        icon: '⬆️',
    },
    {
        id: 'resources',
        title: 'Collect Resources',
        description: 'Tap on resources like fish, berries, and water to restore your health and stamina.',
        icon: '🐟',
    },
    {
        id: 'survival',
        title: 'Survive',
        description: 'Watch out for predators! Keep your health and stamina up by collecting resources.',
        icon: '❤️',
    },
];

const TUTORIAL_STORAGE_KEY = 'otterfall_tutorial_completed';

export function Tutorial() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

    // Check if user has seen tutorial before
    useEffect(() => {
        try {
            const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
            if (completed === 'true') {
                setHasSeenTutorial(true);
            } else {
                setShowTutorial(true);
            }
        } catch (e) {
            console.error('Failed to check tutorial status:', e);
            setShowTutorial(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        try {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
            setHasSeenTutorial(true);
        } catch (e) {
            console.error('Failed to save tutorial status:', e);
        }
        setShowTutorial(false);
    };

    if (!showTutorial || hasSeenTutorial) {
        return null;
    }

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                pointerEvents: 'all',
                padding: '20px',
            }}
        >
            {/* Tutorial Card */}
            <div
                style={{
                    background: 'rgba(20,20,20,0.95)',
                    border: '2px solid rgba(212,175,55,0.5)',
                    borderRadius: '16px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
            >
                {/* Icon */}
                <div
                    style={{
                        fontSize: '64px',
                        textAlign: 'center',
                        marginBottom: '16px',
                    }}
                >
                    {step.icon}
                </div>

                {/* Title */}
                <h2
                    id="tutorial-title"
                    style={{
                        color: '#d4af37',
                        fontSize: '1.8em',
                        margin: '0 0 16px 0',
                        textAlign: 'center',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '2px',
                    }}
                >
                    {step.title}
                </h2>

                {/* Description */}
                <p
                    style={{
                        color: '#ccc',
                        fontSize: '1.1em',
                        lineHeight: '1.6',
                        textAlign: 'center',
                        margin: '0 0 32px 0',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {step.description}
                </p>

                {/* Progress Dots */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '24px',
                    }}
                >
                    {TUTORIAL_STEPS.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: index === currentStep ? '#d4af37' : 'rgba(255,255,255,0.3)',
                                transition: 'background 0.3s ease',
                            }}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                    }}
                >
                    <button
                        onClick={handleSkip}
                        style={{
                            padding: '12px 24px',
                            fontSize: '1em',
                            fontFamily: 'sans-serif',
                            color: '#aaa',
                            background: 'transparent',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '120px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#fff';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                            e.currentTarget.style.color = '#aaa';
                        }}
                        aria-label="Skip tutorial"
                    >
                        Skip
                    </button>

                    <button
                        onClick={handleNext}
                        style={{
                            padding: '12px 24px',
                            fontSize: '1em',
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            color: '#000',
                            background: '#d4af37',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '120px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5c048';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#d4af37';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label={isLastStep ? 'Start playing' : 'Next step'}
                    >
                        {isLastStep ? 'Start Playing' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
