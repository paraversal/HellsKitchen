<script lang="ts">
	import Printer from '@lucide/svelte/icons/printer';
	import { resolve } from '$app/paths';
	import EmptyNote from '#lib/components/EmptyNote.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import NoPricePill from '#lib/components/NoPricePill.svelte';
	import ShopRow from '#lib/components/ShopRow.svelte';
	import StoreTabs from '#lib/components/StoreTabs.svelte';
	import { planStore } from '#lib/plan/browser.ts';
	import { current } from '#lib/plan/current.svelte.ts';
	import { setChecked } from '#lib/plan/plan.ts';
	import { euro } from '#lib/plan/shopping.ts';

	// The shopping list of the open plan: one tab per store, with what is left to buy there.
	const view = $derived(current.shopping);
	let selected = $state<string | null>(null);
	const store = $derived(view?.stores.find((s) => s.id === selected) ?? view?.stores[0]);
	const tabs = $derived(view?.stores.map((s) => ({ id: s.id, label: s.name, count: s.open })) ?? []);
	const done = $derived(store ? store.lines.filter((l) => l.checked).length : 0);
</script>

{#if view && store}
	<div class="list">
		<StoreTabs {tabs} bind:active={() => store.id, (id) => (selected = id)} />

		<div class="summary">
			<span class="cost"><strong>{euro(store.cost)}</strong> <span class="soft">estimated</span></span>
			<span class="end">
				{#if store.unpriced}<NoPricePill count={store.unpriced} />{/if}
				<IconButton icon={Printer} label="Print the list for {store.name}" size={36} href="{resolve('/print/shopping')}?store={store.id}" />
			</span>
		</div>

		<div class="progress">
			<div class="meter" role="meter" aria-label="Bought in {store.name}" aria-valuemin={0} aria-valuemax={store.lines.length} aria-valuenow={done}>
				<div class="fill" style:width="{(done / store.lines.length) * 100}%"></div>
			</div>
			<span class="count">{done} / {store.lines.length}</span>
		</div>

		<ul>
			{#each store.lines as line (line.id)}
				<li>
					<ShopRow
						name={line.name}
						buy={line.buy}
						need={line.need}
						unpriced={line.unpriced}
						bind:checked={() => line.checked, (value) => planStore.change((p) => setChecked(p, line.id, value))}
					/>
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<EmptyNote>
		<span>Nothing to buy yet.</span>
		<a href={resolve('/(app)/plan')}>Put dishes in the plan</a>
	</EmptyNote>
{/if}

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.end {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.cost strong {
		font-size: 20px;
		font-weight: var(--weight-heavy);
	}
	.cost .soft {
		font-size: var(--text-note);
	}
	.progress {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.meter {
		flex: 1;
		height: 10px;
		border-radius: 5px;
		background: var(--color-line);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: 5px;
		background: var(--color-leaf);
	}
	.count {
		font-size: var(--text-small);
		font-weight: var(--weight-bold);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li + li {
		border-top: 1px solid var(--color-line);
	}
</style>
