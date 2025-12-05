import { getAdaptiveQualityManager } from '@/utils/adaptiveQuality';
import * as fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';

describe('WeatherParticles - Property-Based Tests', () => {
  beforeEach(() => {
    const manager = getAdaptiveQualityManager();
    manager.reset();
  });

  describe('Property 13: Particle Count Bounds', () => {
    const RAIN_COUNT = 500;
    const SNOW_COUNT = 300;

    it('should never exceed maximum rain particle count', () => {
      fc.assert(
        fc.property(
          fc.record({
            particleMultiplier: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
          }),
          ({ particleMultiplier }: { particleMultiplier: number }) => {
            const activeRainCount = Math.floor(RAIN_COUNT * particleMultiplier);
            expect(activeRainCount).toBeLessThanOrEqual(RAIN_COUNT);
            expect(activeRainCount).toBeGreaterThanOrEqual(0);
            const expectedCount = Math.floor(RAIN_COUNT * particleMultiplier);
            expect(activeRainCount).toBe(expectedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never exceed maximum snow particle count', () => {
      fc.assert(
        fc.property(
          fc.record({
            particleMultiplier: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
          }),
          ({ particleMultiplier }: { particleMultiplier: number }) => {
            const activeSnowCount = Math.floor(SNOW_COUNT * particleMultiplier);
            expect(activeSnowCount).toBeLessThanOrEqual(SNOW_COUNT);
            expect(activeSnowCount).toBeGreaterThanOrEqual(0);
            const expectedCount = Math.floor(SNOW_COUNT * particleMultiplier);
            expect(activeSnowCount).toBe(expectedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reduce particle count when quality is reduced', () => {
      fc.assert(
        fc.property(
          fc.record({
            multiplier1: fc.float({ min: Math.fround(0.5), max: Math.fround(1.0), noNaN: true }),
            multiplier2: fc.float({ min: Math.fround(0.1), max: Math.fround(0.5), noNaN: true }),
          }),
          ({ multiplier1, multiplier2 }: { multiplier1: number; multiplier2: number }) => {
            const count1 = Math.floor(RAIN_COUNT * multiplier1);
            const count2 = Math.floor(RAIN_COUNT * multiplier2);
            if (multiplier1 > multiplier2) {
              expect(count1).toBeGreaterThanOrEqual(count2);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain particle count bounds under adaptive quality changes', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: Math.fround(10), max: Math.fround(30), noNaN: true }), { minLength: 5, maxLength: 20 }),
          (frameTimes: number[]) => {
            const manager = getAdaptiveQualityManager();
            manager.reset();
            frameTimes.forEach((frameTime: number) => {
              manager.recordFrameTime(frameTime);
            });
            manager.updateQuality();
            const settings = manager.getSettings();
            const activeRainCount = Math.floor(RAIN_COUNT * settings.particleMultiplier);
            const activeSnowCount = Math.floor(SNOW_COUNT * settings.particleMultiplier);
            expect(activeRainCount).toBeLessThanOrEqual(RAIN_COUNT);
            expect(activeRainCount).toBeGreaterThanOrEqual(0);
            expect(activeSnowCount).toBeLessThanOrEqual(SNOW_COUNT);
            expect(activeSnowCount).toBeGreaterThanOrEqual(0);
            const avgFrameTime = frameTimes.reduce((a: number, b: number) => a + b, 0) / frameTimes.length;
            if (avgFrameTime > 20 && frameTimes.length >= 30) {
              expect(settings.particleMultiplier).toBeLessThanOrEqual(0.5);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
