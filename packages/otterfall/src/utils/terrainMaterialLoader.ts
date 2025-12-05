import * as THREE from 'three';

export type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

interface TerrainTextures {
  albedo: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
  ao: THREE.Texture;
}

// Cache for loaded textures to avoid reloading
const textureCache = new Map<string, THREE.Texture>();

/**
 * Load and configure a texture with proper compression settings for mobile
 */
function loadTexture(path: string, renderer: THREE.WebGLRenderer): THREE.Texture {
  // Check cache first
  if (textureCache.has(path)) {
    return textureCache.get(path)!;
  }

  const loader = new THREE.TextureLoader();
  const texture = loader.load(path);

  // Apply texture compression for mobile optimization
  texture.format = THREE.RGBAFormat;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  
  // Use maximum anisotropic filtering for better quality at angles
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.anisotropy = maxAnisotropy;

  // Enable texture wrapping for tiling
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  // Cache the texture
  textureCache.set(path, texture);

  return texture;
}

/**
 * Load all PBR textures for a specific biome
 */
export function loadBiomeTextures(
  biome: BiomeType,
  renderer: THREE.WebGLRenderer
): TerrainTextures {
  const basePath = `/textures/terrain/${biome}`;

  return {
    albedo: loadTexture(`${basePath}/albedo.jpg`, renderer),
    normal: loadTexture(`${basePath}/normal.jpg`, renderer),
    roughness: loadTexture(`${basePath}/roughness.jpg`, renderer),
    ao: loadTexture(`${basePath}/ao.jpg`, renderer),
  };
}

/**
 * Create a PBR material from loaded textures
 */
export function createTerrainMaterial(
  textures: TerrainTextures,
  options: {
    color?: THREE.Color;
    metalness?: number;
    roughnessScale?: number;
  } = {}
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    map: textures.albedo,
    normalMap: textures.normal,
    roughnessMap: textures.roughness,
    aoMap: textures.ao,
    
    // Default PBR values
    color: options.color || new THREE.Color(0xffffff),
    metalness: options.metalness || 0.0,
    roughness: options.roughnessScale || 1.0,
    
    // Enable AO map on second UV channel
    aoMapIntensity: 1.0,
  });

  return material;
}

/**
 * Preload textures for multiple biomes to reduce loading time during gameplay
 */
export async function preloadBiomeTextures(
  biomes: BiomeType[],
  renderer: THREE.WebGLRenderer
): Promise<Map<BiomeType, TerrainTextures>> {
  const texturesMap = new Map<BiomeType, TerrainTextures>();

  for (const biome of biomes) {
    const textures = loadBiomeTextures(biome, renderer);
    texturesMap.set(biome, textures);
  }

  return texturesMap;
}

/**
 * Clear texture cache to free memory
 */
export function clearTextureCache(): void {
  textureCache.forEach(texture => texture.dispose());
  textureCache.clear();
}
