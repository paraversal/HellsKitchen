<script lang="ts">
	import type { Component } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// One thing to do in a list of things to do: an icon, what it does, and a line that says more. With `href` it is a link.
	type Props = { icon: Component<{ size?: number }>; label: string; hint?: string; href?: string } & Omit<HTMLButtonAttributes, 'children'>;
	let { icon: Icon, label, hint, href, ...rest }: Props = $props();
</script>

{#if href}
	<a class="action pressable" {href}>
		<span class="icon"><Icon size={20} /></span>
		<span class="text"><span class="label">{label}</span>{#if hint}<span class="hint">{hint}</span>{/if}</span>
	</a>
{:else}
	<button class="action pressable" {...rest}>
		<span class="icon"><Icon size={20} /></span>
		<span class="text"><span class="label">{label}</span>{#if hint}<span class="hint">{hint}</span>{/if}</span>
	</button>
{/if}

<style>
	.action {
		display: flex;
		align-items: center;
		gap: 14px;
		width: 100%;
		padding: var(--space-3) 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}
	.action:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-pill);
		background: var(--color-mustard-tint);
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.label {
		font-size: var(--text-strong);
		font-weight: var(--weight-bold);
	}
	.hint {
		color: var(--color-ink-soft);
		font-size: var(--text-note);
	}
</style>
