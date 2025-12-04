import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Tutorial } from '../Tutorial';

const TUTORIAL_STORAGE_KEY = 'otterfall_tutorial_completed';

describe('Tutorial', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('First Launch', () => {
        it('should show tutorial on first launch', () => {
            render(<Tutorial />);

            // Should show the first step
            expect(screen.getByText('Movement')).toBeInTheDocument();
            expect(screen.getByText(/Tap anywhere on the screen/)).toBeInTheDocument();
        });

        it('should not show tutorial if already completed', () => {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');

            render(<Tutorial />);

            // Should not show tutorial
            expect(screen.queryByText('Movement')).not.toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should advance to next step when clicking Next', () => {
            render(<Tutorial />);

            // First step
            expect(screen.getByText('Movement')).toBeInTheDocument();

            // Click Next
            fireEvent.click(screen.getByText('Next'));

            // Second step
            expect(screen.getByText('Jump')).toBeInTheDocument();
            expect(screen.getByText(/Swipe up quickly/)).toBeInTheDocument();
        });

        it('should show all tutorial steps in sequence', () => {
            render(<Tutorial />);

            const steps = ['Movement', 'Jump', 'Collect Resources', 'Survive'];

            steps.forEach((step, index) => {
                expect(screen.getByText(step)).toBeInTheDocument();

                if (index < steps.length - 1) {
                    fireEvent.click(screen.getByText('Next'));
                }
            });
        });

        it('should show "Start Playing" on last step', () => {
            render(<Tutorial />);

            // Navigate to last step
            fireEvent.click(screen.getByText('Next')); // Jump
            fireEvent.click(screen.getByText('Next')); // Collect Resources
            fireEvent.click(screen.getByText('Next')); // Survive

            // Should show "Start Playing" instead of "Next"
            expect(screen.getByText('Start Playing')).toBeInTheDocument();
            expect(screen.queryByText('Next')).not.toBeInTheDocument();
        });
    });

    describe('Skip Functionality', () => {
        it('should close tutorial when clicking Skip', () => {
            render(<Tutorial />);

            expect(screen.getByText('Movement')).toBeInTheDocument();

            // Click Skip
            fireEvent.click(screen.getByText('Skip'));

            // Tutorial should be closed
            expect(screen.queryByText('Movement')).not.toBeInTheDocument();
        });

        it('should mark tutorial as completed when skipped', () => {
            render(<Tutorial />);

            fireEvent.click(screen.getByText('Skip'));

            // Should save to localStorage
            expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('true');
        });
    });

    describe('Completion', () => {
        it('should close tutorial when completing all steps', () => {
            render(<Tutorial />);

            // Navigate through all steps
            fireEvent.click(screen.getByText('Next')); // Jump
            fireEvent.click(screen.getByText('Next')); // Collect Resources
            fireEvent.click(screen.getByText('Next')); // Survive
            fireEvent.click(screen.getByText('Start Playing'));

            // Tutorial should be closed
            expect(screen.queryByText('Survive')).not.toBeInTheDocument();
        });

        it('should mark tutorial as completed when finished', () => {
            render(<Tutorial />);

            // Navigate through all steps
            fireEvent.click(screen.getByText('Next'));
            fireEvent.click(screen.getByText('Next'));
            fireEvent.click(screen.getByText('Next'));
            fireEvent.click(screen.getByText('Start Playing'));

            // Should save to localStorage
            expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('true');
        });
    });

    describe('Progress Indicators', () => {
        it('should show progress dots for all steps', () => {
            const { container } = render(<Tutorial />);

            // Should have 4 dots (4 tutorial steps)
            const dots = container.querySelectorAll('[style*="border-radius: 50%"]');
            expect(dots.length).toBe(4);
        });

        it('should highlight current step dot', () => {
            const { container } = render(<Tutorial />);

            // First dot should be highlighted
            const dots = container.querySelectorAll('[style*="border-radius: 50%"]');
            expect(dots[0]).toHaveStyle({ background: '#d4af37' });

            // Navigate to next step
            fireEvent.click(screen.getByText('Next'));

            // Second dot should be highlighted
            const dotsAfter = container.querySelectorAll('[style*="border-radius: 50%"]');
            expect(dotsAfter[1]).toHaveStyle({ background: '#d4af37' });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            render(<Tutorial />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
            expect(dialog).toHaveAttribute('aria-labelledby', 'tutorial-title');
        });

        it('should have accessible button labels', () => {
            render(<Tutorial />);

            expect(screen.getByLabelText('Skip tutorial')).toBeInTheDocument();
            expect(screen.getByLabelText('Next step')).toBeInTheDocument();
        });

        it('should have accessible label on last step', () => {
            render(<Tutorial />);

            // Navigate to last step
            fireEvent.click(screen.getByText('Next'));
            fireEvent.click(screen.getByText('Next'));
            fireEvent.click(screen.getByText('Next'));

            expect(screen.getByLabelText('Start playing')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle localStorage errors gracefully', () => {
            // Mock localStorage to throw error
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage full');
            });

            render(<Tutorial />);

            // Should still show tutorial
            expect(screen.getByText('Movement')).toBeInTheDocument();

            // Should not crash when trying to save
            fireEvent.click(screen.getByText('Skip'));

            setItemSpy.mockRestore();
        });

        it('should handle corrupted localStorage data', () => {
            // Set invalid data
            localStorage.setItem(TUTORIAL_STORAGE_KEY, 'invalid');

            render(<Tutorial />);

            // Should treat as not completed and show tutorial
            expect(screen.getByText('Movement')).toBeInTheDocument();
        });
    });
});
