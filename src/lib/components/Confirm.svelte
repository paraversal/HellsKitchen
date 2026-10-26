<script lang="ts">
	import { easing } from '#lib/motion/easing.ts';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { nervous, vanish } from '#lib/motion/vanish.ts';
	import Button from './Button.svelte';

	// A small popup in the middle of the screen that asks before something is thrown away.
	// It is the browser's own <dialog>, so Escape and the keyboard work. It can be opened over a sheet.
	// `behind` finds the thing on the page that is about to be deleted: with fun it shakes while the question is open and is crumpled when the answer is yes.
	type Props = { open: boolean; title: string; text?: string; confirm?: string; keep?: string; behind?: () => Element | null | undefined; onconfirm: () => void };
	let { open = $bindable(), title, text, confirm = 'Delete', keep = 'Keep', behind, onconfirm }: Props = $props();

	let dialog: HTMLDialogElement;
	let popup: HTMLElement;
	let keepButton: HTMLElement;
	let calm: (() => void) | undefined;

	$effect(() => {
		if (open && !dialog.open) {
			dialog.showModal();
			arrive();
		} else if (!open && dialog.open) {
			dialog.close();
			calm?.();
			calm = undefined;
		}
	});

	/** A4. Without fun the popup pops in. With fun it wobbles like a question mark, the Keep button breathes, and the thing behind it gets nervous. */
	function arrive() {
		if (!allows.flights()) return;
		if (strength('A4') !== 'crazy') {
			popup.animate([{ transform: 'scale(0.94)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 180, easing: easing('ease-out') });
			return;
		}
		popup.animate([{ transform: 'scale(0.7) rotate(0)', opacity: 0 }, { transform: 'scale(1.04) rotate(-3deg)', opacity: 1, offset: 0.4 }, { transform: 'scale(1) rotate(2.5deg)', offset: 0.6 }, { transform: 'scale(1) rotate(-1.5deg)', offset: 0.8 }, { transform: 'scale(1) rotate(0)' }], { duration: 560, easing: 'ease-out' });
		keepButton.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 600, delay: 600 });
		calm = nervous(behind?.());
	}

	function answer() {
		vanish(behind?.(), strength('B4'));
		open = false;
		onconfirm();
	}
</script>

<dialog
	bind:this={dialog}
	aria-label={title}
	onclose={() => (open = false)}
	onclick={(event) => {
		if (event.target === dialog) open = false;
	}}
>
	<div class="popup" bind:this={popup}>
		<h2>{title}</h2>
		{#if text}<p class="soft">{text}</p>{/if}
		<div class="buttons">
			<Button onclick={answer}>{confirm}</Button>
			<span bind:this={keepButton} class="keep"><Button variant="secondary" onclick={() => (open = false)}>{keep}</Button></span>
		</div>
	</div>
</dialog>

<style>
	dialog {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--color-ink);
		touch-action: none;
	}
	dialog[open] {
		display: grid;
		place-items: center;
		padding: var(--space-5);
	}
	dialog::backdrop {
		background: color-mix(in srgb, var(--color-ink) 45%, transparent);
	}
	.popup {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: min(360px, 100%);
		padding: var(--space-6);
		border-radius: var(--radius-xl);
		background: var(--color-paper);
	}
	h2 {
		margin: 0;
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	p {
		margin: 0;
	}
	.buttons {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
	.buttons :global(.button) {
		width: 100%;
	}
	.keep {
		display: block;
	}
</style>
