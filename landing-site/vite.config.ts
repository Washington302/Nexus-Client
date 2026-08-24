import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: 'https://nexus-core-1-363r.onrender.com',
				changeOrigin: true,
			},
		},
	},
});
