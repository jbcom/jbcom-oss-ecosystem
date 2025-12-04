import * as THREE from 'three';

export type SoundType = 
    | 'footstep_grass' 
    | 'footstep_rock' 
    | 'footstep_water'
    | 'footstep_snow'
    | 'rain'
    | 'wind'
    | 'thunder'
    | 'predator_growl'
    | 'predator_howl'
    | 'prey_chirp'
    | 'prey_squeak'
    | 'collect'
    | 'damage'
    | 'jump'
    | 'marsh_ambient'
    | 'forest_ambient'
    | 'desert_ambient'
    | 'tundra_ambient'
    | 'savanna_ambient'
    | 'mountain_ambient'
    | 'scrubland_ambient';

interface AudioSettings {
    sfxVolume: number;
    musicVolume: number;
    masterVolume: number;
}

class AudioManager {
    private listener: THREE.AudioListener;
    private audioLoader: THREE.AudioLoader;
    private audioBuffers: Map<SoundType, AudioBuffer>;
    private settings: AudioSettings;
    private ambientSounds: Map<string, THREE.Audio>;
    private currentAmbient: string | null;
    private targetAmbient: string | null;
    private ambientCrossfadeProgress: number;

    constructor(camera: THREE.Camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        
        this.audioLoader = new THREE.AudioLoader();
        this.audioBuffers = new Map();
        this.ambientSounds = new Map();
        this.currentAmbient = null;
        this.targetAmbient = null;
        this.ambientCrossfadeProgress = 1.0;
        
        this.settings = {
            sfxVolume: 0.7,
            musicVolume: 0.5,
            masterVolume: 1.0,
        };
    }

    /**
     * Load an audio file and cache it
     */
    async loadSound(type: SoundType, url: string): Promise<void> {
        return new Promise((resolve) => {
            this.audioLoader.load(
                url,
                (buffer) => {
                    this.audioBuffers.set(type, buffer);
                    resolve();
                },
                undefined,
                (error) => {
                    console.warn(`Failed to load audio: ${type}`, error);
                    resolve(); // Don't reject, just continue without audio
                }
            );
        });
    }

    /**
     * Play a sound effect at a specific 3D position
     */
    playSoundAt(type: SoundType, position: THREE.Vector3, volume: number = 1.0): void {
        const buffer = this.audioBuffers.get(type);
        if (!buffer) {
            // Audio not loaded, skip silently
            return;
        }

        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(buffer);
        sound.setRefDistance(5);
        sound.setVolume(volume * this.settings.sfxVolume * this.settings.masterVolume);
        
        // Create a temporary object to hold the sound
        const soundObject = new THREE.Object3D();
        soundObject.position.copy(position);
        soundObject.add(sound);
        
        sound.play();
        
        // Clean up after sound finishes
        sound.onEnded = () => {
            soundObject.remove(sound);
        };
    }

    /**
     * Play a non-positional sound effect
     */
    playSound(type: SoundType, volume: number = 1.0): void {
        const buffer = this.audioBuffers.get(type);
        if (!buffer) {
            return;
        }

        const sound = new THREE.Audio(this.listener);
        sound.setBuffer(buffer);
        sound.setVolume(volume * this.settings.sfxVolume * this.settings.masterVolume);
        sound.play();
    }

    /**
     * Play footstep sound based on terrain type
     */
    playFootstep(position: THREE.Vector3, terrainType: 'grass' | 'rock' | 'water' | 'snow'): void {
        const soundType: SoundType = `footstep_${terrainType}`;
        this.playSoundAt(soundType, position, 0.3);
    }

    /**
     * Play ambient loop for a biome
     */
    playAmbient(biomeType: string): void {
        const ambientType: SoundType = `${biomeType}_ambient` as SoundType;
        const buffer = this.audioBuffers.get(ambientType);
        
        if (!buffer) {
            return;
        }

        // Check if already playing this ambient
        if (this.currentAmbient === biomeType) {
            return;
        }

        // Start crossfade
        this.targetAmbient = biomeType;
        this.ambientCrossfadeProgress = 0.0;

        // Create new ambient sound if it doesn't exist
        if (!this.ambientSounds.has(biomeType)) {
            const sound = new THREE.Audio(this.listener);
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0);
            this.ambientSounds.set(biomeType, sound);
        }

