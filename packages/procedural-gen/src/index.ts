/**
 * @jbcom/procedural-gen
 * 
 * A unified procedural generation library for react-three-fiber
 * bringing together SDF, marching cubes, instancing, and raymarching
 * under one roof.
 * 
 * Lifted from Otterfall game engine.
 */

// Core algorithms
export {
    // SDF
    sdSphere,
    sdBox,
    sdPlane,
    sdCapsule,
    sdTorus,
    sdCone,
    opUnion,
    opSubtraction,
    opIntersection,
    opSmoothUnion,
    opSmoothSubtraction,
    opSmoothIntersection,
    noise3D,
    fbm,
    warpedFbm,
    getBiomeAt,
    getTerrainHeight,
    sdCaves,
    sdTerrain,
    sdRock,
    calcNormal,
    // Marching cubes
    marchingCubes,
    createGeometryFromMarchingCubes,
    generateTerrainChunk
} from './core';
export type { 
    BiomeData as SDFBiomeData, 
    MarchingCubesResult, 
    MarchingCubesOptions, 
    TerrainChunk 
} from './core';

// React components
export {
    Water,
    AdvancedWater,
    GPUInstancedMesh,
    GrassInstances,
    TreeInstances,
    RockInstances,
    generateInstanceData,
    ProceduralSky,
    createTimeOfDay,
    VolumetricEffects,
    VolumetricFogMesh,
    UnderwaterOverlay,
    EnhancedFog,
    Raymarching
} from './components';
export type { 
    InstanceData, 
    BiomeData as InstanceBiomeData,
    TimeOfDayState,
    WeatherState
} from './components';

// GLSL shaders
export * from './shaders';

// Utilities
export * from './utils';
