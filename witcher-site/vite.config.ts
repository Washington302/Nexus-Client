import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		// `shared/` sits above this app's root. Without this the dev server 403s
		// on it; `vite build` ignores fs.allow, so a missing entry shows up only
		// in dev, never in production.
		fs: { allow: ['..'] },
		proxy: {
			'/api': {
				target: 'https://nexus-core-1-363r.onrender.com',
				changeOrigin: true
			}
		}
	}
});
