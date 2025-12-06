# Implementation Plan: Otterfall Complete

## Overview

This implementation plan transforms Otterfall from a proof-of-concept into a complete mobile-first 3D survival game with 13 playable predator species, 15 prey species, natural combat, AI-driven NPCs, procedural terrain with caves, and dynamic weather/time systems.

### Status Summary
- ✅ **Sections 1-5: COMPLETE** - Core systems, assets, CI/CD, initial property tests (~40% of total work)
- 🔄 **Sections 6-13: IN PROGRESS** - Advanced gameplay systems (species, combat, AI, terrain, water, UI, progression)
- ⏳ **Section 14: PENDING** - End-to-end testing and validation

### Requirements Coverage
- **Total Requirements**: 52 (Requirements 1-52)
- **Implemented**: ~20 requirements (Sections 1-5)
- **Remaining**: ~32 requirements (Sections 6-14)

### Key Milestones
1. ✅ **POC Complete** - Basic game loop, rendering, audio, performance
2. 🔄 **Core Gameplay** - Species system, combat, AI (Section 6-7) ← **YOU ARE HERE**
3. ⏳ **World Systems** - Terrain generation, water, ecosystem (Section 8-9)
4. ⏳ **Polish & UX** - Camera, animations, UI, progression (Section 10-12)
5. ⏳ **Advanced Features** - Volumetric effects, weather gameplay, footprints (Section 13)
6. ⏳ **Validation** - E2E testing, performance validation (Section 14)

---

## Completed Work (Sections 1-5)

<details>
<summary>✅ Section 1: Core Game Implementation (COMPLETE)</summary>

- [x] 1.1 Complete Core Game Systems
- [x] 1.2 Complete Visual Effects and Rendering
- [x] 1.3 Implement Complete Audio System
- [x] 1.4 Complete UI and User Experience
- [x] 1.5 Implement Performance Optimization

</details>

<details>
<summary>✅ Section 2: Asset Integration (COMPLETE)</summary>

- [x] 2.1 Phase 1: Core Visual Polish
- [x] 2.2 Phase 2: Environmental Detail
- [x] 2.3 Phase 3: NPC Enhancement
- [x] 2.4 Phase 4: Polish and Optimization

</details>

<details>
<summary>✅ Section 3: CI/CD Infrastructure (COMPLETE)</summary>

- [x] 3.1 Extend ci.yml with Capacitor build matrix
- [x] 3.2 Add Capacitor testing jobs
- [x] 3.3 Implement Capacitor release workflow
- [x] 3.4 Add Capacitor-specific quality checks

</details>

<details>
<summary>✅ Section 4: Initial Property-Based Testing (PARTIAL - Core tests complete)</summary>

- [x] 4.1 Test Core Systems (time, weather, biomes)
- [x] 4.2 Test Gameplay Systems (health, stamina, collection)
- [ ] 4.3 Test Physics and Rendering (pending advanced features)
- [ ] 4.4 Test Performance and Persistence (pending advanced features)

</details>

<details>
<summary>✅ Section 5: CI/CD for Capacitor Builds (COMPLETE)</summary>

- [x] 5.1 Extend ci.yml for Capacitor projects
- [x] 5.2 Configure Capacitor build workflows
- [x] 5.3 Set up GitHub Releases for Capacitor artifacts

</details>

---

## Active Implementation (Sections 6-13)

### Priority: HIGH - Core Gameplay Systems

