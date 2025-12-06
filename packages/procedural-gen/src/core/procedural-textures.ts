/**
 * Procedural Texture Generation
 *
 * Generate realistic PBR textures entirely in code - no external assets needed.
 * Supports noise-based textures, patterns, normal maps, and specialized
 * effects like fur, metal, stone, and more.
 *
 * @module core/procedural-textures
 */

import * as THREE from 'three';
import {
  valueNoise2D,
  fbm2D,
  voronoi2D,
  warpedFbm2D,
  turbulence3D,
  ridgedFbm3D,
  createSeededRandom,
  hash2D,
  FBMOptions,
} from './noise';

// =============================================================================
// TYPES
// =============================================================================

export interface ProceduralTextureOptions {
  width: number;
  height: number;
  seed?: number;
}

export interface NoiseTextureOptions extends ProceduralTextureOptions {
  scale?: number;
  octaves?: number;
  lacunarity?: number;
  gain?: number;
  contrast?: number;
  brightness?: number;
}

export interface PatternOptions extends ProceduralTextureOptions {
  scale?: number;
  color1?: THREE.Color | number;
  color2?: THREE.Color | number;
}

// =============================================================================
// CORE TEXTURE GENERATOR
// =============================================================================

/**
 * Base class for procedural texture generation
 */
export class ProceduralTextureGenerator {
  protected width: number;
  protected height: number;
  protected seed: number;
  protected random: () => number;

  constructor(options: ProceduralTextureOptions) {
    this.width = options.width;
    this.height = options.height;
    this.seed = options.seed ?? Math.random() * 100000;
    this.random = createSeededRandom(this.seed);
  }

  /** Create a DataTexture from RGBA data */
  protected createTexture(data: Uint8Array, sRGB = false): THREE.DataTexture {
    const texture = new THREE.DataTexture(data, this.width, this.height, THREE.RGBAFormat);
    texture.colorSpace = sRGB ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  /** Create a grayscale DataTexture */
  protected createGrayscaleTexture(data: Uint8Array): THREE.DataTexture {
    const rgbaData = new Uint8Array(this.width * this.height * 4);
    for (let i = 0; i < data.length; i++) {
      rgbaData[i * 4] = data[i];
      rgbaData[i * 4 + 1] = data[i];
      rgbaData[i * 4 + 2] = data[i];
      rgbaData[i * 4 + 3] = 255;
    }
    return this.createTexture(rgbaData, false);
  }

  /** Apply contrast and brightness to a value */
  protected adjustValue(value: number, contrast = 1, brightness = 0): number {
    return Math.max(0, Math.min(1, (value - 0.5) * contrast + 0.5 + brightness));
  }
}

// =============================================================================
// NOISE TEXTURES
// =============================================================================

/**
 * Generate various noise-based textures
 */
export class NoiseTextureGenerator extends ProceduralTextureGenerator {
  private scale: number;
  private fbmOptions: FBMOptions;
  private contrast: number;
  private brightness: number;

  constructor(options: NoiseTextureOptions) {
    super(options);
    this.scale = options.scale ?? 4;
    this.fbmOptions = {
      octaves: options.octaves ?? 4,
      lacunarity: options.lacunarity ?? 2,
      gain: options.gain ?? 0.5,
    };
    this.contrast = options.contrast ?? 1;
    this.brightness = options.brightness ?? 0;
  }

  /** Simple value noise */
  valueNoise(): THREE.DataTexture {
    const data = new Uint8Array(this.width * this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * this.scale + this.seed;
        const ny = (y / this.height) * this.scale;
        let value = valueNoise2D(nx, ny);
        value = this.adjustValue(value, this.contrast, this.brightness);
        data[y * this.width + x] = Math.floor(value * 255);
      }
    }
    return this.createGrayscaleTexture(data);
  }

