<script lang="ts">
	import type { Component } from 'svelte';
	import { press } from '#lib/motion/press.ts';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// A round button with only an icon. `label` is what a screen reader says, so it is required. With `href` it is a link.
	type Props = {
		icon: Component<{ size?: number }>;
		label: string;
		variant?: 'light' | 'dark';
		size?: number;
		href?: string;
	} & Omit<HTMLButtonAttributes, 'aria-label'>;

	let { icon: Icon, label, variant = 'light', size = 44, href, ...rest }: Props = $props();
</script>

{#if href}
	<a class="icon-button {variant}" style:width="{size}px" style:height="{size}px" aria-label={label} {href}>
		<Icon size={Math.round(size * 0.46)} />
	</a>
{:else}
	<button class="icon-button {variant}" style:width="{size}px" style:height="{size}px" aria-label={label} use:press {...rest}>
		<Icon size={Math.round(size * 0.46)} />
	</button>
{/if}

<style>
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		padding: 0;
		border-radius: var(--radius-pill);
		cursor: pointer;
		text-decoration: none;
	}
	.icon-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.light {
		background: var(--color-sheet);
		border: var(--border);
		color: var(--color-ink);
	}
	.dark {
		background: var(--color-ink);
		border: 0;
		color: var(--color-paper);
	}
	@media (hover: hover) {
		.light:not(:disabled):hover {
			background: var(--color-mustard-tint);
		}
		.dark:not(:disabled):hover {
			background: color-mix(in srgb, var(--color-paper) 18%, var(--color-ink));
		}
	}
	.light:not(:disabled):global([data-pressed]) {
		background: var(--color-mustard);
	}
	.dark:not(:disabled):global([data-pressed]) {
		background: color-mix(in srgb, var(--color-paper) 30%, var(--color-ink));
	}
</style>
