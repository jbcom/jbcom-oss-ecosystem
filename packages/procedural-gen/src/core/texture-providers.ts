/**
 * Texture Provider System
 *
 * Provider-agnostic texture loading supporting standardized PBR formats
 * from AmbientCG, Poly Haven, Quixel Megascans, and custom sources.
 *
 * @module core/texture-providers
 */

import * as THREE from 'three';

// =============================================================================
// STANDARD TEXTURE TYPES (Provider-Agnostic)
// =============================================================================

/**
 * Standard PBR texture types used across the industry
 * These map to the standard glTF PBR model
 */
export type StandardTextureType =
  | 'baseColor'        // Albedo/Diffuse (sRGB)
  | 'normal'           // Normal map (Linear, OpenGL or DirectX)
  | 'roughness'        // Roughness (Linear, 0=smooth, 1=rough)
  | 'metallic'         // Metalness (Linear, 0=dielectric, 1=metal)
  | 'ambientOcclusion' // AO (Linear)
  | 'height'           // Displacement/Height (Linear)
  | 'emissive'         // Emissive (sRGB)
  | 'opacity'          // Alpha/Opacity (Linear)
  | 'orm'              // Packed: Occlusion(R) Roughness(G) Metallic(B)
  | 'metallicRoughness'; // Packed: Metallic(B) Roughness(G) - glTF standard

/** Normal map convention */
export type NormalMapFormat = 'opengl' | 'directx';

/** Texture file format */
export type TextureFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'exr' | 'hdr';

/** Texture resolution preset */
export type TextureResolution = '1K' | '2K' | '4K' | '8K' | 'custom';

// =============================================================================
// PROVIDER DEFINITIONS
// =============================================================================

/**
 * Naming pattern for a texture type from a specific provider
 */
export interface TextureNamingPattern {
  /** Patterns to match (regex or string suffixes) */
  patterns: string[];
  /** Is this in sRGB color space? */
  sRGB: boolean;
  /** Normal map format (if applicable) */
  normalFormat?: NormalMapFormat;
}

/**
 * Provider definition - describes how a texture provider names their files
 */
export interface TextureProviderDefinition {
  name: string;
  /** URL pattern for the provider (optional, for documentation) */
  urlPattern?: string;
  /** Supported file extensions in order of preference */
  extensions: TextureFormat[];
  /** Naming patterns for each texture type */
  patterns: Partial<Record<StandardTextureType, TextureNamingPattern>>;
  /** Resolution suffixes (e.g., "_1K", "_2K") */
  resolutionSuffixes?: Record<TextureResolution, string>;
}

// =============================================================================
// BUILT-IN PROVIDER DEFINITIONS
// =============================================================================

