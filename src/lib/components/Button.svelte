<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { press } from '#lib/motion/press.ts';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// The main actions. `primary` is the red one, `secondary` the outlined one. `block` stretches it over the full width.
	type Props = {
		variant?: 'primary' | 'secondary';
		block?: boolean;
		icon?: Component<{ size?: number }>;
		children: Snippet;
	} & HTMLButtonAttributes;

	let { variant = 'primary', block = false, icon, children, ...rest }: Props = $props();
</script>

<button class="button {variant}" class:block use:press={{ crumbs: variant === 'primary' }} {...rest}>
	{#if icon}{@const Icon = icon}<Icon size={variant === 'primary' ? 20 : 18} />{/if}
	{@render children()}
</button>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		cursor: pointer;
		border: 0;
		font-weight: var(--weight-bold);
	}
	.button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.primary {
		height: 52px;
		padding: 0 var(--space-6);
		border-radius: 26px;
		background: var(--color-tomato);
		color: var(--color-on-tomato);
		font-size: var(--text-body);
	}
	.secondary {
		height: 44px;
		padding: 0 18px;
		border-radius: 22px;
		background: var(--color-sheet);
		border: var(--border);
		font-size: var(--text-compact);
	}
		@media (hover: hover) {
		.primary:not(:disabled):hover {
			background: color-mix(in srgb, var(--color-ink) 14%, var(--color-tomato));
		}
		.secondary:not(:disabled):hover {
			background: var(--color-mustard-tint);
		}
	}
	.primary:not(:disabled):active {
		background: color-mix(in srgb, var(--color-ink) 24%, var(--color-tomato));
	}
	.secondary:not(:disabled):active {
		background: var(--color-mustard);
	}
	.block {
		display: flex;
		width: 100%;
		height: 56px;
		border-radius: 18px;
		font-size: var(--text-strong);
	}
</style>
