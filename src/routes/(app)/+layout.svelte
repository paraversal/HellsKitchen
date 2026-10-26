<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import Toasts from '#lib/components/Toasts.svelte';
	import { planStore } from '#lib/plan/browser.ts';
	import { backup } from '#lib/plan/backup.svelte.ts';
	import { current } from '#lib/plan/current.svelte.ts';
	import { takeLinkFromAddress } from '#lib/plan/transfer.svelte.ts';
	import AddToPlanSheet from '#lib/screens/AddToPlanSheet.svelte';
	import ImportSheet from '#lib/screens/ImportSheet.svelte';
	import PlansSheet from '#lib/screens/PlansSheet.svelte';
	import ShareSheet from '#lib/screens/ShareSheet.svelte';
	import type { NavId } from '#lib/nav.ts';

	// The frame around the three places of the app: a bar at the bottom on a phone (below 900 px), a bar on the left on a desktop.
	let { children } = $props();

	// The footer of the sidebar: the event at a glance.
	const facts = $derived.by(() => {
		const plan = planStore.plan;
		if (!plan) return [];
		const { everyone, organisers, appetite_factor: appetite = 1 } = plan.event;
		const days = plan.days.length;
		return [
			`${everyone} people${organisers ? ` · ${organisers} organisers` : ''}`,
			`${days} ${days === 1 ? 'day' : 'days'}${appetite !== 1 ? ` · hungry ×${appetite}` : ''}`
		];
	});
	let plansOpen = $state(false);

	const path = $derived(page.url.pathname);
	const active: NavId = $derived(path.includes('/recipes') ? 'recipes' : path.includes('/shopping') ? 'shopping' : path.includes('/meta') ? 'meta' : 'plan');
	// A recipe on a phone has its own button at the bottom, which takes the place of the tab bar.
	const reading = $derived(page.route.id === '/(app)/recipes/[id]');

	// Read the saved plans when the app opens, and save for good when the page is hidden.
	// A plan in the address (a link that was shared) is offered, now and whenever the address changes to one.
	onMount(() => {
		void planStore.load();
		backup.start();
		planStore.onchange = (before, after) => backup.changed(before, after);
		takeLinkFromAddress();
		addEventListener('hashchange', takeLinkFromAddress);
		const save = () => void planStore.flush();
		const hidden = () => document.visibilityState === 'hidden' && save();
		document.addEventListener('visibilitychange', hidden);
		addEventListener('pagehide', save);
		return () => {
			document.removeEventListener('visibilitychange', hidden);
			removeEventListener('pagehide', save);
			removeEventListener('hashchange', takeLinkFromAddress);
		};
	});
</script>

<div class="app" class:reading>
	<div class="sidebar"><Sidebar {active} openItems={current.shopping?.open} planName={planStore.plan?.name} planFacts={facts} onplans={() => (plansOpen = true)} /></div>
	<main>{@render children()}</main>
	<div class="tabbar"><TabBar {active} openItems={current.shopping?.open} /></div>
</div>

<AddToPlanSheet />
<ShareSheet />
<PlansSheet bind:open={plansOpen} />
<ImportSheet />
<Toasts />

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
