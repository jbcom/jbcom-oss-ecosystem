# Strata Examples

**Examples are documentation and demos, not tests.**

These examples demonstrate how to use Strata in real applications. They are meant to be:
- **Readable** - Clear, well-commented code
- **Educational** - Show best practices
- **Complete** - Working, runnable code
- **Documented** - Explain concepts and patterns

## Example Structure

```
examples/
├── basic/          # Simple, single-feature examples
├── advanced/       # Complex, multi-feature examples
└── comprehensive/  # Full game example (like the POC)
```

## Running Examples

Each example directory should have:
- `README.md` - Explanation of what it demonstrates
- `package.json` - Dependencies and scripts
- Source files - The actual example code

```bash
cd examples/basic/water
npm install
npm run dev
```

## Example Guidelines

### 1. Keep It Simple

Examples should focus on one concept at a time:

```tsx
// ✅ Good: Simple water example
function WaterExample() {
  return (
    <Canvas>
      <Water size={10} />
    </Canvas>
  );
}

// ❌ Bad: Too many features at once
function EverythingExample() {
  return (
    <Canvas>
      <Water />
      <Terrain />
      <Character />
      <Sky />
      {/* ... 20 more components */}
    </Canvas>
  );
}
```

### 2. Document Everything

Explain what, why, and how:

```tsx
/**
 * Water Example
 * 
 * Demonstrates basic water rendering with:
 * - Simple wave animation
 * - Transparent rendering
 * - Time-based animation
 * 
 * See: https://strata.docs/water
 */
function WaterExample() {
  // ...
}
```

### 3. Show Best Practices

Examples should demonstrate correct usage:

```tsx
// ✅ Good: Proper cleanup
useEffect(() => {
  const material = createWaterMaterial();
  return () => material.dispose(); // Cleanup
}, []);

// ❌ Bad: Memory leak
useEffect(() => {
  createWaterMaterial(); // Never disposed
}, []);
```

### 4. Include Error Handling

Show how to handle errors gracefully:

```tsx
function SafeExample() {
  try {
    const data = generateInstanceData(1000, 50, biomes);
    return <GPUInstancedMesh instances={data} />;
  } catch (error) {
    console.error('Failed to generate instances:', error);
    return <ErrorFallback />;
  }
}
```

### 5. Make It Runnable

Examples should work out of the box:

- Include all dependencies
- Provide setup instructions
- Include sample data
- Handle edge cases

## Example Categories

### Basic Examples

Single-feature demonstrations:
- `water/` - Basic water rendering
- `terrain/` - Simple terrain generation
- `fur/` - Fur rendering on a sphere
- `character/` - Basic character with animation
- `molecular/` - Simple molecule visualization

### Advanced Examples

Multi-feature combinations:
- `water-terrain/` - Water with terrain
- `character-fur/` - Character with fur
- `instancing/` - GPU instancing with wind/LOD
- `raymarching/` - Ray marching SDF scene

### Comprehensive Example

Full game example (like the original POC):
- `comprehensive/` - Complete game with all features
  - Background layer (sky, terrain)
  - Midground layer (water, vegetation)
  - Foreground layer (character, fur)
  - Input handling
  - Camera follow
  - Procedural animation

## Testing Examples

Examples are **not** tests, but they can be used for:
- Manual verification
- Visual inspection
- Performance profiling
- Documentation screenshots

E2E tests may use examples as test fixtures, but examples themselves are not automated tests.

## Contributing Examples

When adding examples:
1. Create a new directory in appropriate category
2. Add README.md explaining the example
3. Include package.json with dependencies
4. Make it runnable and documented
5. Update this README with a link

## Examples vs Tests

| Examples | Tests |
|----------|-------|
| For humans to read | For machines to run |
| Show how to use | Verify it works |
| Educational | Verification |
| May have bugs | Must be correct |
| Can be incomplete | Must be complete |
| For documentation | For CI/CD |

Keep them separate!
