<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Plus from '@lucide/svelte/icons/plus';
	import DayLabel from '#lib/components/DayLabel.svelte';
	import { MEAL_TYPES } from '#lib/components/meal-types.ts';
	import Sheet from '#lib/components/Sheet.svelte';
	import { appData } from '#lib/app-data.ts';
	import { dishAdded } from '#lib/motion/addflight.ts';
	import { adding } from '#lib/plan/current.svelte.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { addDish, addMeal, dayLabel } from '#lib/plan/plan.ts';
	import { showToast } from '#lib/toast.svelte.ts';

	// "Add to plan": choose the meal that gets the recipe, or a new meal on one of the days.
	let open = $state(false);
	$effect(() => {
		open = adding.recipe !== null;
	});

	const plan = $derived(planStore.plan);
	const recipe = $derived(adding.recipe ? appData.recipes[adding.recipe] : undefined);

	function put(day: number, meal: number | 'new') {
		const id = adding.recipe;
		if (!id || !plan) return;
		let index = meal === 'new' ? -1 : meal;
		const already = meal !== 'new' && plan.days[day].meals[meal].dishes.some((d) => d.recipe === id);
		if (!already) {
			planStore.change((p) => {
				let next = p;
				if (meal === 'new') {
					const added = addMeal(p, day);
					next = added.plan;
					index = added.meal;
				}
				return addDish(next, day, index, id);
			});
		}
		const when = dayLabel(plan.days[day].date).name;
		const kind = planStore.plan?.days[day].meals[index]?.type ?? 'meal';
		showToast(already ? `Already in ${when} ${kind}` : `Added to ${when} ${kind}`);
		adding.recipe = null;
		if (!already) void dishAdded(id);
	}
</script>

<Sheet bind:open title={recipe ? `Add ${recipe.name}` : 'Add to plan'} onclose={() => (adding.recipe = null)}>
	{#if plan}
		<div class="days">
			{#each plan.days as day, d (day.date)}
				{@const label = dayLabel(day.date)}
				<section>
					<DayLabel name={label.name} date={label.date} />
					<ul>
						{#each day.meals as meal, m (m)}
							{@const type = MEAL_TYPES[meal.type]}
							{@const has = meal.dishes.some((x) => x.recipe === adding.recipe)}
							<li>
								<button onclick={() => put(d, m)}>
									<span class="icon" style:background="var(--color-{type.tint})" style:color="var(--color-{type.color})"><type.icon size={18} /></span>
									<span class="grow"><strong>{type.label}</strong>{#if meal.time}<span class="soft"> {meal.time}</span>{/if}</span>
									<span class="soft count">{meal.dishes.length} {meal.dishes.length === 1 ? 'dish' : 'dishes'}</span>
									{#if has}<Check size={18} />{/if}
								</button>
							</li>
						{/each}
						<li>
							<button class="new" onclick={() => put(d, 'new')}><Plus size={18} /> New meal</button>
						</li>
					</ul>
				</section>
			{/each}
		</div>
	{/if}
</Sheet>

<style>
	.days {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	ul {
		margin: var(--space-2) 0 0;
		padding: 0;
		list-style: none;
	}
	button {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: 10px 0;
		border: 0;
		border-bottom: 1px solid var(--color-line);
		background: none;
		text-align: left;
		cursor: pointer;
	}
	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-pill);
	}
	.grow {
		flex: 1;
	}
	.count {
		font-size: var(--text-note);
	}
	.new {
		color: var(--color-ink-soft);
		font-weight: var(--weight-medium);
		border-bottom: 0;
	}
</style>
