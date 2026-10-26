<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// The row that adds something. `dashed` is the plain one; `ghost` is quiet text for small additions (a meal in a day); `day` is a big one that is easy to find (a new day).
	let { label, variant = 'dashed', ...rest }: { label: string; variant?: 'dashed' | 'ghost' | 'day' } & HTMLButtonAttributes = $props();
</script>

<button class="add-row {variant}" {...rest}>
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
	@media (hover: hover) {
		.add-row:hover {
			background: var(--color-sheet);
			color: var(--color-ink);
		}
	}
	.add-row:global([data-pressed]) {
		background: var(--color-mustard-tint);
	}
	.ghost {
		justify-content: flex-start;
		height: 40px;
		padding: 0 var(--space-3);
		border: 0;
		color: var(--color-tomato-ink);
		font-weight: var(--weight-bold);
	}
	.ghost:global([data-pressed]) {
		background: var(--color-mustard-tint);
	}
	.day {
		height: 72px;
		border-radius: var(--radius-l);
		font-size: var(--text-compact);
		font-weight: var(--weight-bold);
	}
</style>
