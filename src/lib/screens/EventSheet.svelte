<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AddRow from '#lib/components/AddRow.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import Field from '#lib/components/Field.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { planStore } from '#lib/plan/browser.ts';
	import { whenText } from '#lib/format.ts';
	import { listPlans } from '#lib/plan/library.ts';
	import { rename, setEvent } from '#lib/plan/plan.ts';

	// The settings of the whole event: its name, the two headcounts, and the appetite factor.
	let { open = $bindable() }: { open: boolean } = $props();
	const plan = $derived(planStore.plan);
	let bump = $state(0);
	let deleting = $state<string | null>(null);
	const plans = $derived(planStore.library ? listPlans(planStore.library) : []);

	const facts = (p: { days: number; meals: number; updatedAt: string }) => `${p.days} ${p.days === 1 ? 'day' : 'days'}, ${p.meals} ${p.meals === 1 ? 'meal' : 'meals'}, changed ${whenText(p.updatedAt)}`;

	/** A number that is not allowed puts the old value back. */
	function number(text: string, apply: (n: number) => void, whole = true, min = 0) {
		const n = Number(text);
		if (text.trim() !== '' && Number.isFinite(n) && n >= min && (!whole || Number.isInteger(n))) apply(n);
		else bump++;
	}
</script>

<Sheet bind:open title="Event">
	{#if plan}
		{#key bump}
			<div class="stack">
				<Field label="Name" value={plan.name} oncommit={(value) => value.trim() ? planStore.change((p) => rename(p, value.trim())) : bump++} />
				<div class="two">
					<Field label="Everyone" type="number" min={1} step={1} value={String(plan.event.everyone)} oncommit={(v) => number(v, (n) => planStore.change((p) => setEvent(p, { everyone: n })), true, 1)} />
					<Field label="Organisers" type="number" min={0} step={1} value={String(plan.event.organisers)} oncommit={(v) => number(v, (n) => planStore.change((p) => setEvent(p, { organisers: n })))} />
				</div>
				<Field
					label="Appetite factor, for meals that are hungrier than usual"
					type="number"
					min={0.1}
					step="any"
					value={String(plan.event.appetite_factor ?? 1)}
					oncommit={(v) => number(v, (n) => planStore.change((p) => setEvent(p, { appetite_factor: n })), false, 0.1)}
				/>
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
									<button class="plan-row" disabled={p.open} onclick={() => { planStore.switchTo(p.id); open = false; }}>
										<span class="name">{p.name}</span>
										<span class="facts">{facts(p)}</span>
									</button>
									{#if p.open}<Badge tone="leaf">Open</Badge>{/if}
									{#if plans.length > 1}<IconButton icon={Trash2} label="Delete {p.name}" size={36} onclick={() => (deleting = p.id)} />{/if}
								{/if}
							</li>
						{/each}
					</ul>
					<AddRow label="New plan" onclick={() => { planStore.startPlan(); open = false; }} />
				</section>
			</div>
		{/key}
	{/if}
</Sheet>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-2);
	}
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
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
</style>
