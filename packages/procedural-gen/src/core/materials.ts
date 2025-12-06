/**
 * PBR Material System with Texture Slots
 *
 * A flexible, slot-based material system for procedural generation.
 * Supports triplanar mapping, texture blending, and PBR workflows.
 *
 * @module core/materials
 */

import * as THREE from 'three';

// =============================================================================
// TEXTURE SLOT TYPES
// =============================================================================

/** Standard PBR texture slot names */
export type TextureSlot =
  | 'albedo'
  | 'normal'
  | 'roughness'
  | 'metallic'
  | 'ao'
  | 'height'
  | 'emissive'
  | 'opacity';

/** Complete set of PBR textures for a material */
export interface PBRTextureSet {
  albedo?: THREE.Texture | null;
  normal?: THREE.Texture | null;
  roughness?: THREE.Texture | null;
  metallic?: THREE.Texture | null;
  ao?: THREE.Texture | null;
  height?: THREE.Texture | null;
  emissive?: THREE.Texture | null;
  opacity?: THREE.Texture | null;
}

/** Material properties (fallback when textures aren't available) */
export interface MaterialProperties {
  color?: THREE.Color | string | number;
  roughness?: number;
  metallic?: number;
  emissive?: THREE.Color | string | number;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
}

/** A complete material definition */
export interface MaterialDefinition {
  name: string;
  textures: PBRTextureSet;
  properties: MaterialProperties;
  /** Texture tiling scale */
  tiling?: THREE.Vector2;
  /** Normal map strength */
  normalScale?: number;
  /** Height/parallax scale */
  heightScale?: number;
}

// =============================================================================
// MATERIAL SLOT SYSTEM
// =============================================================================

/**
 * Material Slot - represents a single material that can be applied to geometry
 */
export class MaterialSlot {
  readonly id: string;
  readonly name: string;
  private textures: Map<TextureSlot, THREE.Texture | null> = new Map();
  private properties: MaterialProperties = {};
  private tiling: THREE.Vector2 = new THREE.Vector2(1, 1);
  private normalScale: number = 1.0;
  private heightScale: number = 0.05;

  constructor(id: string, name: string, definition?: Partial<MaterialDefinition>) {
    this.id = id;
    this.name = name;

    if (definition) {
      if (definition.textures) {
        Object.entries(definition.textures).forEach(([slot, tex]) => {
          this.textures.set(slot as TextureSlot, tex ?? null);
        });
      }
      if (definition.properties) {
        this.properties = { ...definition.properties };
      }
      if (definition.tiling) {
        this.tiling.copy(definition.tiling);
      }
      if (definition.normalScale !== undefined) {
        this.normalScale = definition.normalScale;
      }
      if (definition.heightScale !== undefined) {
        this.heightScale = definition.heightScale;
      }
    }
  }

  /** Set a texture for a slot */
  setTexture(slot: TextureSlot, texture: THREE.Texture | null): this {
    this.textures.set(slot, texture);
    return this;
  }

  /** Get a texture from a slot */
  getTexture(slot: TextureSlot): THREE.Texture | null {
    return this.textures.get(slot) ?? null;
  }

  /** Set material property */
  setProperty<K extends keyof MaterialProperties>(key: K, value: MaterialProperties[K]): this {
    this.properties[key] = value;
    return this;
  }

  /** Get material property */
  getProperty<K extends keyof MaterialProperties>(key: K): MaterialProperties[K] {
    return this.properties[key];
  }

  /** Set tiling */
  setTiling(x: number, y: number): this {
    this.tiling.set(x, y);
    return this;
  }

  /** Get tiling */
  getTiling(): THREE.Vector2 {
    return this.tiling.clone();
  }

  /** Get normal scale */
  getNormalScale(): number {
    return this.normalScale;
  }

  /** Get height scale */
  getHeightScale(): number {
    return this.heightScale;
  }

  /** Check if slot has a specific texture */
  hasTexture(slot: TextureSlot): boolean {
    return this.textures.has(slot) && this.textures.get(slot) !== null;
  }

  /** Get all textures */
  getAllTextures(): Map<TextureSlot, THREE.Texture | null> {
    return new Map(this.textures);
  }