export const PROVIDERS: Record<string, TextureProviderDefinition> = {
  /**
   * AmbientCG (ambientcg.com)
   * Free CC0 PBR materials
   */
  ambientCG: {
    name: 'AmbientCG',
    urlPattern: 'https://ambientcg.com/view?id={id}',
    extensions: ['jpg', 'png', 'exr'],
    resolutionSuffixes: {
      '1K': '_1K',
      '2K': '_2K',
      '4K': '_4K',
      '8K': '_8K',
      'custom': '',
    },
    patterns: {
      baseColor: {
        patterns: ['_Color', '_Diffuse', '_BaseColor'],
        sRGB: true,
      },
      normal: {
        patterns: ['_NormalGL', '_Normal'],
        sRGB: false,
        normalFormat: 'opengl',
      },
      roughness: {
        patterns: ['_Roughness'],
        sRGB: false,
      },
      metallic: {
        patterns: ['_Metalness', '_Metallic'],
        sRGB: false,
      },
      ambientOcclusion: {
        patterns: ['_AmbientOcclusion', '_AO'],
        sRGB: false,
      },
      height: {
        patterns: ['_Displacement', '_Height'],
        sRGB: false,
      },
      opacity: {
        patterns: ['_Opacity', '_Alpha'],
        sRGB: false,
      },
    },
  },

  /**
   * Poly Haven (polyhaven.com)
   * Free CC0 HDRIs, textures, and 3D models
   */
  polyHaven: {
    name: 'Poly Haven',
    urlPattern: 'https://polyhaven.com/a/{id}',
    extensions: ['jpg', 'png', 'exr'],
    resolutionSuffixes: {
      '1K': '_1k',
      '2K': '_2k',
      '4K': '_4k',
      '8K': '_8k',
      'custom': '',
    },
    patterns: {
      baseColor: {
        patterns: ['_diff_', '_diffuse', '_color', '_col_'],
        sRGB: true,
      },
      normal: {
        patterns: ['_nor_gl_', '_normal_gl', '_nor_', '_normal'],
        sRGB: false,
        normalFormat: 'opengl',
      },
      roughness: {
        patterns: ['_rough_', '_roughness'],
        sRGB: false,
      },
      metallic: {
        patterns: ['_metal_', '_metallic'],
        sRGB: false,
      },
      ambientOcclusion: {
        patterns: ['_ao_', '_ambient_occlusion'],
        sRGB: false,
      },
      height: {
        patterns: ['_disp_', '_displacement', '_height'],
        sRGB: false,
      },
      orm: {
        patterns: ['_arm_'], // AO(R) Roughness(G) Metallic(B)
        sRGB: false,
      },
    },
  },

  /**
   * Quixel Megascans
   * High-quality scanned materials (requires license)
   */
  quixel: {
    name: 'Quixel Megascans',
    extensions: ['jpg', 'png', 'exr'],
    resolutionSuffixes: {
      '1K': '_1K',
      '2K': '_2K',
      '4K': '_4K',
      '8K': '_8K',
      'custom': '',
    },
    patterns: {
      baseColor: {
        patterns: ['_Albedo', '_BaseColor'],
        sRGB: true,
      },
      normal: {
        patterns: ['_Normal'],
        sRGB: false,
        normalFormat: 'directx', // Quixel uses DirectX normals!
      },
      roughness: {
        patterns: ['_Roughness'],
        sRGB: false,
      },
      metallic: {
        patterns: ['_Metalness'],
        sRGB: false,
      },
      ambientOcclusion: {
        patterns: ['_AO'],
        sRGB: false,
      },
      height: {
        patterns: ['_Displacement'],
        sRGB: false,
      },
      opacity: {
        patterns: ['_Opacity'],
        sRGB: false,
      },
    },
  },

  /**
   * TextureCan / CC0 Textures
   */
  textureCan: {
    name: 'TextureCan',
    extensions: ['jpg', 'png'],
    patterns: {
      baseColor: {
        patterns: ['_basecolor', '_albedo', '_diffuse'],
        sRGB: true,
      },
      normal: {
        patterns: ['_normal'],
        sRGB: false,
        normalFormat: 'opengl',
      },
      roughness: {
        patterns: ['_roughness'],
        sRGB: false,
      },
      metallic: {
        patterns: ['_metallic'],
        sRGB: false,
      },
      ambientOcclusion: {
        patterns: ['_ao', '_ambientocclusion'],
        sRGB: false,
      },
      height: {
        patterns: ['_height', '_displacement'],
        sRGB: false,
      },
    },
  },

  /**
   * Generic/Simple naming (albedo.jpg, normal.jpg, etc.)
   * Useful for custom or hand-made textures
   */
  generic: {
    name: 'Generic',
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    patterns: {
      baseColor: {
        patterns: ['albedo', 'diffuse', 'color', 'basecolor', 'base_color'],
        sRGB: true,
      },
      normal: {
        patterns: ['normal', 'norm', 'nrm'],
        sRGB: false,
        normalFormat: 'opengl',
      },
      roughness: {
        patterns: ['roughness', 'rough'],
        sRGB: false,
      },
      metallic: {
        patterns: ['metallic', 'metal', 'metalness'],
        sRGB: false,
      },
      ambientOcclusion: {
        patterns: ['ao', 'ambient_occlusion', 'ambientocclusion', 'occlusion'],
        sRGB: false,
      },
      height: {
        patterns: ['height', 'displacement', 'disp', 'bump'],
        sRGB: false,
      },
      emissive: {
        patterns: ['emissive', 'emission', 'emit'],
        sRGB: true,
      },
      opacity: {
        patterns: ['opacity', 'alpha', 'transparency'],
        sRGB: false,
      },
    },
  },
};