        // Start playing target ambient at volume 0
        const targetSound = this.ambientSounds.get(biomeType);
        if (targetSound && !targetSound.isPlaying) {
            targetSound.play();
        }
    }

    /**
     * Update crossfade between ambient sounds
     */
    updateAmbientCrossfade(delta: number): void {
        if (this.ambientCrossfadeProgress >= 1.0 || !this.targetAmbient) {
            return;
        }

        const CROSSFADE_DURATION = 10.0; // 10 seconds
        this.ambientCrossfadeProgress = Math.min(1.0, this.ambientCrossfadeProgress + delta / CROSSFADE_DURATION);

        // Fade out current
        if (this.currentAmbient) {
            const currentSound = this.ambientSounds.get(this.currentAmbient);
            if (currentSound) {
                const volume = (1.0 - this.ambientCrossfadeProgress) * this.settings.musicVolume * this.settings.masterVolume;
                currentSound.setVolume(volume);
                
                if (this.ambientCrossfadeProgress >= 1.0) {
                    currentSound.stop();
                }
            }
        }

        // Fade in target
        if (this.targetAmbient) {
            const targetSound = this.ambientSounds.get(this.targetAmbient);
            if (targetSound) {
                const volume = this.ambientCrossfadeProgress * this.settings.musicVolume * this.settings.masterVolume;
                targetSound.setVolume(volume);
            }
        }

        // Complete crossfade
        if (this.ambientCrossfadeProgress >= 1.0) {
            this.currentAmbient = this.targetAmbient;
            this.targetAmbient = null;
        }
    }

    /**
     * Set volume levels
     */
    setVolume(type: 'sfx' | 'music' | 'master', volume: number): void {
        volume = Math.max(0, Math.min(1, volume));
        
        if (type === 'sfx') {
            this.settings.sfxVolume = volume;
        } else if (type === 'music') {
            this.settings.musicVolume = volume;
            // Update all ambient sounds
            this.ambientSounds.forEach((sound) => {
                if (sound.isPlaying) {
                    sound.setVolume(volume * this.settings.masterVolume);
                }
            });
        } else if (type === 'master') {
            this.settings.masterVolume = volume;
        }
    }

    /**
     * Get current volume settings
     */
    getVolume(type: 'sfx' | 'music' | 'master'): number {
        if (type === 'sfx') return this.settings.sfxVolume;
        if (type === 'music') return this.settings.musicVolume;
        return this.settings.masterVolume;
    }

    /**
     * Play environmental weather sound (rain, wind, thunder)
     */
    playWeatherSound(type: 'rain' | 'wind' | 'thunder', intensity: number = 1.0): void {
        const soundType: SoundType = type;
        const buffer = this.audioBuffers.get(soundType);
        
        if (!buffer) {
            return;
        }

        if (type === 'rain' || type === 'wind') {
            // Loop rain and wind
            const key = `weather_${type}`;
            if (!this.ambientSounds.has(key)) {
                const sound = new THREE.Audio(this.listener);
                sound.setBuffer(buffer);
                sound.setLoop(true);
                sound.setVolume(intensity * this.settings.sfxVolume * this.settings.masterVolume);
                this.ambientSounds.set(key, sound);
                sound.play();
            } else {
                const sound = this.ambientSounds.get(key);
                if (sound) {
                    sound.setVolume(intensity * this.settings.sfxVolume * this.settings.masterVolume);
                    if (!sound.isPlaying) {
                        sound.play();
                    }
                }
            }
        } else if (type === 'thunder') {
            // Thunder is one-shot
            this.playSound(soundType, intensity);
        }
    }

    /**
     * Stop weather sound
     */
    stopWeatherSound(type: 'rain' | 'wind'): void {
        const key = `weather_${type}`;
        const sound = this.ambientSounds.get(key);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    /**
     * Stop all sounds
     */
    stopAll(): void {
        this.ambientSounds.forEach((sound) => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
        this.currentAmbient = null;
        this.targetAmbient = null;
    }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function initAudioManager(camera: THREE.Camera): AudioManager {
    if (!audioManagerInstance) {
        audioManagerInstance = new AudioManager(camera);
        // Load audio files
        loadAudioAssets(audioManagerInstance);
    }
    return audioManagerInstance;
}

export function getAudioManager(): AudioManager | null {
    return audioManagerInstance;
}

/**
 * Load all audio assets
 */
async function loadAudioAssets(manager: AudioManager): Promise<void> {
    // Load footstep sounds (multiple variations for variety)
    const footstepTypes = ['grass', 'rock', 'water', 'snow'];
    for (const type of footstepTypes) {
        // Load first variation for each type
        await manager.loadSound(`footstep_${type}` as SoundType, `/audio/footsteps/footstep_${type}_000.ogg`);
    }

    // Load SFX
    await manager.loadSound('collect', '/audio/sfx/collect.ogg');
    await manager.loadSound('damage', '/audio/sfx/damage.ogg');
    await manager.loadSound('jump', '/audio/sfx/jump.ogg');

    console.log('Audio assets loaded');
}
