/**
 * GPU Instancing System
 *
 * Efficient rendering of thousands of objects using GPU instancing.
 * Supports LOD, frustum culling, and animated instances.
 *
 * @module core/instancing
 */

import * as THREE from 'three';
import { fbm2D, createSeededRandom } from './noise';

// =============================================================================
// TYPES
// =============================================================================

/** Data for a single instance */
export interface InstanceData {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  /** Custom data (color, animation phase, etc.) */
  userData?: Record<string, number>;
}

/** Configuration for instance generation */
export interface InstanceGeneratorConfig {
  /** Number of instances to generate */
  count: number;
  /** Area size (width x depth) */
  areaSize: number | [number, number];
  /** Height function (returns Y at given X, Z) */
  heightFunction?: (x: number, z: number) => number;
  /** Density function (0-1, controls spawn probability) */
  densityFunction?: (x: number, z: number) => number;
  /** Minimum allowed height */
  minHeight?: number;
  /** Maximum allowed height */
  maxHeight?: number;
  /** Random seed */
  seed?: number;
  /** Scale range [min, max] */
  scaleRange?: [number, number];
  /** Uniform scale (same X, Y, Z) */
  uniformScale?: boolean;
  /** Random rotation around Y axis */
  randomYRotation?: boolean;
  /** Random tilt (X and Z rotation) */
  randomTilt?: number;
  /** Clustering strength (0 = uniform, 1 = highly clustered) */
  clustering?: number;
  /** Minimum distance between instances */
  minDistance?: number;
}

/** LOD level configuration */
export interface LODLevel {
  /** Distance at which this LOD activates */
  distance: number;
  /** Geometry for this LOD (null = hidden) */
  geometry: THREE.BufferGeometry | null;
  /** Material for this LOD */
  material?: THREE.Material;
}

// =============================================================================
// INSTANCE GENERATOR
// =============================================================================

/**
 * Generate instance data based on configuration
 */
export function generateInstances(config: InstanceGeneratorConfig): InstanceData[] {
  const {
    count,
    areaSize,
    heightFunction = () => 0,
    densityFunction = () => 1,
    minHeight = -Infinity,
    maxHeight = Infinity,
    seed = Date.now(),
    scaleRange = [0.8, 1.2],
    uniformScale = true,
    randomYRotation = true,
    randomTilt = 0,
    clustering = 0.5,
    minDistance = 0,
  } = config;

  const [areaW, areaD] = Array.isArray(areaSize) ? areaSize : [areaSize, areaSize];
  const halfW = areaW / 2;
  const halfD = areaD / 2;

  const random = createSeededRandom(seed);
  const instances: InstanceData[] = [];
  const positions: THREE.Vector2[] = [];

  let attempts = 0;
  const maxAttempts = count * 20;

  while (instances.length < count && attempts < maxAttempts) {
    attempts++;

    // Generate candidate position
    let x = (random() - 0.5) * areaW;
    let z = (random() - 0.5) * areaD;

    // Apply clustering via noise
    if (clustering > 0) {
      const clusterNoise = fbm2D(x * 0.02, z * 0.02, { octaves: 3 });
      if (random() > clusterNoise * (1 + clustering)) {
        continue;
      }
    }

    // Check density function
    const density = densityFunction(x, z);
    if (random() > density) {
      continue;
    }

    // Get height
    const y = heightFunction(x, z);

    // Check height bounds
    if (y < minHeight || y > maxHeight) {
      continue;
    }

    // Check minimum distance
    if (minDistance > 0) {
      const pos2D = new THREE.Vector2(x, z);
      const tooClose = positions.some(p => p.distanceTo(pos2D) < minDistance);
      if (tooClose) {
        continue;
      }
      positions.push(pos2D);
    }

    // Generate rotation
    const rotation = new THREE.Euler(
      randomTilt > 0 ? (random() - 0.5) * randomTilt : 0,
      randomYRotation ? random() * Math.PI * 2 : 0,
      randomTilt > 0 ? (random() - 0.5) * randomTilt : 0
    );

    // Generate scale
    const baseScale = scaleRange[0] + random() * (scaleRange[1] - scaleRange[0]);
    const scale = uniformScale
      ? new THREE.Vector3(baseScale, baseScale, baseScale)
      : new THREE.Vector3(
          scaleRange[0] + random() * (scaleRange[1] - scaleRange[0]),
          scaleRange[0] + random() * (scaleRange[1] - scaleRange[0]),
          scaleRange[0] + random() * (scaleRange[1] - scaleRange[0])
        );

    instances.push({
      position: new THREE.Vector3(x, y, z),
      rotation,
      scale,
      userData: {
        phase: random() * Math.PI * 2, // For animation
        windInfluence: 0.5 + random() * 0.5,
      },
    });
  }

  return instances;
}

