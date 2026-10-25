<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Field from '#lib/components/Field.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { planStore } from '#lib/plan/browser.ts';
	import { removeDay, setDayDate } from '#lib/plan/plan.ts';

	// One day: its date, and removing it.
	let { day = $bindable() }: { day: number | null } = $props();
	const plan = $derived(planStore.plan);
	const date = $derived(day !== null && plan ? plan.days[day]?.date : undefined);
	let open = $state(false);
	let bump = $state(0);

	$effect(() => {
		open = date !== undefined;
	});

	function move(value: string) {
		if (day === null || !plan || !/^\d{4}-\d{2}-\d{2}$/.test(value) || plan.days.some((d, i) => i !== day && d.date === value)) {
			bump++;
			return;
		}
		planStore.change((p) => setDayDate(p, day!, value));
		day = null;
	}

	function remove() {
		if (day === null) return;
		const index = day;
		day = null;
		planStore.change((p) => removeDay(p, index));
	}
</script>

<Sheet bind:open title="Day" onclose={() => (day = null)}>
	{#if date}
		{#key bump}
			<div class="stack">
				<Field label="Date" type="date" value={date} oncommit={move} />
				{#if (plan?.days.length ?? 0) > 1}
					<Button variant="secondary" onclick={remove}>Delete this day and its meals</Button>
				{/if}
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
</style>