  /** Create a standard Three.js MeshStandardMaterial from this slot */
  toStandardMaterial(): THREE.MeshStandardMaterial {
    const mat = new THREE.MeshStandardMaterial();

    // Apply textures
    if (this.hasTexture('albedo')) {
      mat.map = this.getTexture('albedo');
    }
    if (this.hasTexture('normal')) {
      mat.normalMap = this.getTexture('normal');
      mat.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
    }
    if (this.hasTexture('roughness')) {
      mat.roughnessMap = this.getTexture('roughness');
    }
    if (this.hasTexture('metallic')) {
      mat.metalnessMap = this.getTexture('metallic');
    }
    if (this.hasTexture('ao')) {
      mat.aoMap = this.getTexture('ao');
    }
    if (this.hasTexture('emissive')) {
      mat.emissiveMap = this.getTexture('emissive');
    }
    if (this.hasTexture('height')) {
      mat.displacementMap = this.getTexture('height');
      mat.displacementScale = this.heightScale;
    }

    // Apply properties
    if (this.properties.color !== undefined) {
      mat.color = new THREE.Color(this.properties.color);
    }
    if (this.properties.roughness !== undefined) {
      mat.roughness = this.properties.roughness;
    }
    if (this.properties.metallic !== undefined) {
      mat.metalness = this.properties.metallic;
    }
    if (this.properties.emissive !== undefined) {
      mat.emissive = new THREE.Color(this.properties.emissive);
    }
    if (this.properties.emissiveIntensity !== undefined) {
      mat.emissiveIntensity = this.properties.emissiveIntensity;
    }
    if (this.properties.opacity !== undefined) {
      mat.opacity = this.properties.opacity;
    }
    if (this.properties.transparent !== undefined) {
      mat.transparent = this.properties.transparent;
    }

    return mat;
  }

  /** Dispose all textures */
  dispose(): void {
    this.textures.forEach(tex => tex?.dispose());
    this.textures.clear();
  }
}

// =============================================================================
// MATERIAL LIBRARY
// =============================================================================

/**
 * Material Library - manages a collection of material slots
 *
 * @example
 * ```ts
 * const library = new MaterialLibrary();
 *
 * library.register('grass', {
 *   textures: { albedo: grassAlbedo, normal: grassNormal },
 *   properties: { roughness: 0.8 },
 *   tiling: new THREE.Vector2(4, 4)
 * });
 *
 * library.register('rock', {
 *   textures: { albedo: rockAlbedo, normal: rockNormal },
 *   properties: { roughness: 0.9 }
 * });
 *
 * const grassMat = library.get('grass');
 * ```
 */
export class MaterialLibrary {
  private slots: Map<string, MaterialSlot> = new Map();
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  /** Register a material slot */
  register(id: string, definition: Omit<MaterialDefinition, 'name'> & { name?: string }): MaterialSlot {
    const slot = new MaterialSlot(id, definition.name ?? id, definition);
    this.slots.set(id, slot);
    return slot;
  }

  /** Get a material slot by ID */
  get(id: string): MaterialSlot | undefined {
    return this.slots.get(id);
  }

  /** Check if a material exists */
  has(id: string): boolean {
    return this.slots.has(id);
  }

  /** Get all material IDs */
  getIds(): string[] {
    return Array.from(this.slots.keys());
  }

  /** Remove a material */
  remove(id: string): boolean {
    const slot = this.slots.get(id);
    if (slot) {
      slot.dispose();
      return this.slots.delete(id);
    }
    return false;
  }

