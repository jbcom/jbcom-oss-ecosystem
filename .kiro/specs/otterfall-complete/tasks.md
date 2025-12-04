# Implementation Plan: Otterfall Complete

- [-] 1. Complete Otterfall Game Implementation
  - [x] 1.1 Complete Core Game Systems
    - [x] 1.1.1 Integrate TimeSystem with R3F lighting
      - Update directional light intensity and position based on time
      - Update ambient light color and intensity
      - Update fog density and color
      - _Requirements: 1.7_
    
    - [x] 1.1.2 Implement biome-specific terrain generation
      - Add water features for marsh biome
      - Add tree generation for forest biome (0.3 per sq meter)
      - Add cacti for desert biome
      - Add snow shader for tundra biome
      - Add elevated terrain for mountain biome (slopes up to 45 degrees)
      - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_
    
    - [x] 1.1.3 Implement biome transition effects
      - Add terrain color crossfading at biome boundaries
      - Add fog color transitions
      - Add ambient sound crossfading
      - _Requirements: 3.2_
  
  - [x] 1.2 Complete Visual Effects and Rendering
    - [x] 1.2.1 Create firefly particle system
      - Spawn fireflies during night phase
      - Add glow effect using additive blending
      - Implement wandering movement
      - _Requirements: 9.5_
    
    - [x] 1.2.2 Enhance player animation
      - Improve procedural walk cycle with arm/leg swing
      - Add run animation with faster cycle
      - Add jump animation with anticipation and landing
      - _Requirements: 9.6_
    
    - [x] 1.2.3 Implement terrain shader
      - Add triplanar texture mapping
      - Blend textures based on biome
      - Add detail normal maps
      - _Requirements: 9.7_
  
  - [x] 1.3 Implement Complete Audio System
    - [x] 1.3.1 Create audio manager and footsteps
      - Implement audio loading and caching
      - Add volume controls for SFX and music
      - Implement spatial audio for 3D positioning
      - Play footstep sounds at animation cycle intervals
      - Vary footstep sounds based on terrain type
      - _Requirements: 10.1, 10.2, 10.3, 10.4_
    
    - [x] 1.3.2 Implement environmental audio
      - Add rain sound with volume based on intensity
      - Add wind sound for storms
      - Add thunder sound for storms (random intervals)
      - _Requirements: 10.2_
    
    - [x] 1.3.3 Implement NPC and UI audio
      - Add predator growl/howl sounds
      - Add prey chirp/squeak sounds
      - Trigger sounds based on NPC state
      - Add collection sound effect
      - Add damage sound effect
      - Add jump sound effect
      - _Requirements: 10.3, 10.4_
    
    - [x] 1.3.4 Implement biome ambient soundscapes
      - Create ambient loops for each biome
      - Crossfade soundscapes on biome transitions
      - Crossfade soundscapes on time phase changes
      - _Requirements: 10.5, 10.6_
  
  - [ ] 1.4 Complete UI and User Experience
    - [ ] 1.4.1 Complete HUD elements
      - Implement resource collection prompt with icon and name
      - Display prompt when near resource, hide when out of range
      - Implement pause menu with resume and settings
      - Pause game logic when menu is open
      - Show current hour and phase in top-right corner
      - Format as "8:00 AM - Day"
      - _Requirements: 11.3, 11.5, 11.6_
    
    - [ ] 1.4.2 Complete mobile touch controls
      - Implement tap-to-collect for resource entities
      - Trigger collection action on tap
      - Implement pinch-to-zoom gesture
      - Adjust camera zoom based on pinch distance
      - Clamp zoom to reasonable range
      - _Requirements: 14.4, 14.5_
    
    - [ ] 1.4.3 Complete save system
      - Implement death respawn mechanics
      - Preserve save data on death
      - Reset player to spawn point
      - Reset health and stamina to full
      - _Requirements: 13.5_
    
    - [ ] 1.4.4 Add tutorial and onboarding
      - Implement control instructions overlay for first launch
      - Add tooltip components for game mechanics
      - Add objective marker for first resource collection
      - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 1.5 Implement Performance Optimization
    - [ ] 1.5.1 Implement LOD and culling system
      - Add full detail rendering for entities < 30 units
      - Add medium detail for 30-60 units
      - Add low detail for 60-100 units
      - Cull entities > 100 units
      - _Requirements: 12.3, 12.4_
    
    - [ ] 1.5.2 Implement adaptive quality system
      - Monitor frame time each frame
      - Reduce particle counts by 50% if frame time > 20ms
      - Reduce shadow quality if frame time > 25ms
      - _Requirements: 12.5_
    
    - [ ] 1.5.3 Optimize rendering and memory
      - Verify grass uses instanced mesh (8000 instances)
      - Verify rocks use instanced mesh (150 instances)
      - Add instanced mesh for trees
      - Monitor memory usage
      - Trigger garbage collection if usage > 500MB
      - Implement entity pooling for NPCs and resources
      - _Requirements: 12.2, 12.6_

