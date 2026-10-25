<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import IconButton from './IconButton.svelte';

	// A panel over the screen: it slides up from the bottom on a phone and sits in the middle on a desktop.
	// It is the browser's own <dialog>, so Escape closes it, focus stays inside it, and the page behind it cannot be tapped.
	// On a phone it can be pulled down by its top edge to close it. The page behind never scrolls while it is open.
	type Props = { open: boolean; title: string; children: Snippet; onclose?: () => void };
	let { open = $bindable(), title, children, onclose }: Props = $props();

	let dialog: HTMLDialogElement;
	let pull = $state(0);
	let pulling = $state(false);
	let startY = 0;
	let startTime = 0;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	const phone = () => !matchMedia('(min-width: 900px)').matches;

	function down(event: PointerEvent) {
		if (!phone() || (event.target as HTMLElement).closest('button')) return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		pulling = true;
		startY = event.clientY;
		startTime = event.timeStamp;
	}

	function move(event: PointerEvent) {
		if (pulling) pull = Math.max(0, event.clientY - startY);
	}

	function up(event: PointerEvent) {
		if (!pulling) return;
		pulling = false;
		const fast = pull / Math.max(1, event.timeStamp - startTime) > 0.5; // pixels per millisecond: a flick
		if (pull > 110 || (fast && pull > 30)) open = false;
		pull = 0;
	}
</script>

<dialog
	bind:this={dialog}
	aria-label={title}
	onclose={() => {
		open = false;
		pull = 0;
		onclose?.();
	}}
	onclick={(event) => {
		if (event.target === dialog) open = false;
	}}
>
	<div class="panel" class:pulling style:transform={pull ? `translateY(${pull}px)` : undefined}>
		<!-- Pulling the top edge down is a shortcut for touch screens. The close button and Escape do the same for everyone else. -->
		<div class="grip" role="presentation" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
			<div class="handle" aria-hidden="true"></div>
			<header>
				<h2>{title}</h2>
				<IconButton icon={X} label="Close" size={36} onclick={() => (open = false)} />
			</header>
		</div>
		<div class="body">{@render children()}</div>
	</div>
</dialog>

<style>
	/* The dialog covers the whole screen and is see-through. Anything that touches it, outside the panel, stops there instead of moving the page. */
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
		overflow: hidden;
		overscroll-behavior: contain;
		touch-action: none;
	}
	dialog[open] {
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	dialog::backdrop {
		background: color-mix(in srgb, var(--color-ink) 45%, transparent);
	}
	.panel {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-height: 92dvh;
		padding: 0 var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom));
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		background: var(--color-paper);
		touch-action: none;
		animation: rise 180ms ease-out;
	}
	.panel:not(.pulling) {
		transition: transform 160ms ease-out;
	}
	@keyframes rise {
		from {
			transform: translateY(24px);
			opacity: 0;
		}
	}
	.grip {
		padding-top: var(--space-3);
		touch-action: none;
		cursor: grab;
	}
	.handle {
		width: 44px;
		height: 5px;
		margin: 0 auto var(--space-2);
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
		overscroll-behavior: contain;
		touch-action: pan-y;
		min-height: 0;
	}
	@media (min-width: 900px) {
		dialog[open] {
			align-items: center;
		}
		.panel {
			width: min(560px, 92vw);
			max-height: 88dvh;
			padding-top: var(--space-2);
			border-radius: var(--radius-xl);
		}
		.handle {
			display: none;
		}
		.grip {
			cursor: auto;
		}
	}
</style>
