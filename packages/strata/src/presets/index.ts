/**
 * Strata Presets - Organized game development primitives
 * 
 * This module exports all preset systems organized by layer:
 * - Background: Sky, volumetrics, terrain
 * - Midground: Water, vegetation, instancing
 * - Foreground: Characters, fur, shells, molecular
 */

// Background Layer
export * from '../core/sky';
export * from '../core/volumetrics';
export * from '../core/sdf';
export * from '../core/marching-cubes';

// Midground Layer
export * from './water';
export * from '../core/instancing';
export * from '../core/raymarching';

// Foreground Layer
export * from './fur';
export * from './characters';
export * from './molecular';

// Re-export types
export type { FurOptions, FurUniforms } from './fur';
export type { CharacterJoints, CharacterOptions, CharacterState } from './characters';
export type { MolecularOptions, AtomData, BondData } from './molecular';
