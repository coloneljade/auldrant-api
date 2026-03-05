import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		dts({
			include: ['src'],
			outDir: 'dist',
		}),
	],
	resolve: {
		alias: {
			'@static': resolve(__dirname, 'src/static.ts'),
		},
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es'],
			fileName: 'auldrant-api',
		},
	},
});