  /** Fractal Brownian Motion noise */
  fbm(): THREE.DataTexture {
    const data = new Uint8Array(this.width * this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * this.scale + this.seed;
        const ny = (y / this.height) * this.scale;
        let value = fbm2D(nx, ny, this.fbmOptions);
        value = this.adjustValue(value, this.contrast, this.brightness);
        data[y * this.width + x] = Math.floor(value * 255);
      }
    }
    return this.createGrayscaleTexture(data);
  }

  /** Warped/distorted FBM for organic patterns */
  warpedFbm(warpStrength = 0.5): THREE.DataTexture {
    const data = new Uint8Array(this.width * this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * this.scale + this.seed;
        const ny = (y / this.height) * this.scale;
        let value = warpedFbm2D(nx, ny, warpStrength, this.fbmOptions);
        value = this.adjustValue(value, this.contrast, this.brightness);
        data[y * this.width + x] = Math.floor(value * 255);
      }
    }
    return this.createGrayscaleTexture(data);
  }

  /** Voronoi/cellular noise */
  voronoi(mode: 'f1' | 'f2' | 'f2-f1' | 'cell' = 'f1'): THREE.DataTexture {
    const data = new Uint8Array(this.width * this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * this.scale + this.seed;
        const ny = (y / this.height) * this.scale;
        const v = voronoi2D(nx, ny);
        let value: number;
        switch (mode) {
          case 'f1': value = v.f1; break;
          case 'f2': value = v.f2; break;
          case 'f2-f1': value = v.f2 - v.f1; break;
          case 'cell': value = (v.cellId % 255) / 255; break;
        }
        value = this.adjustValue(value, this.contrast, this.brightness);
        data[y * this.width + x] = Math.floor(value * 255);
      }
    }
    return this.createGrayscaleTexture(data);
  }

  /** Ridged noise (good for veins, cracks, mountains) */
  ridged(): THREE.DataTexture {
    const data = new Uint8Array(this.width * this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * this.scale + this.seed;
        const ny = (y / this.height) * this.scale;
        let value = ridgedFbm3D(nx, ny, 0, this.fbmOptions);
        value = this.adjustValue(value, this.contrast, this.brightness);
        data[y * this.width + x] = Math.floor(value * 255);
      }
    }
    return this.createGrayscaleTexture(data);
  }

  /** Turbulence (absolute value noise, good for clouds/fire) */
  turbulence(): THREE.DataTexture {
    const data = new Uint8Array(this.width * this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * this.scale + this.seed;
        const ny = (y / this.height) * this.scale;
        let value = turbulence3D(nx, ny, 0, this.fbmOptions);
        value = this.adjustValue(value, this.contrast, this.brightness);
        data[y * this.width + x] = Math.floor(value * 255);
      }
    }
    return this.createGrayscaleTexture(data);
  }
}

// =============================================================================
// PROCEDURAL NORMAL MAPS
// =============================================================================

/**
 * Generate normal maps from height data or procedurally
 */
export class NormalMapGenerator extends ProceduralTextureGenerator {
  private scale: number;
  private strength: number;

  constructor(options: ProceduralTextureOptions & { scale?: number; strength?: number }) {
    super(options);
    this.scale = options.scale ?? 4;
    this.strength = options.strength ?? 1;
  }

  /** Generate normal map from height function */
  fromHeightFunction(heightFn: (x: number, y: number) => number): THREE.DataTexture {
    const data = new Uint8Array(this.width * this.height * 4);
    const epsilon = 1 / Math.max(this.width, this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;

        // Sample heights for gradient
        const h = heightFn(nx, ny);
        const hx = heightFn(nx + epsilon, ny);
        const hy = heightFn(nx, ny + epsilon);

        // Calculate gradient
        const dx = (hx - h) * this.strength;
        const dy = (hy - h) * this.strength;

        // Normal from gradient
        const normal = new THREE.Vector3(-dx, -dy, 1).normalize();

        // Pack to RGB (0-255)
        const i = (y * this.width + x) * 4;
        data[i] = Math.floor((normal.x * 0.5 + 0.5) * 255);
        data[i + 1] = Math.floor((normal.y * 0.5 + 0.5) * 255);
        data[i + 2] = Math.floor((normal.z * 0.5 + 0.5) * 255);
        data[i + 3] = 255;
      }
    }

