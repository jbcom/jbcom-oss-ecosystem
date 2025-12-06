# Strata Comprehensive Example

This example demonstrates all features of Strata in a single-page application, similar to the original POC.

## Features Demonstrated

### Background Layer
- ✅ Procedural Sky with time-of-day
- ✅ Volumetric Fog
- ✅ Terrain generation with SDF
- ✅ Marching Cubes mesh generation

### Midground Layer
- ✅ Advanced Water with caustics and foam
- ✅ GPU-Instanced Vegetation (grass, trees, rocks)
- ✅ Ray Marching for complex SDFs

### Foreground Layer
- ✅ Articulated Character with joints
- ✅ Fur rendering with shells
- ✅ Molecular structures
- ✅ Procedural animation

## Setup

```bash
cd examples/comprehensive
npm install
npm run dev
```

## Structure

This example uses:
- React Three Fiber for rendering
- Strata presets for all game primitives
- Input handling (joystick + keyboard)
- Camera follow system
- Procedural animation

## Testing

This example is used for Playwright E2E testing:

```bash
npm run test:e2e
```