- [-] 6. Implement Species and Combat Systems (Requirements 1-5, 8)
  - [ ] 6.1 Implement Species Data System
    - [x] 6.1.1 Create species data definitions
      - Define all 13 predator species with stats from requirements
      - Define all 15 prey species with stats from requirements
      - Create species data loader
      - _Requirements: 1.1, 1.2, 2.1, 2.2_
    
    - [-] 6.1.2 Implement species component system
      - Create SpeciesComponent with all required properties
      - Implement species assignment on entity creation
      - Add species-specific model loading
      - _Requirements: 1.2, 1.5_
    
    - [ ] 6.1.3 Implement species selection screen
      - Create UI for 13 predator species display
      - Show 3D model previews for each species
      - Display stats and descriptions
      - Group by archetype (tank, agile, balanced)
      - _Requirements: 41.1-41.7_
  
  - [ ] 6.2 Implement Combat System
    - [ ] 6.2.1 Create combat component and stats
      - Implement CombatComponent with health, stamina, armor, dodge
      - Apply archetype-specific stats (tank, agile, balanced)
      - Implement stamina regeneration rates
      - _Requirements: 3.1, 4.1-4.6_
    
    - [ ] 6.2.2 Implement attack system
      - Create attack type definitions (bite, claw, tail_whip, headbutt, pounce, roll_crush)
      - Implement attack execution with range, stamina, cooldown checks
      - Apply damage calculation with armor and variance
      - Implement knockback and stun mechanics
      - _Requirements: 3.2-3.7, 5.1-5.8_
    
    - [ ] 6.2.3 Implement combat feedback
      - Display floating damage numbers
      - Show dodge/armor text
      - Implement critical hit visuals (5% chance)
      - Add haptic feedback for attacks and damage
      - Flash red vignette on damage
      - _Requirements: 44.1-44.7_
    
    - [ ] 6.2.4 Add attack UI buttons
      - Create circular attack buttons with cooldown timers
      - Position buttons for thumb reach on mobile
      - Disable buttons when stamina insufficient
      - Show "NOT ENOUGH STAMINA" message
      - _Requirements: 18.7, 44.7_

- [ ] 7. Implement AI and NPC Systems (Requirements 6-7, 10, 32-34)
  - [ ] 7.1 Integrate Yuka.js AI
    - [ ] 7.1.1 Set up Yuka.js integration
      - Install and configure Yuka.js library
      - Create Yuka EntityManager
      - Implement Vehicle synchronization with ECS
      - _Requirements: 6.1, 6.7_
    
    - [ ] 7.1.2 Implement steering behaviors
      - Add WanderBehavior for idle state
      - Add SeekBehavior for chase state
      - Add FleeBehavior for escape state
      - Add ObstacleAvoidanceBehavior
      - Add SeparationBehavior for clustering prevention
      - _Requirements: 6.2-6.6_
    
    - [ ] 7.1.3 Implement state machines
      - Create predator state machine (idle, patrol, chase, attack, eat)
      - Create prey state machine (idle, graze, alert, flee)
      - Implement state transition logic
      - Update ECS AIComponent on transitions
      - _Requirements: 7.1-7.7_
  
  - [ ] 7.2 Implement Predator AI
    - [ ] 7.2.1 Implement hunting behavior
      - Detect prey within awareness radius (20 units)
      - Transition to chase state
      - Use pursue behavior to predict prey movement
      - Transition to attack at 2 unit range
      - _Requirements: 34.1-34.4_
    
    - [ ] 7.2.2 Implement eating behavior
      - Transition to eat state on prey death
      - Remain stationary for 10 seconds
      - Restore 50 health
      - Transition back to patrol when full
      - _Requirements: 34.5-34.7_
    
    - [ ] 7.2.3 Implement hunger-driven behavior
      - Prioritize hunting when health < 50%
      - Increase aggression at night
      - _Requirements: 32.6, 45.6_
  
  - [ ] 7.3 Implement Prey AI
    - [ ] 7.3.1 Implement awareness and flee
      - Detect predators within awareness radius (15 units)
      - Transition to alert state
      - Transition to flee at 8 unit radius
      - Use species-specific flee speeds
      - _Requirements: 33.1-33.3_
    
    - [ ] 7.3.2 Implement flee behavior
      - Flee to safe distance (25 units)
      - Flee from nearest threat if multiple predators
      - Use obstacle avoidance when cornered
      - Aquatic prey flee toward deeper water
      - _Requirements: 33.4-33.7_

