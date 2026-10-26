<script lang="ts">
	import { backOut, cubicIn } from 'svelte/easing';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { toasts } from '#lib/toast.svelte.ts';

	// Short messages at the bottom of the screen, like "Added to Saturday lunch".
	// A5. Without fun a toast slides up and settles. With fun it pops up like toast from a toaster, and the check draws itself.
	const playful = () => strength('A5') === 'playful';

	function enter(_node: Element) {
		if (!allows.flights()) return { duration: 0 };
		return playful()
			? { duration: 480, easing: backOut, css: (t: number, u: number) => `transform: translateY(${u * 40}px) scale(${0.8 + t * 0.2}); opacity: ${Math.min(1, t * 2.5)}` }
			: { duration: 380, easing: backOut, css: (_t: number, u: number) => `transform: translateY(${u * 44}px); opacity: ${1 - u}` };
	}

	function leave(_node: Element) {
		return allows.flights() ? { duration: 220, easing: cubicIn, css: (_t: number, u: number) => `transform: translateY(${u * 30}px); opacity: ${1 - u}` } : { duration: 0 };
	}
</script>

<div class="toasts" aria-live="polite">
	{#each toasts.items as toast (toast.id)}
		<div class="toast" in:enter out:leave>
			{#if playful()}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-mustard)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="draw" d="M4 12.5l5 5L20 6.5" /></svg>
			{/if}
			{toast.text}
		</div>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		inset: auto 0 calc(96px + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		pointer-events: none;
		z-index: 10;
	}
	.toast {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: 10px var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--color-ink);
		color: var(--color-paper);
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
	}
	.draw {
		stroke-dasharray: 30;
		stroke-dashoffset: 30;
		animation: draw 0.4s 0.25s ease-out forwards;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (min-width: 900px) {
		.toasts {
			bottom: var(--space-6);
		}
	}
</style>
