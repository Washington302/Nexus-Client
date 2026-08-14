import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// Shared components live in the sibling `shared/` directory, outside this
		// app. See shared/ui/CONTRACT.md for the rules that keep that safe.
		alias: {
			'@ui': '../shared/ui',
			'@shared': '../shared'
		}
	}
};

export default config;
