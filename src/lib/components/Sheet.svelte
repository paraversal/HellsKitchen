<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import IconButton from './IconButton.svelte';

	// A panel over the screen: it slides up from the bottom on a phone and sits in the middle on a desktop.
	// It is the browser's own <dialog>, so Escape closes it, focus stays inside it, and the page behind it cannot be tapped.
	type Props = { open: boolean; title: string; children: Snippet; onclose?: () => void };
	let { open = $bindable(), title, children, onclose }: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-label={title}
	onclose={() => {
		open = false;
		onclose?.();
	}}
	onclick={(event) => {
		if (event.target === dialog) open = false;
	}}
>
	<div class="panel">
		<div class="handle" aria-hidden="true"></div>
		<header>
			<h2>{title}</h2>
			<IconButton icon={X} label="Close" size={36} onclick={() => (open = false)} />
		</header>
		<div class="body">{@render children()}</div>
	</div>
</dialog>

<style>
	dialog {
		width: 100%;
		max-width: 100%;
		max-height: 92dvh;
		margin: auto 0 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		background: var(--color-paper);
		color: var(--color-ink);
		overflow: hidden;
	}
	dialog::backdrop {
		background: color-mix(in srgb, var(--color-ink) 45%, transparent);
	}
	dialog[open] {
		animation: rise 180ms ease-out;
	}
	@keyframes rise {
		from {
			transform: translateY(24px);
			opacity: 0;
		}
	}
	.panel {
		display: flex;
		flex-direction: column;
		max-height: 92dvh;
		padding: var(--space-3) var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom));
	}
	.handle {
		align-self: center;
		width: 44px;
		height: 5px;
		margin-bottom: var(--space-2);
		border-radius: 3px;
		background: var(--color-line);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-1) 0 var(--space-3);
	}
	h2 {
		margin: 0;
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	.body {
		overflow-y: auto;
		min-height: 0;
	}
	@media (min-width: 900px) {
		dialog {
			width: min(560px, 92vw);
			margin: auto;
			border-radius: var(--radius-xl);
		}
		.handle {
			display: none;
		}
		.panel {
			padding-top: var(--space-5);
		}
	}
</style>
