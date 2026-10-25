<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';

	// The round tick box of the shopping list.
	let { checked = $bindable(false), label }: { checked?: boolean; label: string } = $props();
</script>

<button class="check" class:checked role="checkbox" aria-checked={checked} aria-label={label} onclick={() => (checked = !checked)}>
	{#if checked}<CheckIcon size={16} strokeWidth={3} />{/if}
</button>

<style>
	.check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 26px;
		height: 26px;
		padding: 0;
		border-radius: var(--radius-pill);
		border: 2px solid var(--color-ink-soft);
		background: transparent;
		color: var(--color-sheet);
		cursor: pointer;
	}
	@media (hover: hover) {
		.check:not(.checked):hover {
			border-color: var(--color-ink);
		}
	}
	.checked {
		background: var(--color-leaf);
		border-color: var(--color-leaf);
	}
</style>
