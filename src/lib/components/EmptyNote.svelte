<script lang="ts">
	import type { Snippet } from 'svelte';

	// What a screen says when there is nothing to show yet, with the way forward.
	let { children }: { children: Snippet } = $props();
</script>

<div class="note">{@render children()}</div>

<style>
	.note {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-6) 0;
		color: var(--color-ink-soft);
	}
</style>
