<script lang="ts">
	import { toasts } from '#lib/toast.svelte.ts';

	// Short messages at the bottom of the screen, like "Added to Saturday lunch".
</script>

<div class="toasts" aria-live="polite">
	{#each toasts.items as toast (toast.id)}
		<div class="toast">{toast.text}</div>
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
		padding: 10px var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--color-ink);
		color: var(--color-paper);
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
	}
	@media (min-width: 900px) {
		.toasts {
			bottom: var(--space-6);
		}
	}
</style>
