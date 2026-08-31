import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sites } from '@openai/sites-vite-plugin';
// @ts-expect-error Node types are not needed by the browser bundle.
import { mkdirSync, writeFileSync } from 'node:fs';
export default defineConfig({ plugins: [react(), sites(), { name: 'sites-static-worker', closeBundle() { mkdirSync('dist/server', { recursive: true }); writeFileSync('dist/server/index.js', `export default { async fetch(request, env) { return env.ASSETS.fetch(request) } }\n`); } }] });
