# Implementation Plan: Otterfall Complete

- [x] 1. Complete Otterfall Game Implementation
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
  
  - [x] 1.4 Complete UI and User Experience
    - [x] 1.4.1 Complete HUD elements
      - Implement resource collection prompt with icon and name
      - Display prompt when near resource, hide when out of range
      - Implement pause menu with resume and settings
      - Pause game logic when menu is open
      - Show current hour and phase in top-right corner
      - Format as "8:00 AM - Day"
      - _Requirements: 11.3, 11.5, 11.6_
    
    - [x] 1.4.2 Complete mobile touch controls
      - Implement tap-to-collect for resource entities
      - Trigger collection action on tap
      - Implement pinch-to-zoom gesture
      - Adjust camera zoom based on pinch distance
      - Clamp zoom to reasonable range
      - _Requirements: 14.4, 14.5_
    
    - [x] 1.4.3 Complete save system
      - Implement death respawn mechanics
      - Preserve save data on death
      - Reset player to spawn point
      - Reset health and stamina to full
      - _Requirements: 13.5_
    
    - [x] 1.4.4 Add tutorial and onboarding
      - Implement control instructions overlay for first launch
      - Add tooltip components for game mechanics
      - Add objective marker for first resource collection
      - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 1.5 Implement Performance Optimization
    - [x] 1.5.1 Implement LOD and culling system
      - Add full detail rendering for entities < 30 units
      - Add medium detail for 30-60 units
      - Add low detail for 60-100 units
      - Cull entities > 100 units
      - _Requirements: 12.3, 12.4_
    
    - [x] 1.5.2 Implement adaptive quality system
      - Monitor frame time each frame
      - Reduce particle counts by 50% if frame time > 20ms
      - Reduce shadow quality if frame time > 25ms
      - _Requirements: 12.5_
    
    - [x] 1.5.3 Optimize rendering and memory
      - Verify grass uses instanced mesh (8000 instances)
      - Verify rocks use instanced mesh (150 instances)
      - Add instanced mesh for trees
      - Monitor memory usage
      - Trigger garbage collection if usage > 500MB
      - Implement entity pooling for NPCs and resources
      - _Requirements: 12.2, 12.6_

