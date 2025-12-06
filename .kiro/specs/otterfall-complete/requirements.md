# Requirements Document: Rivermarsh (Otterfall) - Complete Game

## Introduction

Rivermarsh (Otterfall) is a mobile-first 3D exploration and survival game where players control a river otter (or one of 12 other predator species) navigating diverse biomes in a living ecosystem. This is a GAME - a fun, complex 3D experience with deep systems, not a tech demo. Players hunt 15 prey species with realistic AI behaviors, engage in natural combat using bite/claw/tail attacks with proper damage/stamina/cooldown mechanics, explore procedurally generated terrain with caves and overhangs, and experience dynamic weather and day/night cycles that affect gameplay.

Built with React Native + Expo for cross-platform mobile (iOS/Android), React Three Fiber via expo-three and expo-gl for 3D rendering, Miniplex ECS for entity management, Yuka.js for professional AI steering behaviors and state machines, Zustand for state management, and AsyncStorage for save data. The Meshy API generates unique 3D models for all 28 species from text prompts. Terrain uses Signed Distance Fields (SDF) with Marching Cubes algorithm for organic geometry including caves and overhangs.

The current POC in packages/otterfall was merged to main as proof of concept. This specification defines requirements to complete the full game vision with proper depth, interconnected systems, and production-quality implementation. Target performance: 60 FPS on iPhone 13 equivalent devices.

## Glossary

- **Game System**: The core Rivermarsh application including rendering, physics, AI, and game logic
- **Player Entity**: The controllable predator character (default: river otter)
- **NPC Entity**: Non-player character entities including predators and prey with AI behaviors
- **ECS**: Entity Component System architecture using Miniplex for data-oriented design
- **Biome**: A distinct geographical region with unique terrain, vegetation, weather patterns, and species
- **Species Component**: Data defining behavioral, physical, and combat characteristics of creatures
- **Combat System**: Natural weapon-based combat using bite, claw, tail, headbutt, pounce, and roll_crush attacks
- **Time System**: Day/night cycle simulation affecting lighting, NPC behavior, and gameplay
- **Weather System**: Dynamic weather conditions (clear, rain, fog, storm, snow, sandstorm) affecting visibility and movement
- **Collision System**: Physics system handling entity-environment and entity-entity interactions with slope detection
- **AI System**: Yuka.js-based behavioral system with steering behaviors and state machines
- **Steering Behavior**: Yuka.js movement patterns (seek, flee, wander, avoid, separate, pursue)
- **State Machine**: Yuka.js finite state machine controlling NPC behavior transitions
- **Drop System**: System for spawning collectible items when prey is hunted
- **HUD**: Heads-up display showing player status, time, and contextual prompts
- **R3F**: React Three Fiber - React renderer for Three.js 3D graphics
- **Yuka.js**: JavaScript library for game AI providing steering behaviors, state machines, and pathfinding
- **React Native**: Cross-platform mobile framework for building native iOS and Android apps with JavaScript
- **Expo**: Development platform and toolchain for React Native with managed workflow
- **expo-three**: Expo integration package for React Three Fiber 3D rendering on mobile
- **expo-gl**: Expo's OpenGL ES bindings providing native 3D graphics context
- **Meshy API**: AI-powered 3D model generation service creating GLB models from text prompts
- **Miniplex**: Lightweight ECS library for TypeScript with React hooks integration
- **Zustand**: Minimal state management library for React with simple API
- **AsyncStorage**: React Native persistent key-value storage for save data
- **SDF**: Signed Distance Field - mathematical function returning distance to nearest surface
- **Marching Cubes**: Algorithm for extracting polygonal mesh from 3D scalar field (SDF)
- **FBM**: Fractal Brownian Motion - layered noise for natural terrain variation
- **Domain Warping**: Technique for creating organic shapes by warping noise coordinates
- **LOD**: Level of Detail - rendering optimization reducing polygon count at distance
- **Instancing**: GPU technique for rendering many copies of mesh in single draw call
- **Triplanar Mapping**: Texture mapping technique avoiding UV stretching on procedural geometry
- **Gerstner Waves**: Wave simulation algorithm for realistic water surface animation

## Requirements

### Requirement 1: Species System with 13 Predators

**User Story:** As a player, I want to encounter and play as diverse predator species from around the world, so that gameplay feels rich and varied.

#### Predator Species Data

| Species | Display Name | Size | Archetype | Health | Stamina | Armor | Dodge | Attacks | Native Biome | Meshy Prompt |
|---------|-------------|------|-----------|--------|---------|-------|-------|---------|--------------|--------------|
| otter | River Otter | medium | balanced | 100 | 100 | 15% | 20% | bite, claw, tail_whip | marsh | "realistic river otter, brown fur, sleek body, webbed paws, playful expression, sculpture style" |
| fox | Red Fox | medium | balanced | 100 | 100 | 15% | 20% | bite, claw, pounce | forest | "realistic red fox, orange-red fur, white chest, bushy tail, alert ears, sculpture style" |
| badger | European Badger | medium | tank | 150 | 80 | 30% | 10% | bite, headbutt | forest | "realistic european badger, black and white striped face, gray body, stocky build, powerful claws, sculpture style" |
| wolf | Gray Wolf | large | tank | 150 | 80 | 30% | 10% | bite, pounce | tundra | "realistic gray wolf, gray fur, muscular build, sharp teeth, intense eyes, sculpture style" |
| raccoon | Raccoon | small | balanced | 100 | 100 | 15% | 20% | claw, bite | marsh | "realistic raccoon, gray fur, black mask, ringed tail, dexterous paws, sculpture style" |
| pangolin | Pangolin | medium | balanced | 100 | 100 | 15% | 20% | tail_whip, roll_crush | savanna | "realistic pangolin, brown scales, armored body, long tail, small head, sculpture style" |
| mongoose | Mongoose | small | agile | 80 | 120 | 5% | 35% | bite, claw, pounce | savanna | "realistic mongoose, tan fur, slender body, quick movements, alert posture, sculpture style" |
| coati | Coati | medium | agile | 80 | 120 | 5% | 35% | claw, bite | scrubland | "realistic coati, brown fur, long snout, ringed tail, climbing posture, sculpture style" |
| meerkat | Meerkat | tiny | agile | 80 | 120 | 5% | 35% | claw, bite | desert | "realistic meerkat, tan fur, standing upright, alert expression, small size, sculpture style" |
| honey_badger | Honey Badger | medium | balanced | 100 | 100 | 15% | 20% | bite, claw | desert | "realistic honey badger, black and white fur, stocky build, fierce expression, powerful jaws, sculpture style" |
| red_panda | Red Panda | small | agile | 80 | 120 | 5% | 35% | claw, bite | mountain | "realistic red panda, reddish-brown fur, white face markings, bushy tail, tree-climbing, sculpture style" |
| wombat | Wombat | medium | tank | 150 | 80 | 30% | 10% | bite, headbutt | scrubland | "realistic wombat, brown fur, stocky build, short legs, powerful digger, sculpture style" |
| tasmanian_devil | Tasmanian Devil | medium | tank | 150 | 80 | 30% | 10% | bite, claw | scrubland | "realistic tasmanian devil, black fur, white chest patch, powerful jaws, aggressive stance, sculpture style" |

#### Acceptance Criteria

1. WHEN the game initializes THEN the Species System SHALL load all 13 predator species definitions from the table above
2. WHEN a predator entity is created THEN the Species System SHALL assign species-specific properties: size, archetype, health, stamina, armor, dodge, attacks, native biome, and Meshy prompt
3. WHEN the player selects a species THEN the Species System SHALL create a player entity with that species' combat stats and movement capabilities
4. WHEN an NPC predator spawns THEN the Species System SHALL select species appropriate for the current biome based on native biome preferences
5. WHEN a predator is rendered THEN the Render System SHALL load the species-specific 3D model from public/models/characters/{species_id}/model.glb
6. WHEN displaying species information THEN the UI SHALL show species display name, size category, archetype, and combat stats

### Requirement 2: Species System with 15 Prey

**User Story:** As a player, I want to hunt diverse prey species with realistic behaviors, so that the ecosystem feels alive and challenging.

#### Prey Species Data

