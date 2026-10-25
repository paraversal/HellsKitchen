<script lang="ts">
	import Flame from '@lucide/svelte/icons/flame';
	import { resolve } from '$app/paths';
	import { NAV, type NavId } from '#lib/nav.ts';
	import Plate from './Plate.svelte';

	// The red bar on the left of a desktop screen: the name of the app, the three places, and the open plan.
	type Props = { active: NavId; openItems?: number; planName?: string };
	let { active, openItems, planName }: Props = $props();
</script>

<aside>
	<a class="brand" href={resolve('/')}>
		<span class="logo"><Flame size={18} /></span>
		Hell's Kitchen
	</a>
	<nav aria-label="Main">
		{#each NAV as item (item.id)}
			<a href={resolve(item.path)} class:active={item.id === active} aria-current={item.id === active ? 'page' : undefined}>
				<item.icon size={22} />
				<span class="label">{item.label}</span>
				{#if item.id === 'shopping' && openItems}<span class="badge">{openItems}</span>{/if}
			</a>
		{/each}
	</nav>
	{#if planName}
		<div class="plan">
			<Plate seed={planName} size={36} />
			<span>{planName}</span>
		</div>
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
		gap: 10px;
		margin-top: auto;
		padding: var(--space-2) 6px;
		font-size: var(--text-small);
		font-weight: var(--weight-bold);
	}
	nav a {
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
	nav a:not(.active):active {
		background: color-mix(in srgb, var(--color-on-tomato) 28%, transparent);
	}
	nav .active {
		background: var(--color-on-tomato);
		color: var(--color-tomato);
		font-weight: var(--weight-heavy);
	}
</style>
