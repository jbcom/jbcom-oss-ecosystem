import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../gameStore';

describe('Input System - Property-Based Tests', () => {
  beforeEach(() => {
    useGameStore.setState({
      input: {
        active: false,
        direction: { x: 0, y: 0 },
        jump: false,
      },
    });
  });

  describe('Property 18: Touch Input Responsiveness', () => {
    it('should update movement direction immediately on input', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
            y: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
          }),
          ({ x, y }: { x: number; y: number }) => {
            const { setInput } = useGameStore.getState();
            const startTime = performance.now();
            setInput(x, y, true, false);
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            expect(updateTime).toBeLessThan(16.67);
            const input = useGameStore.getState().input;
            expect(input.active).toBe(true);
            expect(input.direction.x).toBeCloseTo(x, 5);
            expect(input.direction.y).toBeCloseTo(y, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle rapid input changes without delay', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              x: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
              y: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          (inputs: Array<{ x: number; y: number }>) => {
            const { setInput } = useGameStore.getState();
            const updateTimes: number[] = [];
            inputs.forEach(({ x, y }: { x: number; y: number }) => {
              const startTime = performance.now();
              setInput(x, y, true, false);
              const endTime = performance.now();
              updateTimes.push(endTime - startTime);
            });
            updateTimes.forEach((time) => {
              expect(time).toBeLessThan(16.67);
            });
            const lastInput = inputs[inputs.length - 1];
            const finalState = useGameStore.getState().input;
            expect(finalState.direction.x).toBeCloseTo(lastInput.x, 5);
            expect(finalState.direction.y).toBeCloseTo(lastInput.y, 5);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle touch release immediately', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
            y: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
          }),
          ({ x, y }: { x: number; y: number }) => {
            const { setInput } = useGameStore.getState();
            setInput(x, y, true, false);
            expect(useGameStore.getState().input.active).toBe(true);
            const startTime = performance.now();
            setInput(0, 0, false, false);
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            expect(updateTime).toBeLessThan(16.67);
            const input = useGameStore.getState().input;
            expect(input.active).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle jump input immediately', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (jumpState: boolean) => {
            const { setInput } = useGameStore.getState();
            const startTime = performance.now();
            setInput(0, 0, false, jumpState);
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            expect(updateTime).toBeLessThan(16.67);
            const input = useGameStore.getState().input;
            expect(input.jump).toBe(jumpState);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain input state consistency across multiple operations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              active: fc.boolean(),
              x: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
              y: fc.float({ min: Math.fround(-1), max: Math.fround(1), noNaN: true }),
              jump: fc.boolean(),
            }),
            { minLength: 3, maxLength: 10 }
          ),
          (operations: Array<{ active: boolean; x: number; y: number; jump: boolean }>) => {
            const { setInput } = useGameStore.getState();
            operations.forEach(({ active, x, y, jump }: { active: boolean; x: number; y: number; jump: boolean }) => {
              setInput(x, y, active, jump);
              const input = useGameStore.getState().input;
              expect(input.active).toBe(active);
              expect(input.jump).toBe(jump);
              if (active) {
                expect(input.direction.x).toBeCloseTo(x, 5);
                expect(input.direction.y).toBeCloseTo(y, 5);
              }
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