| Species | Display Name | Size | Health | Flee Speed | Awareness Radius | Drop Items | Drop Chance | Habitat | Meshy Prompt |
|---------|-------------|------|--------|------------|------------------|------------|-------------|---------|--------------|
| rabbit | Rabbit | small | 20 | 8 m/s | 15 units | rabbit_meat (1-2, +15 health each) | 80% | land | "realistic rabbit, brown fur, long ears, fluffy tail, alert posture, sculpture style" |
| deer | Deer | large | 50 | 10 m/s | 18 units | deer_meat (2-4, +25 health each) | 90% | land | "realistic deer, brown fur, white spots, antlers, graceful build, sculpture style" |
| grouse | Grouse | small | 15 | 7 m/s | 12 units | bird_meat (1, +12 health) | 70% | land | "realistic grouse, brown feathers, plump body, ground bird, sculpture style" |
| vole | Vole | tiny | 10 | 6 m/s | 10 units | small_meat (1, +8 health) | 60% | land | "realistic vole, gray fur, small rodent, round body, sculpture style" |
| capybara | Capybara | large | 60 | 6 m/s | 15 units | capybara_meat (3-5, +20 health each) | 95% | water | "realistic capybara, brown fur, large rodent, semi-aquatic, calm expression, sculpture style" |
| wallaby | Wallaby | medium | 35 | 9 m/s | 16 units | wallaby_meat (2-3, +18 health each) | 85% | land | "realistic wallaby, gray-brown fur, kangaroo-like, long tail, hopping posture, sculpture style" |
| fish_bass | Bass | small | 15 | 5 m/s | 8 units | bass_meat (1, +20 health) | 100% | water | "realistic bass fish, green scales, streamlined body, fins, underwater, sculpture style" |
| fish_trout | Trout | small | 12 | 6 m/s | 8 units | trout_meat (1, +18 health) | 100% | water | "realistic trout fish, silver scales with spots, streamlined body, sculpture style" |
| crayfish | Crayfish | tiny | 8 | 3 m/s | 6 units | crayfish_meat (1, +10 health, +15 stamina) | 85% | water | "realistic crayfish, red-brown shell, claws, segmented body, sculpture style" |
| frog | Frog | tiny | 10 | 4 m/s | 8 units | frog_legs (1, +12 health, +10 stamina) | 75% | water | "realistic frog, green skin, webbed feet, sitting posture, sculpture style" |
| beetle | Beetle | tiny | 5 | 2 m/s | 5 units | insect_protein (1, +8 health) | 70% | land | "realistic beetle, black shell, six legs, antennae, sculpture style" |
| salmon | Salmon | medium | 25 | 7 m/s | 10 units | salmon_meat (1-2, +25 health each) | 90% | water | "realistic salmon, silver-pink scales, streamlined body, powerful swimmer, sculpture style" |
| duck | Duck | small | 18 | 6 m/s | 12 units | duck_meat (1, +15 health) | 75% | water | "realistic duck, brown feathers, webbed feet, swimming posture, sculpture style" |
| squirrel | Squirrel | tiny | 12 | 7 m/s | 10 units | squirrel_meat (1, +10 health) | 65% | land | "realistic squirrel, red-brown fur, bushy tail, climbing posture, sculpture style" |
| lizard | Lizard | tiny | 8 | 5 m/s | 8 units | lizard_meat (1, +8 health) | 60% | land | "realistic lizard, green-brown scales, long tail, basking posture, sculpture style" |

#### Acceptance Criteria

1. WHEN the game initializes THEN the Species System SHALL load all 15 prey species definitions from the table above
2. WHEN a prey entity is created THEN the Species System SHALL assign flee behavior, movement speed, awareness radius, drop items, and habitat based on species data
3. WHEN prey spawns in a biome THEN the Spawn System SHALL select species appropriate for that biome's spawn tables
4. WHEN a predator approaches within awareness radius THEN prey SHALL transition to flee state using Yuka.js flee behavior at species-specific flee speed
5. WHEN prey is hunted successfully THEN the Combat System SHALL drop species-specific items based on drop table with specified probability
6. WHEN aquatic prey spawns THEN the Species System SHALL assign swim behavior and restrict movement to water volumes using Yuka.js containment

### Requirement 3: Natural Combat System

**User Story:** As a player, I want to engage in natural combat using animal attacks, so that combat feels authentic and visceral.

#### Acceptance Criteria

1. WHEN a predator entity is created THEN the Combat System SHALL assign attack types based on species archetype: tank (bite, headbutt), agile (claw swipe, pounce), or balanced (bite, claw, tail whip)
2. WHEN the player initiates an attack THEN the Combat System SHALL check stamina cost, cooldown timer, and target range before executing
3. WHEN an attack connects THEN the Combat System SHALL apply damage, knockback force, and stun duration to the target entity
4. WHEN an entity takes damage THEN the Combat System SHALL reduce health by attack damage minus armor percentage
5. WHEN an entity's health reaches zero THEN the Combat System SHALL transition entity to dead state and trigger death animation
6. WHEN stamina is depleted THEN the Combat System SHALL prevent attacks until stamina regenerates at species-specific rate
7. WHEN an attack has cooldown remaining THEN the Combat System SHALL disable that attack and display cooldown timer in UI

### Requirement 4: Combat Stats and Archetypes

**User Story:** As a player, I want different species to have distinct combat styles, so that choosing a species matters strategically.

#### Acceptance Criteria

1. WHEN a tank archetype predator is created THEN the Combat System SHALL assign 150 max health, 80 max stamina, 30% armor, and 10% dodge chance
2. WHEN an agile archetype predator is created THEN the Combat System SHALL assign 80 max health, 120 max stamina, 5% armor, and 35% dodge chance
3. WHEN a balanced archetype predator is created THEN the Combat System SHALL assign 100 max health, 100 max stamina, 15% armor, and 20% dodge chance
4. WHEN stamina regenerates THEN the Combat System SHALL restore stamina at archetype-specific rate: tank 8/sec, agile 15/sec, balanced 10/sec
5. WHEN an attack is dodged THEN the Combat System SHALL use species dodge chance to determine if damage is negated
6. WHEN armor reduces damage THEN the Combat System SHALL calculate final damage as base damage multiplied by (1 minus armor percentage)

### Requirement 5: Attack Types and Mechanics

**User Story:** As a player, I want different attack types with unique properties, so that combat has tactical depth.

#### Attack Type Data

| Attack Type | Damage | Range | Stamina Cost | Cooldown | Knockback | Stun | Special |
|------------|--------|-------|--------------|----------|-----------|------|---------|
| bite | 28-40 (varies by species) | 1.5m | 20-25 | 1.5-2.0s | 1m | 0s | High damage, short range |
| claw | 20-22 | 1.8m | 15-18 | 1.0-1.2s | 0.5m | 0s | Fast, low stamina |
| tail_whip | 25 | 2.5m | 25 | 2.5s | 3m | 0s | Long range, knockback |
| headbutt | 30 | 1.2m | 30 | 3.0s | 4m | 1.5s | Tank attack, stun |
| pounce | 35 | 4.0m | 40 | 4.0s | 3m | 0.5s | Agile attack, gap closer |
| roll_crush | 32 | 1.0m | 35 | 3.5s | 2m | 1.0s | Pangolin special, armor penetration |

#### Acceptance Criteria

1. WHEN a bite attack is used THEN the Combat System SHALL apply damage based on species (wolf: 40, otter: 30, meerkat: 28) at 1.5m range with species-specific stamina cost and cooldown
2. WHEN a claw swipe attack is used THEN the Combat System SHALL apply 20-22 damage at 1.8m range with 15-18 stamina cost and 1.0-1.2 second cooldown
3. WHEN a tail whip attack is used THEN the Combat System SHALL apply 25 damage at 2.5m range with 25 stamina cost, 2.5 second cooldown, and 3m knockback force
4. WHEN a headbutt attack is used THEN the Combat System SHALL apply 30 damage at 1.2m range with 30 stamina cost, 3.0 second cooldown, 4m knockback, and 1.5 second stun
5. WHEN a pounce attack is used THEN the Combat System SHALL apply 35 damage at 4.0m range with 40 stamina cost, 4.0 second cooldown, launch player forward 4m, and apply 0.5 second stun on hit
6. WHEN a roll_crush attack is used (pangolin only) THEN the Combat System SHALL apply 32 damage at 1.0m range with 35 stamina cost, 3.5 second cooldown, ignore 50% of target armor
7. WHEN a stunned entity attempts to act THEN the Combat System SHALL prevent all actions until stun duration expires
8. WHEN calculating attack damage THEN the Combat System SHALL apply random variance of ±10% to base damage for combat variety

