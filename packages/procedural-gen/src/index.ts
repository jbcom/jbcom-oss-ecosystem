/**
 * @jbcom/procedural-gen
 * 
 * A unified procedural generation library for react-three-fiber
 * bringing together SDF, marching cubes, instancing, and raymarching
 * under one roof.
 * 
 * Lifted from Otterfall game engine.
 */

// Core algorithms (pure TypeScript, no React)
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
    generateTerrainChunk,
    // Instancing (pure TS)
    generateInstanceData as generateInstanceDataCore,
    createInstancedMesh,
    // Water (pure TS)
    createWaterMaterial,
    createAdvancedWaterMaterial,
    createWaterGeometry,
    // Ray marching (pure TS)
    createRaymarchingMaterial,
    createRaymarchingGeometry,
    // Sky (pure TS)
    createSkyMaterial,
    createSkyGeometry,
    // Volumetrics (pure TS)
    createVolumetricFogMeshMaterial,
    createUnderwaterOverlayMaterial
} from './core';
export type { 
    // SDF types
    BiomeData as SDFBiomeData,
    // Instancing types (same InstanceData, different BiomeData)
    InstanceData,
    BiomeData as InstancingBiomeData,
    // Marching cubes types
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
    // Re-export InstanceData from components (same as core)
    InstanceData as ComponentInstanceData,
    // Re-export BiomeData from components (same as core InstancingBiomeData)
    BiomeData as ComponentBiomeData,
    // Component-specific types
    TimeOfDayState,
    WeatherState
} from './components';

// GLSL shaders
export * from './shaders';

// Utilities
export * from './utils';
