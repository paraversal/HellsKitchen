<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { whenText } from '#lib/format.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { planCounts } from '#lib/plan/plan.ts';
	import { samePlan } from '#lib/plan/transfer.ts';
	import { acceptIncoming, transfer } from '#lib/plan/transfer.svelte.ts';
	import type { PlanFile } from '#lib/data/schema.ts';

	// A plan arrived, by link or by file. Shows it next to the one on this device, with when each was last changed, so the person can tell which is which.
	let open = $state(false);
	const incoming = $derived(transfer.incoming);
	const arrived = $derived(incoming?.result.ok ? incoming.result.shared : undefined);
	const mine = $derived(planStore.record);
	const identical = $derived(!!arrived && !!mine && samePlan(arrived.plan, mine.plan));
	const ready = $derived(planStore.status === 'ready');

	$effect(() => {
		open = incoming !== null;
	});

	const facts = (plan: PlanFile) => {
		const { days, meals } = planCounts(plan);
		return `${days} ${days === 1 ? 'day' : 'days'}, ${meals} ${meals === 1 ? 'meal' : 'meals'}, ${plan.event.everyone} people`;
	};
</script>

<Sheet bind:open title={arrived ? 'A plan arrived' : 'This cannot be opened'} onclose={() => (transfer.incoming = null)}>
	{#if incoming && !incoming.result.ok}
		<div class="stack">
			<p>{incoming.result.problem}</p>
			<Button variant="secondary" onclick={() => (open = false)}>Close</Button>
		</div>
	{:else if arrived}
		<div class="stack">
			<div class="copies">
				<section aria-label="The plan that arrived">
					<h3>Arrived</h3>
					<p class="name">{arrived.plan.name}</p>
					<p class="soft">{facts(arrived.plan)}</p>
					<p class="soft">Changed {whenText(arrived.updatedAt)}</p>
				</section>
				{#if mine}
					<section aria-label="The plan on this device">
						<h3>On this device</h3>
						<p class="name">{mine.plan.name}</p>
						<p class="soft">{facts(mine.plan)}</p>
						<p class="soft">Changed {whenText(mine.updatedAt)}</p>
					</section>
				{/if}
			</div>

			{#if identical}
				<p>You already have this plan.</p>
				<Button variant="secondary" onclick={() => (open = false)}>Close</Button>
			{:else}
				<div class="buttons">
					<Button block disabled={!ready} onclick={() => acceptIncoming('new')}>Keep both</Button>
					<Button block variant="secondary" disabled={!ready} onclick={() => acceptIncoming('replace')}>Replace the plan on this device</Button>
					<Button block variant="secondary" onclick={() => (open = false)}>Cancel</Button>
				</div>
			{/if}
		</div>
	{/if}
</Sheet>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-2);
	}
	p {
		margin: 0;
	}
	.copies {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	h3 {
		margin: 0 0 var(--space-1);
		color: var(--color-ink-soft);
		font-size: var(--text-note);
		font-weight: var(--weight-medium);
	}
	.name {
		font-size: var(--text-strong);
		font-weight: var(--weight-bold);
		overflow-wrap: anywhere;
	}
	.soft {
		font-size: var(--text-small);
	}
	.buttons {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