### Requirement 6: Yuka.js AI Integration

**User Story:** As a player, I want NPCs to move and behave realistically using professional AI, so that interactions feel natural and challenging.

#### Acceptance Criteria

1. WHEN an NPC entity is created THEN the AI System SHALL create a paired Yuka.js Vehicle with position, velocity, and maxSpeed synchronized to ECS MovementComponent
2. WHEN an NPC is in idle state THEN the AI System SHALL apply Yuka.js WanderBehavior with random direction changes every 3-5 seconds
3. WHEN an NPC is in chase state THEN the AI System SHALL apply Yuka.js SeekBehavior targeting the prey or player entity
4. WHEN an NPC is in flee state THEN the AI System SHALL apply Yuka.js FleeBehavior moving away from the threat entity
5. WHEN an NPC encounters an obstacle THEN the AI System SHALL apply Yuka.js ObstacleAvoidanceBehavior to steer around it
6. WHEN multiple NPCs are nearby THEN the AI System SHALL apply Yuka.js SeparationBehavior to prevent overlap and clustering
7. WHEN the Yuka EntityManager updates THEN the AI System SHALL synchronize Yuka Vehicle positions back to ECS TransformComponents

### Requirement 7: Yuka.js State Machines

**User Story:** As a player, I want NPCs to have complex behavioral states, so that they feel intelligent and responsive.

#### Acceptance Criteria

1. WHEN a predator NPC is created THEN the AI System SHALL initialize a Yuka.js StateMachine with states: idle, patrol, chase, attack, and eat
2. WHEN a prey NPC is created THEN the AI System SHALL initialize a Yuka.js StateMachine with states: idle, graze, alert, and flee
3. WHEN a predator detects prey within awareness radius THEN the StateMachine SHALL transition from idle to chase state
4. WHEN a predator reaches attack range THEN the StateMachine SHALL transition from chase to attack state
5. WHEN prey detects a predator within awareness radius THEN the StateMachine SHALL transition from graze to flee state
6. WHEN an NPC's health drops below 30% THEN the StateMachine SHALL transition to flee state regardless of current state
7. WHEN the StateMachine transitions states THEN the AI System SHALL update the ECS AIComponent currentState property for rendering and animation

### Requirement 8: Meshy API Integration for 3D Models

**User Story:** As a developer, I want to generate 3D models automatically from species definitions, so that all creatures have unique appearances.

#### Acceptance Criteria

1. WHEN the pre-build script runs THEN the Meshy Integration SHALL read all species definitions from SpeciesComponent
2. WHEN a species model does not exist THEN the Meshy Integration SHALL POST the species meshyPrompt to Meshy API preview endpoint with sculpture art style
3. WHEN Meshy API returns a task ID THEN the Meshy Integration SHALL poll the task status endpoint until status is SUCCEEDED
4. WHEN Meshy task succeeds THEN the Meshy Integration SHALL download the GLB model to public/models/characters/{species_id}/model.glb
5. WHEN a GLB model is downloaded THEN the Meshy Integration SHALL POST to Meshy API auto-rig endpoint to add skeletal animation
6. WHEN auto-rig succeeds THEN the Meshy Integration SHALL download the rigged GLB and save animation mappings to {species_id}/animations.json
7. WHEN all species models exist THEN the pre-build script SHALL exit successfully and allow game build to proceed

### Requirement 9: Biome System with 7 Distinct Regions

**User Story:** As a player, I want to explore diverse biomes with unique visuals and challenges, so that exploration feels rewarding.

#### Acceptance Criteria

1. WHEN the game initializes THEN the Biome System SHALL generate 7 biome regions: marsh, forest, desert, tundra, savanna, mountain, and scrubland
2. WHEN the player enters a biome THEN the Biome System SHALL update terrain color, fog color, fog density, and ambient sound based on biome data
3. WHEN in the marsh biome THEN the Biome System SHALL set water level to 0.2, spawn reeds and water features, and use green-brown terrain colors
4. WHEN in the forest biome THEN the Biome System SHALL spawn trees at 0.3 density per square meter and use dark green terrain colors
5. WHEN in the desert biome THEN the Biome System SHALL spawn cacti, set water level to 0.0, and use tan-yellow terrain colors
6. WHEN in the tundra biome THEN the Biome System SHALL apply snow shader to terrain, reduce ambient temperature, and use white-blue terrain colors
7. WHEN in the mountain biome THEN the Biome System SHALL generate elevated terrain with slopes up to 45 degrees and use gray-brown rock colors
8. WHEN in the savanna biome THEN the Biome System SHALL spawn scattered trees at 0.1 density and use golden-brown terrain colors
9. WHEN in the scrubland biome THEN the Biome System SHALL spawn bushes and small vegetation and use olive-brown terrain colors

### Requirement 10: Biome-Specific Species Spawning

**User Story:** As a player, I want to encounter species appropriate to each biome, so that the world feels ecologically realistic.

#### Biome Spawn Tables

**Marsh Biome:**
- Predators: otter (60%), raccoon (30%), fox (10%) | Target: 5 predators
- Prey: frog (30%), fish_bass (25%), crayfish (20%), duck (15%), rabbit (10%) | Target: 30 prey

**Forest Biome:**
- Predators: fox (40%), badger (30%), wolf (20%), raccoon (10%) | Target: 6 predators
- Prey: deer (30%), rabbit (25%), squirrel (20%), grouse (15%), vole (10%) | Target: 40 prey

**Desert Biome:**
- Predators: meerkat (50%), honey_badger (30%), mongoose (20%) | Target: 4 predators
- Prey: vole (35%), lizard (30%), beetle (25%), grouse (10%) | Target: 20 prey

**Tundra Biome:**
- Predators: wolf (60%), fox (40%) | Target: 5 predators
- Prey: rabbit (40%), vole (30%), grouse (20%), deer (10%) | Target: 25 prey

**Savanna Biome:**
- Predators: mongoose (40%), pangolin (30%), meerkat (30%) | Target: 5 predators
- Prey: wallaby (30%), deer (25%), vole (20%), lizard (15%), beetle (10%) | Target: 35 prey

**Mountain Biome:**
- Predators: red_panda (50%), wolf (30%), fox (20%) | Target: 4 predators
- Prey: deer (35%), rabbit (25%), squirrel (20%), grouse (15%), vole (5%) | Target: 30 prey

**Scrubland Biome:**
- Predators: wombat (40%), tasmanian_devil (30%), coati (30%) | Target: 5 predators
- Prey: wallaby (30%), rabbit (25%), lizard (20%), vole (15%), beetle (10%) | Target: 30 prey

#### Acceptance Criteria

1. WHEN spawning predators in a biome THEN the Spawn System SHALL use weighted random selection based on biome spawn table percentages
2. WHEN spawning prey in a biome THEN the Spawn System SHALL use weighted random selection based on biome spawn table percentages
3. WHEN a biome's predator population is below target THEN the Spawn System SHALL spawn predators at rate of 1 per 60 seconds
4. WHEN a biome's prey population is below target THEN the Spawn System SHALL spawn prey at rate of 1 per 30 seconds
5. WHEN a biome's population exceeds 150% of target THEN the Spawn System SHALL stop spawning that entity type
6. WHEN spawning aquatic prey (fish, crayfish, frog, duck) THEN the Spawn System SHALL only spawn in water volumes (y < water_level)
7. WHEN spawning entities THEN the Spawn System SHALL ensure minimum distance of 20 units from player to prevent pop-in
8. WHEN calculating spawn position THEN the Spawn System SHALL raycast to terrain to ensure valid ground placement

### Requirement 11: Time of Day System

**User Story:** As a player, I want to experience dynamic day/night cycles, so that the world feels alive and immersive.

#### Acceptance Criteria

