/**
 * Procedural Noise Functions
 *
 * Comprehensive noise library for procedural generation.
 * Includes value noise, gradient noise, FBM, domain warping, and more.
 *
 * @module core/noise
 */

// =============================================================================
// HASH FUNCTIONS
// =============================================================================

/** Simple hash function for integers */
export function hashInt(x: number): number {
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return x;
}

/** Hash function for 1D input */
export function hash1D(x: number): number {
  return ((Math.sin(x * 127.1) * 43758.5453) % 1 + 1) % 1;
}

/** Hash function for 2D input */
export function hash2D(x: number, y: number): number {
  return ((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1 + 1) % 1;
}

/** Hash function for 3D input */
export function hash3D(x: number, y: number, z: number): number {
  return ((Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453) % 1 + 1) % 1;
}

// =============================================================================
// INTERPOLATION
// =============================================================================

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/** Smoothstep interpolation */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Smootherstep (Ken Perlin's improved smoothstep) */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// =============================================================================
// VALUE NOISE
// =============================================================================

/** 1D Value noise */
export function valueNoise1D(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash1D(i), hash1D(i + 1), u);
}

/** 2D Value noise */
export function valueNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const n00 = hash2D(ix, iy);
  const n10 = hash2D(ix + 1, iy);
  const n01 = hash2D(ix, iy + 1);
  const n11 = hash2D(ix + 1, iy + 1);

  return lerp(lerp(n00, n10, ux), lerp(n01, n11, ux), uy);
}

/** 3D Value noise */
export function valueNoise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);

  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const n000 = hash3D(ix, iy, iz);
  const n100 = hash3D(ix + 1, iy, iz);
  const n010 = hash3D(ix, iy + 1, iz);
  const n110 = hash3D(ix + 1, iy + 1, iz);
  const n001 = hash3D(ix, iy, iz + 1);
  const n101 = hash3D(ix + 1, iy, iz + 1);
  const n011 = hash3D(ix, iy + 1, iz + 1);
  const n111 = hash3D(ix + 1, iy + 1, iz + 1);

  const nx00 = lerp(n000, n100, ux);
  const nx10 = lerp(n010, n110, ux);
  const nx01 = lerp(n001, n101, ux);
  const nx11 = lerp(n011, n111, ux);

  const nxy0 = lerp(nx00, nx10, uy);
  const nxy1 = lerp(nx01, nx11, uy);

  return lerp(nxy0, nxy1, uz);
}

// =============================================================================
// GRADIENT NOISE (PERLIN-LIKE)
// =============================================================================

const GRAD_3D = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

function gradientDot3D(hash: number, x: number, y: number, z: number): number {
  const g = GRAD_3D[hash % 12];
  return g[0] * x + g[1] * y + g[2] * z;
}

/** 3D Gradient (Perlin-like) noise */
export function gradientNoise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);

  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const uz = fz * fz * fz * (fz * (fz * 6 - 15) + 10);

  const h000 = hashInt(ix + hashInt(iy + hashInt(iz)));
  const h100 = hashInt(ix + 1 + hashInt(iy + hashInt(iz)));
  const h010 = hashInt(ix + hashInt(iy + 1 + hashInt(iz)));
  const h110 = hashInt(ix + 1 + hashInt(iy + 1 + hashInt(iz)));
  const h001 = hashInt(ix + hashInt(iy + hashInt(iz + 1)));
  const h101 = hashInt(ix + 1 + hashInt(iy + hashInt(iz + 1)));
  const h011 = hashInt(ix + hashInt(iy + 1 + hashInt(iz + 1)));
  const h111 = hashInt(ix + 1 + hashInt(iy + 1 + hashInt(iz + 1)));

  const n000 = gradientDot3D(h000, fx, fy, fz);
  const n100 = gradientDot3D(h100, fx - 1, fy, fz);
  const n010 = gradientDot3D(h010, fx, fy - 1, fz);
  const n110 = gradientDot3D(h110, fx - 1, fy - 1, fz);
  const n001 = gradientDot3D(h001, fx, fy, fz - 1);
  const n101 = gradientDot3D(h101, fx - 1, fy, fz - 1);
  const n011 = gradientDot3D(h011, fx, fy - 1, fz - 1);
  const n111 = gradientDot3D(h111, fx - 1, fy - 1, fz - 1);

  const nx00 = lerp(n000, n100, ux);
  const nx10 = lerp(n010, n110, ux);
  const nx01 = lerp(n001, n101, ux);
  const nx11 = lerp(n011, n111, ux);

  const nxy0 = lerp(nx00, nx10, uy);
  const nxy1 = lerp(nx01, nx11, uy);

  return lerp(nxy0, nxy1, uz) * 0.5 + 0.5;
}

