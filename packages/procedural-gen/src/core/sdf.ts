/**
 * Signed Distance Field (SDF) Primitives and Operations
 *
 * SDFs represent geometry as a function returning distance to nearest surface.
 * These are the building blocks for procedural terrain, caves, rocks, and more.
 *
 * @module core/sdf
 */

import * as THREE from 'three';

// =============================================================================
// TYPES
// =============================================================================

/** A function that returns signed distance from a point to a surface */
export type SDFFunction = (p: THREE.Vector3) => number;

// =============================================================================
// SDF PRIMITIVES
// =============================================================================

/** Sphere SDF */
export function sdSphere(p: THREE.Vector3, center: THREE.Vector3, radius: number): number {
  return p.clone().sub(center).length() - radius;
}

/** Box SDF */
export function sdBox(p: THREE.Vector3, center: THREE.Vector3, halfExtents: THREE.Vector3): number {
  const q = new THREE.Vector3(
    Math.abs(p.x - center.x) - halfExtents.x,
    Math.abs(p.y - center.y) - halfExtents.y,
    Math.abs(p.z - center.z) - halfExtents.z
  );
  const outside = new THREE.Vector3(Math.max(q.x, 0), Math.max(q.y, 0), Math.max(q.z, 0)).length();
  const inside = Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0);
  return outside + inside;
}

/** Rounded Box SDF */
export function sdRoundedBox(p: THREE.Vector3, center: THREE.Vector3, halfExtents: THREE.Vector3, radius: number): number {
  const q = new THREE.Vector3(
    Math.abs(p.x - center.x) - halfExtents.x + radius,
    Math.abs(p.y - center.y) - halfExtents.y + radius,
    Math.abs(p.z - center.z) - halfExtents.z + radius
  );
  return new THREE.Vector3(Math.max(q.x, 0), Math.max(q.y, 0), Math.max(q.z, 0)).length() +
    Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0) - radius;
}

/** Infinite ground plane SDF (y = height) */
export function sdPlane(p: THREE.Vector3, height: number): number {
  return p.y - height;
}

/** Plane with arbitrary normal */
export function sdPlaneNormal(p: THREE.Vector3, normal: THREE.Vector3, distance: number): number {
  return p.dot(normal) - distance;
}

/** Capsule SDF (cylinder with hemispherical caps) */
export function sdCapsule(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, radius: number): number {
  const pa = p.clone().sub(a);
  const ba = b.clone().sub(a);
  const h = Math.max(0, Math.min(1, pa.dot(ba) / ba.dot(ba)));
  return pa.sub(ba.multiplyScalar(h)).length() - radius;
}

/** Cylinder SDF (capped, along Y axis) */
export function sdCylinder(p: THREE.Vector3, center: THREE.Vector3, radius: number, height: number): number {
  const q = p.clone().sub(center);
  const d = new THREE.Vector2(new THREE.Vector2(q.x, q.z).length() - radius, Math.abs(q.y) - height / 2);
  return Math.min(Math.max(d.x, d.y), 0) + new THREE.Vector2(Math.max(d.x, 0), Math.max(d.y, 0)).length();
}

/** Torus SDF */
export function sdTorus(p: THREE.Vector3, center: THREE.Vector3, majorRadius: number, minorRadius: number): number {
  const q = p.clone().sub(center);
  const qxz = Math.sqrt(q.x * q.x + q.z * q.z) - majorRadius;
  return Math.sqrt(qxz * qxz + q.y * q.y) - minorRadius;
}

/** Cone SDF (tip at center, pointing up) */
export function sdCone(p: THREE.Vector3, center: THREE.Vector3, angle: number, height: number): number {
  const q = p.clone().sub(center);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const qLen = new THREE.Vector2(q.x, q.z).length();
  const d = new THREE.Vector2(s * qLen - c * q.y, c * qLen + s * q.y - height);
  return Math.max(d.x, d.y) < 0 ? Math.max(d.x, d.y) : new THREE.Vector2(Math.max(d.x, 0), Math.max(d.y, 0)).length();
}

/** Ellipsoid SDF (approximate) */
export function sdEllipsoid(p: THREE.Vector3, center: THREE.Vector3, radii: THREE.Vector3): number {
  const q = p.clone().sub(center);
  const k0 = new THREE.Vector3(q.x / radii.x, q.y / radii.y, q.z / radii.z);
  const k1 = new THREE.Vector3(q.x / (radii.x * radii.x), q.y / (radii.y * radii.y), q.z / (radii.z * radii.z));
  return (k0.length() * (k0.length() - 1)) / k1.length();
}

// =============================================================================
// BOOLEAN OPERATIONS
// =============================================================================

/** Union - combines two shapes */
export function opUnion(d1: number, d2: number): number {
  return Math.min(d1, d2);
}

/** Subtraction - cuts d2 from d1 */
export function opSubtraction(d1: number, d2: number): number {
  return Math.max(d1, -d2);
}

/** Intersection - keeps overlapping parts */
export function opIntersection(d1: number, d2: number): number {
  return Math.max(d1, d2);
}

/** XOR - symmetric difference */
export function opXor(d1: number, d2: number): number {
  return Math.max(Math.min(d1, d2), -Math.max(d1, d2));
}

// =============================================================================
// SMOOTH OPERATIONS
// =============================================================================

/** Smooth union - blends shapes together */
export function opSmoothUnion(d1: number, d2: number, k: number): number {
  const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
  return Math.min(d1, d2) - h * h * k * 0.25;
}

