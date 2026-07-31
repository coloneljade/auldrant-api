import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [],
	resolve: {
		alias: {
			'@static': resolve(import.meta.dirname, 'src/static.ts'),
		},
	},
	build: {
		outDir: 'dist',
		lib: {
			entry: resolve(import.meta.dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'auldrant-api',
		},
	},
});