- [ ] 8. Implement Terrain and World Generation (Requirements 22-24, 30, 43)
  - [ ] 8.1 Implement SDF Terrain System
    - [ ] 8.1.1 Create SDF utility functions
      - Implement Fractal Brownian Motion (3-5 octaves)
      - Implement domain warping
      - Implement ridge noise for mountains
      - Create biome-specific SDF functions
      - _Requirements: 22.1-22.5_
    
    - [ ] 8.1.2 Implement cave and overhang generation
      - Use 3D noise for cave carving (threshold 0.15)
      - Carve tunnels below y=10
      - Use domain warping for overhangs
      - Calculate normals using SDF gradient (epsilon 0.001)
      - _Requirements: 22.6-22.8_
  
  - [ ] 8.2 Implement Marching Cubes System
    - [ ] 8.2.1 Create marching cubes algorithm
      - Implement edge and triangle table lookups
      - Sample SDF at grid resolution (32-128)
      - Interpolate edge vertices
      - Deduplicate vertices using position keys
      - _Requirements: 23.1-23.5_
    
    - [ ] 8.2.2 Implement chunk-based generation
      - Generate terrain in 64x64x64 unit chunks
      - Unload chunks out of view (> 150 units)
      - Implement chunk streaming
      - _Requirements: 23.6-23.7_
  
  - [ ] 8.3 Implement Biome Transition System
    - [ ] 8.3.1 Create biome blending
      - Blend terrain colors over 10 meters
      - Crossfade ambient sounds over 5 seconds
      - Adjust fog color and density over 10 meters
      - Spawn transition vegetation
      - _Requirements: 43.1-43.5_
    
    - [ ] 8.3.2 Add biome entry notifications
      - Display biome name as toast
      - Track biome exploration for achievements
      - _Requirements: 43.6, 42.4_

- [ ] 9. Implement Water and Environmental Systems (Requirements 14, 31-32)
  - [ ] 9.1 Implement Water System
    - [ ] 9.1.1 Create water rendering
      - Implement Gerstner wave displacement (4 frequencies)
      - Apply Fresnel effect for reflections
      - Add normal mapping from Water002 texture
      - Render caustics in shallow water (< 0.5 units)
      - _Requirements: 31.1, 31.6, 31.8_
    
    - [ ] 9.1.2 Implement water physics
      - Apply buoyancy force based on submersion depth
      - Reduce movement speed by 30% in water
      - Apply swim animation
      - Restrict aquatic prey to water volumes
      - _Requirements: 31.2-31.4_
    
    - [ ] 9.1.3 Add underwater effects
      - Apply blue fog tint underwater
      - Reduce visibility to 20 units
      - Define water level per biome (marsh: 0.2, others: 0.0)
      - _Requirements: 31.5, 31.7_
  
  - [ ] 9.2 Implement Ecosystem Balance System
    - [ ] 9.2.1 Create population management
      - Track population per biome
      - Adjust spawn rates based on population (< 20%: +50%, > 150%: stop)
      - Increase prey spawning when predators overpopulated
      - Record kills and update statistics
      - _Requirements: 32.1-32.5_
    
    - [ ] 9.2.2 Implement spawn system
      - Use weighted random selection from spawn tables
      - Ensure minimum 20 unit distance from player
      - Raycast to terrain for valid placement
      - Spawn aquatic prey only in water
      - _Requirements: 10.1-10.8_
  
  - [ ] 9.3 Implement Drop System
    - [ ] 9.3.1 Create drop mechanics
      - Spawn drops on prey death based on drop tables
      - Implement species-specific drop items and quantities
      - Show collection prompt when player within 1.5 units
      - _Requirements: 14.1-14.9_
    
    - [ ] 9.3.2 Implement drop collection
      - Tap to collect on mobile
      - Play collection sound
      - Apply health/stamina restoration
      - Despawn after 120 seconds if not collected
      - _Requirements: 14.10-14.11_

