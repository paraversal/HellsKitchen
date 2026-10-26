<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AddRow from '#lib/components/AddRow.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import { whenText } from '#lib/format.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { listPlans } from '#lib/plan/library.ts';

	// The plans on this device: open one, start a new one, delete one. `onchosen` is told when a plan was opened or started.
	let { onchosen }: { onchosen?: () => void } = $props();
	let deleting = $state<string | null>(null);
	const plans = $derived(planStore.library ? listPlans(planStore.library) : []);

	const facts = (p: { days: number; meals: number; updatedAt: string }) => `${p.days} ${p.days === 1 ? 'day' : 'days'}, ${p.meals} ${p.meals === 1 ? 'meal' : 'meals'}, changed ${whenText(p.updatedAt)}`;
</script>

<section class="plans" aria-label="Plans on this device">
	<h3>Plans on this device</h3>
	<ul>
		{#each plans as p (p.id)}
			<li>
				{#if deleting === p.id}
					<div class="confirm">
						<span>Delete {p.name}?</span>
						<Button variant="secondary" onclick={() => { planStore.deletePlan(p.id); deleting = null; }}>Delete</Button>
						<Button variant="secondary" onclick={() => (deleting = null)}>Keep</Button>
					</div>
				{:else}
					<button class="plan-row pressable" disabled={p.open} onclick={() => { planStore.switchTo(p.id); onchosen?.(); }}>
						<span class="name">{p.name}</span>
						<span class="facts">{facts(p)}</span>
					</button>
					{#if p.open}<Badge tone="leaf">Open</Badge>{/if}
					{#if plans.length > 1}<IconButton icon={Trash2} label="Delete {p.name}" size={36} onclick={() => (deleting = p.id)} />{/if}
				{/if}
			</li>
		{/each}
	</ul>
	<AddRow label="New plan" onclick={() => { planStore.startPlan(); onchosen?.(); }} />
</section>

<style>
	.plans {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
	h3 {
		margin: 0;
		font-size: var(--text-strong);
		font-weight: var(--weight-heavy);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) 0;
		border-top: 1px solid var(--color-line);
	}
	.plan-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.plan-row:disabled {
		cursor: default;
	}
	.name {
		font-weight: var(--weight-bold);
		overflow-wrap: anywhere;
	}
	.facts {
		color: var(--color-ink-soft);
		font-size: var(--text-note);
	}
	.confirm {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		flex: 1;
	}
	.confirm span {
		flex: 1 1 100%;
		font-weight: var(--weight-bold);
	}
</style>
