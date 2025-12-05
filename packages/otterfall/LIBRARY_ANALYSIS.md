# Library Analysis - Patterns That Could Use Existing Libraries

This document identifies hand-rolled implementations in the Otterfall codebase that would be better served by battle-tested libraries.

## 🔴 Critical - Major Refactoring Recommended

### 1. Physics System (`Player.tsx`)

**Current Implementation:**
```typescript
// Hand-rolled physics constants
const GRAVITY = 0.015;
const JUMP_FORCE = 0.35;
const MAX_STEP_HEIGHT = 0.5;
const BUOYANCY_FORCE = 0.008;

// Custom ellipsoid collision with rocks
const sqDist = (rx * rx) / (a * a) + (rz * rz) / (c * c);
if (sqDist < 1.0) {
    const rockH = b * Math.sqrt(1.0 - sqDist);
    h = Math.max(h, rockH + 0.1);
}
```

**Problems:**
- Custom gravity/jump physics are fragile and non-physical
- Ellipsoid approximation doesn't handle complex rock shapes
- No proper collision response (sliding, bouncing)
- Buoyancy is a magic number, not based on actual volume/density
- Step height logic is brittle

**Recommended Library:** `@react-three/rapier`

```typescript
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';

// Physics-based player
<RigidBody type="dynamic" colliders={false}>
    <CapsuleCollider args={[0.5, 0.3]} />
    <Player />
</RigidBody>

// Rocks get automatic collision
<RigidBody type="fixed" colliders="hull">
    <RockMesh />
</RigidBody>
```

**Benefits:**
- Real physics simulation (deterministic, testable)
- Proper collision detection with any mesh shape
- Built-in gravity, friction, restitution
- CCD prevents tunneling through objects
- ~10x more performant with BVH broad-phase

---

### 2. Collision System (`CollisionSystem.ts`)

**Current Implementation:**
```typescript
// O(n²) collision checks
for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
        const distance = entityA.transform.position.distanceTo(entityB.transform.position);
        if (distance < collisionDistance && distance > 0) {
            // Basic pushback
            const pushDir = new THREE.Vector3()
                .subVectors(entityA.transform.position, entityB.transform.position)
                .normalize();
            const pushAmount = (collisionDistance - distance) * PUSHBACK_FORCE;
            entityA.transform.position.add(pushDir.clone().multiplyScalar(pushAmount));
        }
    }
}
```

**Problems:**
- O(n²) scales poorly (100 entities = 4,950 checks per frame)
- Sphere-only collision doesn't match visual mesh shapes
- Pushback isn't physics-based (entities can overlap, jitter)
- No contact events for game logic

**Recommended Library:** `@react-three/rapier` (same as above)

With Rapier, collision detection is:
- O(n log n) via BVH spatial partitioning
- Accurate to mesh geometry
- Generates contact events for damage logic

---

## 🟡 Moderate - Worth Considering

### 3. LOD System (`lod.ts`)

**Current Implementation:**
```typescript
export function calculateLODLevel(
    entityPosition: THREE.Vector3,
    cameraPosition: THREE.Vector3
): LODLevel {
    const distance = entityPosition.distanceTo(cameraPosition);
    if (distance < 30) return LODLevel.FULL;
    if (distance < 60) return LODLevel.MEDIUM;
    if (distance < 100) return LODLevel.LOW;
    return LODLevel.CULLED;
}
```

**Problems:**
- Doesn't integrate with Three.js frustum culling
- Fixed thresholds don't adapt to screen size
- Requires manual application to each entity

**Recommended:** Use Three.js built-in `THREE.LOD` or drei's `<Detailed>`:

```tsx
import { Detailed } from '@react-three/drei';

<Detailed distances={[0, 30, 60, 100]}>
    <HighDetailNPC />
    <MediumDetailNPC />
    <LowDetailNPC />
    <null /> {/* Culled */}
</Detailed>
```

**Benefits:**
- Automatic camera distance calculation
- Integrates with Three.js render pipeline
- Smooth transitions between levels

---

### 4. Procedural Animation (`Player.tsx`)

**Current Implementation:**
```typescript
// Manual walk cycle with sin/cos
const walkCycle = timeRef.current * cycleSpeed;
joints.legL.rotation.x = Math.sin(walkCycle) * limbSwing * speed;
joints.legR.rotation.x = Math.sin(walkCycle + Math.PI) * limbSwing * speed;
joints.armL.rotation.x = Math.sin(walkCycle + Math.PI) * armSwing * speed;
// ... 50+ lines of manual joint math
```

