<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import { easing } from '#lib/motion/easing.ts';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import IconButton from './IconButton.svelte';

	// A panel over the screen: it slides up from the bottom on a phone and sits in the middle on a desktop.
	// It is the browser's own <dialog>, so Escape closes it, focus stays inside it, and the page behind it cannot be tapped.
	// On a phone it can be pulled down by its top edge to close it. The page behind never scrolls while it is open.
	type Props = { open: boolean; title: string; children: Snippet; onclose?: () => void };
	let { open = $bindable(), title, children, onclose }: Props = $props();

	let dialog: HTMLDialogElement;
	let panel: HTMLElement;
	let body: HTMLElement;
	let handle: HTMLElement;
	let closing = false;
	let pull = $state(0);
	let pulling = $state(false);
	let startY = 0;
	let startTime = 0;

	const phone = () => !matchMedia('(min-width: 900px)').matches;

	// When the on-screen keyboard opens, a phone does not shrink the page, it puts the keyboard over it. The sheet follows the part that is left, so it sits above the keyboard.
	$effect(() => {
		const viewport = window.visualViewport;
		if (!open || !viewport) return;
		const fit = () => {
			dialog.style.top = `${viewport.offsetTop}px`;
			dialog.style.height = `${viewport.height}px`;
			dialog.style.setProperty('--visible', `${viewport.height}px`);
		};
		fit();
		viewport.addEventListener('resize', fit);
		viewport.addEventListener('scroll', fit);
		return () => {
			viewport.removeEventListener('resize', fit);
			viewport.removeEventListener('scroll', fit);
			dialog.style.top = '';
			dialog.style.height = '';
			dialog.style.removeProperty('--visible');
		};
	});

	$effect(() => {
		if (open && !dialog.open) {
			dialog.showModal();
			arrive();
		} else if (!open && dialog.open && !closing) void leave();
	});

	/** A3. The panel comes in. Without fun it rises and settles; with fun it overshoots like a tray set down, its content follows one by one, and the grip wiggles. */
	function arrive() {
		if (!allows.flights()) return;
		const fun = strength('A3') === 'playful';
		const from = phone() ? 'translateY(100%)' : 'translateY(32px) scale(0.97)';
		panel.animate([{ transform: from, opacity: phone() ? 1 : 0 }, { transform: 'none', opacity: 1 }], { duration: fun ? 520 : 380, easing: easing(fun ? 'spring-bouncy' : 'spring-soft') });
		if (!fun) return;
		const wrapper = body.children.length === 1 ? body.children[0].children : body.children;
		[...wrapper].slice(0, 8).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, delay: 120 + i * 60, easing: 'ease-out', fill: 'backwards' }));
		handle.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }], { duration: 500, delay: 300 });
	}

	/** The panel goes out, a little faster than it came, and then the dialog closes. */
	async function leave() {
		closing = true;
		if (allows.flights()) {
			const to = phone() ? 'translateY(100%)' : 'translateY(24px) scale(0.97)';
			try {
				dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, pseudoElement: '::backdrop', fill: 'forwards' });
			} catch {
				// an older browser has no animation for the backdrop
			}
			await panel.animate([{ transform: panel.style.transform || 'none', opacity: 1 }, { transform: to, opacity: phone() ? 1 : 0 }], { duration: 220, easing: easing('ease-in'), fill: 'forwards' }).finished.catch(() => {});
		}
		if (dialog.open) dialog.close();
		// What the animations kept at their end would otherwise hold the panel away when the dialog opens again.
		dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
		closing = false;
	}

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
	oncancel={(event) => {
		// Escape: the panel goes out first, then the dialog closes.
		event.preventDefault();
		open = false;
	}}
	onclose={() => {
		open = false;
		pull = 0;
		onclose?.();
	}}
	onclick={(event) => {
		if (event.target === dialog) open = false;
	}}
>
	<div class="panel" class:pulling bind:this={panel} style:transform={pull ? `translateY(${pull}px)` : undefined}>
		<!-- Pulling the top edge down is a shortcut for touch screens. The close button and Escape do the same for everyone else. -->
		<div class="grip" role="presentation" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
			<div class="handle" bind:this={handle} aria-hidden="true"></div>
			<header>
				<h2>{title}</h2>
				<IconButton icon={X} label="Close" size={36} onclick={() => (open = false)} />
			</header>
		</div>
		<div class="body" bind:this={body}>{@render children()}</div>
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
		max-height: min(92dvh, calc(var(--visible, 100dvh) - var(--space-2)));
		padding: 0 var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom));
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		background: var(--color-paper);
		touch-action: none;
	}
	.panel:not(.pulling) {
		transition: transform 160ms ease-out;
	}
	dialog[open]::backdrop {
		animation: backdrop-in 180ms ease-out;
	}
	@keyframes backdrop-in {
		from {
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
		/* Room at the sides for the patch that lights up behind a pressed row, which reaches past the row. */
		margin: 0 calc(-1 * var(--space-3));
		padding: 0 var(--space-3);
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