    return this.createTexture(data, false);
  }

  /** Generate normal map from noise */
  fromNoise(noiseType: 'fbm' | 'voronoi' | 'ridged' = 'fbm'): THREE.DataTexture {
    const heightFn = (x: number, y: number): number => {
      const nx = x * this.scale + this.seed;
      const ny = y * this.scale;
      switch (noiseType) {
        case 'fbm': return fbm2D(nx, ny, { octaves: 4 });
        case 'voronoi': return voronoi2D(nx, ny).f1;
        case 'ridged': return ridgedFbm3D(nx, ny, 0, { octaves: 4 });
        default: return fbm2D(nx, ny);
      }
    };
    return this.fromHeightFunction(heightFn);
  }

  /** Generate normal map from existing height texture */
  fromHeightTexture(heightTexture: THREE.DataTexture): THREE.DataTexture {
    const heightData = heightTexture.image.data;
    const heightFn = (x: number, y: number): number => {
      const px = Math.floor(x * this.width) % this.width;
      const py = Math.floor(y * this.height) % this.height;
      const i = (py * this.width + px) * 4;
      return heightData[i] / 255;
    };
    return this.fromHeightFunction(heightFn);
  }

  /** Detail normal map (high-frequency surface detail) */
  detailNormal(detailScale = 20): THREE.DataTexture {
    const heightFn = (x: number, y: number): number => {
      const nx = x * detailScale + this.seed;
      const ny = y * detailScale;
      return fbm2D(nx, ny, { octaves: 2, lacunarity: 3, gain: 0.4 }) * 0.5 +
             valueNoise2D(nx * 2, ny * 2) * 0.3 +
             hash2D(Math.floor(nx * 50), Math.floor(ny * 50)) * 0.2;
    };
    return this.fromHeightFunction(heightFn);
  }
}

// =============================================================================
// PBR MATERIAL GENERATORS
// =============================================================================

/**
 * Generate complete procedural PBR texture sets
 */