/** Smooth subtraction */
export function opSmoothSubtraction(d1: number, d2: number, k: number): number {
  const h = Math.max(k - Math.abs(-d1 - d2), 0) / k;
  return Math.max(d1, -d2) + h * h * k * 0.25;
}

/** Smooth intersection */
export function opSmoothIntersection(d1: number, d2: number, k: number): number {
  const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
  return Math.max(d1, d2) + h * h * k * 0.25;
}

// =============================================================================
// DOMAIN TRANSFORMATIONS
// =============================================================================

/** Translate an SDF */
export function opTranslate(sdf: SDFFunction, offset: THREE.Vector3): SDFFunction {
  return (p) => sdf(p.clone().sub(offset));
}

/** Rotate an SDF */
export function opRotate(sdf: SDFFunction, quaternion: THREE.Quaternion): SDFFunction {
  const inv = quaternion.clone().invert();
  return (p) => sdf(p.clone().applyQuaternion(inv));
}

/** Scale an SDF uniformly */
export function opScale(sdf: SDFFunction, scale: number): SDFFunction {
  return (p) => sdf(p.clone().divideScalar(scale)) * scale;
}

/** Repeat SDF infinitely */
export function opRepeat(sdf: SDFFunction, period: THREE.Vector3): SDFFunction {
  return (p) => {
    const q = new THREE.Vector3(
      ((((p.x % period.x) + period.x) % period.x) - period.x * 0.5),
      ((((p.y % period.y) + period.y) % period.y) - period.y * 0.5),
      ((((p.z % period.z) + period.z) % period.z) - period.z * 0.5)
    );
    return sdf(q);
  };
}

/** Twist SDF around Y axis */
export function opTwist(sdf: SDFFunction, amount: number): SDFFunction {
  return (p) => {
    const c = Math.cos(amount * p.y);
    const s = Math.sin(amount * p.y);
    return sdf(new THREE.Vector3(c * p.x - s * p.z, p.y, s * p.x + c * p.z));
  };
}

/** Apply displacement function */
export function opDisplace(sdf: SDFFunction, displacement: (p: THREE.Vector3) => number): SDFFunction {
  return (p) => sdf(p) + displacement(p);
}

// =============================================================================
// NORMAL CALCULATION
// =============================================================================

/** Calculate surface normal using central differences */
export function calcNormal(p: THREE.Vector3, sdf: SDFFunction, epsilon = 0.001): THREE.Vector3 {
  const dx = new THREE.Vector3(epsilon, 0, 0);
  const dy = new THREE.Vector3(0, epsilon, 0);
  const dz = new THREE.Vector3(0, 0, epsilon);
  return new THREE.Vector3(
    sdf(p.clone().add(dx)) - sdf(p.clone().sub(dx)),
    sdf(p.clone().add(dy)) - sdf(p.clone().sub(dy)),
    sdf(p.clone().add(dz)) - sdf(p.clone().sub(dz))
  ).normalize();
}

// =============================================================================
// SDF BUILDER (FLUENT API)
// =============================================================================

/** Fluent API for composing complex SDFs */
export class SDFBuilder {
  private currentSdf: SDFFunction | null = null;
  private pendingOp: { type: string; k?: number } | null = null;

  sphere(center: THREE.Vector3, radius: number): this {
    return this.addShape((p) => sdSphere(p, center, radius));
  }

  box(center: THREE.Vector3, halfExtents: THREE.Vector3): this {
    return this.addShape((p) => sdBox(p, center, halfExtents));
  }

  torus(center: THREE.Vector3, major: number, minor: number): this {
    return this.addShape((p) => sdTorus(p, center, major, minor));
  }

  capsule(a: THREE.Vector3, b: THREE.Vector3, radius: number): this {
    return this.addShape((p) => sdCapsule(p, a, b, radius));
  }

  custom(sdf: SDFFunction): this {
    return this.addShape(sdf);
  }

  union(): this { this.pendingOp = { type: 'union' }; return this; }
  subtract(): this { this.pendingOp = { type: 'subtract' }; return this; }
  intersect(): this { this.pendingOp = { type: 'intersect' }; return this; }
  smoothUnion(k: number): this { this.pendingOp = { type: 'smooth_union', k }; return this; }
  smoothSubtract(k: number): this { this.pendingOp = { type: 'smooth_subtract', k }; return this; }

  build(): SDFFunction {
    return this.currentSdf ?? (() => Infinity);
  }

  private addShape(sdf: SDFFunction): this {
    if (!this.currentSdf) {
      this.currentSdf = sdf;
      return this;
    }
    const prev = this.currentSdf;
    const op = this.pendingOp ?? { type: 'union' };
    switch (op.type) {
      case 'union': this.currentSdf = (p) => opUnion(prev(p), sdf(p)); break;
      case 'subtract': this.currentSdf = (p) => opSubtraction(prev(p), sdf(p)); break;
      case 'intersect': this.currentSdf = (p) => opIntersection(prev(p), sdf(p)); break;
      case 'smooth_union': this.currentSdf = (p) => opSmoothUnion(prev(p), sdf(p), op.k!); break;
      case 'smooth_subtract': this.currentSdf = (p) => opSmoothSubtraction(prev(p), sdf(p), op.k!); break;
    }
    this.pendingOp = null;
    return this;
  }
}