  /** Load a texture from URL */
  async loadTexture(url: string, options?: TextureOptions): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          applyTextureOptions(texture, options);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /** Load a complete PBR texture set from a directory */
  async loadPBRSet(
    basePath: string,
    options?: {
      albedoFile?: string;
      normalFile?: string;
      roughnessFile?: string;
      metallicFile?: string;
      aoFile?: string;
      heightFile?: string;
      extension?: string;
    }
  ): Promise<PBRTextureSet> {
    const ext = options?.extension ?? 'jpg';
    const files = {
      albedo: options?.albedoFile ?? `albedo.${ext}`,
      normal: options?.normalFile ?? `normal.${ext}`,
      roughness: options?.roughnessFile ?? `roughness.${ext}`,
      metallic: options?.metallicFile ?? `metallic.${ext}`,
      ao: options?.aoFile ?? `ao.${ext}`,
      height: options?.heightFile ?? `height.${ext}`,
    };

    const result: PBRTextureSet = {};
    const loadPromises: Promise<void>[] = [];

    for (const [slot, filename] of Object.entries(files)) {
      const url = `${basePath}/${filename}`;
      loadPromises.push(
        this.loadTexture(url)
          .then(tex => {
            result[slot as keyof PBRTextureSet] = tex;
          })
          .catch(() => {
            // Texture doesn't exist, that's OK
            result[slot as keyof PBRTextureSet] = null;
          })
      );
    }

    await Promise.all(loadPromises);
    return result;
  }

  /** Dispose all materials */
  dispose(): void {
    this.slots.forEach(slot => slot.dispose());
    this.slots.clear();
  }
}

// =============================================================================
// TEXTURE UTILITIES
// =============================================================================

export interface TextureOptions {
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  magFilter?: THREE.MagnificationTextureFilter;
  minFilter?: THREE.MinificationTextureFilter;
  anisotropy?: number;
  encoding?: THREE.ColorSpace;
  flipY?: boolean;
  generateMipmaps?: boolean;
}

/** Apply options to a texture */
export function applyTextureOptions(texture: THREE.Texture, options?: TextureOptions): void {
  if (!options) return;

  if (options.wrapS !== undefined) texture.wrapS = options.wrapS;
  if (options.wrapT !== undefined) texture.wrapT = options.wrapT;
  if (options.magFilter !== undefined) texture.magFilter = options.magFilter;
  if (options.minFilter !== undefined) texture.minFilter = options.minFilter;
  if (options.anisotropy !== undefined) texture.anisotropy = options.anisotropy;
  if (options.encoding !== undefined) texture.colorSpace = options.encoding;
  if (options.flipY !== undefined) texture.flipY = options.flipY;
  if (options.generateMipmaps !== undefined) texture.generateMipmaps = options.generateMipmaps;

  texture.needsUpdate = true;
}

