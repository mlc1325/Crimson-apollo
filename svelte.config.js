import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// If your app is a single-page app (SPA), a fallback file is helpful.
			// (If you need dynamic endpoints, see the note below.)
			fallback: 'index.html'
		})
	}
};

export default config;


