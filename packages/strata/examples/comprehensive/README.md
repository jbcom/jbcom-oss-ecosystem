# Comprehensive Strata Example

This example demonstrates **all features** of Strata in a single application, similar to the original POC.

## Features Demonstrated

### Background Layer
- ✅ Procedural Sky with time-of-day
- ✅ Terrain generation
- ✅ Volumetric Fog

### Midground Layer
- ✅ Advanced Water rendering
- ✅ GPU-Instanced Vegetation (8000+ grass instances)
- ✅ Wind animation on GPU

### Foreground Layer
- ✅ Articulated Character with joints
- ✅ Fur rendering with shells
- ✅ Molecular structures (water molecules)
- ✅ Procedural animation (walk/idle cycles)

## Running

```bash
npm install
npm run dev
```

## Structure

This example uses:
- React Three Fiber for rendering
- Strata presets for all game primitives
- GPU-accelerated instancing
- Procedural animation
- All three layers (background, midground, foreground)

## Code Organization

```tsx
// Background Layer
<ProceduralSky />
<Terrain />
<VolumetricEffects />

// Midground Layer
<Water />
<Vegetation /> // GPU-instanced

// Foreground Layer
<Character /> // With fur
<Molecules />
```

## Performance

This example demonstrates:
- GPU instancing for thousands of objects
- GPU-driven wind animation
- Efficient rendering pipeline
- Mobile-optimized settings

## Testing

This example is used for Playwright E2E testing:

```bash
npm run test:e2e
```

The E2E tests verify:
- All features render correctly
- Performance metrics
- Visual regression
- Cross-browser compatibility

## See Also

- [Basic Examples](../basic/)
- [Advanced Examples](../advanced/)
- [Public API](../../PUBLIC_API.md)
- [API Documentation](../../API.md)
