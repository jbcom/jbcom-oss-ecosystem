/**
 * Texture loading utilities
 * 
 * Lifted from Otterfall terrain material loader.
 */

import * as THREE from 'three';

export type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

export interface TerrainTextures {
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
export function loadTexture(path: string, renderer: THREE.WebGLRenderer): THREE.Texture {
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
    renderer: THREE.WebGLRenderer,
    basePath: string = '/textures/terrain'
): TerrainTextures {
    const biomePath = `${basePath}/${biome}`;

    return {
        albedo: loadTexture(`${biomePath}/albedo.jpg`, renderer),
        normal: loadTexture(`${biomePath}/normal.jpg`, renderer),
        roughness: loadTexture(`${biomePath}/roughness.jpg`, renderer),
        ao: loadTexture(`${biomePath}/ao.jpg`, renderer),
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
    renderer: THREE.WebGLRenderer,
    basePath?: string
): Promise<Map<BiomeType, TerrainTextures>> {
    const texturesMap = new Map<BiomeType, TerrainTextures>();
    const loader = new THREE.TextureLoader();

    const loadPromises = biomes.map(async (biome) => {
        const biomePath = basePath ? `${basePath}/${biome}` : `/textures/terrain/${biome}`;
        const texturePaths = [
            `${biomePath}/albedo.jpg`,
            `${biomePath}/normal.jpg`,
            `${biomePath}/roughness.jpg`,
            `${biomePath}/ao.jpg`
        ];

        const texturePromises = texturePaths.map((path) => {
            return new Promise<THREE.Texture>((resolve, reject) => {
                loader.load(
                    path,
                    (texture) => {
                        texture.format = THREE.RGBAFormat;
                        texture.minFilter = THREE.LinearMipmapLinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        texture.generateMipmaps = true;
                        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
                        texture.anisotropy = maxAnisotropy;
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        resolve(texture);
                    },
                    undefined,
                    reject
                );
            });
        });

        try {
            const [albedo, normal, roughness, ao] = await Promise.all(texturePromises);
            texturesMap.set(biome, { albedo, normal, roughness, ao });
        } catch (error) {
            console.warn(`Failed to preload textures for biome "${biome}":`, error);
        }
    });

    await Promise.all(loadPromises);
    return texturesMap;
}

/**
 * Clear texture cache to free memory
 */
export function clearTextureCache(): void {
    textureCache.forEach(texture => texture.dispose());
    textureCache.clear();
}

// =============================================================================
// TEXTURE PROVIDER SUPPORT
// =============================================================================

/**
 * Standard texture types in PBR workflows
 */
export type StandardTextureType = 
    | 'albedo' | 'diffuse' | 'basecolor'
    | 'normal' 
    | 'roughness' | 'smoothness'
    | 'metallic' | 'metalness'
    | 'ao' | 'ambient_occlusion'
    | 'height' | 'displacement'
    | 'emissive' | 'emission'
    | 'opacity' | 'alpha';

/**
 * Common texture provider naming patterns
 */
export const TEXTURE_PROVIDER_PATTERNS = {
    // AmbientCG naming
    ambientCG: {
        albedo: 'Color',
        normal: 'NormalGL', // OpenGL format
        roughness: 'Roughness',
        metallic: 'Metalness',
        ao: 'AmbientOcclusion',
        height: 'Displacement',
        normalDX: 'NormalDX' // DirectX format
    },
    
    // Poly Haven naming
    polyHaven: {
        albedo: 'diff',
        normal: 'nor_gl',
        roughness: 'rough',
        metallic: 'metal',
        ao: 'ao',
        height: 'disp',
        normalDX: 'nor_dx'
    },
    
    // Generic/custom
    generic: {
        albedo: 'albedo',
        normal: 'normal',
        roughness: 'roughness',
        metallic: 'metallic',
        ao: 'ao',
        height: 'height',
        emissive: 'emissive'
    }
};

/**
 * Load a texture set from a provider with automatic naming detection
 */
export function loadTextureSet(
    basePath: string,
    materialName: string,
    renderer: THREE.WebGLRenderer,
    provider: keyof typeof TEXTURE_PROVIDER_PATTERNS = 'generic',
    extension: string = 'jpg'
): Partial<TerrainTextures> & { metallic?: THREE.Texture; height?: THREE.Texture } {
    const patterns = TEXTURE_PROVIDER_PATTERNS[provider];
    const textures: Record<string, THREE.Texture> = {};
    
    const tryLoad = (key: string, suffix: string) => {
        try {
            const path = `${basePath}/${materialName}_${suffix}.${extension}`;
            textures[key] = loadTexture(path, renderer);
        } catch (error) {
            // Texture not available or failed to load; this may be expected for some materials.
            console.warn(`Failed to load texture for key "${key}" at path "${basePath}/${materialName}_${suffix}.${extension}":`, error);
        }
    };
    
    tryLoad('albedo', patterns.albedo);
    tryLoad('normal', patterns.normal);
    tryLoad('roughness', patterns.roughness);
    
    if ('metallic' in patterns) {
        tryLoad('metallic', patterns.metallic as string);
    }
    if ('ao' in patterns) {
        tryLoad('ao', patterns.ao);
    }
    if ('height' in patterns) {
        tryLoad('height', patterns.height as string);
    }
    
    return textures as Partial<TerrainTextures>;
}
