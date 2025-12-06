# Basic Character Example

Demonstrates character creation and animation with Strata.

## What This Shows

- Creating an articulated character
- Procedural animation (walk/idle cycles)
- Fur rendering on character
- Character state management

## Running

```bash
npm install
npm run dev
```

## Code

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { createCharacter, animateCharacter } from '@jbcom/strata/presets';
import { useRef } from 'react';

function CharacterExample() {
  const characterRef = useRef(createCharacter({
    skinColor: 0x3e2723,
    scale: 1.0
  }));

  useFrame((state) => {
    const character = characterRef.current;
    character.state.speed = 0.1; // Walking
    animateCharacter(character, state.clock.elapsedTime);
  });

  return <primitive object={characterRef.current.root} />;
}
```

## See Also

- [Character API Documentation](../../../PUBLIC_API.md#characters)
- [Character Preset](../../../src/presets/characters/)