1. WHEN the game runs THEN the Time System SHALL advance the hour value from 0.0 to 24.0 continuously based on real-time delta
2. WHEN the hour value reaches 24.0 THEN the Time System SHALL reset the hour to 0.0 and increment day counter
3. WHEN the hour is between 5.0 and 7.0 THEN the Time System SHALL set the phase to dawn
4. WHEN the hour is between 7.0 and 17.0 THEN the Time System SHALL set the phase to day
5. WHEN the hour is between 17.0 and 19.0 THEN the Time System SHALL set the phase to dusk
6. WHEN the hour is between 19.0 and 5.0 THEN the Time System SHALL set the phase to night
7. WHEN the phase changes THEN the Time System SHALL update sunIntensity, sunAngle, ambientLight, and fogDensity values smoothly over 30 seconds
8. WHEN time phase is night THEN the Time System SHALL reduce directional light intensity to 0.1 and increase ambient light blue tint

### Requirement 12: Weather System

**User Story:** As a player, I want to encounter different weather conditions, so that gameplay remains varied and challenging.

#### Acceptance Criteria

1. WHEN weather duration expires THEN the Weather System SHALL select a new weather type based on biome-specific probabilities
2. WHEN transitioning weather THEN the Weather System SHALL interpolate intensity from 0.0 to 1.0 over 30 seconds
3. WHEN weather is rain THEN the Weather System SHALL reduce visibility by 20% and spawn 500 raindrop particles
4. WHEN weather is fog THEN the Weather System SHALL reduce visibility by 50% and increase fog density to 0.08
5. WHEN weather is storm THEN the Weather System SHALL reduce visibility by 30%, increase wind speed by 300%, spawn 500 raindrops, and play thunder sounds
6. WHEN weather is snow THEN the Weather System SHALL reduce player movement speed by 15%, spawn 300 snowflake particles, and apply white tint to terrain
7. WHEN weather is sandstorm THEN the Weather System SHALL reduce visibility by 70%, increase wind speed by 400%, and apply tan tint to fog
8. WHEN weather is clear THEN the Weather System SHALL set visibility to 100%, fog density to 0.02, and disable weather particles

### Requirement 13: Player Health and Stamina

**User Story:** As a player, I want to manage my health and stamina, so that survival feels meaningful.

#### Acceptance Criteria

1. WHEN the player spawns THEN the Player System SHALL initialize health and stamina to species-specific max values based on combat archetype
2. WHEN the player runs THEN the Player System SHALL decrease stamina by 5 per second
3. WHEN the player is idle or walking THEN the Player System SHALL increase stamina at species-specific regeneration rate
4. WHEN the player takes damage from an attack THEN the Player System SHALL decrease health by attack damage minus armor percentage
5. WHEN the player's health reaches zero THEN the Player System SHALL trigger death state, play death animation, and show game over screen
6. WHEN the player collects a resource THEN the Player System SHALL increase health or stamina based on resource type and amount

### Requirement 14: Hunting and Drop System

**User Story:** As a player, I want to hunt prey to obtain resources, so that survival feels earned and realistic.

#### Acceptance Criteria

1. WHEN a prey entity's health reaches zero THEN the Combat System SHALL trigger death state and spawn drop items based on species drop table
2. WHEN a rabbit dies THEN the Drop System SHALL spawn 1-2 rabbit meat items (restores 15 health each) with 80% probability
3. WHEN a deer dies THEN the Drop System SHALL spawn 2-4 deer meat items (restores 25 health each) with 90% probability
4. WHEN a fish_bass dies THEN the Drop System SHALL spawn 1 bass meat item (restores 20 health each) with 100% probability
5. WHEN a fish_trout dies THEN the Drop System SHALL spawn 1 trout meat item (restores 18 health each) with 100% probability
6. WHEN a beetle dies THEN the Drop System SHALL spawn 1 insect protein item (restores 8 health each) with 70% probability
7. WHEN a frog dies THEN the Drop System SHALL spawn 1 frog legs item (restores 12 health, 10 stamina) with 75% probability
8. WHEN a crayfish dies THEN the Drop System SHALL spawn 1 crayfish meat item (restores 10 health, 15 stamina) with 85% probability
9. WHEN the player is within 1.5 units of a dropped item THEN the Drop System SHALL highlight the item and show collection prompt
10. WHEN the player taps a dropped item THEN the Drop System SHALL collect it, play collection sound, apply restoration effects, and remove the item entity
11. WHEN a dropped item is not collected within 120 seconds THEN the Drop System SHALL despawn the item to prevent clutter
12. WHEN prey spawns in water THEN the Spawn System SHALL mark it as aquatic and restrict movement to water volumes

### Requirement 15: Enhanced Collision System

**User Story:** As a player, I want realistic collision with terrain and entities, so that movement feels natural.

#### Acceptance Criteria

1. WHEN the player moves toward a rock THEN the Collision System SHALL prevent horizontal movement through the rock's collision bounds
2. WHEN the player moves onto terrain with slope less than 30 degrees THEN the Collision System SHALL allow walking up the slope
3. WHEN the player moves onto terrain with slope greater than 30 degrees THEN the Collision System SHALL require jumping to ascend
4. WHEN the player collides with an NPC THEN the Collision System SHALL apply push-back force to both entities based on mass
5. WHEN the player is in water THEN the Collision System SHALL apply buoyancy force and reduce movement speed by 30%
6. WHEN the player falls from height greater than 5 units THEN the Collision System SHALL apply fall damage proportional to fall distance
7. WHEN calculating slope THEN the Collision System SHALL use terrain normal vector to determine angle in degreesrom height greater than 5 units THEN the Collision System SHALL apply fall damage proportional to fall distance
7. WHEN calculating slope THEN the Collision System SHALL use terrain normal vector to determine angle in degrees

### Requirement 16: Visual Effects and Shaders

**User Story:** As a player, I want high-quality visual effects that enhance immersion, so that the game is enjoyable to look at.

#### Acceptance Criteria

1. WHEN rendering the player THEN the Render System SHALL apply fur shader with 5 shell layers for volumetric fur effect
2. WHEN rendering water THEN the Render System SHALL apply animated water shader with Gerstner wave displacement and normal mapping
3. WHEN weather is rain THEN the Render System SHALL render particle system with 500 raindrops using additive blending
4. WHEN weather is snow THEN the Render System SHALL render particle system with 300 snowflakes using alpha blending
5. WHEN time phase is night THEN the Render System SHALL render firefly particles with glow effect using additive blending
6. WHEN the player moves THEN the Render System SHALL animate player limbs with procedural walk cycle or play Meshy animation
7. WHEN rendering terrain THEN the Render System SHALL apply triplanar texture mapping based on biome type to avoid UV stretching

### Requirement 17: Audio System

**User Story:** As a player, I want responsive audio that reacts to the environment, so that the experience feels complete.

#### Acceptance Criteria

1. WHEN the player moves THEN the Audio System SHALL play footstep sounds at intervals matching animation cycle
2. WHEN weather is rain THEN the Audio System SHALL play rain ambient sound at volume proportional to intensity
3. WHEN a predator is nearby THEN the Audio System SHALL play predator vocalization sounds using spatial audio
4. WHEN the player collects a resource THEN the Audio System SHALL play collection sound effect
5. WHEN time phase changes THEN the Audio System SHALL crossfade ambient soundscapes over 10 seconds
6. WHEN in different biomes THEN the Audio System SHALL play biome-specific ambient sounds (marsh: frogs/water, forest: birds, desert: wind)
7. WHEN an attack connects THEN the Audio System SHALL play impact sound effect based on attack type

### Requirement 18: HUD and UI

**User Story:** As a player, I want visual feedback on my status, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN the game runs THEN the HUD SHALL display player health as a bar in the top-left corner
2. WHEN the game runs THEN the HUD SHALL display player stamina as a bar below the health bar
3. WHEN the player is near a resource THEN the HUD SHALL display tap-to-collect prompt with resource icon
4. WHEN the player is in danger (health below 30%) THEN the HUD SHALL pulse red vignette effect
5. WHEN the player taps pause button THEN the HUD SHALL display pause menu with resume and settings options
6. WHEN displaying time THEN the HUD SHALL show current hour and phase as text in top-right corner formatted as "8:00 AM - Day"
7. WHEN displaying attack cooldowns THEN the HUD SHALL show circular cooldown timers for each attack button