// =============================================================================
// INSTANCED MESH MANAGER
// =============================================================================

/**
 * Manages an InstancedMesh with utilities for updates and animations
 */
export class InstancedMeshManager {
  mesh: THREE.InstancedMesh;
  private instances: InstanceData[];
  private tempMatrix: THREE.Matrix4;
  private tempPosition: THREE.Vector3;
  private tempQuaternion: THREE.Quaternion;
  private tempScale: THREE.Vector3;
  private tempEuler: THREE.Euler;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    instances: InstanceData[]
  ) {
    this.instances = instances;
    this.mesh = new THREE.InstancedMesh(geometry, material, instances.length);
    this.mesh.frustumCulled = true;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.tempMatrix = new THREE.Matrix4();
    this.tempPosition = new THREE.Vector3();
    this.tempQuaternion = new THREE.Quaternion();
    this.tempScale = new THREE.Vector3();
    this.tempEuler = new THREE.Euler();

    this.updateAllMatrices();
  }

  /** Update all instance matrices */
  updateAllMatrices(): void {
    for (let i = 0; i < this.instances.length; i++) {
      this.updateMatrix(i);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Update a single instance matrix */
  updateMatrix(index: number): void {
    const instance = this.instances[index];
    this.tempQuaternion.setFromEuler(instance.rotation);
    this.tempMatrix.compose(instance.position, this.tempQuaternion, instance.scale);
    this.mesh.setMatrixAt(index, this.tempMatrix);
  }

  /** Get instance data */
  getInstance(index: number): InstanceData {
    return this.instances[index];
  }

  /** Set instance position */
  setPosition(index: number, position: THREE.Vector3): void {
    this.instances[index].position.copy(position);
    this.updateMatrix(index);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Set instance rotation */
  setRotation(index: number, rotation: THREE.Euler): void {
    this.instances[index].rotation.copy(rotation);
    this.updateMatrix(index);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Set instance scale */
  setScale(index: number, scale: THREE.Vector3): void {
    this.instances[index].scale.copy(scale);
    this.updateMatrix(index);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Apply wind animation to all instances */
  applyWind(time: number, strength: number = 0.3, frequency: number = 2): void {
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      const phase = instance.userData?.phase ?? 0;
      const influence = instance.userData?.windInfluence ?? 1;

      this.mesh.getMatrixAt(i, this.tempMatrix);
      this.tempMatrix.decompose(this.tempPosition, this.tempQuaternion, this.tempScale);

      // Calculate wind bend
      const windPhase = time * frequency + instance.position.x * 0.1 + instance.position.z * 0.1 + phase;
      const bendAngle = Math.sin(windPhase) * strength * influence;

      // Apply bend as rotation
      const originalRotation = instance.rotation;
      this.tempEuler.set(
        originalRotation.x + bendAngle * 0.5,
        originalRotation.y,
        originalRotation.z + bendAngle * 0.3
      );
      this.tempQuaternion.setFromEuler(this.tempEuler);

      this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
      this.mesh.setMatrixAt(i, this.tempMatrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Apply LOD based on camera distance */
  applyLOD(camera: THREE.Camera, lodDistances: number[]): void {
    const cameraPos = camera.position;

    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      const dist = instance.position.distanceTo(cameraPos);

      // Find LOD level
      let lodLevel = 0;
      for (let l = 0; l < lodDistances.length; l++) {
        if (dist > lodDistances[l]) {
          lodLevel = l + 1;
        }
      }

      // Scale down or hide distant instances
      const scaleFactor = lodLevel >= lodDistances.length ? 0 : 1 - lodLevel * 0.2;

      this.mesh.getMatrixAt(i, this.tempMatrix);
      this.tempMatrix.decompose(this.tempPosition, this.tempQuaternion, this.tempScale);

      this.tempScale.copy(instance.scale).multiplyScalar(scaleFactor);
      this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
      this.mesh.setMatrixAt(i, this.tempMatrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Get count */
  get count(): number {
    return this.instances.length;
  }

  /** Dispose */
  dispose(): void {
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(m => m.dispose());
    } else {
      this.mesh.material.dispose();
    }
  }
}

// =============================================================================
// VEGETATION PRESETS
// =============================================================================

/** Create grass blade geometry */
export function createGrassGeometry(
  height: number = 1,
  width: number = 0.1,
  segments: number = 3
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const halfWidth = width / 2;
  const segmentHeight = height / segments;

  for (let i = 0; i <= segments; i++) {
    const y = i * segmentHeight;
    const t = i / segments;
    const w = halfWidth * (1 - t * 0.8); // Taper towards top

    positions.push(-w, y, 0);
    positions.push(w, y, 0);

    normals.push(0, 0, 1);
    normals.push(0, 0, 1);

    uvs.push(0, t);
    uvs.push(1, t);
  }

  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const base = i * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

/** Create simple tree geometry (cone + cylinder trunk) */
export function createSimpleTreeGeometry(
  trunkHeight: number = 2,
  trunkRadius: number = 0.2,
  canopyHeight: number = 4,
  canopyRadius: number = 1.5
): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 6);
  trunk.translate(0, trunkHeight / 2, 0);

  const canopy = new THREE.ConeGeometry(canopyRadius, canopyHeight, 8);
  canopy.translate(0, trunkHeight + canopyHeight / 2, 0);

  // Merge geometries
  const geometry = new THREE.BufferGeometry();
  const mergedPositions: number[] = [];
  const mergedNormals: number[] = [];

  const trunkPos = trunk.attributes.position.array;
  const trunkNorm = trunk.attributes.normal.array;
  for (let i = 0; i < trunkPos.length; i++) {
    mergedPositions.push(trunkPos[i]);
  }
  for (let i = 0; i < trunkNorm.length; i++) {
    mergedNormals.push(trunkNorm[i]);
  }

  const canopyPos = canopy.attributes.position.array;
  const canopyNorm = canopy.attributes.normal.array;
  for (let i = 0; i < canopyPos.length; i++) {
    mergedPositions.push(canopyPos[i]);
  }
  for (let i = 0; i < canopyNorm.length; i++) {
    mergedNormals.push(canopyNorm[i]);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(mergedPositions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(mergedNormals, 3));

  // Merge indices
  const trunkIndices = trunk.index!.array;
  const canopyIndices = canopy.index!.array;
  const mergedIndices: number[] = [];

  for (let i = 0; i < trunkIndices.length; i++) {
    mergedIndices.push(trunkIndices[i]);
  }

  const offset = trunk.attributes.position.count;
  for (let i = 0; i < canopyIndices.length; i++) {
    mergedIndices.push(canopyIndices[i] + offset);
  }

  geometry.setIndex(mergedIndices);

  trunk.dispose();
  canopy.dispose();

  return geometry;
}

/** Create rock geometry (distorted icosahedron) */
export function createRockGeometry(
  radius: number = 0.5,
  detail: number = 1,
  seed: number = 0
): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  const positions = geometry.attributes.position.array as Float32Array;
  const random = createSeededRandom(seed);

  // Distort vertices
  for (let i = 0; i < positions.length; i += 3) {
    const distortion = 0.7 + random() * 0.6;
    positions[i] *= distortion;
    positions[i + 1] *= distortion * (0.5 + random() * 0.5); // Flatten a bit
    positions[i + 2] *= distortion;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

// =============================================================================
// BATCH RENDERER
// =============================================================================

/**
 * Batch multiple instance types into a single draw call where possible
 */
export class BatchRenderer {
  private batches: Map<string, InstancedMeshManager> = new Map();
  private group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'BatchRenderer';
  }

  /** Add a batch */
  addBatch(
    id: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    instances: InstanceData[]
  ): InstancedMeshManager {
    const manager = new InstancedMeshManager(geometry, material, instances);
    this.batches.set(id, manager);
    this.group.add(manager.mesh);
    return manager;
  }

  /** Get a batch */
  getBatch(id: string): InstancedMeshManager | undefined {
    return this.batches.get(id);
  }

  /** Remove a batch */
  removeBatch(id: string): boolean {
    const batch = this.batches.get(id);
    if (batch) {
      this.group.remove(batch.mesh);
      batch.dispose();
      return this.batches.delete(id);
    }
    return false;
  }

  /** Get the Three.js group */
  getGroup(): THREE.Group {
    return this.group;
  }

  /** Update all batches (e.g., for wind animation) */
  update(time: number, camera?: THREE.Camera, windEnabled = true): void {
    this.batches.forEach(batch => {
      if (windEnabled) {
        batch.applyWind(time);
      }
      if (camera) {
        batch.applyLOD(camera, [50, 100, 150]);
      }
    });
  }

  /** Dispose all */
  dispose(): void {
    this.batches.forEach(batch => batch.dispose());
    this.batches.clear();
  }
}
