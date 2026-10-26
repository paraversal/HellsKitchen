<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import Share2 from '@lucide/svelte/icons/share-2';
	import AddRow from '#lib/components/AddRow.svelte';
	import CostBlock from '#lib/components/CostBlock.svelte';
	import DayLabel from '#lib/components/DayLabel.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import MealRow from '#lib/components/MealRow.svelte';
	import InlineEdit from '#lib/components/InlineEdit.svelte';
	import Odometer from '#lib/components/Odometer.svelte';
	import { appData } from '#lib/app-data.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { current } from '#lib/plan/current.svelte.ts';
	import { addDay, addMeal, dayLabel, peopleIn, portionOverride, rename, setEvent } from '#lib/plan/plan.ts';
	import { euro } from '#lib/plan/shopping.ts';
	import { dayIn, mealIn } from '#lib/motion/arrive.ts';
	import { transfer } from '#lib/plan/transfer.svelte.ts';
	import DaySheet from './DaySheet.svelte';
	import EventSheet from './EventSheet.svelte';
	import MealSheet from './MealSheet.svelte';

	// The plan: the event at the top, then the days with their meals. Pressing a meal opens it for editing.
	const plan = $derived(planStore.plan);
	let meal = $state<{ day: number; meal: number } | null>(null);
	let day = $state<number | null>(null);
	let event = $state(false);

	/** What was changed for a dish, shown next to its name: its own grams per person, its own share of the guests. */
	function dishNote(dish: Parameters<typeof portionOverride>[0]): string | undefined {
		const grams = portionOverride(dish);
		const parts = [grams !== undefined ? `${grams} g` : '', dish.share === undefined ? '' : dish.share === 1 ? 'for everyone' : `for ${Math.round(dish.share * 100)} %`].filter(Boolean);
		return parts.length ? parts.join(' · ') : undefined;
	}

	/** The headcount is typed. Anything that is not a whole number of at least 1 is ignored. */
	function people(text: string) {
		const n = Number(text);
		if (Number.isInteger(n) && n >= 1) planStore.change((p) => setEvent(p, { everyone: n }));
	}

	function newMeal(index: number) {
		let created = 0;
		planStore.change((p) => {
			const result = addMeal(p, index);
			created = result.meal;
			return result.plan;
		});
		meal = { day: index, meal: created };
	}
</script>

{#if plan}
	<div class="plan">
		<header>
			<div class="title">
				<h1><InlineEdit label="Name of the plan" value={plan.name} oncommit={(value) => planStore.change((p) => rename(p, value.trim()))} /></h1>
				<div class="tools">
					<IconButton icon={Share2} label="Share and print" onclick={() => (transfer.sharing = true)} />
					<IconButton icon={Settings2} label="Event settings" onclick={() => (event = true)} />
				</div>
			</div>
			<div class="people">
				<span class="figure">
					<InlineEdit label="People" type="number" min={1} value={String(plan.event.everyone)} oncommit={people}>
						{#snippet display()}<Odometer text={String(plan.event.everyone)} />{/snippet}
					</InlineEdit>
				</span>
				<span class="soft">People</span>
			</div>
			{#if current.shopping?.stores.length}
				<CostBlock value={current.shopping.cost.total / Math.max(1, plan.event.everyone)} format={euro} caption="Estimated cost per person" coverage={current.shopping.cost.coverage} />
			{/if}
		</header>

		<div class="days">
			{#each plan.days as d, index (d.date)}
				{@const label = dayLabel(d.date)}
				<section class="day" data-day={index} in:dayIn>
					<div class="day-head">
						<DayLabel name={label.name} date={label.date} heading="h2" />
						<IconButton icon={Ellipsis} label="Edit {label.name}" size={36} onclick={() => (day = index)} />
					</div>
					{#each d.meals as m, mealIndex (m.id ?? mealIndex)}
						<div class="meal" data-meal="{index}-{mealIndex}" in:mealIn>
							<MealRow
								type={m.type}
								time={m.time}
								day={label.name}
								people={peopleIn(plan, m)}
								organisers={m.for === 'organisers'}
								hungry={m.appetite ? `×${plan.event.appetite_factor ?? 1}` : undefined}
								dishes={m.dishes.map((dish) => ({ id: dish.recipe, name: appData.recipes[dish.recipe]?.name ?? dish.recipe, note: dishNote(dish) }))}
								onopen={() => (meal = { day: index, meal: mealIndex })}
							/>
						</div>
					{/each}
					<AddRow variant="ghost" label="Add meal" onclick={() => newMeal(index)} />
				</section>
			{/each}
			<div class="add-day"><AddRow variant="day" label="Add day" onclick={() => planStore.change((p) => addDay(p))} /></div>
		</div>
	</div>

	<MealSheet bind:target={meal} />
	<DaySheet bind:day />
	<EventSheet bind:open={event} />
{/if}

<style>
	header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 14px;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		width: 100%;
	}
	h1 {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.people {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}
	.figure {
		font-size: var(--text-counter);
		font-weight: var(--weight-heavy);
		line-height: 1.1;
	}
	.tools {
		display: flex;
		gap: var(--space-2);
	}
	.days {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		margin-top: var(--space-6);
	}
	.day-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: var(--space-3);
	}
	.day :global(.ghost) {
		margin-top: var(--space-2);
	}
	.meal + .meal,
	.day-head + .meal {
		border-top: 0;
	}
	.meal:not(:first-of-type) {
		border-top: 1px solid var(--color-line);
	}

	@media (min-width: 900px) {
		.days {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: var(--space-9) var(--space-8);
			margin-top: var(--space-7);
		}
		.add-day {
			align-self: start;
			padding-top: var(--space-2);
		}
	}
</style>
