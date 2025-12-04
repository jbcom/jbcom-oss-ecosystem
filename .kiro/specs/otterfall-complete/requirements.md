# Requirements Document: Otterfall Complete Implementation

## Introduction

Otterfall is a mobile-first 3D exploration and survival game where players control a river otter navigating through diverse biomes. The game features a living ecosystem with predator-prey dynamics, weather systems, time-of-day cycles, and biome-specific challenges. The current baseline includes functional player movement, collision detection, and basic rendering. This specification defines the requirements to complete the full game vision.

## Glossary

- **Game System**: The core Otterfall application including rendering, physics, and game logic
- **Player Entity**: The controllable river otter character
- **NPC Entity**: Non-player character entities including predators and prey
- **ECS**: Entity Component System architecture using Miniplex
- **Biome**: A distinct geographical region with unique visual characteristics and species
- **Species Component**: Data defining behavioral and physical characteristics of entities
- **Time System**: The day/night cycle simulation affecting lighting and gameplay
- **Weather System**: Dynamic weather conditions affecting visibility and gameplay
- **Collision System**: Physics system handling entity-environment and entity-entity interactions
- **AI System**: Behavioral system controlling NPC decision-making and movement
- **Resource**: Collectible items that restore player health or stamina
- **HUD**: Heads-up display showing player status and game information

## Requirements

### Requirement 1: Time of Day System

**User Story:** As a player, I want to experience dynamic day/night cycles, so that the world feels alive and immersive.

#### Acceptance Criteria

1. WHEN the game runs THEN the Time System SHALL advance the hour value from 0.0 to 24.0 continuously
2. WHEN the hour value reaches 24.0 THEN the Time System SHALL reset the hour to 0.0
3. WHEN the hour is between 5.0 and 7.0 THEN the Time System SHALL set the phase to dawn
4. WHEN the hour is between 7.0 and 17.0 THEN the Time System SHALL set the phase to day
5. WHEN the hour is between 17.0 and 19.0 THEN the Time System SHALL set the phase to dusk
6. WHEN the hour is between 19.0 and 5.0 THEN the Time System SHALL set the phase to night
7. WHEN the phase changes THEN the Time System SHALL update sunIntensity, sunAngle, ambientLight, and fogDensity values smoothly

### Requirement 2: Weather System

**User Story:** As a player, I want to encounter different weather conditions, so that gameplay remains varied and challenging.

#### Acceptance Criteria

1. WHEN weather duration expires THEN the Weather System SHALL select a new weather type based on biome probabilities
2. WHEN transitioning weather THEN the Weather System SHALL interpolate intensity from 0.0 to 1.0 over 30 seconds
3. WHEN weather is rain THEN the Weather System SHALL reduce visibility by 20%
4. WHEN weather is fog THEN the Weather System SHALL reduce visibility by 50%
5. WHEN weather is storm THEN the Weather System SHALL increase wind speed by 300%
6. WHEN weather is snow THEN the Weather System SHALL reduce player movement speed by 15%
7. WHEN weather is sandstorm THEN the Weather System SHALL reduce visibility by 70% and increase wind speed by 400%

### Requirement 3: Biome System

**User Story:** As a player, I want to explore distinct biomes with unique visuals and challenges, so that exploration feels rewarding.

#### Acceptance Criteria

1. WHEN the game initializes THEN the Biome System SHALL generate 7 distinct biome regions
2. WHEN the player enters a biome THEN the Biome System SHALL update terrain colors, fog color, and ambient sound
3. WHEN in the marsh biome THEN the Biome System SHALL spawn water features and reeds
4. WHEN in the forest biome THEN the Biome System SHALL spawn trees with density of 0.3 per square meter
5. WHEN in the desert biome THEN the Biome System SHALL spawn cacti and reduce water features to zero
6. WHEN in the tundra biome THEN the Biome System SHALL apply snow shader to terrain and reduce ambient temperature
7. WHEN in the mountain biome THEN the Biome System SHALL generate elevated terrain with slopes up to 45 degrees

### Requirement 4: NPC Species System

