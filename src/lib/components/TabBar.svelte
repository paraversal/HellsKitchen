<script lang="ts">
	import { resolve } from '$app/paths';
	import { NAV, type NavId } from '#lib/nav.ts';

	// The bar at the bottom of a phone screen. The place you are in has a mustard pill behind its icon.
	let { active }: { active: NavId } = $props();
</script>

<nav class="tabs" aria-label="Main">
	{#each NAV as item (item.id)}
		<a href={resolve(item.path)} class:active={item.id === active} aria-current={item.id === active ? 'page' : undefined}>
			<span class="pill"><item.icon size={22} /></span>
			{item.label}
		</a>
	{/each}
</nav>

<style>
	.tabs {
		display: flex;
		justify-content: space-between;
		padding: 10px 28px calc(10px + env(safe-area-inset-bottom));
		background: var(--color-paper);
		border-top: var(--border);
	}
	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		width: 84px;
		color: var(--color-ink-soft);
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		text-decoration: none;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 32px;
		border-radius: 16px;
	}
	.active {
		color: var(--color-ink);
		font-weight: var(--weight-heavy);
	}
	.active .pill {
		background: var(--color-mustard);
	}
</style>
