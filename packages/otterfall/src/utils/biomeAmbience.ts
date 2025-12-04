import * as Tone from 'tone';

/**
 * Synthesized biome ambient soundscapes using Tone.js
 * Creates unique atmospheric sounds for each biome
 */

type BiomeType = 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';

class BiomeAmbienceSynthesizer {
    private synths: Map<BiomeType, Tone.Player[]> = new Map();
    private volumes: Map<BiomeType, Tone.Volume> = new Map();
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;
        await Tone.start();

        // Create ambient soundscapes for each biome
        this.createMarshAmbience();
        this.createForestAmbience();
        this.createDesertAmbience();
        this.createTundraAmbience();
        this.createSavannaAmbience();
        this.createMountainAmbience();
        this.createScrublandAmbience();

        this.initialized = true;
    }

    private createMarshAmbience(): void {
        // Marsh: water sounds, frogs, insects
        const volume = new Tone.Volume(-20).toDestination();
        this.volumes.set('marsh', volume);

        // Water bubbling (low frequency noise)
        const waterNoise = new Tone.Noise('brown').connect(volume);
        const waterFilter = new Tone.Filter(200, 'lowpass').connect(volume);
        waterNoise.connect(waterFilter);
        waterNoise.start();

        // Frog croaks (periodic low synth)
        const frogLoop = new Tone.Loop((time) => {
            const frog = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 2,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
            }).connect(volume);
            frog.triggerAttackRelease('C2', '8n', time);
            setTimeout(() => frog.dispose(), 500);
        }, '4n');
        frogLoop.start(0);
    }

    private createForestAmbience(): void {
        // Forest: rustling leaves, birds, wind through trees
        const volume = new Tone.Volume(-18).toDestination();
        this.volumes.set('forest', volume);

        // Rustling leaves (filtered noise with LFO)
        const leavesNoise = new Tone.Noise('pink').connect(volume);
        const leavesFilter = new Tone.Filter(1500, 'bandpass').connect(volume);
        const leavesLFO = new Tone.LFO(0.5, 800, 2000).connect(leavesFilter.frequency);
        leavesNoise.connect(leavesFilter);
        leavesNoise.start();
        leavesLFO.start();

        // Bird chirps (periodic high synth)
        const birdLoop = new Tone.Loop((time) => {
            if (Math.random() < 0.3) {
                const bird = new Tone.Synth({
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
                }).connect(volume);
                bird.triggerAttackRelease('C5', '32n', time);
                setTimeout(() => bird.dispose(), 300);
            }
        }, '2n');
        birdLoop.start(0);
    }

    private createDesertAmbience(): void {
        // Desert: wind, sparse sounds, heat shimmer
        const volume = new Tone.Volume(-22).toDestination();
        this.volumes.set('desert', volume);

        // Dry wind (filtered noise)
        const windNoise = new Tone.Noise('white').connect(volume);
        const windFilter = new Tone.Filter(600, 'lowpass').connect(volume);
        const windLFO = new Tone.LFO(0.2, 400, 800).connect(windFilter.frequency);
        windNoise.connect(windFilter);
        windNoise.start();
        windLFO.start();
    }

    private createTundraAmbience(): void {
        // Tundra: cold wind, sparse, desolate
        const volume = new Tone.Volume(-20).toDestination();
        this.volumes.set('tundra', volume);

        // Cold wind (very low frequency)
        const windNoise = new Tone.Noise('pink').connect(volume);
        const windFilter = new Tone.Filter(300, 'lowpass').connect(volume);
        windNoise.connect(windFilter);
        windNoise.start();
    }

    private createSavannaAmbience(): void {
        // Savanna: warm breeze, distant animals, grassland sounds
        const volume = new Tone.Volume(-19).toDestination();
        this.volumes.set('savanna', volume);

        // Warm breeze
        const breezeNoise = new Tone.Noise('pink').connect(volume);
        const breezeFilter = new Tone.Filter(1000, 'lowpass').connect(volume);
        breezeNoise.connect(breezeFilter);
        breezeNoise.start();

        // Distant animal calls
        const animalLoop = new Tone.Loop((time) => {
            if (Math.random() < 0.1) {
                const call = new Tone.Synth({
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.1, decay: 0.3, sustain: 0.2, release: 0.4 },
                }).connect(volume);
                call.triggerAttackRelease('A3', '4n', time);
                setTimeout(() => call.dispose(), 1000);
            }
        }, '1n');
        animalLoop.start(0);
    }

    private createMountainAmbience(): void {
        // Mountain: wind, echoes, sparse
        const volume = new Tone.Volume(-21).toDestination();
        this.volumes.set('mountain', volume);

        // Mountain wind (medium frequency)
        const windNoise = new Tone.Noise('white').connect(volume);
        const windFilter = new Tone.Filter(500, 'bandpass').connect(volume);
        const windLFO = new Tone.LFO(0.4, 300, 700).connect(windFilter.frequency);
        windNoise.connect(windFilter);
        windNoise.start();
        windLFO.start();
    }

    private createScrublandAmbience(): void {
        // Scrubland: dry breeze, insects, sparse vegetation
        const volume = new Tone.Volume(-20).toDestination();
        this.volumes.set('scrubland', volume);

        // Dry breeze
        const breezeNoise = new Tone.Noise('white').connect(volume);
        const breezeFilter = new Tone.Filter(800, 'lowpass').connect(volume);
        breezeNoise.connect(breezeFilter);
        breezeNoise.start();

        // Insect buzzing
        const insectLoop = new Tone.Loop((time) => {
            if (Math.random() < 0.2) {
                const buzz = new Tone.Synth({
                    oscillator: { type: 'square' },
                    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 },
                }).connect(volume);
                buzz.triggerAttackRelease('E4', '16n', time);
                setTimeout(() => buzz.dispose(), 500);
            }
        }, '4n');
        insectLoop.start(0);
    }

    /**
     * Set volume for a specific biome
     */
    setVolume(biome: BiomeType, volume: number): void {
        const vol = this.volumes.get(biome);
        if (vol) {
            const dbVolume = -40 + (volume * 20); // -40dB to -20dB
            vol.volume.rampTo(dbVolume, 1.0);
        }
    }

    /**
     * Dispose all synthesizers
     */
    dispose(): void {
        this.volumes.forEach((vol) => vol.dispose());
        this.volumes.clear();
        this.synths.clear();
        this.initialized = false;
    }
}

// Singleton instance
let biomeAmbienceInstance: BiomeAmbienceSynthesizer | null = null;

export async function initBiomeAmbience(): Promise<BiomeAmbienceSynthesizer> {
    if (!biomeAmbienceInstance) {
        biomeAmbienceInstance = new BiomeAmbienceSynthesizer();
        await biomeAmbienceInstance.initialize();
    }
    return biomeAmbienceInstance;
}

export function getBiomeAmbience(): BiomeAmbienceSynthesizer | null {
    return biomeAmbienceInstance;
}
