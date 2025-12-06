# Basic Water Example

Demonstrates simple water rendering with Strata.

## What This Shows

- Basic water material creation
- Time-based wave animation
- Transparent rendering
- Simple integration with React Three Fiber

## Running

```bash
npm install
npm run dev
```

## Code

```tsx
import { Canvas } from '@react-three/fiber';
import { Water } from '@jbcom/strata';

function App() {
  return (
    <Canvas>
      <Water size={10} />
    </Canvas>
  );
}
```

## See Also

- [Advanced Water Example](../advanced/water/)
- [Water API Documentation](../../../API.md#water)
- [Water Preset](../../../src/presets/water/)