- [x] 2. Asset Integration and Visual Enrichment
  - [x] 2.1 Phase 1: Core Visual Polish (High Priority)
    - [x] 2.1.1 Integrate terrain textures from AmbientCG
      - Copy and optimize Rock035 or Rock042 for mountain biome (1024x1024)
      - Copy and optimize Ground037 for forest floor (1024x1024)
      - Copy and optimize Ground054 for desert sand (1024x1024)
      - Copy and optimize Mud004 for marsh biome (1024x1024)
      - Copy and optimize Snow006 for tundra biome (1024x1024)
      - Organize under public/textures/terrain/ with proper naming
      - Include albedo, normal, roughness, AO maps for each
      - Apply texture compression in code (mipmaps, anisotropy)
      - _Requirements: 9.7, 3.3, 3.4, 3.5, 3.6, 3.7_
    
    - [x] 2.1.2 Implement PBR material system for terrain
      - Create terrain material loader utility
      - Implement triplanar mapping shader for procedural terrain
      - Add biome-specific material switching
      - Test on mobile devices for performance
      - _Requirements: 9.7_
    
    - [x] 2.1.3 Integrate water textures and enhance shader
      - Copy Water002 normal and displacement maps (512x512)
      - Organize under public/textures/water/
      - Update water shader to use real normal maps
      - Add animated UV scrolling
      - Test performance on mobile
      - _Requirements: 9.2_
    
    - [x] 2.1.4 Integrate player character model
      - Select appropriate otter model from Quaternius Animal Pack
      - Optimize to ~2000 triangles if needed
      - Copy to public/models/characters/otter.glb
      - Update Player.tsx to load GLB model
      - Verify animations work with procedural system
      - _Requirements: 9.1, 9.6_
    
    - [x] 2.1.5 Integrate collectible resource models
      - Select fish model from Quaternius Food Pack (~500 triangles)
      - Select berry/fruit model from Quaternius Food Pack (~300 triangles)
      - Copy to public/models/collectibles/
      - Update Resources.tsx to use GLB models
      - Add simple idle animations (bobbing, rotation)
      - _Requirements: 7.1, 7.2_
  
  - [x] 2.2 Phase 2: Environmental Detail (Medium Priority)
    - [x] 2.2.1 Integrate tree and vegetation models
      - Select pine tree model for forest biome (~800 triangles)
      - Select cactus model for desert biome (~400 triangles)
      - Select dead tree model for tundra biome (~600 triangles)
      - Copy to public/models/props/vegetation/
      - Implement instanced rendering for trees
      - Add LOD system for distant trees
      - _Requirements: 3.4, 3.5, 3.6, 12.2_
    
    - [x] 2.2.2 Integrate rock prop variations
      - Select 3-4 rock models from Quaternius Nature Pack (~300-500 triangles each)
      - Copy to public/models/props/rocks/
      - Update World.tsx to use varied rock models
      - Verify collision detection works with new models
      - _Requirements: 8.1, 12.2_
    
    - [x] 2.2.3 Add vegetation textures
      - Copy Bark007 or Bark012 for tree trunks (512x512)
      - Copy Leaves004 for foliage (512x512, with alpha)
      - Copy Grass004 for ground cover (512x512)
      - Organize under public/textures/vegetation/
      - Apply to tree and grass models
      - _Requirements: 3.4, 9.7_
    
    - [x] 2.2.4 Integrate biome ambient audio loops
      - Select/create marsh ambient (water, frogs, insects)
      - Select/create forest ambient (birds, wind, leaves)
      - Select/create desert ambient (wind, distant calls)
      - Select/create tundra ambient (howling wind, ice)
      - Select/create mountain ambient (wind, eagles, rocks)
      - Convert to OGG Vorbis, 22050 Hz, 96 kbps
      - Copy to public/audio/environment/biomes/
      - Update biomeAmbience.ts to load and use loops
      - _Requirements: 10.6_
    
    - [x] 2.2.5 Integrate weather sound effects
      - Select rain sounds (light, medium, heavy)
      - Select wind sounds for storms
      - Select thunder sounds (3-4 variations)
      - Select snow/wind sounds for snow weather
      - Convert to OGG Vorbis, 44100 Hz, 128 kbps
      - Copy to public/audio/environment/weather/
      - Update environmentalAudio.ts to use sounds
      - _Requirements: 10.2_
  
  - [x] 2.3 Phase 3: NPC Enhancement (Medium Priority)
    - [x] 2.3.1 Integrate predator models
      - Select fox model from Quaternius Animal Pack (~1000 triangles)
      - Select wolf model if available (~1200 triangles)
      - Copy to public/models/characters/predators/
      - Update NPCs.tsx to load predator models
      - Verify AI behaviors work with new models
      - _Requirements: 4.1, 4.4_
    
    - [x] 2.3.2 Integrate prey models
      - Select rabbit model from Quaternius Animal Pack (~800 triangles)
      - Select deer model if available (~1000 triangles)
      - Copy to public/models/characters/prey/
      - Update NPCs.tsx to load prey models
      - Verify flee behaviors work with new models
      - _Requirements: 4.2, 4.5_
    
    - [x] 2.3.3 Add NPC vocalization sounds
      - Select/create predator sounds (growls, howls)
      - Select/create prey sounds (chirps, squeaks)
      - Convert to OGG Vorbis, 44100 Hz, 128 kbps
      - Copy to public/audio/sfx/npcs/
      - Update AudioSystem.tsx to trigger based on NPC state
      - Implement spatial audio for distance-based volume
      - _Requirements: 10.3_
  
  - [x] 2.4 Phase 4: Polish and Optimization (Low Priority)
    - [x] 2.4.1 Add UI icons and elements
      - Select appropriate icons from Kenney UI Pack
      - Copy to public/ui/icons/
      - Update HUD.tsx to use icon assets
      - Update Tutorial.tsx to use icon assets
      - Ensure icons are optimized for mobile (PNG, compressed)
      - _Requirements: 11.1, 11.2, 11.3_
    
    - [x] 2.4.2 Optimize all integrated assets
      - Run texture compression on all textures
      - Verify all models meet poly count budgets
      - Test asset loading times (< 3s for critical assets)
      - Implement lazy loading for biome-specific assets
      - Test memory usage with all assets loaded (< 500MB)
      - _Requirements: 12.1, 12.6_
    
    - [x] 2.4.3 Implement asset quality tiers
      - Create asset loader utility with quality detection
      - Implement high/mid/low quality asset paths
      - Add device capability detection
      - Test on different device tiers
      - Verify fallback behavior for failed loads
      - _Requirements: 12.1, 12.5_
    
    - [x] 2.4.4 Create asset loading screen
      - Design loading screen with progress bar
      - Show asset loading progress
      - Add tips/instructions during loading
      - Implement smooth transition to game
      - _Requirements: 11.1_