// =============================================================================
// FRACTAL BROWNIAN MOTION (FBM)
// =============================================================================

export interface FBMOptions {
  octaves?: number;
  lacunarity?: number;
  gain?: number;
  amplitude?: number;
  frequency?: number;
}

const DEFAULT_FBM: FBMOptions = {
  octaves: 4,
  lacunarity: 2.0,
  gain: 0.5,
  amplitude: 0.5,
  frequency: 1.0,
};

/** 2D Fractal Brownian Motion */
export function fbm2D(x: number, y: number, options: FBMOptions = {}): number {
  const { octaves, lacunarity, gain, frequency } = { ...DEFAULT_FBM, ...options };
  let value = 0;
  let amp = options.amplitude ?? 0.5;
  let freq = frequency!;
  let maxValue = 0;

  for (let i = 0; i < octaves!; i++) {
    value += amp * valueNoise2D(x * freq, y * freq);
    maxValue += amp;
    amp *= gain!;
    freq *= lacunarity!;
  }

  return value / maxValue;
}

/** 3D Fractal Brownian Motion */
export function fbm3D(x: number, y: number, z: number, options: FBMOptions = {}): number {
  const { octaves, lacunarity, gain, frequency } = { ...DEFAULT_FBM, ...options };
  let value = 0;
  let amp = options.amplitude ?? 0.5;
  let freq = frequency!;
  let maxValue = 0;

  for (let i = 0; i < octaves!; i++) {
    value += amp * valueNoise3D(x * freq, y * freq, z * freq);
    maxValue += amp;
    amp *= gain!;
    freq *= lacunarity!;
  }

  return value / maxValue;
}

/** Ridged FBM - creates ridge-like patterns (mountains, veins) */
export function ridgedFbm3D(x: number, y: number, z: number, options: FBMOptions = {}): number {
  const { octaves, lacunarity, gain, frequency } = { ...DEFAULT_FBM, ...options };
  let value = 0;
  let amp = options.amplitude ?? 0.5;
  let freq = frequency!;
  let weight = 1.0;

  for (let i = 0; i < octaves!; i++) {
    let signal = valueNoise3D(x * freq, y * freq, z * freq);
    signal = 1.0 - Math.abs(signal * 2 - 1); // Ridge
    signal *= signal * weight;
    weight = Math.min(1, Math.max(0, signal * 2));
    value += signal * amp;
    amp *= gain!;
    freq *= lacunarity!;
  }

  return value;
}

/** Turbulence - absolute value FBM (good for clouds, fire) */
export function turbulence3D(x: number, y: number, z: number, options: FBMOptions = {}): number {
  const { octaves, lacunarity, gain, frequency } = { ...DEFAULT_FBM, ...options };
  let value = 0;
  let amp = options.amplitude ?? 0.5;
  let freq = frequency!;

  for (let i = 0; i < octaves!; i++) {
    value += amp * Math.abs(valueNoise3D(x * freq, y * freq, z * freq) * 2 - 1);
    amp *= gain!;
    freq *= lacunarity!;
  }

  return value;
}

// =============================================================================
// DOMAIN WARPING
// =============================================================================

