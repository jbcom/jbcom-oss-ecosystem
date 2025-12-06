/**
 * Signed Distance Field (SDF) Primitives and Operations
 *
 * SDFs represent geometry as a function that returns the distance to the nearest surface.
 * Negative values are inside, positive values are outside.
 *
 * These functions work both on CPU (for marching cubes) and can be ported to GLSL for raymarching.
 * See the `shaders` module for GLSL implementations.
 *
 * @module core/sdf
 */

import * as THREE from 'three';

// =============================================================================
// TYPES
// =============================================================================

/** A function that returns the signed distance from a point to a surface */
export type SDFFunction = (p: THREE.Vector3) => number;

/** A function that combines two SDF distances */
export type SDFOperation = (d1: number, d2: number) => number;

/** A smooth operation with a blending factor */
export type SmoothSDFOperation = (d1: number, d2: number, k: number) => number;

// =============================================================================
// SDF PRIMITIVES
// =============================================================================

/**
 * Sphere SDF - returns distance to sphere surface
 *
 * @param p - Point to evaluate
 * @param center - Center of the sphere
 * @param radius - Radius of the sphere
 * @returns Signed distance (negative inside, positive outside)
 *
 * @example
 * ```ts
 * const dist = sdSphere(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 1);
 * // dist === -1 (point is 1 unit inside the sphere)
 * ```
 */
export function sdSphere(
  p: THREE.Vector3,
  center: THREE.Vector3,
  radius: number
): number {
  return p.clone().sub(center).length() - radius;
}

/**
 * Box SDF - returns distance to box surface
 *
 * @param p - Point to evaluate
 * @param center - Center of the box
 * @param halfExtents - Half-size of the box in each dimension
 * @returns Signed distance
 */
export function sdBox(
  p: THREE.Vector3,
  center: THREE.Vector3,
  halfExtents: THREE.Vector3
): number {
  const q = new THREE.Vector3(
    Math.abs(p.x - center.x) - halfExtents.x,
    Math.abs(p.y - center.y) - halfExtents.y,
    Math.abs(p.z - center.z) - halfExtents.z
  );
  const outside = new THREE.Vector3(
    Math.max(q.x, 0),
    Math.max(q.y, 0),
    Math.max(q.z, 0)
  ).length();
  const inside = Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0);
  return outside + inside;
}

/**
 * Rounded Box SDF - box with rounded edges
 *
 * @param p - Point to evaluate
 * @param center - Center of the box
 * @param halfExtents - Half-size of the box in each dimension
 * @param radius - Corner rounding radius
 * @returns Signed distance
 */
export function sdRoundedBox(
  p: THREE.Vector3,
  center: THREE.Vector3,
  halfExtents: THREE.Vector3,
  radius: number
): number {
  const q = new THREE.Vector3(
    Math.abs(p.x - center.x) - halfExtents.x + radius,
    Math.abs(p.y - center.y) - halfExtents.y + radius,
    Math.abs(p.z - center.z) - halfExtents.z + radius
  );
  const outside = new THREE.Vector3(
    Math.max(q.x, 0),
    Math.max(q.y, 0),
    Math.max(q.z, 0)
  ).length();
  const inside = Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0);
  return outside + inside - radius;
}

/**
 * Infinite ground plane SDF (y = height)
 *
 * @param p - Point to evaluate
 * @param height - Y-coordinate of the plane
 * @returns Signed distance (negative below plane)
 */
export function sdPlane(p: THREE.Vector3, height: number): number {
  return p.y - height;
}

/**
 * Plane SDF with arbitrary normal
 *
 * @param p - Point to evaluate
 * @param normal - Plane normal (should be normalized)
 * @param distance - Distance from origin along normal
 * @returns Signed distance
 */
export function sdPlaneNormal(
  p: THREE.Vector3,
  normal: THREE.Vector3,
  distance: number
): number {
  return p.dot(normal) - distance;
}

/**
 * Capsule SDF - cylinder with hemispherical caps
 *
 * @param p - Point to evaluate
 * @param a - Start point of capsule
 * @param b - End point of capsule
 * @param radius - Radius of the capsule
 * @returns Signed distance
 */
