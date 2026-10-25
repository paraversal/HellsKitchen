<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// The dashed row that adds something, like a meal.
	let { label, ...rest }: { label: string } & HTMLButtonAttributes = $props();
</script>

<button class="add-row" {...rest}>
	<Plus size={16} />
	{label}
</button>

<style>
	.add-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		height: 44px;
		border: 1.5px dashed var(--color-line);
		border-radius: 14px;
		background: none;
		color: var(--color-ink-soft);
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		cursor: pointer;
	}
</style>