- [-] 3. Establish CI/CD Infrastructure for Capacitor Projects
  - [x] 3.1 Extend ci.yml with Capacitor build matrix
    - Add new job `capacitor-build` with matrix for platforms: [web, desktop, android]
    - Use existing pnpm setup pattern from agentic-control
    - Build web: `pnpm run build` (Vite production build)
    - Build desktop: Use `@capacitor-community/electron` or Tauri
    - Build Android: Use `@capacitor/android` with Gradle
    - Upload build artifacts for each platform
    - _Requirements: CI/CD for multi-platform builds_
  
  - [x] 3.2 Add Capacitor testing jobs
    - Add `capacitor-test-unit` job for vitest unit tests
    - Add `capacitor-test-e2e` job for Playwright e2e tests
    - Run tests in matrix across platforms where applicable
    - Use existing test patterns from agentic-control
    - _Requirements: Automated testing for Capacitor projects_
  
  - [x] 3.3 Implement Capacitor release workflow
    - Add `capacitor-release` job (main branch only)
    - Check for changes in Capacitor packages since last tag
    - Determine version bump from conventional commits
    - Build release artifacts (web bundle, APK, desktop binaries)
    - Create GitHub Release with artifacts attached
    - Tag format: `{package-name}-v{version}` (e.g., `otterfall-v1.0.0`)
    - Do NOT publish to npm/PyPI - GitHub Releases only
    - _Requirements: Automated releases with downloadable artifacts_
  
  - [x] 3.4 Add Capacitor-specific quality checks
    - Bundle size analysis for web builds
    - APK size check for Android builds
    - Performance budget enforcement
    - Asset optimization verification
    - _Requirements: Quality gates for production builds_

- [ ] 4. Complete Property-Based Testing
  - [ ] 4.1 Test Core Systems
    - [x] 4.1.1 Write property test for time progression
      - **Property 1: Time Progression Monotonicity**
      - **Validates: Requirements 1.1, 1.2**
    
    - [x] 4.1.2 Write property test for phase transitions
      - **Property 2: Phase Transition Consistency**
      - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    
    - [x] 4.1.3 Write property test for weather transitions
      - **Property 3: Weather Transition Completeness**
      - **Validates: Requirements 2.1, 2.2**
    
    - [x] 4.1.4 Write property test for visibility bounds
      - **Property 4: Visibility Bounds**
      - **Validates: Requirements 2.3, 2.4, 2.7**
    
    - [x] 4.1.5 Write property test for biome boundaries
      - **Property 5: Biome Boundary Exclusivity**
      - **Validates: Requirements 3.1, 3.2**
  
  - [ ] 4.2 Test Gameplay Systems
    - [x] 4.2.1 Write property test for species health bounds
      - **Property 6: Species Health Bounds**
      - **Validates: Requirements 4.3, 4.6**
    
    - [x] 4.2.2 Write property test for state transitions
      - **Property 7: State Transition Validity**
      - **Validates: Requirements 4.4, 4.5, 4.6**
    
    - [x] 4.2.3 Write property test for steering force magnitude
      - **Property 8: Steering Force Magnitude**
      - **Validates: Requirements 5.1, 5.2, 5.3**
    
    - [x] 4.2.4 Write property test for stamina conservation
      - **Property 9: Stamina Conservation**
      - **Validates: Requirements 6.2, 6.3**
    
    - [x] 4.2.5 Write property test for collection idempotence
      - **Property 10: Resource Collection Idempotence**
      - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**
  
  - [ ] 4.3 Test Physics and Rendering
    - [ ] 4.3.1 Write property test for collision prevention
      - **Property 11: Collision Prevention**
      - **Validates: Requirements 8.1, 8.4**
    
    - [ ] 4.3.2 Write property test for slope walkability
      - **Property 12: Slope Walkability**
      - **Validates: Requirements 8.2, 8.3**
    
    - [ ] 4.3.3 Write property test for particle count bounds
      - **Property 13: Particle Count Bounds**
      - **Validates: Requirements 9.3, 9.4**
    
    - [ ] 4.3.4 Write property test for audio sync
      - **Property 14: Audio Sync**
      - **Validates: Requirements 10.1**
    
    - [ ] 4.3.5 Write property test for HUD value accuracy
      - **Property 15: HUD Value Accuracy**
      - **Validates: Requirements 11.1, 11.2**
  
  - [ ] 4.4 Test Performance and Persistence
    - [ ] 4.4.1 Write property test for frame rate target
      - **Property 16: Frame Rate Target**
      - **Validates: Requirements 12.1**
    
    - [ ] 4.4.2 Write property test for save data round trip
      - **Property 17: Save Data Round Trip**
      - **Validates: Requirements 13.1, 13.2**
    
    - [ ] 4.4.3 Write property test for touch input responsiveness
      - **Property 18: Touch Input Responsiveness**
      - **Validates: Requirements 14.1, 14.2**

