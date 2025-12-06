/**
 * PBR Texture Format Support
 *
 * Industry-standard texture format handling for procedural generation.
 * Supports all common PBR workflows, packed textures, and projections.
 *
 * @module core/texture-formats
 */

import * as THREE from 'three';

// =============================================================================
// PBR WORKFLOW TYPES
// =============================================================================

/**
 * The two standard PBR workflows used in real-time graphics
 */
export type PBRWorkflow = 'metallic-roughness' | 'specular-glossiness';

/**
 * Metallic-Roughness workflow (glTF 2.0, Unreal, Unity Standard)
 * - baseColor: RGB diffuse color, A optional opacity
 * - metallic: 0 = dielectric, 1 = metal
 * - roughness: 0 = smooth/mirror, 1 = rough/diffuse
 */
export interface MetallicRoughnessTextures {
  baseColor?: THREE.Texture;
  metallicRoughness?: THREE.Texture; // Packed: R=unused, G=roughness, B=metallic
  metallic?: THREE.Texture;          // Separate metallic (if not packed)
  roughness?: THREE.Texture;         // Separate roughness (if not packed)
  normal?: THREE.Texture;
  occlusion?: THREE.Texture;
  emissive?: THREE.Texture;
  height?: THREE.Texture;
}

/**
 * Specular-Glossiness workflow (legacy, Marmoset, some game engines)
 * - diffuse: RGB diffuse color
 * - specular: RGB specular color (F0 reflectance)
 * - glossiness: 0 = rough, 1 = smooth (inverse of roughness)
 */
export interface SpecularGlossinessTextures {
  diffuse?: THREE.Texture;
  specularGlossiness?: THREE.Texture; // Packed: RGB=specular, A=glossiness
  specular?: THREE.Texture;           // Separate specular
  glossiness?: THREE.Texture;         // Separate glossiness
  normal?: THREE.Texture;
  occlusion?: THREE.Texture;
  emissive?: THREE.Texture;
  height?: THREE.Texture;
}

// =============================================================================
// PACKED TEXTURE FORMATS
// =============================================================================

/**
 * Common packed texture channel layouts
 */
export type PackedTextureFormat =
  | 'ORM'    // Occlusion(R), Roughness(G), Metallic(B) - Poly Haven, many engines
  | 'ARM'    // Ambient Occlusion(R), Roughness(G), Metallic(B) - same as ORM
  | 'RMA'    // Roughness(R), Metallic(G), AO(B) - Unreal Engine
  | 'MR'     // Metallic(B), Roughness(G) - glTF metallicRoughness
  | 'MRA'    // Metallic(R), Roughness(G), AO(B)
  | 'RGBA';  // Custom/full RGBA data

/**
 * Channel assignment in a packed texture
 */
export interface PackedChannelLayout {
  r: 'occlusion' | 'roughness' | 'metallic' | 'height' | 'unused' | 'custom';
  g: 'occlusion' | 'roughness' | 'metallic' | 'height' | 'unused' | 'custom';
  b: 'occlusion' | 'roughness' | 'metallic' | 'height' | 'unused' | 'custom';
  a?: 'occlusion' | 'roughness' | 'metallic' | 'height' | 'opacity' | 'unused' | 'custom';
}

/** Standard packed format layouts */
export const PACKED_LAYOUTS: Record<PackedTextureFormat, PackedChannelLayout> = {
  ORM: { r: 'occlusion', g: 'roughness', b: 'metallic' },
  ARM: { r: 'occlusion', g: 'roughness', b: 'metallic' },
  RMA: { r: 'roughness', g: 'metallic', b: 'occlusion' },
  MR: { r: 'unused', g: 'roughness', b: 'metallic' },
  MRA: { r: 'metallic', g: 'roughness', b: 'occlusion' },
  RGBA: { r: 'custom', g: 'custom', b: 'custom', a: 'custom' },
};

// =============================================================================
// NORMAL MAP FORMATS
// =============================================================================

/**
 * Normal map coordinate conventions
 * - OpenGL: Y+ points UP (green channel = up)
 * - DirectX: Y+ points DOWN (green channel = down)
 */
export type NormalMapFormat = 'opengl' | 'directx';

/**
 * Normal map encoding types
 */
export type NormalMapEncoding =
  | 'tangent'     // Standard tangent-space normals (most common)
  | 'object'      // Object-space normals (RGB = XYZ directly)
  | 'world'       // World-space normals
  | 'derivative'  // Derivative maps (for runtime normal generation)
  | 'bc5'         // BC5/ATI2 compressed (RG only, B reconstructed)
  | 'dxt5nm';     // DXT5nm (AG channels, RB unused)

// =============================================================================
// COLOR SPACE
// =============================================================================