- [ ] 2. Establish CI/CD Infrastructure for Capacitor Projects
  - [ ] 2.1 Extend ci.yml with Capacitor build matrix
    - Add new job `capacitor-build` with matrix for platforms: [web, desktop, android]
    - Use existing pnpm setup pattern from agentic-control
    - Build web: `pnpm run build` (Vite production build)
    - Build desktop: Use `@capacitor-community/electron` or Tauri
    - Build Android: Use `@capacitor/android` with Gradle
    - Upload build artifacts for each platform
    - _Requirements: CI/CD for multi-platform builds_
  
  - [ ] 2.2 Add Capacitor testing jobs
    - Add `capacitor-test-unit` job for vitest unit tests
    - Add `capacitor-test-e2e` job for Playwright e2e tests
    - Run tests in matrix across platforms where applicable
    - Use existing test patterns from agentic-control
    - _Requirements: Automated testing for Capacitor projects_
  
  - [ ] 2.3 Implement Capacitor release workflow
    - Add `capacitor-release` job (main branch only)
    - Check for changes in Capacitor packages since last tag
    - Determine version bump from conventional commits
    - Build release artifacts (web bundle, APK, desktop binaries)
    - Create GitHub Release with artifacts attached
    - Tag format: `{package-name}-v{version}` (e.g., `otterfall-v1.0.0`)
    - Do NOT publish to npm/PyPI - GitHub Releases only
    - _Requirements: Automated releases with downloadable artifacts_
  
  - [ ] 2.4 Add Capacitor-specific quality checks
    - Bundle size analysis for web builds
    - APK size check for Android builds
    - Performance budget enforcement
    - Asset optimization verification
    - _Requirements: Quality gates for production builds_

- [ ] 3. Complete Property-Based Testing
  - [ ] 2.1 Test Core Systems
    - [ ] 2.1.1 Write property test for time progression
      - **Property 1: Time Progression Monotonicity**
      - **Validates: Requirements 1.1, 1.2**
    
    - [ ] 2.1.2 Write property test for phase transitions
      - **Property 2: Phase Transition Consistency**
      - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    
    - [ ] 2.1.3 Write property test for weather transitions
      - **Property 3: Weather Transition Completeness**
      - **Validates: Requirements 2.1, 2.2**
    
    - [ ] 2.1.4 Write property test for visibility bounds
      - **Property 4: Visibility Bounds**
      - **Validates: Requirements 2.3, 2.4, 2.7**
    
    - [ ] 2.1.5 Write property test for biome boundaries
      - **Property 5: Biome Boundary Exclusivity**
      - **Validates: Requirements 3.1, 3.2**
  
  - [ ] 2.2 Test Gameplay Systems
    - [ ] 2.2.1 Write property test for species health bounds
      - **Property 6: Species Health Bounds**
      - **Validates: Requirements 4.3, 4.6**
    
    - [ ] 2.2.2 Write property test for state transitions
      - **Property 7: State Transition Validity**
      - **Validates: Requirements 4.4, 4.5, 4.6**
    
    - [ ] 2.2.3 Write property test for steering force magnitude
      - **Property 8: Steering Force Magnitude**
      - **Validates: Requirements 5.1, 5.2, 5.3**
    
    - [ ] 2.2.4 Write property test for stamina conservation
      - **Property 9: Stamina Conservation**
      - **Validates: Requirements 6.2, 6.3**
    
    - [ ] 2.2.5 Write property test for collection idempotence
      - **Property 10: Resource Collection Idempotence**
      - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**
  
  - [ ] 2.3 Test Physics and Rendering
    - [ ] 2.3.1 Write property test for collision prevention
      - **Property 11: Collision Prevention**
      - **Validates: Requirements 8.1, 8.4**
    
    - [ ] 2.3.2 Write property test for slope walkability
      - **Property 12: Slope Walkability**
      - **Validates: Requirements 8.2, 8.3**
    
    - [ ] 2.3.3 Write property test for particle count bounds
      - **Property 13: Particle Count Bounds**
      - **Validates: Requirements 9.3, 9.4**
    
    - [ ] 2.3.4 Write property test for audio sync
      - **Property 14: Audio Sync**
      - **Validates: Requirements 10.1**
    
    - [ ] 2.3.5 Write property test for HUD value accuracy
      - **Property 15: HUD Value Accuracy**
      - **Validates: Requirements 11.1, 11.2**
  
  - [ ] 2.4 Test Performance and Persistence
    - [ ] 2.4.1 Write property test for frame rate target
      - **Property 16: Frame Rate Target**
      - **Validates: Requirements 12.1**
    
    - [ ] 2.4.2 Write property test for save data round trip
      - **Property 17: Save Data Round Trip**
      - **Validates: Requirements 13.1, 13.2**
    
    - [ ] 2.4.3 Write property test for touch input responsiveness
      - **Property 18: Touch Input Responsiveness**
      - **Validates: Requirements 14.1, 14.2**

