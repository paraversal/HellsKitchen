<script lang="ts">
	import type { Snippet } from 'svelte';

	// A small label, like the category of a recipe.
	let { tone = 'neutral', children }: { tone?: 'neutral' | 'leaf' | 'mustard'; children: Snippet } = $props();
</script>

<span class="badge {tone}">{@render children()}</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		height: 24px;
		padding: 0 10px;
		border-radius: var(--radius-s);
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
	}
	.neutral {
		background: var(--color-line);
		color: var(--color-ink-soft);
	}
	.leaf {
		background: var(--color-leaf-tint);
		color: var(--color-leaf);
	}
	.mustard {
		background: var(--color-mustard-tint);
		color: var(--color-ink);
	}
</style>
