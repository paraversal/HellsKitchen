<script lang="ts">
	import Tag from '@lucide/svelte/icons/tag';
	import Check from './Check.svelte';

	// One line of the shopping list: tick box, name, and what to buy. The tag marks an ingredient without a price.
	// The whole row is the tick box, so it is easy to hit with one thumb in a shop.
	type Props = { name: string; buy: string; need?: string; checked?: boolean; unpriced?: boolean };
	let { name, buy, need, checked = $bindable(false), unpriced = false }: Props = $props();
	let fresh = $state(false);
</script>

<button
	class="row pressable"
	class:done={checked}
	role="checkbox"
	aria-checked={checked}
	aria-label="{name}, {buy}{unpriced ? ', no price' : ''}"
	onclick={() => {
		fresh = true;
		checked = !checked;
	}}
>
	<Check {checked} still {fresh} />
	<span class="name">{name}{#if unpriced}<Tag size={14} />{/if}</span>
	<span class="amounts">
		<span class="buy">{buy}</span>
		{#if need}<span class="need">{need}</span>{/if}
	</span>
</button>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 14px;
		width: 100%;
		min-height: 52px;
		padding: var(--space-3) 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.name {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 1;
		font-size: var(--text-body);
		font-weight: var(--weight-medium);
	}
	.name :global(svg) {
		color: var(--color-ink-soft);
	}
	.amounts {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1px;
		text-align: right;
	}
	.buy {
		font-size: var(--text-body);
		font-weight: var(--weight-bold);
	}
	.need {
		color: var(--color-ink-soft);
		font-size: var(--text-caption);
	}
	.done .name {
		color: var(--color-ink-soft);
		text-decoration: line-through;
	}
	.done .buy {
		color: var(--color-ink-soft);
	}
</style>