- [ ] 10. Implement Camera and Animation Systems (Requirements 35-37)
  - [ ] 10.1 Implement Camera System
    - [ ] 10.1.1 Create camera positioning
      - Position 8 units behind, 4 units above player
      - Smooth follow with lerp (damping 0.1)
      - Orbit on player rotation
      - _Requirements: 35.1-35.3_
    
    - [ ] 10.1.2 Add camera controls
      - Implement pinch-to-zoom (5-15 units)
      - Raycast for terrain collision avoidance
      - Lower to 2 units above water surface
      - Zoom out to 12 units in combat
      - _Requirements: 35.4-35.7_
  
  - [ ] 10.2 Implement Animation System
    - [ ] 10.2.1 Create animation states
      - Idle: Breathing cycle
      - Walk/Run: Speed-proportional playback
      - Jump: Takeoff → Air → Land phases
      - Attack: Type-specific animations
      - Hit: 0.3s reaction
      - _Requirements: 36.1-36.6_
    
    - [ ] 10.2.2 Integrate Meshy animations
      - Load Meshy skeletal animations if available
      - Fallback to procedural animation
      - Implement animation blending
      - _Requirements: 36.7_
  
  - [ ] 10.3 Implement Particle System
    - [ ] 10.3.1 Create particle types
      - Dust: 10/sec when running
      - Impact: Blood/sparks on hit
      - Collection: Sparkle particles
      - Splash: Water entry
      - _Requirements: 37.1-37.3, 37.7_
    
    - [ ] 10.3.2 Integrate weather particles
      - Rain: 500 drops, 15 m/s
      - Snow: 300 flakes, 2 m/s with drift
      - Fireflies: Night only, glow effect
      - _Requirements: 37.4-37.6_

- [ ] 11. Implement UI Systems (Requirements 18, 38-41)
  - [ ] 11.1 Implement HUD System
    - [ ] 11.1.1 Create status bars
      - Health bar: Top-left, red fill
      - Stamina bar: Below health, yellow fill
      - Hunger bar: Below stamina, orange fill
      - Time display: Top-right, "8:00 AM - Day"
      - _Requirements: 18.1-18.2, 18.6, 48.7_
    
    - [ ] 11.1.2 Add danger indicators
      - Red vignette pulse when HP < 30%
      - Hunger warning at 25%
      - _Requirements: 18.4, 48.3_
  
  - [ ] 11.2 Implement Minimap System
    - [ ] 11.2.1 Create minimap rendering
      - Render 150x150px top-down view
      - Show terrain as grayscale heightmap
      - Show player as white arrow
      - Show NPCs as colored dots (red: predators, green: prey)
      - Show biome boundaries
      - _Requirements: 38.1-38.5_
    
    - [ ] 11.2.2 Add minimap controls
      - Update center to follow player
      - Tap to toggle zoom (50 / 200 unit radius)
      - _Requirements: 38.6-38.7_
  
  - [ ] 11.3 Implement Menu Systems
    - [ ] 11.3.1 Create pause menu
      - Resume, settings, quit options
      - Pause game logic when open
      - _Requirements: 18.5_
    
    - [ ] 11.3.2 Create settings menu
      - Graphics quality (Low/Medium/High)
      - Master, music, SFX volume sliders
      - Virtual joystick toggle
      - Save to AsyncStorage on change
      - _Requirements: 40.1-40.7_
  
  - [ ] 11.4 Implement Tutorial System
    - [ ] 11.4.1 Create tutorial steps
      - Welcome + basic controls
      - First movement → Stamina explanation
      - First prey → Hunting mechanics
      - First damage → Health and healing
      - First attack → Attack types and cooldowns
      - _Requirements: 39.1-39.5_
    
    - [ ] 11.4.2 Add tutorial persistence
      - Mark completion in save data
      - Add replay option in settings
      - _Requirements: 39.6-39.7_

