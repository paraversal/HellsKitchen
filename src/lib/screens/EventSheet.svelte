<script lang="ts">
	import Field from '#lib/components/Field.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { planStore } from '#lib/plan/browser.ts';
	import { rename, setEvent } from '#lib/plan/plan.ts';
	import PlansList from './PlansList.svelte';

	// The settings of the whole event: its name, the two headcounts, and the appetite factor.
	let { open = $bindable() }: { open: boolean } = $props();
	const plan = $derived(planStore.plan);
	let bump = $state(0);

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
				<PlansList onchosen={() => (open = false)} />
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
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
</style>
