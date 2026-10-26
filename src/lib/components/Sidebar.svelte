<script lang="ts">
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Flame from '@lucide/svelte/icons/flame';
	import { resolve } from '$app/paths';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { hop, movePill, setPill, type Spot } from '#lib/motion/pill.ts';
	import { NAV, type NavId } from '#lib/nav.ts';
	import Odometer from './Odometer.svelte';

	// The red bar on the left of a desktop screen: the name of the app, the three places, and the open plan.
	// The footer is the event at a glance: its name and size. Pressing it opens the plans of the device, to switch between them.
	type Props = { active: NavId; openItems?: number; planName?: string; planFacts?: string[]; onplans?: () => void };
	let { active, openItems, planName, planFacts = [], onplans }: Props = $props();

	// The white pill behind the place you are in slides to the next one.
	let nav = $state<HTMLElement>();
	let bg = $state<HTMLElement>();
	const links: HTMLElement[] = [];
	const icons: HTMLElement[] = [];
	let placed: Spot | null = null;
	/** False until the sliding pill has found its place. Until then the active entry shows its own background, so it is never invisible. */
	let ready = $state(false);

	function spot(index: number): Spot | undefined {
		const box = nav?.getBoundingClientRect();
		const link = links[index]?.getBoundingClientRect();
		return box && link?.width ? { x: link.left - box.left, y: link.top - box.top, w: link.width, h: link.height } : undefined;
	}

	function place(animate: boolean) {
		const index = NAV.findIndex((item) => item.id === active);
		const to = spot(index);
		if (!bg || !to) return;
		if (animate && placed) {
			const how = strength('A1');
			movePill(bg, placed, to, 'y', how);
			if (how === 'playful') hop(icons[index]);
		} else setPill(bg, to);
		placed = to;
		ready = true;
	}

	$effect(() => {
		void active;
		if (nav && bg) place(true);
	});

	$effect(() => {
		if (!nav) return;
		const watch = new ResizeObserver(() => place(false));
		watch.observe(nav);
		return () => watch.disconnect();
	});
</script>

<aside>
	<a class="brand" href={resolve('/')}>
		<span class="logo"><Flame size={18} /></span>
		Hell's Kitchen
	</a>
	<nav aria-label="Main" bind:this={nav} class:ready>
		<span class="slider" bind:this={bg} aria-hidden="true"></span>
		{#each NAV as item, i (item.id)}
			<a href={resolve(item.path)} class:active={item.id === active} aria-current={item.id === active ? 'page' : undefined} bind:this={links[i]}>
				<span class="icon" data-tab-icon={item.id} bind:this={icons[i]}><item.icon size={22} /></span>
				<span class="label">{item.label}</span>
				{#if item.id === 'shopping' && openItems}<span class="badge"><Odometer text={String(openItems)} /></span>{/if}
			</a>
		{/each}
	</nav>
	{#if planName}
		<button class="plan" onclick={onplans} aria-label="Plans on this device. Open: {planName}">
			<span class="plan-text">
				<span class="plan-name">{planName}</span>
				{#each planFacts as fact (fact)}<span class="plan-fact">{fact}</span>{/each}
			</span>
			<ChevronsUpDown size={18} />
		</button>
	{/if}
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		height: 100dvh;
		padding: var(--space-7) 14px;
		background: var(--color-tomato);
		color: var(--color-on-tomato);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 6px 26px;
		color: inherit;
		font-size: 18px;
		font-weight: var(--weight-heavy);
		text-decoration: none;
	}
	.logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-pill);
		background: var(--color-mustard);
		color: var(--color-tomato);
	}
	nav {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.label {
		flex: 1;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		height: 22px;
		padding: 0 8px;
		border-radius: 11px;
		background: var(--color-mustard);
		color: var(--color-ink);
		font-size: var(--text-caption);
		font-weight: var(--weight-heavy);
	}
	.plan {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: auto;
		padding: 10px 12px;
		border: 0;
		border-radius: 14px;
		background: color-mix(in srgb, var(--color-on-tomato) 12%, transparent);
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	@media (hover: hover) {
		.plan:hover {
			background: color-mix(in srgb, var(--color-on-tomato) 20%, transparent);
		}
	}
	.plan:global([data-pressed]) {
		background: color-mix(in srgb, var(--color-on-tomato) 28%, transparent);
	}
	.plan-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		gap: 2px;
	}
	.plan-name {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: var(--text-small);
		font-weight: var(--weight-heavy);
		line-height: 1.25;
	}
	.plan-fact {
		font-size: var(--text-caption);
		opacity: 0.8;
		line-height: 1.3;
	}
	.slider {
		position: absolute;
		left: 0;
		top: 0;
		border-radius: 14px;
		background: var(--color-on-tomato);
		pointer-events: none;
	}
	.icon {
		display: inline-flex;
	}
	nav a {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		height: 46px;
		padding: 0 14px;
		border-radius: 14px;
		color: inherit;
		font-weight: var(--weight-medium);
		text-decoration: none;
	}
	@media (hover: hover) {
		nav a:not(.active):hover {
			background: color-mix(in srgb, var(--color-on-tomato) 16%, transparent);
		}
	}
	nav a:not(.active):global([data-pressed]) {
		background: color-mix(in srgb, var(--color-on-tomato) 28%, transparent);
	}
	nav:not(.ready) .active {
		background: var(--color-on-tomato);
	}
	nav:not(.ready) .slider {
		display: none;
	}
	nav .active {
		color: var(--color-tomato);
		font-weight: var(--weight-heavy);
	}
</style>