**Problems:**
- Fragile - any change breaks the whole system
- No blending between states (jump → walk is jarring)
- Hard to add new animations

**Recommended Libraries:**
- **`@react-spring/three`** for smooth state transitions
- **Pre-baked animations** with `useAnimations` from drei
- **GSAP** for timeline-based sequences

```typescript
import { useSpring, animated } from '@react-spring/three';

const [springs] = useSpring(() => ({
    legRotation: isWalking ? Math.sin(walkCycle) * 0.8 : 0,
    config: { tension: 200, friction: 20 }
}));

<animated.group rotation-x={springs.legRotation}>
    <Leg />
</animated.group>
```

---

### 5. Weather/Time Transitions (`WeatherSystem.ts`, `TimeSystem.ts`)

**Current Implementation:**
```typescript
// Manual lerping
weather.transitionProgress += delta / TRANSITION_DURATION;
weather.intensity = currentConfig.intensity * (1 - t) + nextConfig.intensity * t;
weather.visibilityMod = currentConfig.visibilityMod * (1 - t) + nextConfig.visibilityMod * t;
```

**Problems:**
- Linear interpolation only (no easing)
- Manual progress tracking
- Can't interrupt/reverse mid-transition

**Recommended:** `@react-spring/three` or `tween.js`:

```typescript
import { useSpring } from '@react-spring/three';

const [weatherSpring] = useSpring(() => ({
    intensity: WEATHER_CONFIG[weather.current].intensity,
    visibility: WEATHER_CONFIG[weather.current].visibilityMod,
    config: { duration: 30000, easing: easings.easeInOutCubic }
}));
```

---

## 🟢 Acceptable - Minor Improvements Possible

### 6. Entity Pool (`entityPool.ts`)

**Current Implementation:** Generic object pool for entity reuse.

**Status:** Acceptable, but note:
- Miniplex (the ECS) already handles entity lifecycle
- For **rendering** many similar entities, `THREE.InstancedMesh` is more appropriate

**Consider:** Using `InstancedMesh` for NPCs:
```typescript
<instancedMesh args={[geometry, material, 1000]}>
    {npcs.map((npc, i) => (
        <Instance key={i} position={npc.position} />
    ))}
</instancedMesh>
```

---

### 7. Terrain Height (`collision.ts`)

**Current Implementation:**
```typescript
function getTerrainHeight(_x: number, _z: number): number {
    // Flat terrain for now
    // TODO: Integrate with actual terrain heightmap when available
    return 0;
}
```

**When Implemented, Use:** Rapier's `Heightfield` collider:
```typescript
import { HeightfieldCollider } from '@react-three/rapier';

<RigidBody type="fixed">
    <HeightfieldCollider args={[heights, { x: 100, y: 10, z: 100 }]} />
</RigidBody>
```

---

## ✅ Already Using Good Libraries

| Area | Library | Status |
|------|---------|--------|
| Rendering | React Three Fiber | ✅ Excellent choice |
| State Management | Zustand | ✅ Appropriate for game state |
| ECS | Miniplex | ✅ Lightweight, React-friendly |
| AI | Yuka | ✅ Just implemented! |
| Audio Synthesis | Tone.js | ✅ Great for procedural audio |
| Touch Controls | nipplejs | ✅ Battle-tested joystick |

---

## Priority Recommendations

### Immediate (High Impact, Moderate Effort)
1. **Add `@react-three/rapier`** for physics/collision
   - Eliminates hand-rolled physics in Player.tsx
   - Eliminates CollisionSystem.ts entirely
   - Enables proper rock collision with mesh shapes
   - One-time setup, massive quality improvement

### Soon (Moderate Impact)
2. **Use drei's `<Detailed>`** for LOD
   - Replace custom LOD calculations
   - Automatic frustum culling integration

3. **Add `@react-spring/three`** for animations
   - Smooth state transitions
   - Replace manual joint calculations
   - Better weather/time transitions

### Later (Nice to Have)
4. **Consider GSAP** for complex animation sequences
5. **Consider InstancedMesh** for NPC rendering at scale

---

## Installation Commands

```bash
# Critical - Physics
pnpm add @react-three/rapier

# Recommended - Animation
pnpm add @react-spring/three

# Optional - Advanced Animation
pnpm add gsap
```