export class ProceduralPBRGenerator extends ProceduralTextureGenerator {
  /**
   * Generate a rough stone/rock material
   */
  stone(options?: {
    baseColor?: THREE.Color;
    roughnessRange?: [number, number];
    bumpStrength?: number;
  }): { albedo: THREE.DataTexture; normal: THREE.DataTexture; roughness: THREE.DataTexture; ao: THREE.DataTexture } {
    const baseColor = options?.baseColor ?? new THREE.Color(0.4, 0.38, 0.35);
    const roughnessRange = options?.roughnessRange ?? [0.7, 0.95];
    const bumpStrength = options?.bumpStrength ?? 1.5;

    const albedoData = new Uint8Array(this.width * this.height * 4);
    const roughnessData = new Uint8Array(this.width * this.height);
    const aoData = new Uint8Array(this.width * this.height);
    const heightData = new Uint8Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * 8 + this.seed;
        const ny = (y / this.height) * 8;
        const i = y * this.width + x;

        // Multi-layer noise for natural stone look
        const large = warpedFbm2D(nx * 0.5, ny * 0.5, 0.3);
        const medium = fbm2D(nx, ny, { octaves: 4 });
        const small = fbm2D(nx * 4, ny * 4, { octaves: 2 }) * 0.3;
        const cracks = 1 - Math.pow(voronoi2D(nx * 2, ny * 2).f1, 0.5) * 0.3;

        const combined = large * 0.4 + medium * 0.4 + small + cracks * 0.2;

        // Albedo with color variation
        const colorVar = 0.85 + combined * 0.3;
        albedoData[i * 4] = Math.floor(baseColor.r * colorVar * 255);
        albedoData[i * 4 + 1] = Math.floor(baseColor.g * colorVar * 255);
        albedoData[i * 4 + 2] = Math.floor(baseColor.b * colorVar * 255);
        albedoData[i * 4 + 3] = 255;

        // Roughness varies with surface detail
        const roughness = roughnessRange[0] + combined * (roughnessRange[1] - roughnessRange[0]);
        roughnessData[i] = Math.floor(roughness * 255);

        // AO in crevices
        aoData[i] = Math.floor((0.7 + cracks * 0.3) * 255);

        // Height for normal map
        heightData[i] = Math.floor(combined * 255);
      }
    }

    const normalGen = new NormalMapGenerator({
      width: this.width,
      height: this.height,
      seed: this.seed,
      strength: bumpStrength,
    });

    return {
      albedo: this.createTexture(albedoData, true),
      normal: normalGen.fromHeightFunction((x, y) => {
        const i = Math.floor(y * this.height) * this.width + Math.floor(x * this.width);
        return heightData[i % heightData.length] / 255;
      }),
      roughness: this.createGrayscaleTexture(roughnessData),
      ao: this.createGrayscaleTexture(aoData),
    };
  }

  /**
   * Generate a metallic surface material
   */
  metal(options?: {
    baseColor?: THREE.Color;
    metalness?: number;
    roughnessRange?: [number, number];
    scratches?: number;
  }): { albedo: THREE.DataTexture; normal: THREE.DataTexture; roughness: THREE.DataTexture; metallic: THREE.DataTexture } {
    const baseColor = options?.baseColor ?? new THREE.Color(0.8, 0.8, 0.85);
    const metalness = options?.metalness ?? 0.95;
    const roughnessRange = options?.roughnessRange ?? [0.2, 0.5];
    const scratches = options?.scratches ?? 0.5;

    const albedoData = new Uint8Array(this.width * this.height * 4);
    const roughnessData = new Uint8Array(this.width * this.height);
    const metallicData = new Uint8Array(this.width * this.height);
    const heightData = new Float32Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * 10 + this.seed;
        const ny = (y / this.height) * 10;
        const i = y * this.width + x;

        // Fine grain texture
        const grain = fbm2D(nx * 5, ny * 5, { octaves: 3 }) * 0.1;

        // Scratches using directional noise
        const scratchNoise = Math.abs(Math.sin(nx * 50 + fbm2D(nx, ny) * 5)) * scratches;

        // Subtle surface variation
        const surface = fbm2D(nx, ny, { octaves: 2 }) * 0.05;

        const combined = grain + scratchNoise * 0.2 + surface;

        // Albedo (metallic surfaces reflect their color)
        const colorVar = 0.95 + combined * 0.1;
        albedoData[i * 4] = Math.floor(baseColor.r * colorVar * 255);
        albedoData[i * 4 + 1] = Math.floor(baseColor.g * colorVar * 255);
        albedoData[i * 4 + 2] = Math.floor(baseColor.b * colorVar * 255);
        albedoData[i * 4 + 3] = 255;

        // Roughness - scratches are rougher
        const roughness = roughnessRange[0] + scratchNoise * (roughnessRange[1] - roughnessRange[0]);
        roughnessData[i] = Math.floor(roughness * 255);

        // Constant high metalness
        metallicData[i] = Math.floor(metalness * 255);

        // Height for normal map
        heightData[i] = combined;
      }
    }

    const normalGen = new NormalMapGenerator({
      width: this.width,
      height: this.height,
      seed: this.seed,
      strength: 0.5,
    });

    return {
      albedo: this.createTexture(albedoData, true),
      normal: normalGen.fromHeightFunction((x, y) => {
        const i = Math.floor(y * this.height) * this.width + Math.floor(x * this.width);
        return heightData[i % heightData.length];
      }),
      roughness: this.createGrayscaleTexture(roughnessData),
      metallic: this.createGrayscaleTexture(metallicData),
    };
  }

  /**
   * Generate organic/skin-like material
   */
  organic(options?: {
    baseColor?: THREE.Color;
    secondaryColor?: THREE.Color;
    roughness?: number;
    subsurface?: number;
  }): { albedo: THREE.DataTexture; normal: THREE.DataTexture; roughness: THREE.DataTexture } {
    const baseColor = options?.baseColor ?? new THREE.Color(0.8, 0.6, 0.5);
    const secondaryColor = options?.secondaryColor ?? new THREE.Color(0.6, 0.4, 0.35);
    const roughness = options?.roughness ?? 0.6;

    const albedoData = new Uint8Array(this.width * this.height * 4);
    const roughnessData = new Uint8Array(this.width * this.height);
    const heightData = new Float32Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * 6 + this.seed;
        const ny = (y / this.height) * 6;
        const i = y * this.width + x;

        // Organic warped patterns
        const pattern = warpedFbm2D(nx, ny, 0.8, { octaves: 4 });

        // Cellular structure (pores, scales)
        const cells = voronoi2D(nx * 3, ny * 3);
        const cellEdge = Math.pow(cells.f2 - cells.f1, 0.5) * 0.3;

        // Fine detail
        const detail = fbm2D(nx * 8, ny * 8, { octaves: 2 }) * 0.1;

        // Color mixing
        const colorMix = pattern * 0.7 + cellEdge;
        const r = baseColor.r * (1 - colorMix) + secondaryColor.r * colorMix;
        const g = baseColor.g * (1 - colorMix) + secondaryColor.g * colorMix;
        const b = baseColor.b * (1 - colorMix) + secondaryColor.b * colorMix;

        albedoData[i * 4] = Math.floor(r * 255);
        albedoData[i * 4 + 1] = Math.floor(g * 255);
        albedoData[i * 4 + 2] = Math.floor(b * 255);
        albedoData[i * 4 + 3] = 255;

        // Roughness with pore detail
        roughnessData[i] = Math.floor((roughness + detail * 0.2) * 255);

        // Height
        heightData[i] = pattern * 0.5 + cellEdge * 0.3 + detail;
      }
    }

    const normalGen = new NormalMapGenerator({
      width: this.width,
      height: this.height,
      seed: this.seed,
      strength: 1.0,
    });

    return {
      albedo: this.createTexture(albedoData, true),
      normal: normalGen.fromHeightFunction((x, y) => {
        const i = Math.floor(y * this.height) * this.width + Math.floor(x * this.width);
        return heightData[i % heightData.length];
      }),
      roughness: this.createGrayscaleTexture(roughnessData),
    };
  }

  /**
   * Generate grass/vegetation material
   */
  grass(options?: {
    baseColor?: THREE.Color;
    tipColor?: THREE.Color;
  }): { albedo: THREE.DataTexture; normal: THREE.DataTexture; roughness: THREE.DataTexture; opacity: THREE.DataTexture } {
    const baseColor = options?.baseColor ?? new THREE.Color(0.2, 0.35, 0.1);
    const tipColor = options?.tipColor ?? new THREE.Color(0.4, 0.55, 0.2);

    const albedoData = new Uint8Array(this.width * this.height * 4);
    const roughnessData = new Uint8Array(this.width * this.height);
    const opacityData = new Uint8Array(this.width * this.height);
    const heightData = new Float32Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) * 4 + this.seed;
        const ny = (y / this.height) * 4;
        const i = y * this.width + x;

        // Vertical gradient (base to tip)
        const gradient = y / this.height;

        // Blade variation
        const bladeNoise = fbm2D(nx * 10, ny * 2, { octaves: 2 });

        // Color gradient with noise variation
        const colorMix = gradient + bladeNoise * 0.2;
        const r = baseColor.r * (1 - colorMix) + tipColor.r * colorMix;
        const g = baseColor.g * (1 - colorMix) + tipColor.g * colorMix;
        const b = baseColor.b * (1 - colorMix) + tipColor.b * colorMix;

        albedoData[i * 4] = Math.floor(r * 255);
        albedoData[i * 4 + 1] = Math.floor(g * 255);
        albedoData[i * 4 + 2] = Math.floor(b * 255);
        albedoData[i * 4 + 3] = 255;

        // Roughness (tips are slightly smoother)
        roughnessData[i] = Math.floor((0.8 - gradient * 0.2) * 255);

        // Opacity (for alpha-cutout grass cards)
        const bladeShape = Math.pow(Math.sin((x / this.width) * Math.PI), 0.5);
        const tipFade = Math.pow(1 - gradient, 0.3);
        opacityData[i] = Math.floor(bladeShape * tipFade * 255);

        heightData[i] = bladeNoise * 0.5 + gradient * 0.5;
      }
    }

    const normalGen = new NormalMapGenerator({
      width: this.width,
      height: this.height,
      seed: this.seed,
      strength: 0.5,
    });

    return {
      albedo: this.createTexture(albedoData, true),
      normal: normalGen.fromHeightFunction((x, y) => {
        const i = Math.floor(y * this.height) * this.width + Math.floor(x * this.width);
        return heightData[i % heightData.length];
      }),
      roughness: this.createGrayscaleTexture(roughnessData),
      opacity: this.createGrayscaleTexture(opacityData),
    };
  }
}

