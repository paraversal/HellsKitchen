import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

// The app is hosted on GitHub Pages under /<repository-name>/. The deploy workflow passes that in BASE_PATH.
// Locally the base path is empty, so the app lives at the root.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Everything is turned into plain files: no server.
			adapter: adapter(),
			paths: { base },

			// Shown on the skeleton page, and makes the offline cache change with every deploy.
			version: { name: process.env.GITHUB_SHA?.slice(0, 7) ?? Date.now().toString(36) }
		})
	],
	// The icon library is made of Svelte components. Vite must not bundle it separately in development, or it ends up with a second copy of Svelte.
	optimizeDeps: { exclude: ['@lucide/svelte'] },
	test: {
		include: ['src/**/*.test.ts']
	}
});