export function sdCapsule(
  p: THREE.Vector3,
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number
): number {
  const pa = p.clone().sub(a);
  const ba = b.clone().sub(a);
  const h = Math.max(0, Math.min(1, pa.dot(ba) / ba.dot(ba)));
  return pa.sub(ba.multiplyScalar(h)).length() - radius;
}

/**
 * Cylinder SDF - capped cylinder along Y axis
 *
 * @param p - Point to evaluate
 * @param center - Center of the cylinder base
 * @param radius - Radius of the cylinder
 * @param height - Height of the cylinder
 * @returns Signed distance
 */
export function sdCylinder(
  p: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
  height: number
): number {
  const q = p.clone().sub(center);
  const d = new THREE.Vector2(
    new THREE.Vector2(q.x, q.z).length() - radius,
    Math.abs(q.y) - height / 2
  );
  return (
    Math.min(Math.max(d.x, d.y), 0) +
    new THREE.Vector2(Math.max(d.x, 0), Math.max(d.y, 0)).length()
  );
}

/**
 * Torus SDF - donut shape
 *
 * @param p - Point to evaluate
 * @param center - Center of the torus
 * @param majorRadius - Distance from center to tube center
 * @param minorRadius - Radius of the tube
 * @returns Signed distance
 */
export function sdTorus(
  p: THREE.Vector3,
  center: THREE.Vector3,
  majorRadius: number,
  minorRadius: number
): number {
  const q = p.clone().sub(center);
  const qxz = Math.sqrt(q.x * q.x + q.z * q.z) - majorRadius;
  return Math.sqrt(qxz * qxz + q.y * q.y) - minorRadius;
}

/**
 * Cone SDF - tip at origin, pointing up
 *
 * @param p - Point to evaluate
 * @param center - Tip position
 * @param angle - Half-angle of the cone in radians
 * @param height - Height of the cone
 * @returns Signed distance
 */
export function sdCone(
  p: THREE.Vector3,
  center: THREE.Vector3,
  angle: number,
  height: number
): number {
  const q = p.clone().sub(center);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const qLen = new THREE.Vector2(q.x, q.z).length();
  const d = new THREE.Vector2(s * qLen - c * q.y, c * qLen + s * q.y - height);
  const a = Math.max(d.x, d.y);
  const b = new THREE.Vector2(Math.max(d.x, 0), Math.max(d.y, 0)).length();
  return a < 0 ? a : b;
}

/**
 * Ellipsoid SDF - stretched sphere
 *
 * @param p - Point to evaluate
 * @param center - Center of the ellipsoid
 * @param radii - Radii in each dimension
 * @returns Signed distance (approximate)
 */
export function sdEllipsoid(
  p: THREE.Vector3,
  center: THREE.Vector3,
  radii: THREE.Vector3
): number {
  const q = p.clone().sub(center);
  const k0 = new THREE.Vector3(q.x / radii.x, q.y / radii.y, q.z / radii.z);
  const k1 = new THREE.Vector3(
    q.x / (radii.x * radii.x),
    q.y / (radii.y * radii.y),
    q.z / (radii.z * radii.z)
  );
  return (k0.length() * (k0.length() - 1)) / k1.length();
}

// =============================================================================
// SDF BOOLEAN OPERATIONS
// =============================================================================

/**
 * Union - combines two shapes (logical OR)
 *
 * @param d1 - Distance to first shape
 * @param d2 - Distance to second shape
 * @returns Combined distance
 */
export function opUnion(d1: number, d2: number): number {
  return Math.min(d1, d2);
}

/**
 * Subtraction - cuts second shape from first (logical AND NOT)
 *
 * @param d1 - Distance to shape to cut from
 * @param d2 - Distance to cutting shape
 * @returns Combined distance
 */
export function opSubtraction(d1: number, d2: number): number {
  return Math.max(d1, -d2);
}

/**
 * Intersection - keeps only overlapping parts (logical AND)
 *
 * @param d1 - Distance to first shape
 * @param d2 - Distance to second shape
 * @returns Combined distance
 */
export function opIntersection(d1: number, d2: number): number {
  return Math.max(d1, d2);
}

/**
 * XOR - symmetric difference of two shapes
 *
 * @param d1 - Distance to first shape
 * @param d2 - Distance to second shape
 * @returns Combined distance
 */
export function opXor(d1: number, d2: number): number {
  return Math.max(Math.min(d1, d2), -Math.max(d1, d2));
}