### Requirement 19: Performance Optimization

**User Story:** As a player, I want smooth performance on mobile devices, so that the game is playable.

#### Acceptance Criteria

1. WHEN rendering THEN the Render System SHALL maintain 60 FPS on iPhone 13 or equivalent Android device
2. WHEN rendering grass, rocks, and trees THEN the Render System SHALL use GPU instanced meshes to reduce draw calls
3. WHEN entities are beyond 50 units THEN the Render System SHALL apply level-of-detail reduction (medium poly models)
4. WHEN entities are beyond 100 units THEN the Render System SHALL cull entities from rendering entirely
5. WHEN the frame time exceeds 16ms THEN the Performance System SHALL reduce particle counts by 50%
6. WHEN memory usage exceeds 500MB THEN the Performance System SHALL trigger garbage collection and unload distant biome assets
7. WHEN the app launches THEN the Render System SHALL initialize native OpenGL ES context via expo-gl

### Requirement 20: Save System

**User Story:** As a player, I want my progress to be saved, so that I can continue later.

#### Acceptance Criteria

1. WHEN the player pauses THEN the Save System SHALL serialize player position, health, stamina, species, and time to AsyncStorage
2. WHEN the game loads THEN the Save System SHALL restore player state from AsyncStorage if available
3. WHEN the player collects a resource THEN the Save System SHALL update the save data with collected resource IDs
4. WHEN the save data is corrupted THEN the Save System SHALL initialize a new game with default values and log error
5. WHEN the player dies THEN the Save System SHALL preserve the save but reset player to spawn point with full health and stamina

### Requirement 21: Mobile Touch Controls

**User Story:** As a mobile player, I want intuitive touch controls, so that the game is easy to play on my device.

#### Acceptance Criteria

1. WHEN the player touches the screen THEN the Input System SHALL display virtual joystick at touch position
2. WHEN the player drags the joystick THEN the Input System SHALL update movement direction continuously
3. WHEN the player swipes up THEN the Input System SHALL trigger jump action
4. WHEN the player taps a resource THEN the Input System SHALL trigger collection action
5. WHEN the player taps an attack button THEN the Input System SHALL trigger that attack if stamina and cooldown allow
6. WHEN the player uses two fingers to pinch THEN the Input System SHALL adjust camera zoom
7. WHEN the player releases touch THEN the Input System SHALL hide the virtual joystick after 1 second
8. WHEN the player taps an NPC THEN the Input System SHALL set that NPC as the combat target

### Requirement 22: SDF Terrain Generation

**User Story:** As a player, I want procedurally generated terrain with caves and overhangs, so that the world feels organic and explorable.

#### Acceptance Criteria

1. WHEN the game initializes THEN the Terrain System SHALL use Signed Distance Field functions to define terrain geometry
2. WHEN calculating terrain height THEN the Terrain System SHALL use Fractal Brownian Motion with 3-5 octaves for natural variation
3. WHEN generating mountain biome terrain THEN the Terrain System SHALL apply warped FBM with ridge noise to create peaks up to 25 units high
4. WHEN generating marsh biome terrain THEN the Terrain System SHALL use minimal noise (0.5 unit variation) for flat wetlands
5. WHEN generating desert biome terrain THEN the Terrain System SHALL use sine-based noise to create sand dunes
6. WHEN generating caves THEN the Terrain System SHALL use 3D noise to carve tunnel systems below y=10 with threshold 0.15
7. WHEN generating terrain overhangs THEN the Terrain System SHALL use domain warping to push surfaces outward in certain areas
8. WHEN calculating terrain normals THEN the Terrain System SHALL use SDF gradient with epsilon 0.001 for smooth lighting

### Requirement 23: Marching Cubes Mesh Generation

**User Story:** As a developer, I want to convert SDF terrain into renderable meshes efficiently, so that the game performs well.

#### Acceptance Criteria

1. WHEN generating terrain mesh THEN the Marching Cubes System SHALL sample the SDF at grid resolution (32-128 based on quality)
2. WHEN processing a cube THEN the Marching Cubes System SHALL use edge table and triangle table lookups for correct topology
3. WHEN interpolating edge vertices THEN the Marching Cubes System SHALL use linear interpolation between grid points based on SDF values
4. WHEN generating vertices THEN the Marching Cubes System SHALL deduplicate vertices using position-based key mapping
5. WHEN calculating normals THEN the Marching Cubes System SHALL use SDF gradient at each vertex for smooth shading
6. WHEN generating large terrain THEN the Marching Cubes System SHALL use chunk-based generation with 64x64x64 unit chunks
7. WHEN a chunk is out of view THEN the Marching Cubes System SHALL unload the chunk geometry to free memory

### Requirement 24: GPU Instancing for Vegetation

**User Story:** As a player, I want dense vegetation without performance loss, so that biomes feel lush and alive.

#### Acceptance Criteria

1. WHEN rendering grass THEN the Render System SHALL use GPU instancing to render 8000 grass blades as a single draw call
2. WHEN rendering rocks THEN the Render System SHALL use GPU instancing to render 150 rock instances as a single draw call
3. WHEN rendering trees THEN the Render System SHALL use GPU instancing with biome-specific density (forest: 0.3/m², savanna: 0.1/m²)
4. WHEN updating instance transforms THEN the Render System SHALL use instanced buffer attributes for position, rotation, and scale
5. WHEN an instance is beyond 100 units THEN the Render System SHALL exclude it from the instance buffer
6. WHEN biome changes THEN the Render System SHALL regenerate instance buffers with appropriate species and density

### Requirement 25: Adaptive Quality System

**User Story:** As a player, I want the game to maintain smooth performance by adjusting quality, so that gameplay never stutters.

#### Acceptance Criteria

1. WHEN frame time exceeds 16ms for 3 consecutive frames THEN the Adaptive Quality System SHALL reduce particle counts by 50%
2. WHEN frame time exceeds 20ms for 3 consecutive frames THEN the Adaptive Quality System SHALL reduce shadow map resolution from 2048 to 1024
3. WHEN frame time exceeds 25ms for 3 consecutive frames THEN the Adaptive Quality System SHALL disable post-processing effects
4. WHEN frame time drops below 14ms for 60 consecutive frames THEN the Adaptive Quality System SHALL restore one quality level
5. WHEN memory usage exceeds 500MB THEN the Adaptive Quality System SHALL trigger garbage collection
6. WHEN memory usage exceeds 600MB THEN the Adaptive Quality System SHALL unload distant biome assets and reduce texture resolution

### Requirement 26: Entity Pooling System

**User Story:** As a developer, I want to reuse entity objects efficiently, so that garbage collection doesn't cause frame drops.

#### Acceptance Criteria

1. WHEN an NPC dies THEN the Entity Pool System SHALL return the entity to the pool instead of destroying it
2. WHEN spawning an NPC THEN the Entity Pool System SHALL reuse a pooled entity if available before creating a new one
3. WHEN a resource is collected THEN the Entity Pool System SHALL return the resource entity to the pool
4. WHEN a resource respawns THEN the Entity Pool System SHALL retrieve an entity from the pool and reset its properties
5. WHEN the pool size exceeds 200 entities THEN the Entity Pool System SHALL trim excess entities to prevent memory bloat
6. WHEN retrieving from pool THEN the Entity Pool System SHALL reset all component values to defaults

### Requirement 27: Level of Detail (LOD) System

**User Story:** As a player, I want distant objects to render efficiently, so that I can see far without performance loss.

#### Acceptance Criteria

1. WHEN an entity is within 30 units THEN the LOD System SHALL render the full-detail model
2. WHEN an entity is between 30-60 units THEN the LOD System SHALL render the medium-detail model (50% poly count)
3. WHEN an entity is between 60-100 units THEN the LOD System SHALL render the low-detail model (25% poly count)
4. WHEN an entity is beyond 100 units THEN the LOD System SHALL cull the entity entirely
5. WHEN calculating distance THEN the LOD System SHALL use squared distance to avoid expensive square root operations
6. WHEN LOD level changes THEN the LOD System SHALL swap models without recreating the entity

