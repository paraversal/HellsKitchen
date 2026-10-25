<script lang="ts">
	import Button from './Button.svelte';

	// A small popup in the middle of the screen that asks before something is thrown away.
	// It is the browser's own <dialog>, so Escape and the keyboard work. It can be opened over a sheet.
	type Props = { open: boolean; title: string; text?: string; confirm?: string; keep?: string; onconfirm: () => void };
	let { open = $bindable(), title, text, confirm = 'Delete', keep = 'Keep', onconfirm }: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-label={title}
	onclose={() => (open = false)}
	onclick={(event) => {
		if (event.target === dialog) open = false;
	}}
>
	<div class="popup">
		<h2>{title}</h2>
		{#if text}<p class="soft">{text}</p>{/if}
		<div class="buttons">
			<Button
				onclick={() => {
					open = false;
					onconfirm();
				}}>{confirm}</Button>
			<Button variant="secondary" onclick={() => (open = false)}>{keep}</Button>
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
</style>