// =============================================================================
// SHELL/FUR TEXTURING
// =============================================================================

/**
 * Generate textures for shell-based fur/grass rendering
 */
export class ShellTextureGenerator extends ProceduralTextureGenerator {
  /**
   * Generate a fur density/alpha texture for shell rendering
   */
  furDensity(options?: {
    density?: number;
    strandThickness?: number;
    layers?: number;
  }): THREE.DataTexture {
    const density = options?.density ?? 0.7;
    const strandThickness = options?.strandThickness ?? 0.03;

    const data = new Uint8Array(this.width * this.height * 4);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;
        const i = (y * this.width + x) * 4;

        // Voronoi for strand distribution
        const v = voronoi2D(nx * 50 + this.seed, ny * 50);

        // Each cell center is a potential strand
        const distToStrand = v.f1;
        const strandAlpha = distToStrand < strandThickness ? 1 : 0;

        // Density control via noise
        const densityNoise = fbm2D(nx * 10 + this.seed, ny * 10, { octaves: 2 });
        const finalAlpha = strandAlpha * (densityNoise > (1 - density) ? 1 : 0);

        // Color variation per strand
        const colorVar = 0.8 + (v.cellId % 100) / 500;

        data[i] = Math.floor(colorVar * 255);
        data[i + 1] = Math.floor(colorVar * 255);
        data[i + 2] = Math.floor(colorVar * 255);
        data[i + 3] = Math.floor(finalAlpha * 255);
      }
    }

    return this.createTexture(data, false);
  }

  /**
   * Generate fur flow/direction texture
   */
  furFlow(options?: {
    flowDirection?: THREE.Vector2;
    curliness?: number;
  }): THREE.DataTexture {
    const flowDir = options?.flowDirection ?? new THREE.Vector2(0, 1);
    const curliness = options?.curliness ?? 0.3;

    const data = new Uint8Array(this.width * this.height * 4);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;
        const i = (y * this.width + x) * 4;

        // Base flow direction
        let fx = flowDir.x;
        let fy = flowDir.y;

        // Add curl variation
        const curl = fbm2D(nx * 5 + this.seed, ny * 5, { octaves: 3 }) * curliness;
        const angle = Math.atan2(fy, fx) + curl * Math.PI;
        fx = Math.cos(angle);
        fy = Math.sin(angle);

        // Pack direction as RG (normalized to 0-1)
        data[i] = Math.floor((fx * 0.5 + 0.5) * 255);
        data[i + 1] = Math.floor((fy * 0.5 + 0.5) * 255);
        data[i + 2] = 128; // Can store additional data
        data[i + 3] = 255;
      }
    }

    return this.createTexture(data, false);
  }

  /**
   * Generate length variation texture for fur shells
   */
  furLength(options?: {
    baseLength?: number;
    variation?: number;
  }): THREE.DataTexture {
    const baseLength = options?.baseLength ?? 0.7;
    const variation = options?.variation ?? 0.3;

    const data = new Uint8Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;
        const i = y * this.width + x;

        const lengthNoise = fbm2D(nx * 8 + this.seed, ny * 8, { octaves: 3 });
        const length = baseLength + (lengthNoise - 0.5) * variation;

        data[i] = Math.floor(Math.max(0, Math.min(1, length)) * 255);
      }
    }

    return this.createGrayscaleTexture(data);
  }
}