### Requirement 28: Memory Monitoring System

**User Story:** As a developer, I want to track memory usage in real-time, so that I can prevent out-of-memory crashes.

#### Acceptance Criteria

1. WHEN the game runs THEN the Memory Monitor SHALL track heap size, texture memory, and geometry memory every second
2. WHEN memory usage increases by 100MB in 10 seconds THEN the Memory Monitor SHALL log a warning
3. WHEN memory usage exceeds 500MB THEN the Memory Monitor SHALL trigger garbage collection
4. WHEN memory usage exceeds 600MB THEN the Memory Monitor SHALL emit a critical warning and unload non-essential assets
5. WHEN in development mode THEN the Memory Monitor SHALL display memory stats in the HUD
6. WHEN memory leak is detected (continuous growth) THEN the Memory Monitor SHALL log detailed allocation traces

### Requirement 29: Volumetric Effects System

**User Story:** As a player, I want atmospheric volumetric effects like god rays and fog, so that the world feels immersive.

#### Acceptance Criteria

1. WHEN time phase is dawn or dusk THEN the Volumetric Effects System SHALL render god rays from the sun direction
2. WHEN weather is fog THEN the Volumetric Effects System SHALL render volumetric fog with density based on weather intensity
3. WHEN in a cave THEN the Volumetric Effects System SHALL render volumetric darkness with light shafts from openings
4. WHEN rendering god rays THEN the Volumetric Effects System SHALL use radial blur post-processing from sun screen position
5. WHEN rendering volumetric fog THEN the Volumetric Effects System SHALL use depth-based fog density calculation
6. WHEN performance is low THEN the Volumetric Effects System SHALL reduce volumetric sample count from 32 to 16

### Requirement 30: Terrain Material Loader

**User Story:** As a developer, I want to load PBR materials efficiently for different biomes, so that terrain looks realistic.

#### Acceptance Criteria

1. WHEN loading terrain materials THEN the Material Loader SHALL load albedo, normal, roughness, AO, and displacement maps
2. WHEN applying materials THEN the Material Loader SHALL use triplanar mapping to avoid UV stretching on procedural terrain
3. WHEN switching biomes THEN the Material Loader SHALL blend between biome materials over 10 meters at boundaries
4. WHEN on mobile THEN the Material Loader SHALL reduce texture resolution from 1024x1024 to 512x512
5. WHEN memory is low THEN the Material Loader SHALL unload distant biome materials and keep only current biome loaded
6. WHEN materials are loaded THEN the Material Loader SHALL apply texture compression (DXT5 for desktop, PVRTC for mobile)

### Requirement 31: Water System

**User Story:** As a player, I want realistic water physics and visuals, so that aquatic gameplay feels immersive.

#### Acceptance Criteria

1. WHEN rendering water THEN the Water System SHALL use animated Gerstner wave displacement with 4 wave frequencies
2. WHEN the player enters water THEN the Water System SHALL apply buoyancy force based on submersion depth
3. WHEN the player is in water THEN the Water System SHALL reduce movement speed by 30% and apply swim animation
4. WHEN aquatic prey spawns THEN the Water System SHALL restrict movement to water volumes using Yuka.js containment behavior
5. WHEN calculating water surface THEN the Water System SHALL use SDF to define water level at y=0.2 in marsh biome, y=0.0 in other biomes
6. WHEN rendering water THEN the Water System SHALL apply Fresnel effect for realistic reflections and refractions
7. WHEN underwater THEN the Water System SHALL apply blue fog tint and reduce visibility to 20 units
8. WHEN water is shallow (depth < 0.5 units) THEN the Water System SHALL render caustics on terrain below

### Requirement 32: Ecosystem Balance System

**User Story:** As a player, I want the ecosystem to feel alive with predator-prey dynamics, so that the world feels realistic.

#### Acceptance Criteria

1. WHEN prey population in a biome drops below 20% of target THEN the Ecosystem System SHALL increase prey spawn rate by 50%
2. WHEN prey population in a biome exceeds 150% of target THEN the Ecosystem System SHALL decrease prey spawn rate by 50%
3. WHEN predator population in a biome exceeds 120% of target THEN the Ecosystem System SHALL increase prey spawn rate to provide food
4. WHEN a predator kills prey THEN the Ecosystem System SHALL record the kill and update population statistics
5. WHEN calculating spawn rates THEN the Ecosystem System SHALL use target populations: marsh (30 prey, 5 predators), forest (40 prey, 6 predators), desert (20 prey, 4 predators)
6. WHEN an NPC predator is hungry (health < 50%) THEN the AI System SHALL prioritize hunting behavior over wandering
7. WHEN an NPC predator successfully hunts THEN the AI System SHALL transition to eat state and restore health over 10 seconds

### Requirement 33: Prey Awareness and Flee Behavior

**User Story:** As a player, I want prey to react realistically to threats, so that hunting feels challenging.

#### Acceptance Criteria

1. WHEN a predator enters prey awareness radius (15 units) THEN the Prey AI SHALL transition from graze to alert state
2. WHEN a predator enters prey flee radius (8 units) THEN the Prey AI SHALL transition to flee state using Yuka.js flee behavior
3. WHEN fleeing THEN the Prey AI SHALL move at species-specific flee speed: rabbit (8 m/s), deer (10 m/s), vole (6 m/s)
4. WHEN prey reaches safe distance (25 units from threat) THEN the Prey AI SHALL transition back to graze state
5. WHEN prey detects multiple predators THEN the Prey AI SHALL flee from the nearest threat
6. WHEN prey is cornered (no escape path) THEN the Prey AI SHALL use Yuka.js obstacle avoidance to find alternate routes
7. WHEN prey is aquatic THEN the Prey AI SHALL flee toward deeper water instead of land

### Requirement 34: Predator Hunting Behavior

**User Story:** As a player, I want NPC predators to hunt realistically, so that the ecosystem feels dynamic.

#### Acceptance Criteria

1. WHEN an NPC predator detects prey within awareness radius (20 units) THEN the Predator AI SHALL transition to chase state
2. WHEN chasing THEN the Predator AI SHALL use Yuka.js pursue behavior to predict prey movement
3. WHEN predator reaches attack range (2 units) THEN the Predator AI SHALL transition to attack state
4. WHEN attacking THEN the Predator AI SHALL use species-appropriate attack (tank: bite, agile: pounce, balanced: claw)
5. WHEN prey dies THEN the Predator AI SHALL transition to eat state and restore health by consuming the corpse
6. WHEN eating THEN the Predator AI SHALL remain stationary for 10 seconds and restore 50 health
7. WHEN predator health is full THEN the Predator AI SHALL transition back to patrol state

### Requirement 35: Camera System

**User Story:** As a player, I want a responsive camera that follows my character smoothly, so that gameplay feels polished.

#### Acceptance Criteria

1. WHEN the game runs THEN the Camera System SHALL position the camera 8 units behind and 4 units above the player
2. WHEN the player moves THEN the Camera System SHALL smoothly follow using lerp with damping factor 0.1
3. WHEN the player rotates THEN the Camera System SHALL orbit around the player maintaining distance
4. WHEN the player uses two-finger pinch THEN the Camera System SHALL adjust distance between 5-15 units
5. WHEN the camera would intersect terrain THEN the Camera System SHALL raycast and move camera forward to avoid clipping
6. WHEN the player enters water THEN the Camera System SHALL lower camera angle to 2 units above water surface
7. WHEN the player is in combat THEN the Camera System SHALL zoom out to 12 units to show more battlefield

### Requirement 36: Animation System

**User Story:** As a player, I want smooth character animations, so that movement feels natural.

#### Acceptance Criteria

1. WHEN the player is idle THEN the Animation System SHALL play idle animation with breathing cycle
2. WHEN the player walks THEN the Animation System SHALL play walk cycle animation at speed proportional to velocity
3. WHEN the player runs THEN the Animation System SHALL play run cycle animation at speed proportional to velocity
4. WHEN the player jumps THEN the Animation System SHALL play jump animation with takeoff, air, and land phases
5. WHEN the player attacks THEN the Animation System SHALL play attack animation matching attack type (bite, claw, tail)
6. WHEN the player takes damage THEN the Animation System SHALL play hit reaction animation with 0.3 second duration
7. WHEN Meshy rigged models are available THEN the Animation System SHALL use Meshy skeletal animations, otherwise use procedural animation