/** Domain warping - creates organic, flowing patterns */
export function warpedFbm2D(x: number, y: number, strength: number = 0.5, options: FBMOptions = {}): number {
  const wx = x + fbm2D(x, y, { ...options, octaves: 2 }) * strength;
  const wy = y + fbm2D(x + 5.2, y + 1.3, { ...options, octaves: 2 }) * strength;
  return fbm2D(wx, wy, options);
}

/** 3D Domain warping */
export function warpedFbm3D(x: number, y: number, z: number, strength: number = 0.5, options: FBMOptions = {}): number {
  const wx = x + fbm3D(x, y, z, { ...options, octaves: 2 }) * strength;
  const wy = y + fbm3D(x + 5.2, y + 1.3, z + 2.8, { ...options, octaves: 2 }) * strength;
  const wz = z + fbm3D(x + 9.1, y + 4.7, z + 3.4, { ...options, octaves: 2 }) * strength;
  return fbm3D(wx, wy, wz, options);
}

// =============================================================================
// VORONOI / WORLEY NOISE
// =============================================================================

/** Voronoi/Worley noise - returns F1 distance (distance to nearest point) */
export function voronoi2D(x: number, y: number): { f1: number; f2: number; cellId: number } {
  const ix = Math.floor(x);
  const iy = Math.floor(y);

  let f1 = Infinity;
  let f2 = Infinity;
  let cellId = 0;

  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = ix + i;
      const cy = iy + j;
      // Random point within cell
      const px = cx + hash2D(cx, cy);
      const py = cy + hash2D(cx + 127, cy + 31);

      const dx = x - px;
      const dy = y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < f1) {
        f2 = f1;
        f1 = dist;
        cellId = hashInt(cx * 1000 + cy);
      } else if (dist < f2) {
        f2 = dist;
      }
    }
  }

  return { f1, f2, cellId };
}

/** 3D Voronoi noise */
export function voronoi3D(x: number, y: number, z: number): { f1: number; f2: number; cellId: number } {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);

  let f1 = Infinity;
  let f2 = Infinity;
  let cellId = 0;

  for (let k = -1; k <= 1; k++) {
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const cx = ix + i;
        const cy = iy + j;
        const cz = iz + k;

        const px = cx + hash3D(cx, cy, cz);
        const py = cy + hash3D(cx + 127, cy + 31, cz + 57);
        const pz = cz + hash3D(cx + 59, cy + 113, cz + 97);

        const dx = x - px;
        const dy = y - py;
        const dz = z - pz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < f1) {
          f2 = f1;
          f1 = dist;
          cellId = hashInt(cx * 1000000 + cy * 1000 + cz);
        } else if (dist < f2) {
          f2 = dist;
        }
      }
    }
  }

  return { f1, f2, cellId };
}

// =============================================================================
// SPECIALTY NOISE
// =============================================================================

/** Billow noise - soft, pillow-like appearance */
export function billow3D(x: number, y: number, z: number, options: FBMOptions = {}): number {
  const { octaves, lacunarity, gain, frequency } = { ...DEFAULT_FBM, ...options };
  let value = 0;
  let amp = options.amplitude ?? 0.5;
  let freq = frequency!;

  for (let i = 0; i < octaves!; i++) {
    const n = valueNoise3D(x * freq, y * freq, z * freq);
    value += amp * (2 * Math.abs(n - 0.5));
    amp *= gain!;
    freq *= lacunarity!;
  }

  return value;
}

/** Swiss cheese noise - good for caves */
export function swissCheese3D(x: number, y: number, z: number, options: FBMOptions = {}): number {
  const n1 = valueNoise3D(x * 0.05, y * 0.05, z * 0.05);
  const n2 = valueNoise3D(x * 0.08 + 100, y * 0.08, z * 0.08);
  return n1 * n2;
}

// =============================================================================
// SEEDED RANDOM
// =============================================================================

/** Create a seeded random number generator */
export function createSeededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/** Shuffle array using Fisher-Yates with seed */
export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = createSeededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
