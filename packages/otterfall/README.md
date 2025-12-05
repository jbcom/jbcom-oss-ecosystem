# Otterfall

A mobile-first 3D exploration game built with React Three Fiber and Capacitor. Control an otter navigating diverse biomes in a living ecosystem with dynamic weather, time-of-day cycles, and AI-driven NPCs.

## Features

- **7 Unique Biomes**: Marsh, Forest, Desert, Tundra, Savanna, Mountain, Scrubland
- **Dynamic Weather System**: Rain, fog, snow, storms with real-time effects
- **Day/Night Cycle**: 24-hour time progression with lighting changes
- **AI Ecosystem**: Predator/prey behaviors using steering algorithms
- **Mobile-First Controls**: Touch-optimized virtual joystick and gestures
- **Performance Optimized**: LOD system, adaptive quality, 60 FPS target

## Tech Stack

- **React Three Fiber** - 3D rendering
- **Zustand** - State management
- **Miniplex ECS** - Entity Component System
- **Tone.js** - Procedural audio synthesis
- **Capacitor** - Native mobile deployment

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
pnpm run build
```

### Run Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui
```

### Linting

```bash
pnpm run lint
```

## Mobile Deployment

### Android

#### Prerequisites

- Android Studio
- JDK 17+
- Android SDK (API 33+)

#### Build APK

```bash
# Full build pipeline
pnpm run build:android

# Or step by step:
pnpm run build              # Build web assets
pnpm run cap:sync:android   # Sync to Android platform
cd android && ./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

#### Development

```bash
# Sync changes to Android
pnpm run cap:sync:android

# Open in Android Studio
pnpm run cap:open:android

# Run on device/emulator
pnpm run cap:run:android
```

### iOS

iOS deployment requires macOS with Xcode. See [Capacitor iOS documentation](https://capacitorjs.com/docs/ios) for setup.

## Project Structure

```
packages/otterfall/
├── src/
│   ├── components/        # R3F rendering components
│   │   ├── Player.tsx     # Player character
│   │   ├── NPCs.tsx       # AI-driven entities
│   │   ├── World.tsx      # Terrain and environment
│   │   └── ui/            # HUD and UI components
│   ├── ecs/               # Entity Component System
│   │   ├── components.ts  # ECS component definitions
│   │   ├── systems/       # Game logic systems
│   │   └── data/          # Static game data
│   ├── stores/            # Zustand state management
│   ├── shaders/           # GLSL shaders
│   ├── systems/           # Game systems (audio, input)
│   └── utils/             # Utility functions
├── public/                # Static assets
│   ├── models/            # 3D models (GLB)
│   ├── textures/          # PBR textures
│   └── audio/             # Sound effects
├── e2e/                   # Playwright E2E tests
├── android/               # Android platform (generated)
└── capacitor.config.ts    # Capacitor configuration
```

## Game Systems

### Time System
- 24-hour day/night cycle
- 4 phases: Dawn, Day, Dusk, Night
- Dynamic lighting and fog

### Weather System
- 6 weather types: Clear, Rain, Fog, Snow, Storm, Sandstorm
- Smooth transitions (30 seconds)
- Affects visibility and movement

### Biome System
- 7 distinct biomes with unique terrain
- Smooth biome transitions
- Biome-specific resources and NPCs

### AI System
- Steering behaviors (seek, flee, wander, avoid)
- State machines (idle, walk, run, chase, flee, attack)
- Predator/prey dynamics

### Resource System
- 3 resource types: Fish, Berries, Water
- Restores health and stamina
- Respawn mechanics

### Audio System
- Procedural audio synthesis (Tone.js)
- Biome-specific ambient soundscapes
- Weather sound effects
- Footstep sounds (terrain-based)
- Spatial audio for NPCs

### Performance Optimization
- LOD system (4 levels: Full, Medium, Low, Culled)
- Adaptive quality (dynamic particle/shadow reduction)
- Instanced rendering (grass, rocks, trees)
- Memory monitoring and GC hints

## Controls

### Desktop
- **Arrow Keys** - Move
- **Space** - Jump
- **ESC** - Pause

### Mobile
- **Tap** - Move (virtual joystick appears)
- **Swipe Up** - Jump
- **Pinch** - Zoom camera
- **Tap Resource** - Collect

## Performance Targets

- **60 FPS** on iPhone 13 equivalent
- **< 500MB** memory usage
- **< 100** draw calls per frame
- **< 500k** vertices per frame

## Testing

The project includes comprehensive test coverage:

- **177 unit tests** - Components, systems, utilities
- **52 property-based tests** - Invariant validation
- **8 E2E test suites** - Complete gameplay workflows (biome exploration, NPC behaviors, resource collection, player movement, game systems, time/weather, initialization, gameplay)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

[MIT](../../LICENSE) © jbcom
