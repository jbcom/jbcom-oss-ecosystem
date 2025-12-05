import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        plugins: [
            react(),
            glsl(),
            // Replace env vars in index.html
            {
                name: 'html-env-replace',
                transformIndexHtml(html) {
                    return html
                        .replace(/%VITE_METICULOUS_TOKEN%/g, env.VITE_METICULOUS_TOKEN || '')
                        .replace(/%VITE_IS_PRODUCTION%/g, mode === 'production' ? 'true' : 'false');
                },
            },
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            host: true, // Expose on 0.0.0.0 for LAN access
        },
    };
});