/**
 * Proper color space for each texture type
 */
export const TEXTURE_COLOR_SPACES: Record<string, THREE.ColorSpace> = {
  // sRGB (color data)
  baseColor: THREE.SRGBColorSpace,
  diffuse: THREE.SRGBColorSpace,
  albedo: THREE.SRGBColorSpace,
  emissive: THREE.SRGBColorSpace,

  // Linear (non-color data)
  normal: THREE.LinearSRGBColorSpace,
  roughness: THREE.LinearSRGBColorSpace,
  metallic: THREE.LinearSRGBColorSpace,
  metalness: THREE.LinearSRGBColorSpace,
  occlusion: THREE.LinearSRGBColorSpace,
  ao: THREE.LinearSRGBColorSpace,
  height: THREE.LinearSRGBColorSpace,
  displacement: THREE.LinearSRGBColorSpace,
  opacity: THREE.LinearSRGBColorSpace,
  specular: THREE.LinearSRGBColorSpace,
  glossiness: THREE.LinearSRGBColorSpace,

  // Packed (always linear)
  orm: THREE.LinearSRGBColorSpace,
  arm: THREE.LinearSRGBColorSpace,
  metallicRoughness: THREE.LinearSRGBColorSpace,
};

// =============================================================================
// TEXTURE PROJECTION MODES
// =============================================================================

/**
 * How textures are projected onto geometry
 */
export type TextureProjection =
  | 'uv'           // Standard UV mapping
  | 'triplanar'    // Project from 3 axes, blend based on normal
  | 'biplanar'     // Project from 2 axes (optimization)
  | 'box'          // Box projection (for cubemaps)
  | 'spherical'    // Spherical projection
  | 'cylindrical'  // Cylindrical projection
  | 'planar';      // Single-plane projection

// =============================================================================
// TEXTURE CONFIGURATION
// =============================================================================

/**
 * Complete texture configuration for a material
 */
export interface TextureConfig {
  /** PBR workflow being used */
  workflow: PBRWorkflow;

  /** Individual or packed textures */
  textures: {
    // Core PBR
    baseColor?: THREE.Texture;
    normal?: THREE.Texture;
    roughness?: THREE.Texture;
    metallic?: THREE.Texture;
    occlusion?: THREE.Texture;
    emissive?: THREE.Texture;
    height?: THREE.Texture;
    opacity?: THREE.Texture;

    // Packed alternatives
    metallicRoughness?: THREE.Texture;
    occlusionRoughnessMetallic?: THREE.Texture;

    // Spec-gloss workflow
    diffuse?: THREE.Texture;
    specular?: THREE.Texture;
    glossiness?: THREE.Texture;
    specularGlossiness?: THREE.Texture;
  };

  /** Packed texture format (if using packed) */
  packedFormat?: PackedTextureFormat;

  /** Normal map format */
  normalFormat: NormalMapFormat;

  /** Normal map encoding */
  normalEncoding: NormalMapEncoding;

  /** Texture projection method */
  projection: TextureProjection;

  /** Tiling scale */
  tiling: THREE.Vector2;

  /** UV offset */
  offset: THREE.Vector2;

  /** Texture rotation (radians) */
  rotation: number;
}

// =============================================================================
// FORMAT UTILITIES
// =============================================================================

/**
 * Apply correct color space to a texture based on its type
 */
export function applyColorSpace(texture: THREE.Texture, textureType: string): void {
  const colorSpace = TEXTURE_COLOR_SPACES[textureType.toLowerCase()];
  if (colorSpace) {
    texture.colorSpace = colorSpace;
  } else {
    // Default to linear for unknown types (safer for data textures)
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }
  texture.needsUpdate = true;
}

/**
 * Configure texture for tiling (seamless textures)
 */
export function configureForTiling(
  texture: THREE.Texture,
  tilingX: number = 1,
  tilingY: number = 1
): void {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(tilingX, tilingY);
  texture.needsUpdate = true;
}

/**
 * Flip normal map Y channel (convert between OpenGL/DirectX)
 * Note: For runtime conversion without pixel manipulation, use normalScale.y = -1
 */
export function flipNormalMapY(material: THREE.MeshStandardMaterial): void {
  if (material.normalScale) {
    material.normalScale.y *= -1;
  }
}

/**
 * Create a material from texture config
 */
