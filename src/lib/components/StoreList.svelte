<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import { euro } from '#lib/plan/shopping.ts';

	// The stores of the shopping list as a column, for a desktop, where there is room to see them all with what each costs.
	// A phone has the store tabs instead. The number is how many items are still to buy there; a store with nothing left shows a check.
	type Store = { id: string; label: string; count: number; cost: number };
	let { stores, active = $bindable() }: { stores: Store[]; active: string } = $props();

	const buttons: Record<string, HTMLElement> = {};

	/** Up and down move between the stores; only the open one is in the Tab order. */
	function keys(event: KeyboardEvent) {
		const at = stores.findIndex((store) => store.id === active);
		const to = event.key === 'ArrowDown' ? at + 1 : event.key === 'ArrowUp' ? at - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? stores.length - 1 : -2;
		if (to === -2) return;
		event.preventDefault();
		const next = stores[(to + stores.length) % stores.length];
		active = next.id;
		buttons[next.id]?.focus();
	}
</script>

<div class="stores" role="tablist" aria-label="Stores" aria-orientation="vertical" tabindex="-1" onkeydown={keys}>
	{#each stores as store (store.id)}
		<button class="store pressable" class:active={store.id === active} role="tab" aria-selected={store.id === active} tabindex={store.id === active ? 0 : -1} bind:this={buttons[store.id]} onclick={() => (active = store.id)}>
			<span class="text">
				<span class="name">{store.label}</span>
				<span class="cost">{euro(store.cost)}</span>
			</span>
			<span class="count" class:done={store.count === 0}>{#if store.count === 0}<CheckIcon size={13} strokeWidth={3.5} />{:else}{store.count}{/if}</span>
		</button>
	{/each}
</div>

<style>
	.stores {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.store {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 6px 0;
		border: 0;
		background: none;
		color: var(--color-ink);
		text-align: left;
		cursor: pointer;
	}
	.store.active::before {
		background: var(--color-mustard-tint);
		opacity: 1;
	}
	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.name {
		font-weight: var(--weight-medium);
	}
	.active .name {
		font-weight: var(--weight-heavy);
	}
	.cost {
		color: var(--color-ink-soft);
		font-size: var(--text-small);
	}
	.count {
		display: inline-flex;
		align-items: center;
		height: 20px;
		padding: 0 7px;
		border-radius: 10px;
		background: var(--color-line);
		font-size: var(--text-caption);
		font-weight: var(--weight-heavy);
	}
	.active .count {
		background: var(--color-mustard);
	}
	.count.done,
	.active .count.done {
		background: var(--color-leaf);
		color: var(--color-sheet);
	}
</style>