// =============================================================================
// PATTERN GENERATORS
// =============================================================================

/**
 * Generate geometric and repeating patterns
 */
export class PatternGenerator extends ProceduralTextureGenerator {
  /**
   * Brick/tile pattern
   */
  bricks(options?: {
    brickWidth?: number;
    brickHeight?: number;
    mortarWidth?: number;
    mortarColor?: THREE.Color;
    brickColor?: THREE.Color;
    colorVariation?: number;
  }): { albedo: THREE.DataTexture; normal: THREE.DataTexture; roughness: THREE.DataTexture } {
    const brickW = options?.brickWidth ?? 0.25;
    const brickH = options?.brickHeight ?? 0.1;
    const mortarW = options?.mortarWidth ?? 0.01;
    const mortarColor = options?.mortarColor ?? new THREE.Color(0.5, 0.5, 0.5);
    const brickColor = options?.brickColor ?? new THREE.Color(0.6, 0.3, 0.25);
    const colorVar = options?.colorVariation ?? 0.15;

    const albedoData = new Uint8Array(this.width * this.height * 4);
    const roughnessData = new Uint8Array(this.width * this.height);
    const heightData = new Float32Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;
        const i = y * this.width + x;

        // Calculate brick position
        const row = Math.floor(ny / brickH);
        const offset = (row % 2) * brickW * 0.5;
        const bx = ((nx + offset) % brickW) / brickW;
        const by = (ny % brickH) / brickH;

        // Mortar check
        const inMortarX = bx < mortarW / brickW || bx > 1 - mortarW / brickW;
        const inMortarY = by < mortarW / brickH || by > 1 - mortarW / brickH;
        const inMortar = inMortarX || inMortarY;

        // Brick ID for color variation
        const brickId = row * 100 + Math.floor((nx + offset) / brickW);
        const brickVariation = (hash2D(brickId, this.seed) - 0.5) * colorVar;

        let color: THREE.Color;
        let height: number;
        let rough: number;

        if (inMortar) {
          color = mortarColor;
          height = 0;
          rough = 0.9;
        } else {
          color = brickColor.clone();
          color.r += brickVariation;
          color.g += brickVariation * 0.5;
          color.b += brickVariation * 0.3;

          // Surface noise on brick
          const noise = fbm2D(nx * 50 + this.seed, ny * 50, { octaves: 2 }) * 0.1;
          color.r += noise;
          color.g += noise;
          color.b += noise;

          height = 1;
          rough = 0.7 + noise;
        }

        albedoData[i * 4] = Math.floor(Math.max(0, Math.min(1, color.r)) * 255);
        albedoData[i * 4 + 1] = Math.floor(Math.max(0, Math.min(1, color.g)) * 255);
        albedoData[i * 4 + 2] = Math.floor(Math.max(0, Math.min(1, color.b)) * 255);
        albedoData[i * 4 + 3] = 255;

        roughnessData[i] = Math.floor(rough * 255);
        heightData[i] = height;
      }
    }

    const normalGen = new NormalMapGenerator({
      width: this.width,
      height: this.height,
      seed: this.seed,
      strength: 2,
    });

    return {
      albedo: this.createTexture(albedoData, true),
      normal: normalGen.fromHeightFunction((x, y) => {
        const i = Math.floor(y * this.height) * this.width + Math.floor(x * this.width);
        return heightData[i % heightData.length];
      }),
      roughness: this.createGrayscaleTexture(roughnessData),
    };
  }

  /**
   * Wood grain pattern
   */
  woodGrain(options?: {
    baseColor?: THREE.Color;
    grainColor?: THREE.Color;
    grainScale?: number;
    ringScale?: number;
  }): { albedo: THREE.DataTexture; normal: THREE.DataTexture; roughness: THREE.DataTexture } {
    const baseColor = options?.baseColor ?? new THREE.Color(0.6, 0.4, 0.25);
    const grainColor = options?.grainColor ?? new THREE.Color(0.4, 0.25, 0.15);
    const grainScale = options?.grainScale ?? 30;
    const ringScale = options?.ringScale ?? 10;

    const albedoData = new Uint8Array(this.width * this.height * 4);
    const roughnessData = new Uint8Array(this.width * this.height);
    const heightData = new Float32Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x / this.width) + this.seed;
        const ny = (y / this.height);
        const i = y * this.width + x;

        // Ring pattern
        const ringNoise = fbm2D(nx * 2, ny * 0.5, { octaves: 2 }) * 2;
        const rings = Math.sin((nx * ringScale + ringNoise) * Math.PI * 2) * 0.5 + 0.5;

        // Fine grain
        const grain = fbm2D(nx * grainScale, ny * grainScale * 0.3, { octaves: 3 });

        // Combine
        const pattern = rings * 0.7 + grain * 0.3;

        // Color
        const r = baseColor.r * (1 - pattern * 0.5) + grainColor.r * pattern * 0.5;
        const g = baseColor.g * (1 - pattern * 0.5) + grainColor.g * pattern * 0.5;
        const b = baseColor.b * (1 - pattern * 0.5) + grainColor.b * pattern * 0.5;

        albedoData[i * 4] = Math.floor(r * 255);
        albedoData[i * 4 + 1] = Math.floor(g * 255);
        albedoData[i * 4 + 2] = Math.floor(b * 255);
        albedoData[i * 4 + 3] = 255;

        roughnessData[i] = Math.floor((0.5 + grain * 0.3) * 255);
        heightData[i] = grain * 0.5;
      }
    }

    const normalGen = new NormalMapGenerator({
      width: this.width,
      height: this.height,
      seed: this.seed,
      strength: 0.3,
    });

    return {
      albedo: this.createTexture(albedoData, true),
      normal: normalGen.fromHeightFunction((x, y) => {
        const i = Math.floor(y * this.height) * this.width + Math.floor(x * this.width);
        return heightData[i % heightData.length];
      }),
      roughness: this.createGrayscaleTexture(roughnessData),
    };
  }
}

