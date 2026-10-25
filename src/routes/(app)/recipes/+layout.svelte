<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Chip from '#lib/components/Chip.svelte';
	import RecipeRow from '#lib/components/RecipeRow.svelte';
	import SearchField from '#lib/components/SearchField.svelte';
	import { appData } from '#lib/app-data.ts';
	import { CATEGORIES, categoryName } from '#lib/categories.ts';
	import type { Category } from '#lib/kitchen-engine/types.ts';
	import { categoriesInUse, filterRecipes, groupByLetter, ingredientCountText, summaries } from '#lib/recipes.ts';

	// The recipe list. On a phone it is a screen of its own and a recipe opens over it. On a desktop the list stays on the left and the recipe opens on the right.
	let { children } = $props();

	const all = summaries(appData);
	const categories = categoriesInUse(appData);
	let query = $state('');
	let category = $state<Category | null>(null);

	const groups = $derived(groupByLetter(filterRecipes(all, appData, { query, category })));
	const selected = $derived(page.params.id);

	// On a desktop there is room for a recipe next to the list, so show the first one.
	onMount(() => {
		if (!selected && matchMedia('(min-width: 900px)').matches) goto(resolve('/(app)/recipes/[id]', { id: all[0].id }), { replaceState: true });
	});
</script>

<div class="recipes" class:open={!!selected}>
	<section class="list" aria-label="Recipes">
		<div class="head">
			<h1>Recipes</h1>
			<SearchField bind:value={query} placeholder="Recipe or ingredient" />
			<div class="chips">
				<Chip active={category === null} onclick={() => (category = null)}>All</Chip>
				{#each categories as id (id)}
					<Chip active={category === id} onclick={() => (category = id)}>{CATEGORIES.find((c) => c.id === id)?.many}</Chip>
				{/each}
			</div>
		</div>

		{#each groups as group (group.letter)}
			<div class="letter"><span>{group.letter}</span></div>
			{#each group.recipes as recipe (recipe.id)}
				<RecipeRow
					id={recipe.id}
					name={recipe.name}
					meta="{categoryName(recipe.category)} · {ingredientCountText(recipe.ingredientCount)}"
					href={resolve('/(app)/recipes/[id]', { id: recipe.id })}
					selected={selected === recipe.id}
					canAdd={false}
				/>
			{/each}
		{:else}
			<p class="empty soft">No recipe matches.</p>
		{/each}
	</section>

	<section class="detail">{@render children()}</section>
</div>

<style>
	.list {
		padding: var(--space-6) var(--space-5) var(--space-4);
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding-bottom: 6px;
	}
	.chips {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		margin: 0 calc(-1 * var(--space-5));
		padding: 0 var(--space-5);
		scrollbar-width: none;
	}
	.letter {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 14px var(--space-3) 2px;
		color: var(--color-tomato);
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	.letter::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-line);
	}
	.empty {
		padding: var(--space-6) var(--space-3);
	}

	/* A phone: the list, or the recipe that was opened. */
	.open .list {
		display: none;
	}
	.recipes:not(.open) .detail {
		display: none;
	}

	/* A desktop: both at once. */
	@media (min-width: 900px) {
		.recipes {
			display: grid;
			grid-template-columns: 420px 1fr;
			min-height: 100dvh;
		}
		.list,
		.open .list {
			display: block;
			position: sticky;
			top: 0;
			height: 100dvh;
			overflow-y: auto;
			padding: var(--space-8) var(--space-5) var(--space-5);
			border-right: var(--border);
		}
		.head {
			padding: 0 var(--space-3) 6px;
		}
		.chips {
			margin: 0;
			padding: 0;
			flex-wrap: wrap;
		}
		.recipes:not(.open) .detail {
			display: block;
		}
	}
</style>
