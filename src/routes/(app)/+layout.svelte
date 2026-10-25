<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import type { NavId } from '#lib/nav.ts';

	// The frame around the three places of the app: a bar at the bottom on a phone (below 900 px), a bar on the left on a desktop.
	let { children } = $props();

	const path = $derived(page.url.pathname);
	const active: NavId = $derived(path.includes('/recipes') ? 'recipes' : path.includes('/shopping') ? 'shopping' : 'plan');
	// A recipe on a phone has its own button at the bottom, which takes the place of the tab bar.
	const reading = $derived(page.route.id === '/(app)/recipes/[id]');
</script>

<div class="app" class:reading>
	<div class="sidebar"><Sidebar {active} /></div>
	<main>{@render children()}</main>
	<div class="tabbar"><TabBar {active} /></div>
</div>

<style>
	.app {
		min-height: 100dvh;
	}
	.sidebar {
		display: none;
	}
	main {
		padding-bottom: 88px;
	}
	.reading main {
		padding-bottom: 0;
	}
	.tabbar {
		position: fixed;
		inset: auto 0 0;
	}
	.reading .tabbar {
		display: none;
	}
	@media (min-width: 900px) {
		.app {
			display: grid;
			grid-template-columns: 208px 1fr;
		}
		.sidebar {
			display: block;
			position: sticky;
			top: 0;
			height: 100dvh;
		}
		main {
			padding-bottom: 0;
		}
		.tabbar {
			display: none;
		}
	}
</style>