### Requirement 37: Particle System

**User Story:** As a player, I want visual feedback through particles, so that actions feel impactful.

#### Acceptance Criteria

1. WHEN the player runs on terrain THEN the Particle System SHALL spawn dust particles behind the player at 10 particles per second
2. WHEN an attack connects THEN the Particle System SHALL spawn impact particles (blood for flesh, sparks for armor) at hit location
3. WHEN the player collects an item THEN the Particle System SHALL spawn sparkle particles that rise and fade over 1 second
4. WHEN weather is rain THEN the Particle System SHALL spawn 500 raindrop particles with downward velocity 15 m/s
5. WHEN weather is snow THEN the Particle System SHALL spawn 300 snowflake particles with downward velocity 2 m/s and horizontal drift
6. WHEN time is night THEN the Particle System SHALL spawn firefly particles with glow effect and random flight paths
7. WHEN the player enters water THEN the Particle System SHALL spawn splash particles at water surface

### Requirement 38: Minimap System

**User Story:** As a player, I want a minimap to navigate the world, so that I don't get lost.

#### Acceptance Criteria

1. WHEN the game runs THEN the Minimap System SHALL render a top-down view in the bottom-right corner at 150x150 pixels
2. WHEN rendering minimap THEN the Minimap System SHALL show terrain elevation using grayscale heightmap
3. WHEN rendering minimap THEN the Minimap System SHALL show player position as a white arrow indicating facing direction
4. WHEN rendering minimap THEN the Minimap System SHALL show nearby NPCs as colored dots (red: predators, green: prey)
5. WHEN rendering minimap THEN the Minimap System SHALL show biome boundaries as colored regions
6. WHEN the player moves THEN the Minimap System SHALL update minimap center to follow player position
7. WHEN the player taps minimap THEN the Minimap System SHALL toggle between zoomed (50 unit radius) and wide (200 unit radius) views

### Requirement 39: Tutorial System

**User Story:** As a new player, I want a tutorial to learn the game, so that I understand how to play.

#### Acceptance Criteria

1. WHEN the game starts for the first time THEN the Tutorial System SHALL display welcome message and basic controls
2. WHEN the player first moves THEN the Tutorial System SHALL display message explaining stamina management
3. WHEN the player first encounters prey THEN the Tutorial System SHALL display message explaining hunting mechanics
4. WHEN the player first takes damage THEN the Tutorial System SHALL display message explaining health and healing
5. WHEN the player first uses an attack THEN the Tutorial System SHALL display message explaining attack types and cooldowns
6. WHEN the player completes all tutorial steps THEN the Tutorial System SHALL mark tutorial as complete in save data
7. WHEN the player opens settings THEN the Tutorial System SHALL provide option to replay tutorial

### Requirement 40: Settings System

**User Story:** As a player, I want to customize game settings, so that I can tailor the experience to my preferences.

#### Acceptance Criteria

1. WHEN the player opens settings THEN the Settings System SHALL display options for graphics quality, audio volume, and controls
2. WHEN the player changes graphics quality THEN the Settings System SHALL adjust shadow resolution, particle counts, and LOD distances
3. WHEN the player changes master volume THEN the Settings System SHALL adjust all audio output proportionally
4. WHEN the player changes music volume THEN the Settings System SHALL adjust only background music volume
5. WHEN the player changes SFX volume THEN the Settings System SHALL adjust only sound effects volume
6. WHEN the player toggles virtual joystick THEN the Settings System SHALL enable/disable on-screen joystick (alternative: tap-to-move)
7. WHEN settings are changed THEN the Settings System SHALL save preferences to AsyncStorage and apply immediately

### Requirement 41: Species Selection Screen

**User Story:** As a player, I want to choose which predator species to play, so that I can experience different playstyles.

#### Acceptance Criteria

1. WHEN starting a new game THEN the Species Selection SHALL display all 13 predator species with 3D model previews
2. WHEN the player taps a species THEN the Species Selection SHALL display species stats: health, stamina, armor, dodge, attacks
3. WHEN the player taps a species THEN the Species Selection SHALL display species description and native biome
4. WHEN the player confirms selection THEN the Species Selection SHALL create player entity with selected species and spawn in native biome
5. WHEN displaying species THEN the Species Selection SHALL group by archetype: tank (badger, wolf, wombat, tasmanian devil), agile (mongoose, meerkat, coati, red panda), balanced (otter, fox, raccoon, pangolin, honey badger)
6. WHEN the player has completed the game with a species THEN the Species Selection SHALL display completion badge for that species
7. WHEN the player selects a species THEN the Species Selection SHALL play species vocalization sound

### Requirement 42: Achievements System

**User Story:** As a player, I want to earn achievements for accomplishments, so that I feel rewarded for my progress.

#### Acceptance Criteria

1. WHEN the player hunts 10 prey THEN the Achievements System SHALL unlock "Novice Hunter" achievement
2. WHEN the player hunts 100 prey THEN the Achievements System SHALL unlock "Master Hunter" achievement
3. WHEN the player survives 10 in-game days THEN the Achievements System SHALL unlock "Survivor" achievement
4. WHEN the player explores all 7 biomes THEN the Achievements System SHALL unlock "Explorer" achievement
5. WHEN the player defeats 5 predators in combat THEN the Achievements System SHALL unlock "Apex Predator" achievement
6. WHEN the player completes the game with all 13 species THEN the Achievements System SHALL unlock "Species Master" achievement
7. WHEN an achievement is unlocked THEN the Achievements System SHALL display toast notification and save to AsyncStorage

### Requirement 43: Biome Transition System

**User Story:** As a player, I want smooth transitions between biomes, so that the world feels cohesive.

#### Acceptance Criteria

1. WHEN the player crosses a biome boundary THEN the Biome Transition System SHALL blend terrain colors over 10 meters
2. WHEN the player crosses a biome boundary THEN the Biome Transition System SHALL crossfade ambient sounds over 5 seconds
3. WHEN the player crosses a biome boundary THEN the Biome Transition System SHALL gradually adjust fog color and density over 10 meters
4. WHEN the player crosses a biome boundary THEN the Biome Transition System SHALL spawn transition vegetation (mix of both biomes) in the boundary zone
5. WHEN calculating biome influence THEN the Biome Transition System SHALL use distance-based weighting for smooth blending
6. WHEN the player enters a new biome THEN the Biome Transition System SHALL display biome name as toast notification

### Requirement 44: Combat Feedback System

**User Story:** As a player, I want clear feedback during combat, so that I understand what's happening.

#### Acceptance Criteria

1. WHEN an attack connects THEN the Combat Feedback System SHALL display damage number floating upward from hit location
2. WHEN an attack is dodged THEN the Combat Feedback System SHALL display "DODGE" text in yellow
3. WHEN an attack is blocked by armor THEN the Combat Feedback System SHALL display reduced damage number in gray
4. WHEN a critical hit occurs (5% chance) THEN the Combat Feedback System SHALL display damage number in red at 150% size
5. WHEN the player lands an attack THEN the Combat Feedback System SHALL trigger haptic feedback (light impact)
6. WHEN the player takes damage THEN the Combat Feedback System SHALL flash red vignette and trigger haptic feedback (medium impact)
7. WHEN stamina is too low for an attack THEN the Combat Feedback System SHALL display "NOT ENOUGH STAMINA" message

### Requirement 45: Day/Night Cycle Effects on Gameplay

**User Story:** As a player, I want day/night cycles to affect gameplay, so that time of day matters strategically.

#### Acceptance Criteria

1. WHEN time phase is night THEN the Gameplay System SHALL increase predator spawn rate by 50%
2. WHEN time phase is night THEN the Gameplay System SHALL reduce prey spawn rate by 30%
3. WHEN time phase is night THEN the Gameplay System SHALL reduce player visibility radius from 100 units to 50 units
4. WHEN time phase is dawn or dusk THEN the Gameplay System SHALL increase prey activity (more movement, less hiding)
5. WHEN time phase is day THEN the Gameplay System SHALL increase prey spawn rate by 20%
6. WHEN time phase is night THEN the Gameplay System SHALL make NPC predators more aggressive (reduced flee threshold)

