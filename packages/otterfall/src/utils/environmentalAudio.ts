import * as Tone from 'tone';

/**
 * Synthesized environmental audio using Tone.js
 * Creates realistic rain, wind, and thunder sounds procedurally
 */

class EnvironmentalAudioSynthesizer {
    private rainNoise: Tone.Noise | null = null;
    private rainFilter: Tone.Filter | null = null;
    private rainVolume: Tone.Volume | null = null;
    
    private windNoise: Tone.Noise | null = null;
    private windFilter: Tone.Filter | null = null;
    private windLFO: Tone.LFO | null = null;
    private windVolume: Tone.Volume | null = null;
    
    private thunderSynth: Tone.MembraneSynth | null = null;
    private thunderNoise: Tone.Noise | null = null;
    private thunderVolume: Tone.Volume | null = null;
    
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        // Ensure Tone.js context is started (requires user interaction)
        await Tone.start();

        // Create rain sound: filtered white noise with rapid amplitude modulation
        this.rainNoise = new Tone.Noise('white');
        this.rainFilter = new Tone.Filter({
            type: 'bandpass',
            frequency: 2000,
            Q: 1,
        });
        this.rainVolume = new Tone.Volume(-20);
        
        this.rainNoise.connect(this.rainFilter);
        this.rainFilter.connect(this.rainVolume);
        this.rainVolume.toDestination();