// =============================================================================
// SMOOTH SDF OPERATIONS
// =============================================================================

/**
 * Smooth union - blends two shapes together
 *
 * @param d1 - Distance to first shape
 * @param d2 - Distance to second shape
 * @param k - Smoothing factor (higher = more blend)
 * @returns Blended distance
 */
export function opSmoothUnion(d1: number, d2: number, k: number): number {
  const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
  return Math.min(d1, d2) - h * h * k * 0.25;
}

/**
 * Smooth subtraction - smoothly cuts second shape from first
 *
 * @param d1 - Distance to shape to cut from
 * @param d2 - Distance to cutting shape
 * @param k - Smoothing factor
 * @returns Blended distance
 */
export function opSmoothSubtraction(d1: number, d2: number, k: number): number {
  const h = Math.max(k - Math.abs(-d1 - d2), 0) / k;
  return Math.max(d1, -d2) + h * h * k * 0.25;
}

/**
 * Smooth intersection - smoothly intersects two shapes
 *
 * @param d1 - Distance to first shape
 * @param d2 - Distance to second shape
 * @param k - Smoothing factor
 * @returns Blended distance
 */
export function opSmoothIntersection(
  d1: number,
  d2: number,
  k: number
): number {
  const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
  return Math.max(d1, d2) + h * h * k * 0.25;
}

// =============================================================================
// SDF DOMAIN OPERATIONS
// =============================================================================

/**
 * Create a function that applies a translation to an SDF
 *
 * @param sdf - The SDF function to transform
 * @param offset - Translation offset
 * @returns Transformed SDF function
 */
export function opTranslate(
  sdf: SDFFunction,
  offset: THREE.Vector3
): SDFFunction {
  return (p: THREE.Vector3) => sdf(p.clone().sub(offset));
}

/**
 * Create a function that applies a rotation to an SDF
 *
 * @param sdf - The SDF function to transform
 * @param quaternion - Rotation quaternion
 * @returns Transformed SDF function
 */
export function opRotate(
  sdf: SDFFunction,
  quaternion: THREE.Quaternion
): SDFFunction {
  const inverseQuat = quaternion.clone().invert();
  return (p: THREE.Vector3) => sdf(p.clone().applyQuaternion(inverseQuat));
}

/**
 * Create a function that applies uniform scaling to an SDF
 *
 * @param sdf - The SDF function to transform
 * @param scale - Scale factor
 * @returns Transformed SDF function
 */
export function opScale(sdf: SDFFunction, scale: number): SDFFunction {
  return (p: THREE.Vector3) => sdf(p.clone().divideScalar(scale)) * scale;
}

/**
 * Create a function that repeats an SDF infinitely in space
 *
 * @param sdf - The SDF function to repeat
 * @param period - Repetition period in each dimension
 * @returns Repeated SDF function
 */
export function opRepeat(
  sdf: SDFFunction,
  period: THREE.Vector3
): SDFFunction {
  return (p: THREE.Vector3) => {
    const q = new THREE.Vector3(
      ((((p.x % period.x) + period.x) % period.x) - period.x * 0.5),
      ((((p.y % period.y) + period.y) % period.y) - period.y * 0.5),
      ((((p.z % period.z) + period.z) % period.z) - period.z * 0.5)
    );
    return sdf(q);
  };
}

/**
 * Create a function that repeats an SDF a limited number of times
 *
 * @param sdf - The SDF function to repeat
 * @param period - Repetition period in each dimension
 * @param count - Number of repetitions in each dimension
 * @returns Repeated SDF function
 */
export function opRepeatLimited(
  sdf: SDFFunction,
  period: THREE.Vector3,
  count: THREE.Vector3
): SDFFunction {
  return (p: THREE.Vector3) => {
    const q = new THREE.Vector3(
      p.x - period.x * Math.max(-count.x, Math.min(count.x, Math.round(p.x / period.x))),
      p.y - period.y * Math.max(-count.y, Math.min(count.y, Math.round(p.y / period.y))),
      p.z - period.z * Math.max(-count.z, Math.min(count.z, Math.round(p.z / period.z)))
    );
    return sdf(q);
  };
}

/**
 * Apply displacement to an SDF using a function
 *
 * @param sdf - The SDF function to displace
 * @param displacement - Function returning displacement amount at each point
 * @returns Displaced SDF function
 */