### Requirement 46: Weather Effects on Gameplay

**User Story:** As a player, I want weather to affect gameplay, so that weather conditions matter strategically.

#### Acceptance Criteria

1. WHEN weather is rain THEN the Gameplay System SHALL reduce NPC awareness radius by 20% (harder to detect player)
2. WHEN weather is fog THEN the Gameplay System SHALL reduce NPC awareness radius by 40%
3. WHEN weather is storm THEN the Gameplay System SHALL reduce player movement speed by 10% due to wind resistance
4. WHEN weather is snow THEN the Gameplay System SHALL reduce player movement speed by 15% and leave footprint trails
5. WHEN weather is sandstorm THEN the Gameplay System SHALL reduce visibility to 20 units and apply constant stamina drain (2/sec)
6. WHEN weather is clear THEN the Gameplay System SHALL apply no penalties and increase NPC awareness radius by 10%

### Requirement 47: Footprint and Trail System

**User Story:** As a player, I want to see footprints and trails, so that tracking feels realistic.

#### Acceptance Criteria

1. WHEN the player moves on terrain THEN the Trail System SHALL spawn footprint decals at foot positions every 0.5 seconds
2. WHEN weather is snow THEN the Trail System SHALL make footprints more visible and persistent (fade after 60 seconds)
3. WHEN weather is rain THEN the Trail System SHALL make footprints fade quickly (fade after 10 seconds)
4. WHEN an NPC moves THEN the Trail System SHALL spawn footprints for that NPC
5. WHEN the player examines footprints THEN the Trail System SHALL display species type and age (fresh, recent, old)
6. WHEN footprints are older than fade time THEN the Trail System SHALL remove the decal to prevent clutter
7. WHEN the player is in water THEN the Trail System SHALL not spawn footprints

### Requirement 48: Hunger System

**User Story:** As a player, I want to manage hunger, so that survival feels more challenging.

#### Acceptance Criteria

1. WHEN the game runs THEN the Hunger System SHALL decrease hunger value by 1 per minute
2. WHEN hunger reaches 50% THEN the Hunger System SHALL reduce stamina regeneration rate by 30%
3. WHEN hunger reaches 25% THEN the Hunger System SHALL reduce max stamina by 20% and display hunger warning
4. WHEN hunger reaches 0% THEN the Hunger System SHALL apply 1 damage per second until player eats
5. WHEN the player consumes meat THEN the Hunger System SHALL restore hunger by amount based on meat type (rabbit: 20%, deer: 40%)
6. WHEN hunger is above 75% THEN the Hunger System SHALL apply well-fed buff: +10% movement speed, +20% stamina regen
7. WHEN the HUD renders THEN the Hunger System SHALL display hunger bar below stamina bar

### Requirement 49: Crafting System

**User Story:** As a player, I want to craft items from gathered materials, so that gameplay has more depth.

#### Acceptance Criteria

1. WHEN the player collects 5 sticks and 3 stones THEN the Crafting System SHALL unlock "Simple Trap" recipe
2. WHEN the player crafts a Simple Trap THEN the Crafting System SHALL consume materials and add trap item to inventory
3. WHEN the player places a trap THEN the Crafting System SHALL spawn trap entity at placement location
4. WHEN prey walks into a trap THEN the Trap System SHALL immobilize prey for 5 seconds and alert player
5. WHEN the player collects 10 plant fibers THEN the Crafting System SHALL unlock "Bandage" recipe
6. WHEN the player uses a bandage THEN the Crafting System SHALL restore 30 health over 10 seconds
7. WHEN the player opens crafting menu THEN the Crafting System SHALL display all unlocked recipes with material requirements

### Requirement 50: React Native + Expo Architecture

**User Story:** As a developer, I want a properly architected React Native + Expo application, so that the game runs natively on iOS and Android with optimal performance.

#### Acceptance Criteria

1. WHEN the app initializes THEN the App System SHALL use Expo managed workflow with expo-gl for OpenGL ES context
2. WHEN rendering 3D graphics THEN the Render System SHALL use expo-three to bridge React Three Fiber to expo-gl native context
3. WHEN the app runs THEN the Architecture SHALL use Miniplex ECS with React hooks (useEntities, useEntity) for entity queries
4. WHEN managing global state THEN the Architecture SHALL use Zustand stores for UI state, settings, and save data
5. WHEN persisting data THEN the Architecture SHALL use AsyncStorage for save files, settings, and achievements
6. WHEN handling touch input THEN the Input System SHALL use React Native PanResponder and GestureHandler for touch events
7. WHEN playing audio THEN the Audio System SHALL use expo-av for sound effects and background music
8. WHEN the app structure is organized THEN the Architecture SHALL follow: src/components (React components), src/systems (ECS systems), src/stores (Zustand stores), src/utils (SDF, marching cubes, helpers)
9. WHEN building for production THEN the Build System SHALL use Expo EAS Build for native iOS and Android binaries
10. WHEN developing THEN the Dev System SHALL use Expo Go for rapid testing on physical devices

### Requirement 51: ECS Architecture with Miniplex

**User Story:** As a developer, I want a clean ECS architecture, so that game logic is maintainable and performant.

#### Component Definitions

| Component | Properties | Purpose |
|-----------|-----------|---------|
| TransformComponent | position: Vector3, rotation: Euler, scale: Vector3 | Entity position and orientation |
| MovementComponent | velocity: Vector3, maxSpeed: number, acceleration: number | Movement physics |
| SpeciesComponent | speciesId: string, displayName: string, size: string, archetype: string | Species identity |
| CombatComponent | health: number, maxHealth: number, stamina: number, maxStamina: number, armor: number, dodge: number, attacks: AttackType[] | Combat stats |
| AIComponent | currentState: string, targetEntity: Entity \| null, awarenessRadius: number, yukaVehicle: Vehicle | AI behavior |
| RenderComponent | modelPath: string, meshRef: Mesh \| null, visible: boolean | 3D rendering |
| CollisionComponent | boundingBox: Box3, collisionMask: number, isTrigger: boolean | Physics collision |
| DropComponent | dropTable: DropItem[], dropChance: number | Loot drops |
| PlayerComponent | isPlayer: boolean, inputEnabled: boolean | Player marker |
| PreyComponent | isPrey: boolean, fleeSpeed: number, fleeRadius: number | Prey behavior |
| PredatorComponent | isPredator: boolean, huntingEnabled: boolean | Predator behavior |

#### Acceptance Criteria

1. WHEN creating an entity THEN the ECS SHALL use Miniplex world.createEntity() with component data
2. WHEN querying entities THEN the ECS SHALL use Miniplex archetypes for efficient filtered queries
3. WHEN updating entities THEN the ECS SHALL use system functions that iterate over entity queries
4. WHEN removing an entity THEN the ECS SHALL use world.destroyEntity() to clean up all components
5. WHEN React components need entity data THEN the ECS SHALL use useEntities() hook for reactive queries
6. WHEN a component needs a specific entity THEN the ECS SHALL use useEntity(entityId) hook
7. WHEN systems run THEN the ECS SHALL execute in order: InputSystem → AISystem → MovementSystem → CollisionSystem → CombatSystem → RenderSystem

### Requirement 52: Inventory System

**User Story:** As a player, I want to manage collected items in an inventory, so that I can use them strategically.

#### Acceptance Criteria

1. WHEN the player collects an item THEN the Inventory System SHALL add the item to inventory with stack count
2. WHEN the player opens inventory THEN the Inventory System SHALL display all items with icons, names, and quantities
3. WHEN the player taps an item THEN the Inventory System SHALL display item description and use/drop options
4. WHEN the player uses a consumable THEN the Inventory System SHALL apply item effect and decrease stack count by 1
5. WHEN the player drops an item THEN the Inventory System SHALL spawn item entity at player position and remove from inventory
6. WHEN inventory is full (20 slots) THEN the Inventory System SHALL prevent collecting new items and display "INVENTORY FULL" message
7. WHEN the player collects the same item type THEN the Inventory System SHALL stack items up to max stack size (meat: 10, materials: 50)