// =============================================================================
// CONVENIENCE FACTORY
// =============================================================================

/**
 * Quick factory for common procedural textures
 */
export const ProceduralTextures = {
  noise: (options: NoiseTextureOptions) => new NoiseTextureGenerator(options),
  normalMap: (options: ProceduralTextureOptions & { scale?: number; strength?: number }) =>
    new NormalMapGenerator(options),
  pbr: (options: ProceduralTextureOptions) => new ProceduralPBRGenerator(options),
  shell: (options: ProceduralTextureOptions) => new ShellTextureGenerator(options),
  pattern: (options: ProceduralTextureOptions) => new PatternGenerator(options),

  /** Quick stone material */
  stone: (size = 512, seed?: number) =>
    new ProceduralPBRGenerator({ width: size, height: size, seed }).stone(),

  /** Quick metal material */
  metal: (size = 512, seed?: number) =>
    new ProceduralPBRGenerator({ width: size, height: size, seed }).metal(),

  /** Quick grass material */
  grass: (size = 512, seed?: number) =>
    new ProceduralPBRGenerator({ width: size, height: size, seed }).grass(),

  /** Quick wood material */
  wood: (size = 512, seed?: number) =>
    new PatternGenerator({ width: size, height: size, seed }).woodGrain(),

  /** Quick brick material */
  brick: (size = 512, seed?: number) =>
    new PatternGenerator({ width: size, height: size, seed }).bricks(),
};