- [x] 5. Set Up CI/CD for Capacitor Builds
  - [x] 5.1 Extend ci.yml for Capacitor projects
    - Add matrix strategy for Capacitor platforms (web, desktop, android)
    - Configure build jobs for each platform
    - Set up artifact uploads for built releases
    - Ensure monorepo-aware builds (only trigger on otterfall changes)
    - Use existing GitHub Actions for Capacitor where available
    - _Requirements: All (deployment infrastructure)_
  
  - [x] 5.2 Configure Capacitor build workflows
    - Add web build job (pnpm run build)
    - Add desktop build job (Electron builds for macOS, Windows, Linux)
    - Add Android APK build job with proper SDK setup
    - Configure proper caching for node_modules and build artifacts
    - Test builds in CI before merging
    - _Requirements: All (deployment infrastructure)_
  
  - [x] 5.3 Set up GitHub Releases for Capacitor artifacts
    - Configure release creation on version tags (v*)
    - Upload web build artifacts (dist/ as zip)
    - Upload desktop builds (dmg, exe, AppImage)
    - Upload Android APK with proper signing
    - Generate release notes from conventional commits
    - Do NOT auto-publish to stores (manual process for now)
    - _Requirements: All (deployment infrastructure)_

- [ ] 6. Complete End-to-End Testing and Validation
  - [ ] 6.1 Write End-to-End Tests
    - [ ] 6.1.1 Write e2e test for biome exploration
      - Verify player can explore all biomes
      - Verify biome transitions work correctly
      - _Requirements: 3.1, 3.2_
    
    - [ ] 6.1.2 Write e2e test for NPC behaviors
      - Verify NPCs spawn correctly in biomes
      - Verify predator chase and prey flee behaviors
      - Verify NPC state transitions
      - _Requirements: 4.1, 4.2, 4.4, 4.5, 5.1, 5.2, 5.3_
    
    - [ ] 6.1.3 Write e2e test for resource collection
      - Verify resources spawn in correct biomes
      - Verify collection restores health/stamina
      - Verify respawn mechanics
      - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
    
    - [ ] 6.1.4 Write e2e test for time and weather systems
      - Verify time progression and phase transitions
      - Verify weather transitions and effects
      - Verify lighting updates with time
      - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
    
    - [ ] 6.1.5 Write e2e test for save/load system
      - Verify save data serialization
      - Verify load restores game state correctly
      - Verify death respawn mechanics
      - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 6.2 Final Validation and Polish
    - [ ] 6.2.1 Run full test suite and fix failures
      - Run all unit tests
      - Run all property-based tests
      - Run all e2e tests
      - Fix any failing tests
      - Ensure 100% test pass rate
    
    - [ ] 6.2.2 Performance validation and optimization
      - Verify 60 FPS on target hardware (iPhone 13 equivalent)
      - Verify memory usage stays under 500MB
      - Verify LOD system is working correctly
      - Profile and optimize any bottlenecks
      - Test on multiple device tiers
    
    - [ ] 6.2.3 Manual gameplay validation
      - Play through all 7 biomes
      - Test all game mechanics (movement, combat, collection)
      - Verify mobile controls work smoothly
      - Check for visual glitches or rendering issues
      - Check for audio glitches or sync issues
      - Verify save/load works across sessions
      - Test edge cases (death, resource respawn, etc.)

