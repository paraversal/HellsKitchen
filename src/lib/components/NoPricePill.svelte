<script lang="ts">
	import Tag from '@lucide/svelte/icons/tag';

	// How many ingredients of a store have no price yet.
	let { count }: { count: number } = $props();
</script>

<span class="pill"><Tag size={14} />{count} without price</span>

<style>
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 26px;
		padding: 0 10px;
		border-radius: 13px;
		background: var(--color-mustard-tint);
		font-size: var(--text-caption);
		font-weight: var(--weight-bold);
	}
</style>
