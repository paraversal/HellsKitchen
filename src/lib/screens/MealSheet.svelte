<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import Plus from '@lucide/svelte/icons/plus';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import X from '@lucide/svelte/icons/x';
	import AddRow from '#lib/components/AddRow.svelte';
	import Button from '#lib/components/Button.svelte';
	import Chip from '#lib/components/Chip.svelte';
	import Confirm from '#lib/components/Confirm.svelte';
	import Field from '#lib/components/Field.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import { MEAL_TYPES } from '#lib/components/meal-types.ts';
	import Plate from '#lib/components/Plate.svelte';
	import SearchField from '#lib/components/SearchField.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import Switch from '#lib/components/Switch.svelte';
	import { appData } from '#lib/app-data.ts';
	import { CATEGORIES, categoryName } from '#lib/categories.ts';
	import type { Category } from '#lib/kitchen-engine/types.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { MEAL_ORDER, addDish, dayLabel, peopleIn, portionOverride, removeDish, removeMeal, setDish, updateMeal, type MealPatch } from '#lib/plan/plan.ts';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { vanish } from '#lib/motion/vanish.ts';
	import { categoriesInUse, filterRecipes, summaries } from '#lib/recipes.ts';

	// Everything about one meal: what kind, when, for whom, and its dishes. Changes apply at once.
	let { target = $bindable() }: { target: { day: number; meal: number } | null } = $props();

	const plan = $derived(planStore.plan);
	const meal = $derived(target && plan ? plan.days[target.day]?.meals[target.meal] : undefined);
	let open = $state(false);
	let view = $state<'meal' | 'picker'>('meal');
	let adjusting = $state<string | null>(null);
	let bump = $state(0);
	let deleting = $state(false);

	$effect(() => {
		open = !!meal;
	});

	const close = () => {
		target = null;
		view = 'meal';
		adjusting = null;
	};

	function patch(change: MealPatch) {
		if (!target) return;
		const { day } = target;
		let moved = target.meal;
		planStore.change((p) => {
			const result = updateMeal(p, day, moved, change);
			moved = result.meal;
			return result.plan;
		});
		target = { day, meal: moved };
	}

	function remove() {
		if (!target) return;
		const { day, meal: index } = target;
		close();
		planStore.change((p) => removeMeal(p, day, index));
	}

	const toggle = (recipe: string) => {
		if (!target || !meal) return;
		const { day, meal: index } = target;
		const present = meal.dishes.some((d) => d.recipe === recipe);
		if (present) vanish(document.querySelector(`dialog[open] [data-dish="${recipe}"]`), strength('B4'));
		planStore.change((p) => (present ? removeDish(p, day, index, recipe) : addDish(p, day, index, recipe)));
	};

	function adjust(recipe: string, change: { portion?: string; share?: string }) {
		if (!target) return;
		const { day, meal: index } = target;
		const number = (text: string | undefined) => (text === undefined || text.trim() === '' || !(Number(text) > 0) ? undefined : Number(text));
		const next: { portion?: number | undefined; share?: number | undefined } = {};
		if ('portion' in change) next.portion = number(change.portion);
		if ('share' in change) {
			const percent = number(change.share);
			next.share = percent === undefined ? undefined : Math.min(percent, 100) / 100;
		}
		planStore.change((p) => setDish(p, day, index, recipe, next));
		bump++;
	}

	// the picker
	const all = summaries(appData);
	const categories = categoriesInUse(appData);
	let query = $state('');
	let category = $state<Category | null>(null);
	const found = $derived(filterRecipes(all, appData, { query, category }));
	const present = $derived(new Set(meal?.dishes.map((d) => d.recipe)));
</script>

