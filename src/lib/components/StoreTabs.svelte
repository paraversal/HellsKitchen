<script lang="ts">
	// The store tabs of the shopping list. The number is how many items are still to buy there.
	type Tab = { id: string; label: string; count: number };
	let { tabs, active = $bindable() }: { tabs: Tab[]; active: string } = $props();
</script>

<div class="tabs" role="tablist">
	{#each tabs as tab (tab.id)}
		<button class="tab" class:active={tab.id === active} role="tab" aria-selected={tab.id === active} onclick={() => (active = tab.id)}>
			<span class="name">{tab.label}</span>
			<span class="count">{tab.count}</span>
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		gap: 24px;
		overflow-x: auto;
		border-bottom: var(--border);
		scrollbar-width: none;
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 0 0 10px;
		background: none;
		border: 0;
		border-bottom: 4px solid transparent;
		border-radius: 2px 2px 0 0;
		margin-bottom: -1.5px;
		color: var(--color-ink-soft);
		font-weight: var(--weight-medium);
		white-space: nowrap;
		cursor: pointer;
	}
	@media (hover: hover) {
		.tab:hover {
			color: var(--color-ink);
		}
	}
	.active {
		color: var(--color-ink);
		font-weight: var(--weight-heavy);
		border-bottom-color: var(--color-tomato);
	}
	.count {
		display: inline-flex;
		align-items: center;
		height: 20px;
		padding: 0 7px;
		border-radius: 10px;
		background: var(--color-line);
		color: var(--color-ink);
		font-size: var(--text-caption);
		font-weight: var(--weight-heavy);
	}
	.active .count {
		background: var(--color-mustard);
	}
</style>