export function opDisplace(
  sdf: SDFFunction,
  displacement: (p: THREE.Vector3) => number
): SDFFunction {
  return (p: THREE.Vector3) => sdf(p) + displacement(p);
}

/**
 * Twist an SDF around the Y axis
 *
 * @param sdf - The SDF function to twist
 * @param twistAmount - Twist amount per unit height
 * @returns Twisted SDF function
 */
export function opTwist(sdf: SDFFunction, twistAmount: number): SDFFunction {
  return (p: THREE.Vector3) => {
    const c = Math.cos(twistAmount * p.y);
    const s = Math.sin(twistAmount * p.y);
    const q = new THREE.Vector3(c * p.x - s * p.z, p.y, s * p.x + c * p.z);
    return sdf(q);
  };
}

/**
 * Bend an SDF around the Y axis
 *
 * @param sdf - The SDF function to bend
 * @param bendAmount - Bend amount
 * @returns Bent SDF function
 */
export function opBend(sdf: SDFFunction, bendAmount: number): SDFFunction {
  return (p: THREE.Vector3) => {
    const c = Math.cos(bendAmount * p.x);
    const s = Math.sin(bendAmount * p.x);
    const q = new THREE.Vector3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
    return sdf(q);
  };
}

// =============================================================================
// NORMAL CALCULATION
// =============================================================================

/**
 * Calculate the gradient (normal) of an SDF at a point using central differences
 *
 * @param p - Point to evaluate
 * @param sdf - The SDF function
 * @param epsilon - Step size for numerical differentiation (default 0.001)
 * @returns Normalized gradient vector (surface normal)
 */
export function calcNormal(
  p: THREE.Vector3,
  sdf: SDFFunction,
  epsilon: number = 0.001
): THREE.Vector3 {
  const dx = new THREE.Vector3(epsilon, 0, 0);
  const dy = new THREE.Vector3(0, epsilon, 0);
  const dz = new THREE.Vector3(0, 0, epsilon);

  const gradX = sdf(p.clone().add(dx)) - sdf(p.clone().sub(dx));
  const gradY = sdf(p.clone().add(dy)) - sdf(p.clone().sub(dy));
  const gradZ = sdf(p.clone().add(dz)) - sdf(p.clone().sub(dz));

  return new THREE.Vector3(gradX, gradY, gradZ).normalize();
}

/**
 * Calculate normal using tetrahedron technique (more accurate, 4 samples instead of 6)
 *
 * @param p - Point to evaluate
 * @param sdf - The SDF function
 * @param epsilon - Step size for numerical differentiation
 * @returns Normalized gradient vector
 */
export function calcNormalTetrahedron(
  p: THREE.Vector3,
  sdf: SDFFunction,
  epsilon: number = 0.001
): THREE.Vector3 {
  const k = new THREE.Vector2(1, -1);

  const xyy = new THREE.Vector3(k.x, k.y, k.y).multiplyScalar(epsilon);
  const yyx = new THREE.Vector3(k.y, k.y, k.x).multiplyScalar(epsilon);
  const yxy = new THREE.Vector3(k.y, k.x, k.y).multiplyScalar(epsilon);
  const xxx = new THREE.Vector3(k.x, k.x, k.x).multiplyScalar(epsilon);

  return new THREE.Vector3(
    k.x * sdf(p.clone().add(xyy)) +
      k.y * sdf(p.clone().add(yyx)) +
      k.y * sdf(p.clone().add(yxy)) +
      k.x * sdf(p.clone().add(xxx)),
    k.y * sdf(p.clone().add(xyy)) +
      k.y * sdf(p.clone().add(yyx)) +
      k.x * sdf(p.clone().add(yxy)) +
      k.x * sdf(p.clone().add(xxx)),
    k.y * sdf(p.clone().add(xyy)) +
      k.x * sdf(p.clone().add(yyx)) +
      k.y * sdf(p.clone().add(yxy)) +
      k.x * sdf(p.clone().add(xxx))
  ).normalize();
}

// =============================================================================
// SDF BUILDER (FLUENT API)
// =============================================================================