export function createMaterialFromConfig(config: TextureConfig): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial();

  // Apply base color
  if (config.textures.baseColor) {
    material.map = config.textures.baseColor;
  }

  // Apply normal map
  if (config.textures.normal) {
    material.normalMap = config.textures.normal;
    // Handle DirectX normals by flipping Y
    if (config.normalFormat === 'directx') {
      material.normalScale = new THREE.Vector2(1, -1);
    }
  }

  // Handle metallic/roughness - either packed or separate
  if (config.textures.metallicRoughness) {
    // glTF-style packed texture
    material.roughnessMap = config.textures.metallicRoughness;
    material.metalnessMap = config.textures.metallicRoughness;
  } else if (config.textures.occlusionRoughnessMetallic) {
    // ORM packed texture
    material.aoMap = config.textures.occlusionRoughnessMetallic;
    material.roughnessMap = config.textures.occlusionRoughnessMetallic;
    material.metalnessMap = config.textures.occlusionRoughnessMetallic;
  } else {
    // Separate textures
    if (config.textures.roughness) {
      material.roughnessMap = config.textures.roughness;
    }
    if (config.textures.metallic) {
      material.metalnessMap = config.textures.metallic;
    }
    if (config.textures.occlusion) {
      material.aoMap = config.textures.occlusion;
    }
  }

  // Emissive
  if (config.textures.emissive) {
    material.emissiveMap = config.textures.emissive;
    material.emissive = new THREE.Color(0xffffff);
  }

  // Height/displacement
  if (config.textures.height) {
    material.displacementMap = config.textures.height;
    material.displacementScale = 0.1;
  }

  // Opacity
  if (config.textures.opacity) {
    material.alphaMap = config.textures.opacity;
    material.transparent = true;
  }

  return material;
}

// =============================================================================
// PACKED TEXTURE UTILITIES
// =============================================================================

/**
 * Extract a single channel from a packed texture into a new texture
 * Useful when you need separate textures from ORM/ARM packed formats
 */
