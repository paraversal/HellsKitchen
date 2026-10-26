<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { tick, type Component } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { easing, wait } from '#lib/motion/easing.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { paper } from '#lib/motion/paper.ts';

	// One thing to do in a list of things to do: an icon, what it does, and a line that says more. With `href` it is a link.
	// E2. With `check`, the icon turns into a check that stamps itself on for a moment once the thing is done (an action that answers `false` was not done).
	// With `printing`, pressing it prints, and with fun a sheet of paper comes out of the icon first (E5).
	type Props = {
		icon: Component<{ size?: number }>;
		label: string;
		hint?: string;
		href?: string;
		check?: boolean;
		printing?: boolean;
		onclick?: (event: MouseEvent) => unknown;
	} & Omit<HTMLButtonAttributes, 'onclick'>;
	let { icon: Icon, label, hint, href, check = false, printing = false, onclick, ...rest }: Props = $props();

	let done = $state(false);
	let stamp = $state<HTMLElement>();

	async function press(event: MouseEvent) {
		const result = await onclick?.(event);
		if (!check || result === false) return;
		done = true;
		await tick();
		if (allows.flights()) stamp?.animate([{ transform: 'scale(2.2) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 420, easing: easing('spring-bouncy') });
		await wait(1500);
		done = false;
	}
</script>

{#if href}
	<a class="action pressable" {href} use:paper>
		<span class="icon"><Icon size={20} /></span>
		<span class="text"><span class="label">{label}</span>{#if hint}<span class="hint">{hint}</span>{/if}</span>
	</a>
{:else}
	<button class="action pressable" {...rest} onclick={press}>
		<span class="icon" bind:this={stamp}>{#if done}<Check size={20} strokeWidth={3} />{:else}<Icon size={20} />{/if}</span>
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
