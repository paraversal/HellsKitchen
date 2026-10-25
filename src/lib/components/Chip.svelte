<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// A filter. The active one is dark.
	type Props = { active?: boolean; icon?: Component<{ size?: number }>; children: Snippet } & HTMLButtonAttributes;
	let { active = false, icon, children, ...rest }: Props = $props();
</script>

<button class="chip" class:active aria-pressed={active} {...rest}>
	{#if icon}{@const Icon = icon}<Icon size={16} />{/if}
	{@render children()}
</button>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 38px;
		padding: 0 var(--space-4);
		border-radius: 19px;
		background: var(--color-sheet);
		border: var(--border);
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		white-space: nowrap;
		cursor: pointer;
	}
	@media (hover: hover) {
		.chip:not(.active):hover {
			background: var(--color-mustard-tint);
		}
	}
	.chip:not(.active):active {
		background: var(--color-mustard);
	}
	.active {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: var(--color-paper);
	}
</style>