// =============================================================================
// TEXTURE SET
// =============================================================================

/**
 * A complete set of PBR textures for a material
 */
export interface TextureSet {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Provider that was used */
  provider: string;
  /** Resolution */
  resolution: TextureResolution;
  /** Loaded textures */
  textures: Partial<Record<StandardTextureType, THREE.Texture>>;
  /** Normal map format */
  normalFormat: NormalMapFormat;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

// =============================================================================
// TEXTURE LOADER
// =============================================================================

export interface TextureLoadOptions {
  /** Anisotropic filtering level */
  anisotropy?: number;
  /** Generate mipmaps */
  generateMipmaps?: boolean;
  /** Wrap mode */
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  /** Flip Y */
  flipY?: boolean;
  /** Convert DirectX normals to OpenGL */
  convertNormals?: boolean;
}

/**
 * Smart texture loader that understands provider conventions
 */
export class TextureSetLoader {
  private loader: THREE.TextureLoader;
  private cache: Map<string, THREE.Texture> = new Map();
  private defaultOptions: TextureLoadOptions;

  constructor(options?: TextureLoadOptions) {
    this.loader = new THREE.TextureLoader();
    this.defaultOptions = {
      anisotropy: 4,
      generateMipmaps: true,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      flipY: true,
      convertNormals: true,
      ...options,
    };
  }