/**
 * Fluent builder for composing complex SDFs
 *
 * @example
 * ```ts
 * const complexSDF = new SDFBuilder()
 *   .sphere(new THREE.Vector3(0, 0, 0), 1)
 *   .smoothUnion(0.3)
 *   .sphere(new THREE.Vector3(1, 0, 0), 0.8)
 *   .subtract()
 *   .box(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.5, 0.5, 0.5))
 *   .build();
 * ```
 */
export class SDFBuilder {
  private operations: Array<{
    sdf: SDFFunction;
    operation: 'union' | 'subtract' | 'intersect' | 'smooth_union' | 'smooth_subtract' | 'smooth_intersect';
    smoothK?: number;
  }> = [];

  private currentSdf: SDFFunction | null = null;
  private pendingOperation:
    | {
        op: 'union' | 'subtract' | 'intersect' | 'smooth_union' | 'smooth_subtract' | 'smooth_intersect';
        k?: number;
      }
    | null = null;

  /**
   * Add a sphere to the composition
   */
  sphere(center: THREE.Vector3, radius: number): SDFBuilder {
    this.addShape((p) => sdSphere(p, center, radius));
    return this;
  }

  /**
   * Add a box to the composition
   */
  box(center: THREE.Vector3, halfExtents: THREE.Vector3): SDFBuilder {
    this.addShape((p) => sdBox(p, center, halfExtents));
    return this;
  }

  /**
   * Add a torus to the composition
   */
  torus(
    center: THREE.Vector3,
    majorRadius: number,
    minorRadius: number
  ): SDFBuilder {
    this.addShape((p) => sdTorus(p, center, majorRadius, minorRadius));
    return this;
  }

  /**
   * Add a capsule to the composition
   */
  capsule(a: THREE.Vector3, b: THREE.Vector3, radius: number): SDFBuilder {
    this.addShape((p) => sdCapsule(p, a, b, radius));
    return this;
  }

  /**
   * Add a custom SDF to the composition
   */
  custom(sdf: SDFFunction): SDFBuilder {
    this.addShape(sdf);
    return this;
  }

  /**
   * Set the next operation to union
   */
  union(): SDFBuilder {
    this.pendingOperation = { op: 'union' };
    return this;
  }

  /**
   * Set the next operation to subtraction
   */
  subtract(): SDFBuilder {
    this.pendingOperation = { op: 'subtract' };
    return this;
  }

  /**
   * Set the next operation to intersection
   */
  intersect(): SDFBuilder {
    this.pendingOperation = { op: 'intersect' };
    return this;
  }

  /**
   * Set the next operation to smooth union
   */
  smoothUnion(k: number): SDFBuilder {
    this.pendingOperation = { op: 'smooth_union', k };
    return this;
  }

  /**
   * Set the next operation to smooth subtraction
   */
  smoothSubtract(k: number): SDFBuilder {
    this.pendingOperation = { op: 'smooth_subtract', k };
    return this;
  }

  /**
   * Set the next operation to smooth intersection
   */
  smoothIntersect(k: number): SDFBuilder {
    this.pendingOperation = { op: 'smooth_intersect', k };
    return this;
  }

  /**
   * Build the final SDF function
   */
  build(): SDFFunction {
    if (!this.currentSdf) {
      return () => Infinity;
    }
    return this.currentSdf;
  }

  private addShape(sdf: SDFFunction): void {
    if (!this.currentSdf) {
      this.currentSdf = sdf;
      return;
    }

    const op = this.pendingOperation || { op: 'union' as const };
    const prevSdf = this.currentSdf;

    switch (op.op) {
      case 'union':
        this.currentSdf = (p) => opUnion(prevSdf(p), sdf(p));
        break;
      case 'subtract':
        this.currentSdf = (p) => opSubtraction(prevSdf(p), sdf(p));
        break;
      case 'intersect':
        this.currentSdf = (p) => opIntersection(prevSdf(p), sdf(p));
        break;
      case 'smooth_union':
        this.currentSdf = (p) => opSmoothUnion(prevSdf(p), sdf(p), op.k!);
        break;
      case 'smooth_subtract':
        this.currentSdf = (p) => opSmoothSubtraction(prevSdf(p), sdf(p), op.k!);
        break;
      case 'smooth_intersect':
        this.currentSdf = (p) => opSmoothIntersection(prevSdf(p), sdf(p), op.k!);
        break;
    }

    this.pendingOperation = null;
  }
}