**User Story:** As a player, I want to encounter various animal species with realistic behaviors, so that the world feels alive.

#### Acceptance Criteria

1. WHEN the game initializes THEN the Species System SHALL spawn predator entities based on biome spawn tables
2. WHEN the game initializes THEN the Species System SHALL spawn prey entities based on biome spawn tables
3. WHEN an NPC entity is created THEN the Species System SHALL assign health, stamina, speed, and behavioral traits from species data
4. WHEN a predator entity detects the player within awareness radius THEN the Species System SHALL transition the predator to chase state
5. WHEN a prey entity detects a predator within awareness radius THEN the Species System SHALL transition the prey to flee state
6. WHEN an entity's health reaches zero THEN the Species System SHALL transition the entity to dead state and remove it after 5 seconds

### Requirement 5: AI Steering Behaviors

**User Story:** As a player, I want NPCs to move and behave realistically, so that interactions feel natural.

#### Acceptance Criteria

1. WHEN an NPC is in idle state THEN the AI System SHALL apply wander behavior with random direction changes every 3-5 seconds
2. WHEN an NPC is in chase state THEN the AI System SHALL apply seek behavior toward the target entity
3. WHEN an NPC is in flee state THEN the AI System SHALL apply flee behavior away from the threat entity
4. WHEN an NPC encounters an obstacle THEN the AI System SHALL apply obstacle avoidance steering
5. WHEN multiple NPCs are nearby THEN the AI System SHALL apply separation steering to prevent overlap
6. WHEN an NPC reaches its destination THEN the AI System SHALL transition to idle state

### Requirement 6: Player Health and Stamina

**User Story:** As a player, I want to manage my health and stamina, so that survival feels meaningful.

#### Acceptance Criteria

1. WHEN the player spawns THEN the Player System SHALL initialize health to 100 and stamina to 100
2. WHEN the player runs THEN the Player System SHALL decrease stamina by 5 per second
3. WHEN the player is idle THEN the Player System SHALL increase stamina by 10 per second up to maximum
4. WHEN the player collides with a predator THEN the Player System SHALL decrease health by the predator's damage value
5. WHEN the player's health reaches zero THEN the Player System SHALL trigger game over state
6. WHEN the player collects a resource THEN the Player System SHALL increase health or stamina based on resource type

### Requirement 7: Resource Collection

**User Story:** As a player, I want to collect resources to restore health and stamina, so that I can survive longer.

#### Acceptance Criteria

1. WHEN the game initializes THEN the Resource System SHALL spawn fish, berries, and water sources in appropriate biomes
2. WHEN the player is within 1.5 units of a resource THEN the Resource System SHALL display a collection prompt
3. WHEN the player collects a fish THEN the Resource System SHALL increase player health by 20
4. WHEN the player collects berries THEN the Resource System SHALL increase player stamina by 15
5. WHEN the player collects water THEN the Resource System SHALL increase player stamina by 25
6. WHEN a resource is collected THEN the Resource System SHALL remove the resource and respawn it after 60 seconds

### Requirement 8: Enhanced Collision System

**User Story:** As a player, I want realistic collision with terrain and entities, so that movement feels natural.

#### Acceptance Criteria

1. WHEN the player moves toward a rock THEN the Collision System SHALL prevent horizontal movement through the rock
2. WHEN the player jumps onto a rock with slope less than 30 degrees THEN the Collision System SHALL allow the player to walk up the slope
3. WHEN the player jumps onto a rock with slope greater than 30 degrees THEN the Collision System SHALL require jumping to reach the top
4. WHEN the player collides with an NPC THEN the Collision System SHALL apply push-back force to both entities
5. WHEN the player is in water THEN the Collision System SHALL apply buoyancy force and reduce movement speed by 30%
6. WHEN the player falls from height greater than 5 units THEN the Collision System SHALL apply fall damage proportional to fall distance

### Requirement 9: Visual Effects and Shaders

**User Story:** As a player, I want high-quality visual effects that enhance immersion, so that the game is enjoyable to look at.