/** Create a solid color texture */
export function createSolidColorTexture(color: THREE.Color | number | string, size = 4): THREE.DataTexture {
  const c = new THREE.Color(color);
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const stride = i * 4;
    data[stride] = Math.floor(c.r * 255);
    data[stride + 1] = Math.floor(c.g * 255);
    data[stride + 2] = Math.floor(c.b * 255);
    data[stride + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

/** Create a checkerboard texture (useful for debugging) */
export function createCheckerboardTexture(
  color1: THREE.Color | number = 0xffffff,
  color2: THREE.Color | number = 0x808080,
  size = 8
): THREE.DataTexture {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const c = (x + y) % 2 === 0 ? c1 : c2;
      data[i] = Math.floor(c.r * 255);
      data[i + 1] = Math.floor(c.g * 255);
      data[i + 2] = Math.floor(c.b * 255);
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/** Create a noise texture */
export function createNoiseTexture(size = 256, seed = 0): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  let s = seed || Math.random() * 10000;

  const random = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  for (let i = 0; i < size * size; i++) {
    const v = Math.floor(random() * 255);
    const stride = i * 4;
    data[stride] = v;
    data[stride + 1] = v;
    data[stride + 2] = v;
    data[stride + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/** Create a gradient texture */
export function createGradientTexture(
  colors: Array<{ color: THREE.Color | number; stop: number }>,
  size = 256,
  vertical = false
): THREE.DataTexture {
  const data = new Uint8Array(size * 4);

  // Sort by stop
  const sortedColors = [...colors].sort((a, b) => a.stop - b.stop);

  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);

    // Find surrounding colors
    let c1 = new THREE.Color(sortedColors[0].color);
    let c2 = new THREE.Color(sortedColors[sortedColors.length - 1].color);
    let localT = t;

    for (let j = 0; j < sortedColors.length - 1; j++) {
      if (t >= sortedColors[j].stop && t <= sortedColors[j + 1].stop) {
        c1 = new THREE.Color(sortedColors[j].color);
        c2 = new THREE.Color(sortedColors[j + 1].color);
        localT = (t - sortedColors[j].stop) / (sortedColors[j + 1].stop - sortedColors[j].stop);
        break;
      }
    }

    const c = c1.clone().lerp(c2, localT);
    const stride = i * 4;
    data[stride] = Math.floor(c.r * 255);
    data[stride + 1] = Math.floor(c.g * 255);
    data[stride + 2] = Math.floor(c.b * 255);
    data[stride + 3] = 255;
  }

  const texture = new THREE.DataTexture(
    data,
    vertical ? 1 : size,
    vertical ? size : 1,
    THREE.RGBAFormat
  );
  texture.needsUpdate = true;
  return texture;
}

// =============================================================================
// TERRAIN MATERIAL BLENDING
// =============================================================================

/** Blend mode for material transitions */
export type BlendMode = 'linear' | 'smoothstep' | 'height' | 'slope';

/** Configuration for a terrain layer */
export interface TerrainLayerConfig {
  material: MaterialSlot;
  /** Minimum height for this layer */
  minHeight?: number;
  /** Maximum height for this layer */
  maxHeight?: number;
  /** Minimum slope (0-1) for this layer */
  minSlope?: number;
  /** Maximum slope (0-1) for this layer */
  maxSlope?: number;
  /** Blend width at transitions */
  blendWidth?: number;
  /** Noise influence (0-1) for organic transitions */
  noiseInfluence?: number;
}

/**
 * Terrain Material Manager - handles multi-material terrain with blending
 */
export class TerrainMaterialManager {
  private layers: TerrainLayerConfig[] = [];
  private library: MaterialLibrary;

  constructor(library: MaterialLibrary) {
    this.library = library;
  }

  /** Add a terrain layer */
  addLayer(config: TerrainLayerConfig): this {
    this.layers.push(config);
    // Sort by minHeight for consistent ordering
    this.layers.sort((a, b) => (a.minHeight ?? -Infinity) - (b.minHeight ?? -Infinity));
    return this;
  }

  /** Get all layers */
  getLayers(): TerrainLayerConfig[] {
    return [...this.layers];
  }

  /** Get the dominant material at a given height and slope */
  getMaterialAt(height: number, slope: number): MaterialSlot | null {
    for (const layer of this.layers) {
      const heightMatch =
        (layer.minHeight === undefined || height >= layer.minHeight) &&
        (layer.maxHeight === undefined || height <= layer.maxHeight);

      const slopeMatch =
        (layer.minSlope === undefined || slope >= layer.minSlope) &&
        (layer.maxSlope === undefined || slope <= layer.maxSlope);

      if (heightMatch && slopeMatch) {
        return layer.material;
      }
    }
    return this.layers[0]?.material ?? null;
  }

  /** Generate shader uniforms for terrain blending */
  generateUniforms(): Record<string, THREE.IUniform> {
    const uniforms: Record<string, THREE.IUniform> = {};

    this.layers.forEach((layer, i) => {
      const prefix = `layer${i}`;

      // Textures
      if (layer.material.hasTexture('albedo')) {
        uniforms[`${prefix}Albedo`] = { value: layer.material.getTexture('albedo') };
      }
      if (layer.material.hasTexture('normal')) {
        uniforms[`${prefix}Normal`] = { value: layer.material.getTexture('normal') };
      }
      if (layer.material.hasTexture('roughness')) {
        uniforms[`${prefix}Roughness`] = { value: layer.material.getTexture('roughness') };
      }
      if (layer.material.hasTexture('ao')) {
        uniforms[`${prefix}AO`] = { value: layer.material.getTexture('ao') };
      }

      // Layer bounds
      uniforms[`${prefix}MinHeight`] = { value: layer.minHeight ?? -1000 };
      uniforms[`${prefix}MaxHeight`] = { value: layer.maxHeight ?? 1000 };
      uniforms[`${prefix}MinSlope`] = { value: layer.minSlope ?? 0 };
      uniforms[`${prefix}MaxSlope`] = { value: layer.maxSlope ?? 1 };
      uniforms[`${prefix}BlendWidth`] = { value: layer.blendWidth ?? 2 };
      uniforms[`${prefix}NoiseInfluence`] = { value: layer.noiseInfluence ?? 0.2 };

      // Tiling
      uniforms[`${prefix}Tiling`] = { value: layer.material.getTiling() };
    });

    uniforms['numLayers'] = { value: this.layers.length };

    return uniforms;
  }

  /** Clear all layers */
  clear(): void {
    this.layers = [];
  }
}

// =============================================================================
// SPLATMAP SYSTEM
// =============================================================================

/**
 * Splatmap - texture that encodes material weights at each point
 * R, G, B, A channels = weights for up to 4 materials
 */
export class Splatmap {
  private data: Float32Array;
  private width: number;
  private height: number;
  private texture: THREE.DataTexture | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height * 4);

    // Initialize with full weight on first channel
    for (let i = 0; i < width * height; i++) {
      this.data[i * 4] = 1.0;
    }
  }

  /** Set weight at a position */
  setWeight(x: number, y: number, channel: 0 | 1 | 2 | 3, weight: number): void {
    const i = (y * this.width + x) * 4 + channel;
    this.data[i] = Math.max(0, Math.min(1, weight));
  }

  /** Get weight at a position */
  getWeight(x: number, y: number, channel: 0 | 1 | 2 | 3): number {
    const i = (y * this.width + x) * 4 + channel;
    return this.data[i];
  }

  /** Normalize weights at a position (ensure they sum to 1) */
  normalizeAt(x: number, y: number): void {
    const base = (y * this.width + x) * 4;
    let sum = 0;
    for (let c = 0; c < 4; c++) {
      sum += this.data[base + c];
    }
    if (sum > 0) {
      for (let c = 0; c < 4; c++) {
        this.data[base + c] /= sum;
      }
    }
  }

  /** Normalize all weights */
  normalizeAll(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.normalizeAt(x, y);
      }
    }
  }

  /** Paint with a brush */
  paint(
    centerX: number,
    centerY: number,
    radius: number,
    channel: 0 | 1 | 2 | 3,
    strength: number = 1.0,
    falloff: 'linear' | 'smooth' | 'constant' = 'smooth'
  ): void {
    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(this.width - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(this.height - 1, Math.ceil(centerY + radius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (dist <= radius) {
          let factor: number;
          switch (falloff) {
            case 'constant':
              factor = 1;
              break;
            case 'linear':
              factor = 1 - dist / radius;
              break;
            case 'smooth':
            default:
              const t = dist / radius;
              factor = 1 - t * t * (3 - 2 * t);
              break;
          }

          const current = this.getWeight(x, y, channel);
          this.setWeight(x, y, channel, current + factor * strength);
        }
      }
    }

    // Normalize the painted area
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.normalizeAt(x, y);
      }
    }
  }

  /** Get as Three.js texture */
  toTexture(): THREE.DataTexture {
    if (this.texture) {
      this.texture.dispose();
    }

    // Convert to Uint8
    const uint8Data = new Uint8Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      uint8Data[i] = Math.floor(this.data[i] * 255);
    }

    this.texture = new THREE.DataTexture(
      uint8Data,
      this.width,
      this.height,
      THREE.RGBAFormat
    );
    this.texture.needsUpdate = true;
    return this.texture;
  }

  /** Generate from height data */
  static fromHeightmap(
    heightData: Float32Array,
    width: number,
    height: number,
    thresholds: Array<{ minHeight: number; maxHeight: number; channel: 0 | 1 | 2 | 3 }>
  ): Splatmap {
    const splatmap = new Splatmap(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const h = heightData[y * width + x];

        // Clear all channels
        for (let c = 0; c < 4; c++) {
          splatmap.setWeight(x, y, c as 0 | 1 | 2 | 3, 0);
        }

        // Set weights based on height
        for (const threshold of thresholds) {
          if (h >= threshold.minHeight && h <= threshold.maxHeight) {
            splatmap.setWeight(x, y, threshold.channel, 1);
            break;
          }
        }
      }
    }

    splatmap.normalizeAll();
    return splatmap;
  }

  /** Dispose */
  dispose(): void {
    this.texture?.dispose();
    this.texture = null;
  }
}
