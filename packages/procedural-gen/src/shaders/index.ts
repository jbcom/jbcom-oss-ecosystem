/**
 * Shader exports
 */

// Water shaders
export {
    waterVertexShader,
    waterFragmentShader,
    advancedWaterVertexShader,
    advancedWaterFragmentShader,
    createWaterUniforms,
    createAdvancedWaterUniforms
} from './water';

// Terrain shaders
export {
    terrainVertexShader,
    terrainFragmentShader,
    simpleTerrainVertexShader,
    simpleTerrainFragmentShader,
    createTerrainUniforms,
    createSimpleTerrainUniforms
} from './terrain';

// Fur/shell shaders
export {
    furVertexShader,
    furFragmentShader,
    createFurUniforms,
    defaultFurConfig
} from './fur';
export type { FurConfig } from './fur';

// Volumetric shaders
export {
    volumetricFogShader,
    underwaterShader,
    atmosphereShader,
    dustParticlesShader
} from './volumetrics';

// Instancing shaders
export {
    instancingVertexShader,
    instancingFragmentShader
} from './instancing';
