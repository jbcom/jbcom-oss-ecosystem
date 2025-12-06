import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { 
    createPostProcessingPipeline, 
    type PostProcessingOptions,
    type PostProcessingEffect 
} from '../../../src/presets/postprocessing';

describe('Post-Processing', () => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;

    beforeEach(() => {
        renderer = new THREE.WebGLRenderer();
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    });

    afterEach(() => {
        renderer.dispose();
    });

    test('should create post-processing pipeline with no effects', () => {
        const options: PostProcessingOptions = {
            renderer,
            scene,
            camera,
            effects: []
        };

        const pipeline = createPostProcessingPipeline(options);
        
        expect(pipeline).toBeDefined();
        expect(typeof pipeline.render).toBe('function');
        expect(typeof pipeline.dispose).toBe('function');
    });

    test('should create post-processing pipeline with bloom effect', () => {
        const effects: PostProcessingEffect[] = [
            { type: 'bloom', threshold: 0.8, intensity: 1.0, radius: 0.5 }
        ];

        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects
        });
        
        expect(pipeline).toBeDefined();
    });

    test('should create post-processing pipeline with multiple effects', () => {
        const effects: PostProcessingEffect[] = [
            { type: 'bloom', threshold: 0.8 },
            { type: 'ssao', radius: 0.5, intensity: 1.0 },
            { type: 'vignette', offset: 0.5, darkness: 0.5 },
            { type: 'filmGrain', intensity: 0.1 }
        ];

        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects
        });
        
        expect(pipeline).toBeDefined();
    });

    test('should validate required parameters', () => {
        expect(() => {
            createPostProcessingPipeline({
                renderer: null as any,
                scene,
                camera
            });
        }).toThrow('renderer is required');

        expect(() => {
            createPostProcessingPipeline({
                renderer,
                scene: null as any,
                camera
            });
        }).toThrow('scene is required');

        expect(() => {
            createPostProcessingPipeline({
                renderer,
                scene,
                camera: null as any
            });
        }).toThrow('camera is required');
    });

    test('should render pipeline', () => {
        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects: [{ type: 'bloom' }]
        });

        expect(() => {
            pipeline.render(0.016);
        }).not.toThrow();
    });

    test('should dispose pipeline', () => {
        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects: [{ type: 'bloom' }]
        });

        expect(() => {
            pipeline.dispose();
        }).not.toThrow();
    });

    test('should handle all effect types', () => {
        const effectTypes: PostProcessingEffect['type'][] = [
            'bloom',
            'ssao',
            'colorGrading',
            'motionBlur',
            'depthOfField',
            'chromaticAberration',
            'vignette',
            'filmGrain'
        ];

        effectTypes.forEach(effectType => {
            const pipeline = createPostProcessingPipeline({
                renderer,
                scene,
                camera,
                effects: [{ type: effectType } as PostProcessingEffect]
            });
            
            expect(pipeline).toBeDefined();
            pipeline.dispose();
        });
    });

    test('should handle custom resolution', () => {
        const pipeline = createPostProcessingPipeline({
            renderer,
            scene,
            camera,
            effects: [],
            resolution: { width: 1920, height: 1080 }
        });
        
        expect(pipeline).toBeDefined();
        pipeline.dispose();
    });
});
