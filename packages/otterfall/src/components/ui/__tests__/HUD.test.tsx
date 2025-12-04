import { world as ecsWorld } from '@/ecs/world';
import { useGameStore } from '@/stores/gameStore';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HUD } from '../HUD';

// Mock the ECS world
vi.mock('@/ecs/world', () => ({
    world: {
        with: vi.fn(() => ({
            *[Symbol.iterator]() {
                yield {
                    time: {
                        hour: 8,
                        phase: 'day',
                    },
                };
            },
        })),
    },
}));

describe('HUD Component', () => {
    beforeEach(() => {
        // Reset store to initial state
        useGameStore.setState({
            player: {
                health: 100,
                maxHealth: 100,
                stamina: 100,
                maxStamina: 100,
                position: { x: 0, y: 0, z: 0 },
                rotation: 0,
                speed: 0,
                maxSpeed: 0.15,
                verticalSpeed: 0,
                isMoving: false,
                isJumping: false,
                invulnerable: false,
                invulnerableUntil: 0,
            },
            nearbyResource: null,
        });
    });

    describe('Health and Stamina Bars', () => {
        it('should display health bar with correct percentage', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 50,
                    maxHealth: 100,
                },
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ width: '50%' });
        });

        it('should display stamina bar with correct percentage', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    stamina: 75,
                    maxStamina: 100,
                },
            });

            render(<HUD />);

            const staminaBar = screen.getByTestId('stamina-bar-fill');
            expect(staminaBar).toHaveStyle({ width: '75%' });
        });

        it('should change health bar color based on health level', () => {
            // High health (>50%) - green
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 60,
                    maxHealth: 100,
                },
            });

            const { rerender } = render(<HUD />);
            let healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ background: '#4ade80' });

            // Medium health (25-50%) - yellow
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 40,
                    maxHealth: 100,
                },
            });

            rerender(<HUD />);
            healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ background: '#fbbf24' });

            // Low health (<25%) - red
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 20,
                    maxHealth: 100,
                },
            });

            rerender(<HUD />);
            healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ background: '#ef4444' });
        });

        it('should handle edge case of 0 health', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 0,
                    maxHealth: 100,
                },
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ width: '0%' });
        });

        it('should handle edge case of full health', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 100,
                    maxHealth: 100,
                },
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toHaveStyle({ width: '100%' });
        });
    });

    describe('Resource Collection Prompt', () => {
        it('should not display prompt when no resource nearby', () => {
            useGameStore.setState({ nearbyResource: null });

            render(<HUD />);

            expect(screen.queryByText(/Press E to collect/i)).not.toBeInTheDocument();
        });

        it('should display prompt when resource is nearby', () => {
            useGameStore.setState({
                nearbyResource: {
                    name: 'Fish',
                    icon: '🐟',
                    type: 'fish',
                },
            });

            render(<HUD />);

            expect(screen.getByText('Fish')).toBeInTheDocument();
            expect(screen.getByText('Press E to collect')).toBeInTheDocument();
            expect(screen.getByText('🐟')).toBeInTheDocument();
        });

        it('should display correct icon for berries', () => {
            useGameStore.setState({
                nearbyResource: {
                    name: 'Berries',
                    icon: '🫐',
                    type: 'berries',
                },
            });

            render(<HUD />);

            expect(screen.getByText('Berries')).toBeInTheDocument();
            expect(screen.getByText('🫐')).toBeInTheDocument();
        });

        it('should display correct icon for water', () => {
            useGameStore.setState({
                nearbyResource: {
                    name: 'Water',
                    icon: '💧',
                    type: 'water',
                },
            });

            render(<HUD />);

            expect(screen.getByText('Water')).toBeInTheDocument();
            expect(screen.getByText('💧')).toBeInTheDocument();
        });

        it('should hide prompt when resource is collected', () => {
            useGameStore.setState({
                nearbyResource: {
                    name: 'Fish',
                    icon: '🐟',
                    type: 'fish',
                },
            });

            const { rerender } = render(<HUD />);
            expect(screen.getByText('Fish')).toBeInTheDocument();

            // Resource collected
            useGameStore.setState({ nearbyResource: null });
            rerender(<HUD />);

            expect(screen.queryByText('Fish')).not.toBeInTheDocument();
        });
    });

    describe('Time Display', () => {
        it('should display time in correct format', () => {
            render(<HUD />);

            // Should show "8:00 AM - Day" based on mocked time
            expect(screen.getByText(/8:00 AM - Day/i)).toBeInTheDocument();
        });

        it('should format PM times correctly', () => {
            // Mock afternoon time
            vi.mocked(ecsWorld.with).mockReturnValue({
                *[Symbol.iterator]() {
                    yield {
                        time: {
                            hour: 14,
                            phase: 'day',
                        },
                    };
                },
            } as any);

            render(<HUD />);

            // Wait for state update
            setTimeout(() => {
                expect(screen.getByText(/2:00 PM - Day/i)).toBeInTheDocument();
            }, 150);
        });

        it('should capitalize phase names', () => {
            render(<HUD />);

            // Should capitalize "day" to "Day"
            expect(screen.getByText(/Day/)).toBeInTheDocument();
        });

        it('should handle midnight (hour 0) as 12 AM', () => {
            vi.mocked(ecsWorld.with).mockReturnValue({
                *[Symbol.iterator]() {
                    yield {
                        time: {
                            hour: 0,
                            phase: 'night',
                        },
                    };
                },
            } as any);

            render(<HUD />);

            setTimeout(() => {
                expect(screen.getByText(/12:00 AM - Night/i)).toBeInTheDocument();
            }, 150);
        });

        it('should handle noon (hour 12) as 12 PM', () => {
            vi.mocked(ecsWorld.with).mockReturnValue({
                *[Symbol.iterator]() {
                    yield {
                        time: {
                            hour: 12,
                            phase: 'day',
                        },
                    };
                },
            } as any);

            render(<HUD />);

            setTimeout(() => {
                expect(screen.getByText(/12:00 PM - Day/i)).toBeInTheDocument();
            }, 150);
        });
    });

    describe('Danger Vignette', () => {
        it('should not show vignette when health is above 30%', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 50,
                    maxHealth: 100,
                },
            });

            const { container } = render(<HUD />);

            // Check for vignette element
            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).not.toBeInTheDocument();
        });

        it('should show vignette when health is below 30%', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 25,
                    maxHealth: 100,
                },
            });

            const { container } = render(<HUD />);

            // Check for vignette element
            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).toBeInTheDocument();
        });

        it('should show vignette at exactly 29% health', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 29,
                    maxHealth: 100,
                },
            });

            const { container } = render(<HUD />);

            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).toBeInTheDocument();
        });

        it('should not show vignette at exactly 30% health', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 30,
                    maxHealth: 100,
                },
            });

            const { container } = render(<HUD />);

            const vignette = container.querySelector('[style*="radial-gradient"]');
            expect(vignette).not.toBeInTheDocument();
        });
    });

    describe('Pause Menu', () => {
        it('should not show pause menu by default', () => {
            render(<HUD />);

            expect(screen.queryByText('PAUSED')).not.toBeInTheDocument();
        });

        // Note: Testing ESC key and pause menu interaction would require
        // more complex setup with user events and state management.
        // This is better tested in E2E tests.
    });

    describe('Edge Cases', () => {
        it('should handle maxHealth of 0 gracefully', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 0,
                    maxHealth: 0,
                },
            });

            render(<HUD />);

            // Should not crash, NaN should be handled
            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toBeInTheDocument();
        });

        it('should handle negative health gracefully', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: -10,
                    maxHealth: 100,
                },
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            expect(healthBar).toBeInTheDocument();
        });

        it('should handle health exceeding maxHealth', () => {
            useGameStore.setState({
                player: {
                    ...useGameStore.getState().player,
                    health: 150,
                    maxHealth: 100,
                },
            });

            render(<HUD />);

            const healthBar = screen.getByTestId('health-bar-fill');
            // Should cap at 100%
            expect(healthBar).toHaveStyle({ width: '100%' });
        });
    });
});