        // Create wind sound: filtered pink noise with slow LFO modulation
        this.windNoise = new Tone.Noise('pink');
        this.windFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: 800,
            Q: 2,
        });
        this.windLFO = new Tone.LFO({
            frequency: 0.3,
            min: 400,
            max: 1200,
        });
        this.windVolume = new Tone.Volume(-15);
        
        this.windLFO.connect(this.windFilter.frequency);
        this.windNoise.connect(this.windFilter);
        this.windFilter.connect(this.windVolume);
        this.windVolume.toDestination();

        // Create thunder sound: combination of low frequency synth and noise burst
        this.thunderSynth = new Tone.MembraneSynth({
            pitchDecay: 0.8,
            octaves: 2,
            oscillator: {
                type: 'sine',
            },
            envelope: {
                attack: 0.001,
                decay: 1.5,
                sustain: 0,
                release: 1.5,
            },
        });
        
        this.thunderNoise = new Tone.Noise('brown');
        this.thunderVolume = new Tone.Volume(-10);
        
        this.thunderSynth.connect(this.thunderVolume);
        this.thunderNoise.connect(this.thunderVolume);
        this.thunderVolume.toDestination();

        this.initialized = true;
    }

    /**
     * Start rain sound with given intensity (0-1)
     */
    startRain(intensity: number = 1.0): void {
        if (!this.initialized || !this.rainNoise || !this.rainVolume) return;

        // Adjust volume based on intensity
        const volume = -30 + (intensity * 15); // -30dB to -15dB
        this.rainVolume.volume.rampTo(volume, 0.5);

        if (this.rainNoise.state !== 'started') {
            this.rainNoise.start();
        }
    }

    /**
     * Stop rain sound
     */
    stopRain(): void {
        if (!this.initialized || !this.rainNoise || !this.rainVolume) return;

        this.rainVolume.volume.rampTo(-60, 1.0);
        setTimeout(() => {
            if (this.rainNoise && this.rainNoise.state === 'started') {
                this.rainNoise.stop();
            }
        }, 1000);
    }

    /**
     * Update rain intensity (0-1)
     */
    setRainIntensity(intensity: number): void {
        if (!this.initialized || !this.rainVolume) return;
        const volume = -30 + (intensity * 15);
        this.rainVolume.volume.rampTo(volume, 0.5);
    }

    /**
     * Start wind sound with given intensity (0-1)
     */
    startWind(intensity: number = 1.0): void {
        if (!this.initialized || !this.windNoise || !this.windVolume || !this.windLFO) return;

        // Adjust volume and filter based on intensity
        const volume = -25 + (intensity * 12); // -25dB to -13dB
        this.windVolume.volume.rampTo(volume, 0.5);

        // Faster LFO for stronger wind
        this.windLFO.frequency.value = 0.2 + (intensity * 0.4);

        if (this.windNoise.state !== 'started') {
            this.windNoise.start();
            this.windLFO.start();
        }
    }

    /**
     * Stop wind sound
     */
    stopWind(): void {
        if (!this.initialized || !this.windNoise || !this.windVolume || !this.windLFO) return;

        this.windVolume.volume.rampTo(-60, 1.5);
        setTimeout(() => {
            if (this.windNoise && this.windNoise.state === 'started') {
                this.windNoise.stop();
            }
            if (this.windLFO) {
                this.windLFO.stop();
            }
        }, 1500);
    }

    /**
     * Update wind intensity (0-1)
     */
    setWindIntensity(intensity: number): void {
        if (!this.initialized || !this.windVolume || !this.windLFO) return;
        const volume = -25 + (intensity * 12);
        this.windVolume.volume.rampTo(volume, 0.5);
        this.windLFO.frequency.value = 0.2 + (intensity * 0.4);
    }

    /**
     * Play thunder sound (one-shot)
     */
    playThunder(): void {
        if (!this.initialized || !this.thunderSynth || !this.thunderNoise) return;

        // Low rumble
        this.thunderSynth.triggerAttackRelease('C1', '2n');

        // Noise burst for crack
        this.thunderNoise.start('+0.05');
        this.thunderNoise.stop('+0.3');
    }

    /**
     * Play predator growl sound (one-shot)
     */
    playPredatorGrowl(): void {
        if (!this.initialized) return;

        // Low frequency growl using synth
        const growl = new Tone.Synth({
            oscillator: { type: 'sawtooth' },
            envelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.4,
                release: 0.5,
            },
        }).toDestination();

        // Growl with pitch bend
        growl.triggerAttack('E2');
        growl.frequency.rampTo('C2', 0.4);
        growl.triggerRelease('+0.8');

        // Ensure cleanup happens even if page unloads
        setTimeout(() => {
            try {
                growl.dispose();
            } catch (e) {
                // Synth may already be disposed
            }
        }, 2000);
    }

    /**
     * Play predator howl sound (one-shot)
     */
    playPredatorHowl(): void {
        if (!this.initialized) return;

        // Higher pitched howl
        const howl = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.2,
                decay: 0.1,
                sustain: 0.8,
                release: 0.6,
            },
        }).toDestination();

        // Howl with vibrato
        const vibrato = new Tone.Vibrato(5, 0.5).toDestination();
        howl.connect(vibrato);

        howl.triggerAttack('A3');
        howl.frequency.rampTo('E4', 0.5);
        howl.triggerRelease('+1.5');

        setTimeout(() => {
            try {
                howl.dispose();
                vibrato.dispose();
            } catch (e) {
                // Effects may already be disposed
            }
        }, 3000);
    }

    /**
     * Play prey chirp sound (one-shot)
     */
    playPreyChirp(): void {
        if (!this.initialized) return;

        // Quick high-pitched chirp
        const chirp = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.05,
                sustain: 0,
                release: 0.05,
            },
        }).toDestination();

        chirp.triggerAttackRelease('C5', '32n');
        setTimeout(() => {
            try {
                chirp.dispose();
            } catch (e) {
                // Synth may already be disposed
            }
        }, 200);
    }

    /**
     * Play prey squeak sound (one-shot)
     */
    playPreySqueak(): void {
        if (!this.initialized) return;

        // Higher pitched squeak
        const squeak = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: {
                attack: 0.001,
                decay: 0.08,
                sustain: 0,
                release: 0.08,
            },
        }).toDestination();

        squeak.triggerAttackRelease('E5', '16n');
        setTimeout(() => {
            try {
                squeak.dispose();
            } catch (e) {
                // Synth may already be disposed
            }
        }, 300);
    }

    /**
     * Dispose all synthesizers
     */
    dispose(): void {
        this.rainNoise?.dispose();
        this.rainFilter?.dispose();
        this.rainVolume?.dispose();
        
        this.windNoise?.dispose();
        this.windFilter?.dispose();
        this.windLFO?.dispose();
        this.windVolume?.dispose();
        
        this.thunderSynth?.dispose();
        this.thunderNoise?.dispose();
        this.thunderVolume?.dispose();
        
        this.initialized = false;
    }
}

// Singleton instance
let synthInstance: EnvironmentalAudioSynthesizer | null = null;

export async function initEnvironmentalAudio(): Promise<EnvironmentalAudioSynthesizer> {
    if (!synthInstance) {
        synthInstance = new EnvironmentalAudioSynthesizer();
        await synthInstance.initialize();
    }
    return synthInstance;
}

export function getEnvironmentalAudio(): EnvironmentalAudioSynthesizer | null {
    return synthInstance;
}

export function disposeEnvironmentalAudio(): void {
    if (synthInstance) {
        synthInstance.dispose();
        synthInstance = null;
    }
}