- [ ] 3. Set Up CI/CD for Capacitor Builds
  - [ ] 3.1 Extend ci.yml for Capacitor projects
    - Add matrix strategy for Capacitor platforms (web, desktop, android)
    - Configure build jobs for each platform
    - Set up artifact uploads for built releases
    - Ensure monorepo-aware builds (only trigger on otterfall changes)
    - Use existing GitHub Actions for Capacitor where available
    - _Requirements: All (deployment infrastructure)_
  
  - [ ] 3.2 Configure Capacitor build workflows
    - Add web build job (pnpm run build)
    - Add desktop build job (Electron builds for macOS, Windows, Linux)
    - Add Android APK build job with proper SDK setup
    - Configure proper caching for node_modules and build artifacts
    - Test builds in CI before merging
    - _Requirements: All (deployment infrastructure)_
  
  - [ ] 3.3 Set up GitHub Releases for Capacitor artifacts
    - Configure release creation on version tags (v*)
    - Upload web build artifacts (dist/ as zip)
    - Upload desktop builds (dmg, exe, AppImage)
    - Upload Android APK with proper signing
    - Generate release notes from conventional commits
    - Do NOT auto-publish to stores (manual process for now)
    - _Requirements: All (deployment infrastructure)_

- [ ] 4. Complete End-to-End Testing and Validation
  - [ ] 4.1 Write End-to-End Tests
    - [ ] 4.1.1 Write e2e test for biome exploration
      - Verify player can explore all biomes
      - Verify biome transitions work correctly
      - _Requirements: 3.1, 3.2_
    
    - [ ] 4.1.2 Write e2e test for NPC behaviors
      - Verify NPCs spawn correctly in biomes
      - Verify predator chase and prey flee behaviors
      - Verify NPC state transitions
      - _Requirements: 4.1, 4.2, 4.4, 4.5, 5.1, 5.2, 5.3_
    
    - [ ] 4.1.3 Write e2e test for resource collection
      - Verify resources spawn in correct biomes
      - Verify collection restores health/stamina
      - Verify respawn mechanics
      - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
    
    - [ ] 4.1.4 Write e2e test for time and weather systems
      - Verify time progression and phase transitions
      - Verify weather transitions and effects
      - Verify lighting updates with time
      - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
    
    - [ ] 4.1.5 Write e2e test for save/load system
      - Verify save data serialization
      - Verify load restores game state correctly
      - Verify death respawn mechanics
      - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 4.2 Final Validation and Polish
    - [ ] 4.2.1 Run full test suite and fix failures
      - Run all unit tests
      - Run all property-based tests
      - Run all e2e tests
      - Fix any failing tests
      - Ensure 100% test pass rate
    
    - [ ] 4.2.2 Performance validation and optimization
      - Verify 60 FPS on target hardware (iPhone 13 equivalent)
      - Verify memory usage stays under 500MB
      - Verify LOD system is working correctly
      - Profile and optimize any bottlenecks
      - Test on multiple device tiers
    
    - [ ] 4.2.3 Manual gameplay validation
      - Play through all 7 biomes
      - Test all game mechanics (movement, combat, collection)
      - Verify mobile controls work smoothly
      - Check for visual glitches or rendering issues
      - Check for audio glitches or sync issues
      - Verify save/load works across sessions
      - Test edge cases (death, resource respawn, etc.)


- [ ] 4. Implement CI/CD for Capacitor Projects
  - [ ] 4.1 Extend ci.yml with Capacitor Matrix
    - [ ] 4.1.1 Add Capacitor project detection
      - Detect projects with capacitor.config.ts
      - Add to build matrix alongside Python/TypeScript/Go
      - _Requirements: CI/CD Infrastructure_
    
    - [ ] 4.1.2 Implement web build and test
      - Build web version using Vite
      - Run Playwright e2e tests
      - Generate test reports
      - _Requirements: CI/CD Infrastructure_
    
    - [ ] 4.1.3 Implement Android build
      - Set up Android SDK in CI
      - Build APK using Capacitor
      - Sign APK for release
      - _Requirements: CI/CD Infrastructure_
    
    - [ ] 4.1.4 Implement desktop build (Electron)
      - Build desktop app using Capacitor + Electron
      - Package for macOS, Windows, Linux
      - _Requirements: CI/CD Infrastructure_
  
  - [ ] 4.2 Implement GitHub Releases for Artifacts
    - [ ] 4.2.1 Create release workflow
      - Trigger on version tags
      - Build all platforms (web, Android, desktop)
      - Upload artifacts to GitHub Releases
      - _Requirements: CI/CD Infrastructure_
    
    - [ ] 4.2.2 Add release notes generation
      - Extract changelog from commits
      - Generate release notes automatically
      - Include download links for all platforms
      - _Requirements: CI/CD Infrastructure_
  
  - [ ] 4.3 Add Capacitor Configuration
    - [ ] 4.3.1 Initialize Capacitor in Otterfall
      - Add capacitor.config.ts
      - Configure app ID and name
      - Set up platform-specific settings
      - _Requirements: CI/CD Infrastructure_
    
    - [ ] 4.3.2 Add Android platform
      - Initialize Android platform
      - Configure AndroidManifest.xml
      - Set up signing configuration
      - _Requirements: CI/CD Infrastructure_
    
    - [ ] 4.3.3 Add Electron platform (desktop)
      - Initialize Electron platform
      - Configure window settings
      - Set up app icons
      - _Requirements: CI/CD Infrastructure_