<Sheet bind:open title={view === 'picker' ? 'Add dishes' : meal ? MEAL_TYPES[meal.type].label : 'Meal'} onclose={close}>
	{#if meal && plan}
		{#if view === 'meal'}
			<div class="stack">
				<div class="chips" role="group" aria-label="Kind of meal">
					{#each MEAL_ORDER as type (type)}
						<Chip active={meal.type === type} icon={MEAL_TYPES[type].icon} onclick={() => patch({ type })}>{MEAL_TYPES[type].short}</Chip>
					{/each}
				</div>

				<div class="two">
					<Field label="Time" type="time" value={meal.time ?? ''} oncommit={(value) => patch({ time: value || null })} />
					<div class="who">
						<span class="label">For</span>
						<div class="chips" role="group" aria-label="Who the meal is for">
							<Chip active={(meal.for ?? 'everyone') === 'everyone'} onclick={() => patch({ for: 'everyone' })}>Everyone · {plan.event.everyone}</Chip>
							<Chip active={meal.for === 'organisers'} onclick={() => patch({ for: 'organisers' })}>Organisers · {plan.event.organisers}</Chip>
						</div>
					</div>
				</div>

				<Switch bind:checked={() => !!meal.appetite, (value) => patch({ appetite: value })}>
					<strong>Hungrier than usual</strong>
					<span class="soft note">Main dishes ×{plan.event.appetite_factor ?? 1}</span>
				</Switch>

				<section>
					<h3>Dishes · {peopleIn(plan, meal)} people</h3>
					<ul>
						{#each meal.dishes as dish (dish.recipe)}
							{@const recipe = appData.recipes[dish.recipe]}
							<li data-dish={dish.recipe}>
								<div class="dish">
									<Plate seed={dish.recipe} size={40} />
									<div class="grow">
										<strong>{recipe?.name ?? dish.recipe}</strong>
										<span class="soft note">
											{recipe ? categoryName(recipe.category) : 'No longer available'}
											{#if portionOverride(dish) || dish.share} · adjusted{/if}
										</span>
									</div>
									{#if recipe}
										<IconButton icon={SlidersHorizontal} label="Adjust {recipe.name}" size={34} onclick={() => (adjusting = adjusting === dish.recipe ? null : dish.recipe)} />
									{/if}
									<IconButton icon={X} label="Remove {recipe?.name ?? dish.recipe}" size={34} onclick={() => toggle(dish.recipe)} />
								</div>
								{#if adjusting === dish.recipe && recipe}
									{#key bump}
										<div class="two adjust">
											<Field label="Grams per person" type="number" min={1} suffix="g" placeholder={String(recipe.portion)} value={String(portionOverride(dish) ?? '')} oncommit={(value) => adjust(dish.recipe, { portion: value })} />
											<Field label="Share of the guests" type="number" min={1} max={100} suffix="%" placeholder="automatic" value={dish.share ? String(Math.round(dish.share * 100)) : ''} oncommit={(value) => adjust(dish.recipe, { share: value })} />
										</div>
									{/key}
								{/if}
							</li>
						{/each}
					</ul>
					<AddRow label="Add dish" onclick={() => (view = 'picker')} />
				</section>

				<Button variant="secondary" onclick={() => (deleting = true)}>Delete this meal</Button>
			</div>
		{:else}
			<div class="stack">
				<div class="top">
					<IconButton icon={ArrowLeft} label="Back to the meal" size={36} onclick={() => (view = 'meal')} />
					<div class="grow"><SearchField bind:value={query} placeholder="Recipe or ingredient" /></div>
				</div>
				<div class="chips scroll">
					<Chip active={category === null} onclick={() => (category = null)}>All</Chip>
					{#each categories as id (id)}
						<Chip active={category === id} onclick={() => (category = id)}>{CATEGORIES.find((c) => c.id === id)?.many}</Chip>
					{/each}
				</div>
				<ul class="picker">
					{#each found as recipe (recipe.id)}
						<li>
							<button class="pick pressable" onclick={() => toggle(recipe.id)} aria-pressed={present.has(recipe.id)}>
								<Plate seed={recipe.id} size={40} />
								<span class="grow"><strong>{recipe.name}</strong><span class="soft note">{categoryName(recipe.category)}</span></span>
								<span class="mark" class:on={present.has(recipe.id)}>{#if present.has(recipe.id)}<Check size={16} />{:else}<Plus size={16} />{/if}</span>
							</button>
						</li>
					{:else}
						<li class="soft">No recipe matches.</li>
					{/each}
				</ul>
				<Button block onclick={() => (view = 'meal')}>Done</Button>
			</div>
		{/if}
	{/if}
</Sheet>

<Confirm
	bind:open={deleting}
	behind={() => (target ? document.querySelector(`[data-meal="${target.day}-${target.meal}"]`) : null)}
	title="Delete this meal?"
	text={meal && target && plan ? `${dayLabel(plan.days[target.day].date).name} ${MEAL_TYPES[meal.type].label.toLowerCase()}${meal.dishes.length ? ` and its ${meal.dishes.length} ${meal.dishes.length === 1 ? 'dish' : 'dishes'}` : ''} will be taken out of the plan.` : undefined}
	onconfirm={remove}
/>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding-bottom: var(--space-2);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.scroll {
		flex-wrap: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		align-items: start;
	}
	.who {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.label {
		color: var(--color-ink-soft);
		font-size: var(--text-note);
		font-weight: var(--weight-medium);
	}
	.note {
		display: block;
		font-size: var(--text-note);
	}
	h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-small);
		font-weight: var(--weight-bold);
		color: var(--color-ink-soft);
	}
	ul {
		margin: 0 0 var(--space-3);
		padding: 0;
		list-style: none;
	}
	.dish,
	.pick {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.dish {
		padding: var(--space-2) 0;
	}
	.grow {
		flex: 1;
		min-width: 0;
		text-align: left;
	}
	.grow strong {
		display: block;
	}
	.adjust {
		padding: 0 0 var(--space-3);
	}
	.top {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.picker {
		margin: 0;
	}
	.pick {
		width: 100%;
		padding: 8px 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: var(--radius-pill);
		border: var(--border);
		background: var(--color-sheet);
	}
	.mark.on {
		border-color: var(--color-leaf);
		background: var(--color-leaf);
		color: var(--color-sheet);
	}
	@media (max-width: 420px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
