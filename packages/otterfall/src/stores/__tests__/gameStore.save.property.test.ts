import * as fc from 'fast-check';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../gameStore';

describe('GameStore Save System - Property-Based Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Reset game store with proper Vector3
    useGameStore.setState({
      player: {
        ...useGameStore.getState().player,
        position: new THREE.Vector3(0, 0, 0),
        health: 100,
        stamina: 100,
      },
      gameOver: false,
      nearbyResource: null,
      rocks: [],
    });
  });

  describe('Property 17: Save Data Round Trip', () => {
    it('should preserve player position through save/load cycle', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
            y: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
            z: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
          }),
          ({ x, y, z }: { x: number; y: number; z: number }) => {
            const { saveGame, loadGame } = useGameStore.getState();

            // Set player position
            useGameStore.setState({
              player: {
                ...useGameStore.getState().player,
                position: new THREE.Vector3(x, y, z),
              },
            });

            // Save game
            saveGame();

            // Modify state
            useGameStore.setState({
              player: {
                ...useGameStore.getState().player,
                position: new THREE.Vector3(999, 999, 999),
              },
            });

            // Load game
            loadGame();

            // Property: Position should be restored exactly
            const loadedPosition = useGameStore.getState().player.position;
            expect(loadedPosition.x).toBeCloseTo(x, 1);
            expect(loadedPosition.y).toBeCloseTo(y, 1);
            expect(loadedPosition.z).toBeCloseTo(z, 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve player health and stamina through save/load cycle', () => {
      fc.assert(
        fc.property(
          fc.record({
            health: fc.float({ min: Math.fround(1), max: Math.fround(100), noNaN: true }),
            stamina: fc.float({ min: Math.fround(1), max: Math.fround(100), noNaN: true }),
          }),
          ({ health, stamina }: { health: number; stamina: number }) => {
            const { saveGame, loadGame } = useGameStore.getState();

            // Set player stats
            useGameStore.setState({
              player: {
                ...useGameStore.getState().player,
                health,
                stamina,
              },
            });

            // Save game
            saveGame();

            // Modify state
            useGameStore.setState({
              player: {
                ...useGameStore.getState().player,
                health: 50,
                stamina: 50,
              },
            });

            // Load game
            loadGame();

            // Property: Stats should be restored exactly
            const loadedPlayer = useGameStore.getState().player;
            expect(loadedPlayer.health).toBeCloseTo(health, 1);
            expect(loadedPlayer.stamina).toBeCloseTo(stamina, 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle multiple save/load cycles without data loss', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              x: fc.float({ min: Math.fround(-50), max: Math.fround(50), noNaN: true }),
              z: fc.float({ min: Math.fround(-50), max: Math.fround(50), noNaN: true }),
              health: fc.float({ min: Math.fround(10), max: Math.fround(100), noNaN: true }),
              stamina: fc.float({ min: Math.fround(10), max: Math.fround(100), noNaN: true }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (states: Array<{ x: number; z: number; health: number; stamina: number }>) => {
            const { saveGame, loadGame } = useGameStore.getState();

            // Perform multiple save/load cycles
            states.forEach((state) => {
              // Set state
              useGameStore.setState({
                player: {
                  ...useGameStore.getState().player,
                  position: new THREE.Vector3(state.x, 0, state.z),
                  health: state.health,
                  stamina: state.stamina,
                },
              });

              // Save
              saveGame();

              // Corrupt state
              useGameStore.setState({
                player: {
                  ...useGameStore.getState().player,
                  position: new THREE.Vector3(0, 0, 0),
                  health: 50,
                  stamina: 50,
                },
              });

              // Load
              loadGame();

              // Property: State should match what was saved
              const loaded = useGameStore.getState().player;
              expect(loaded.position.x).toBeCloseTo(state.x, 1);
              expect(loaded.position.z).toBeCloseTo(state.z, 1);
              expect(loaded.health).toBeCloseTo(state.health, 1);
              expect(loaded.stamina).toBeCloseTo(state.stamina, 1);
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle corrupted save data gracefully', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'invalid json',
            '{"incomplete":',
            '{}',
            '{"player": null}',
            '{"player": {}}',
            ''
          ),
          (corruptedData: string) => {
            const { loadGame } = useGameStore.getState();

            // Corrupt localStorage
            localStorage.setItem('otterfall-save', corruptedData);

            // Property: Loading corrupted data should not crash
            expect(() => loadGame()).not.toThrow();

            // Property: Should either restore valid data or keep current state
            const loaded = useGameStore.getState().player;
            expect(loaded).toBeTruthy();
            expect(typeof loaded.health).toBe('number');
            expect(typeof loaded.stamina).toBe('number');
            expect(loaded.position).toBeTruthy();
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