  /**
   * Load a single texture with proper settings
   */
  async loadTexture(
    url: string,
    type: StandardTextureType,
    provider: TextureProviderDefinition,
    options?: TextureLoadOptions
  ): Promise<THREE.Texture> {
    const opts = { ...this.defaultOptions, ...options };

    // Check cache
    const cacheKey = `${url}:${type}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          // Apply settings based on texture type
          const pattern = provider.patterns[type];
          const isSRGB = pattern?.sRGB ?? false;

          // Color space
          texture.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;

          // Wrapping
          texture.wrapS = opts.wrapS!;
          texture.wrapT = opts.wrapT!;

          // Filtering
          texture.anisotropy = opts.anisotropy!;
          texture.generateMipmaps = opts.generateMipmaps!;

          if (opts.generateMipmaps) {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
          }
          texture.magFilter = THREE.LinearFilter;

          // Flip Y (usually true for web)
          texture.flipY = opts.flipY!;

          // Handle DirectX to OpenGL normal conversion
          if (type === 'normal' && opts.convertNormals && pattern?.normalFormat === 'directx') {
            // Note: Full conversion requires a shader pass or manual pixel manipulation
            // For now, we just mark it for the material to handle
            texture.userData.normalFormat = 'directx';
          }

          texture.needsUpdate = true;

          // Cache it
          this.cache.set(cacheKey, texture);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Auto-detect provider from file naming
   */
  detectProvider(filenames: string[]): TextureProviderDefinition {
    const filenameStr = filenames.join(' ').toLowerCase();

    // Check each provider
    for (const [, provider] of Object.entries(PROVIDERS)) {
      if (provider.name === 'Generic') continue; // Check generic last

      for (const pattern of Object.values(provider.patterns)) {
        if (pattern) {
          for (const p of pattern.patterns) {
            if (filenameStr.includes(p.toLowerCase())) {
              return provider;
            }
          }
        }
      }
    }

    return PROVIDERS.generic;
  }

  /**
   * Load a complete texture set from a directory/base path
   */
  async loadTextureSet(
    basePath: string,
    options?: {
      id?: string;
      name?: string;
      provider?: string | TextureProviderDefinition;
      resolution?: TextureResolution;
      types?: StandardTextureType[];
      extension?: TextureFormat;
    }
  ): Promise<TextureSet> {
    const opts = {
      id: basePath.split('/').pop() ?? 'unknown',
      name: basePath.split('/').pop() ?? 'Unknown Material',
      resolution: '2K' as TextureResolution,
      types: ['baseColor', 'normal', 'roughness', 'ambientOcclusion', 'height'] as StandardTextureType[],
      ...options,
    };

    // Resolve provider
    let provider: TextureProviderDefinition;
    if (typeof opts.provider === 'string') {
      provider = PROVIDERS[opts.provider] ?? PROVIDERS.generic;
    } else if (opts.provider) {
      provider = opts.provider;
    } else {
      // Try to auto-detect (would need file listing in real implementation)
      provider = PROVIDERS.generic;
    }

    const result: TextureSet = {
      id: opts.id,
      name: opts.name,
      provider: provider.name,
      resolution: opts.resolution,
      textures: {},
      normalFormat: 'opengl',
    };

    // Try to load each texture type
    const loadPromises = opts.types.map(async (type) => {
      const pattern = provider.patterns[type];
      if (!pattern) return;

      // Try each pattern and extension combination
      for (const patternStr of pattern.patterns) {
        for (const ext of provider.extensions) {
          if (opts.extension && ext !== opts.extension) continue;

          // Build possible URLs
          const urls = [
            `${basePath}${patternStr}.${ext}`,
            `${basePath}/${patternStr}.${ext}`,
            `${basePath}_${patternStr}.${ext}`,
          ];

          // Add resolution suffix variants
          if (provider.resolutionSuffixes?.[opts.resolution]) {
            const resSuffix = provider.resolutionSuffixes[opts.resolution];
            urls.push(
              `${basePath}${resSuffix}${patternStr}.${ext}`,
              `${basePath}${patternStr}${resSuffix}.${ext}`
            );
          }

          for (const url of urls) {
            try {
              const texture = await this.loadTexture(url, type, provider);
              result.textures[type] = texture;

              // Track normal format
              if (type === 'normal' && pattern.normalFormat) {
                result.normalFormat = pattern.normalFormat;
              }

              return; // Success, move to next type
            } catch {
              // Try next URL
              continue;
            }
          }
        }
      }
    });

    await Promise.allSettled(loadPromises);
    return result;
  }

  /**
   * Load from explicit file paths (most reliable)
   */
  async loadFromPaths(
    paths: Partial<Record<StandardTextureType, string>>,
    options?: {
      id?: string;
      name?: string;
      provider?: string;
    }
  ): Promise<TextureSet> {
    const provider = PROVIDERS[options?.provider ?? 'generic'];

    const result: TextureSet = {
      id: options?.id ?? 'custom',
      name: options?.name ?? 'Custom Material',
      provider: provider.name,
      resolution: 'custom',
      textures: {},
      normalFormat: 'opengl',
    };

    const loadPromises = Object.entries(paths).map(async ([type, url]) => {
      if (!url) return;

      try {
        const texture = await this.loadTexture(url, type as StandardTextureType, provider);
        result.textures[type as StandardTextureType] = texture;
      } catch (e) {
        console.warn(`Failed to load ${type} texture from ${url}:`, e);
      }
    });

    await Promise.allSettled(loadPromises);
    return result;
  }

  /**
   * Clear texture cache
   */
  clearCache(): void {
    this.cache.forEach(tex => tex.dispose());
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { count: number; keys: string[] } {
    return {
      count: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// =============================================================================
// MATERIAL FACTORY
// =============================================================================

/**
 * Create Three.js materials from texture sets
 */
export class PBRMaterialFactory {
  /**
   * Create a MeshStandardMaterial from a texture set
   */
  static createStandardMaterial(
    textureSet: TextureSet,
    options?: {
      roughness?: number;
      metalness?: number;
      normalScale?: number;
      aoMapIntensity?: number;
      displacementScale?: number;
      side?: THREE.Side;
      transparent?: boolean;
    }
  ): THREE.MeshStandardMaterial {
    const mat = new THREE.MeshStandardMaterial({
      roughness: options?.roughness ?? 0.8,
      metalness: options?.metalness ?? 0.0,
      side: options?.side ?? THREE.FrontSide,
      transparent: options?.transparent ?? false,
    });

    // Apply textures
    if (textureSet.textures.baseColor) {
      mat.map = textureSet.textures.baseColor;
    }

    if (textureSet.textures.normal) {
      mat.normalMap = textureSet.textures.normal;
      mat.normalScale = new THREE.Vector2(
        options?.normalScale ?? 1,
        // Flip Y for DirectX normals
        textureSet.normalFormat === 'directx'
          ? -(options?.normalScale ?? 1)
          : (options?.normalScale ?? 1)
      );
    }

    if (textureSet.textures.roughness) {
      mat.roughnessMap = textureSet.textures.roughness;
    }

    if (textureSet.textures.metallic) {
      mat.metalnessMap = textureSet.textures.metallic;
    }

    if (textureSet.textures.ambientOcclusion) {
      mat.aoMap = textureSet.textures.ambientOcclusion;
      mat.aoMapIntensity = options?.aoMapIntensity ?? 1.0;
    }

    if (textureSet.textures.height) {
      mat.displacementMap = textureSet.textures.height;
      mat.displacementScale = options?.displacementScale ?? 0.1;
    }

    if (textureSet.textures.emissive) {
      mat.emissiveMap = textureSet.textures.emissive;
      mat.emissive = new THREE.Color(0xffffff);
    }

    if (textureSet.textures.opacity) {
      mat.alphaMap = textureSet.textures.opacity;
      mat.transparent = true;
    }

    // Handle packed ORM texture
    if (textureSet.textures.orm) {
      mat.aoMap = textureSet.textures.orm;
      mat.roughnessMap = textureSet.textures.orm;
      mat.metalnessMap = textureSet.textures.orm;
      // Note: Requires custom shader or channel manipulation for proper separation
    }

    return mat;
  }

  /**
   * Create a MeshPhysicalMaterial for more advanced rendering
   */
  static createPhysicalMaterial(
    textureSet: TextureSet,
    options?: {
      clearcoat?: number;
      clearcoatRoughness?: number;
      sheen?: number;
      sheenRoughness?: number;
      sheenColor?: THREE.Color;
      transmission?: number;
      thickness?: number;
      ior?: number;
    }
  ): THREE.MeshPhysicalMaterial {
    // Start with standard material settings
    const standardMat = this.createStandardMaterial(textureSet);

    const mat = new THREE.MeshPhysicalMaterial({
      map: standardMat.map,
      normalMap: standardMat.normalMap,
      normalScale: standardMat.normalScale,
      roughnessMap: standardMat.roughnessMap,
      roughness: standardMat.roughness,
      metalnessMap: standardMat.metalnessMap,
      metalness: standardMat.metalness,
      aoMap: standardMat.aoMap,
      aoMapIntensity: standardMat.aoMapIntensity,
      displacementMap: standardMat.displacementMap,
      displacementScale: standardMat.displacementScale,
      emissiveMap: standardMat.emissiveMap,
      emissive: standardMat.emissive,
      ...options,
    });

    standardMat.dispose();
    return mat;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert DirectX normal map to OpenGL format
 * DirectX: Y points down, OpenGL: Y points up
 */
export function convertNormalMapDXtoGL(texture: THREE.Texture): THREE.Texture {
  // This would require reading pixel data and flipping the G channel
  // For now, mark it and handle in shader
  texture.userData.normalFormat = 'opengl';
  texture.userData.converted = true;
  return texture;
}

/**
 * List available providers
 */
export function getAvailableProviders(): string[] {
  return Object.keys(PROVIDERS);
}

/**
 * Get provider definition
 */
export function getProvider(name: string): TextureProviderDefinition | undefined {
  return PROVIDERS[name];
}

/**
 * Register a custom provider
 */
export function registerProvider(name: string, definition: TextureProviderDefinition): void {
  PROVIDERS[name] = definition;
}