- [ ] 12. Implement Progression Systems (Requirements 42, 48-49, 52)
  - [ ] 12.1 Implement Hunger System
    - [ ] 12.1.1 Create hunger mechanics
      - Decrease 1% per minute
      - Apply penalties at thresholds (50%, 25%, 0%)
      - Apply well-fed buff above 75%
      - _Requirements: 48.1-48.6_
    
    - [ ] 12.1.2 Integrate with consumption
      - Restore hunger on meat consumption
      - Different restoration per meat type
      - _Requirements: 48.5_
  
  - [ ] 12.2 Implement Inventory System
    - [ ] 12.2.1 Create inventory structure
      - 20 slot inventory
      - Stack limits: Meat 10, materials 50
      - Item types: Consumables, materials, equipment
      - _Requirements: 52.1-52.2_
    
    - [ ] 12.2.2 Implement inventory actions
      - Collect: Add or stack items
      - Use: Apply effect, decrease count
      - Drop: Spawn entity at player position
      - Full inventory: Prevent collection, show message
      - _Requirements: 52.3-52.7_
  
  - [ ] 12.3 Implement Crafting System
    - [ ] 12.3.1 Create crafting recipes
      - Simple Trap: 5 sticks + 3 stones
      - Bandage: 10 plant fibers
      - _Requirements: 49.1, 49.5_
    
    - [ ] 12.3.2 Implement crafting mechanics
      - Unlock recipes on material collection
      - Consume materials on craft
      - Add crafted items to inventory
      - _Requirements: 49.2, 49.7_
    
    - [ ] 12.3.3 Implement trap system
      - Place trap at location
      - Immobilize prey for 5 seconds
      - Alert player on trigger
      - _Requirements: 49.3-49.4_
    
    - [ ] 12.3.4 Implement bandage system
      - Restore 30 HP over 10 seconds
      - _Requirements: 49.6_
  
  - [ ] 12.4 Implement Achievements System
    - [ ] 12.4.1 Create achievement tracking
      - Novice Hunter: 10 prey
      - Master Hunter: 100 prey
      - Survivor: 10 in-game days
      - Explorer: All 7 biomes
      - Apex Predator: 5 predators defeated
      - Species Master: Complete with all 13 species
      - _Requirements: 42.1-42.6_
    
    - [ ] 12.4.2 Add achievement notifications
      - Toast notification on unlock
      - Save to AsyncStorage
      - Display badges in species selection
      - _Requirements: 42.7, 41.6_

- [ ] 13. Implement Advanced Features (Requirements 29, 44-47)
  - [ ] 13.1 Implement Footprint System
    - [ ] 13.1.1 Create footprint mechanics
      - Spawn decals every 0.5s when moving
      - Fade times: Snow 60s, rain 10s, normal 30s
      - Display species type and age on examination
      - No footprints in water
      - _Requirements: 47.1-47.7_
  
  - [ ] 13.2 Implement Day/Night Gameplay Effects
    - [ ] 13.2.1 Add spawn rate modifiers
      - Night: Predators +50%, prey -30%
      - Day: Prey +20%
      - Dawn/Dusk: Increased prey activity
      - _Requirements: 45.1-45.5_
    
    - [ ] 13.2.2 Add visibility changes
      - Day: 100 units
      - Night: 50 units
      - _Requirements: 45.3_
    
    - [ ] 13.2.3 Add behavior changes
      - Night predators: More aggressive
      - _Requirements: 45.6_
  
  - [ ] 13.3 Implement Weather Gameplay Effects
    - [ ] 13.3.1 Add awareness modifiers
      - Rain: NPC awareness -20%
      - Fog: NPC awareness -40%
      - Clear: NPC awareness +10%
      - _Requirements: 46.1-46.2, 46.6_
    
    - [ ] 13.3.2 Add movement penalties
      - Storm: Player speed -10%
      - Snow: Player speed -15%, footprint trails
      - Sandstorm: Visibility 20 units, stamina drain 2/sec
      - _Requirements: 46.3-46.5_
  
  - [ ] 13.4 Implement Volumetric Effects
    - [ ] 13.4.1 Create god rays
      - Render at dawn/dusk from sun direction
      - Use radial blur post-processing
      - _Requirements: 29.1, 29.4_
    
    - [ ] 13.4.2 Create volumetric fog
      - Render with density based on weather
      - Use depth-based fog calculation
      - Reduce sample count when performance low (32 → 16)
      - _Requirements: 29.2, 29.5-29.6_
    
    - [ ] 13.4.3 Add cave lighting
      - Volumetric darkness in caves
      - Light shafts from openings
      - _Requirements: 29.3_

- [ ] 14. Complete End-to-End Testing and Validation (All Requirements)
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