#### Acceptance Criteria

1. WHEN rendering the player THEN the Render System SHALL apply fur shader with 5 shell layers
2. WHEN rendering water THEN the Render System SHALL apply animated water shader with wave displacement
3. WHEN weather is rain THEN the Render System SHALL render particle system with 500 raindrops
4. WHEN weather is snow THEN the Render System SHALL render particle system with 300 snowflakes
5. WHEN time phase is night THEN the Render System SHALL render firefly particles with glow effect
6. WHEN the player moves THEN the Render System SHALL animate player limbs with procedural walk cycle
7. WHEN rendering terrain THEN the Render System SHALL apply triplanar texture mapping based on biome

### Requirement 10: Audio System

**User Story:** As a player, I want responsive audio that reacts to the environment, so that the experience feels complete.

#### Acceptance Criteria

1. WHEN the player moves THEN the Audio System SHALL play footstep sounds at intervals matching animation
2. WHEN weather is rain THEN the Audio System SHALL play rain ambient sound at volume proportional to intensity
3. WHEN a predator is nearby THEN the Audio System SHALL play predator vocalization sounds
4. WHEN the player collects a resource THEN the Audio System SHALL play collection sound effect
5. WHEN time phase changes THEN the Audio System SHALL crossfade ambient soundscapes over 10 seconds
6. WHEN in different biomes THEN the Audio System SHALL play biome-specific ambient sounds

### Requirement 11: HUD and UI

**User Story:** As a player, I want visual feedback on my status, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN the game runs THEN the HUD SHALL display player health as a bar in the top-left corner
2. WHEN the game runs THEN the HUD SHALL display player stamina as a bar below the health bar
3. WHEN the player is near a resource THEN the HUD SHALL display collection prompt with resource icon
4. WHEN the player is in danger THEN the HUD SHALL pulse red vignette effect
5. WHEN the player pauses THEN the HUD SHALL display pause menu with resume and settings options
6. WHEN displaying time THEN the HUD SHALL show current hour and phase as text in top-right corner

### Requirement 12: Performance Optimization

**User Story:** As a player, I want smooth performance on mobile devices, so that the game is playable.

#### Acceptance Criteria

1. WHEN rendering THEN the Render System SHALL maintain 60 FPS on iPhone 13 or equivalent
2. WHEN rendering THEN the Render System SHALL use instanced meshes for grass, rocks, and trees
3. WHEN entities are beyond 50 units THEN the Render System SHALL apply level-of-detail reduction
4. WHEN entities are beyond 100 units THEN the Render System SHALL cull entities from rendering
5. WHEN the frame time exceeds 16ms THEN the Performance System SHALL reduce particle counts by 50%
6. WHEN memory usage exceeds 500MB THEN the Performance System SHALL trigger garbage collection

### Requirement 13: Save System

**User Story:** As a player, I want my progress to be saved, so that I can continue later.

#### Acceptance Criteria

1. WHEN the player pauses THEN the Save System SHALL serialize player position, health, stamina, and time to localStorage
2. WHEN the game loads THEN the Save System SHALL restore player state from localStorage if available
3. WHEN the player collects a resource THEN the Save System SHALL update the save data
4. WHEN the save data is corrupted THEN the Save System SHALL initialize a new game with default values
5. WHEN the player dies THEN the Save System SHALL preserve the save but reset player to spawn point

### Requirement 14: Mobile Touch Controls

**User Story:** As a mobile player, I want intuitive touch controls, so that the game is easy to play on my device.

#### Acceptance Criteria

1. WHEN the player touches the screen THEN the Input System SHALL display virtual joystick at touch position
2. WHEN the player drags the joystick THEN the Input System SHALL update movement direction continuously
3. WHEN the player swipes up THEN the Input System SHALL trigger jump action
4. WHEN the player taps a resource THEN the Input System SHALL trigger collection action
5. WHEN the player uses two fingers to pinch THEN the Input System SHALL adjust camera zoom
6. WHEN the player releases touch THEN the Input System SHALL hide the virtual joystick after 1 second