export function extractChannel(
  packedTexture: THREE.Texture,
  channel: 'r' | 'g' | 'b' | 'a',
  width?: number,
  height?: number
): THREE.DataTexture | null {
  // This requires the texture to be readable (not compressed, has image data)
  const image = packedTexture.image;
  if (!image) return null;

  const w = width ?? image.width;
  const h = height ?? image.height;

  // Create canvas to read pixels
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  // Extract channel
  const channelIndex = { r: 0, g: 1, b: 2, a: 3 }[channel];
  const data = new Uint8Array(w * h);

  for (let i = 0; i < w * h; i++) {
    data[i] = pixels[i * 4 + channelIndex];
  }

  const texture = new THREE.DataTexture(data, w, h, THREE.RedFormat);
  texture.wrapS = packedTexture.wrapS;
  texture.wrapT = packedTexture.wrapT;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Pack separate textures into a single ORM/ARM texture
 */
export function packTextures(
  occlusion: THREE.Texture | null,
  roughness: THREE.Texture | null,
  metallic: THREE.Texture | null,
  width: number,
  height: number
): THREE.DataTexture {
  const data = new Uint8Array(width * height * 4);

  // Helper to read texture channel
  const readTexture = (tex: THREE.Texture | null, defaultValue: number): Uint8Array => {
    if (!tex?.image) {
      const arr = new Uint8Array(width * height);
      arr.fill(defaultValue);
      return arr;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(tex.image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    // Return red channel (assuming grayscale inputs)
    const result = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      result[i] = imageData.data[i * 4];
    }
    return result;
  };

  const occData = readTexture(occlusion, 255);  // Default white (no occlusion)
  const roughData = readTexture(roughness, 128); // Default 0.5 roughness
  const metalData = readTexture(metallic, 0);    // Default non-metallic

  for (let i = 0; i < width * height; i++) {
    data[i * 4] = occData[i];     // R = Occlusion
    data[i * 4 + 1] = roughData[i]; // G = Roughness
    data[i * 4 + 2] = metalData[i]; // B = Metallic
    data[i * 4 + 3] = 255;          // A = unused
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

// =============================================================================
// TRIPLANAR PROJECTION UTILITIES
// =============================================================================

/**
 * GLSL code for triplanar texture sampling
 * Include this in your shaders for triplanar projection
 */
export const TRIPLANAR_GLSL = /* glsl */ `
// Triplanar mapping function
vec4 triplanarSample(sampler2D tex, vec3 worldPos, vec3 worldNormal, float scale) {
  // Calculate blend weights from normal
  vec3 blendWeights = abs(worldNormal);
  // Make weights sum to 1
  blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

  // Sample from each plane
  vec4 xSample = texture2D(tex, worldPos.yz * scale);
  vec4 ySample = texture2D(tex, worldPos.xz * scale);
  vec4 zSample = texture2D(tex, worldPos.xy * scale);

  // Blend based on normal
  return xSample * blendWeights.x + ySample * blendWeights.y + zSample * blendWeights.z;
}

// Triplanar normal mapping (handles tangent space conversion)
vec3 triplanarNormal(sampler2D tex, vec3 worldPos, vec3 worldNormal, float scale) {
  vec3 blendWeights = abs(worldNormal);
  blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

  // Sample normals
  vec3 xNorm = texture2D(tex, worldPos.yz * scale).rgb * 2.0 - 1.0;
  vec3 yNorm = texture2D(tex, worldPos.xz * scale).rgb * 2.0 - 1.0;
  vec3 zNorm = texture2D(tex, worldPos.xy * scale).rgb * 2.0 - 1.0;

  // Swizzle to world space and blend
  xNorm = vec3(xNorm.xy + worldNormal.zy, abs(xNorm.z) * worldNormal.x);
  yNorm = vec3(yNorm.xy + worldNormal.xz, abs(yNorm.z) * worldNormal.y);
  zNorm = vec3(zNorm.xy + worldNormal.xy, abs(zNorm.z) * worldNormal.z);

  return normalize(
    xNorm.zyx * blendWeights.x +
    yNorm.xzy * blendWeights.y +
    zNorm.xyz * blendWeights.z
  );
}
`;

/**
 * GLSL code for height-based texture blending
 * Blend between materials based on height with noise for organic transitions
 */
export const HEIGHT_BLEND_GLSL = /* glsl */ `
// Height-based blending with noise
float heightBlend(float height, float threshold, float blendWidth, float noise) {
  float adjustedThreshold = threshold + (noise - 0.5) * blendWidth;
  return smoothstep(adjustedThreshold - blendWidth * 0.5, adjustedThreshold + blendWidth * 0.5, height);
}

// Blend 4 materials based on height thresholds
vec4 blendByHeight(
  vec4 mat0, vec4 mat1, vec4 mat2, vec4 mat3,
  float height,
  vec3 thresholds, // threshold for mat1, mat2, mat3
  float blendWidth,
  float noise
) {
  float b1 = heightBlend(height, thresholds.x, blendWidth, noise);
  float b2 = heightBlend(height, thresholds.y, blendWidth, noise);
  float b3 = heightBlend(height, thresholds.z, blendWidth, noise);

  vec4 result = mix(mat0, mat1, b1);
  result = mix(result, mat2, b2);
  result = mix(result, mat3, b3);

  return result;
}
`;

/**
 * GLSL code for slope-based texture blending
 * Blend between materials based on surface slope
 */
export const SLOPE_BLEND_GLSL = /* glsl */ `
// Get slope from world normal (0 = flat, 1 = vertical)
float getSlope(vec3 worldNormal) {
  return 1.0 - abs(dot(worldNormal, vec3(0.0, 1.0, 0.0)));
}

// Blend materials by slope
vec4 blendBySlope(
  vec4 flatMaterial,
  vec4 steepMaterial,
  vec3 worldNormal,
  float slopeThreshold,
  float blendWidth
) {
  float slope = getSlope(worldNormal);
  float blend = smoothstep(slopeThreshold - blendWidth, slopeThreshold + blendWidth, slope);
  return mix(flatMaterial, steepMaterial, blend);
}
`;

// =============================================================================
// TEXTURE ARRAY SUPPORT
// =============================================================================

/**
 * Create a texture array from multiple textures (for terrain splatmaps)
 * Requires WebGL 2
 */
export function createTextureArray(
  textures: THREE.Texture[],
  width: number,
  height: number
): THREE.DataArrayTexture | null {
  if (textures.length === 0) return null;

  const depth = textures.length;
  const data = new Uint8Array(width * height * depth * 4);

  textures.forEach((tex, layer) => {
    if (!tex.image) return;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(tex.image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const layerOffset = layer * width * height * 4;
    data.set(imageData.data, layerOffset);
  });

  const textureArray = new THREE.DataArrayTexture(data, width, height, depth);
  textureArray.format = THREE.RGBAFormat;
  textureArray.type = THREE.UnsignedByteType;
  textureArray.minFilter = THREE.LinearMipmapLinearFilter;
  textureArray.magFilter = THREE.LinearFilter;
  textureArray.wrapS = THREE.RepeatWrapping;
  textureArray.wrapT = THREE.RepeatWrapping;
  textureArray.generateMipmaps = true;
  textureArray.needsUpdate = true;

  return textureArray;
}

// =============================================================================
// DEFAULT TEXTURE CONFIG
// =============================================================================

/**
 * Create a default texture configuration
 */
export function createDefaultConfig(): TextureConfig {
  return {
    workflow: 'metallic-roughness',
    textures: {},
    normalFormat: 'opengl',
    normalEncoding: 'tangent',
    projection: 'uv',
    tiling: new THREE.Vector2(1, 1),
    offset: new THREE.Vector2(0, 0),
    rotation: 0,
  };
}
