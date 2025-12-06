import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest configuration for unit tests
 * 
 * Unit tests test pure TypeScript functions in isolation
 * (no React, no Three.js scene, no DOM)
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/integration', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        'tests',
        '**/*.config.ts',
        '**/index.ts' // Barrel exports
      ]
    }
  },
  resolve: {
    alias: {
      '@jbcom/strata': resolve(__dirname, '../../src'),
      '@jbcom/strata/core': resolve(__dirname, '../../src/core'),
    }
  }
});
