<script lang="ts">
	import type { Component } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// A round button with only an icon. `label` is what a screen reader says, so it is required.
	type Props = {
		icon: Component<{ size?: number }>;
		label: string;
		variant?: 'light' | 'dark';
		size?: number;
	} & Omit<HTMLButtonAttributes, 'aria-label'>;

	let { icon: Icon, label, variant = 'light', size = 44, ...rest }: Props = $props();
</script>

<button class="icon-button {variant}" style:width="{size}px" style:height="{size}px" aria-label={label} {...rest}>
	<Icon size={Math.round(size * 0.46)} />
</button>

<style>
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		padding: 0;
		border-radius: var(--radius-pill);
		cursor: pointer;
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
</style>
