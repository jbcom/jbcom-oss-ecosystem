/**
 * Core algorithm exports
 */

// SDF primitives and operations
export {
    // Primitives
    sdSphere,
    sdBox,
    sdPlane,
    sdCapsule,
    sdTorus,
    sdCone,
    
    // Boolean operations
    opUnion,
    opSubtraction,
    opIntersection,
    opSmoothUnion,
    opSmoothSubtraction,
    opSmoothIntersection,
    
    // Noise functions
    noise3D,
    fbm,
    warpedFbm,
    
    // Terrain
    getBiomeAt,
    getTerrainHeight,
    sdCaves,
    sdTerrain,
    sdRock,
    
    // Utilities
    calcNormal
} from './sdf';
export type { BiomeData } from './sdf';

// Marching cubes
export {
    marchingCubes,
    createGeometryFromMarchingCubes,
    generateTerrainChunk
} from './marching-cubes';
export type { MarchingCubesResult, MarchingCubesOptions, TerrainChunk } from './marching-cubes';
