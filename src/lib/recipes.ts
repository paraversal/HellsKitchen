// What the recipe screens need from the data: lists, filters, groups, and a recipe scaled to a number of portions.
import type { AppData } from './data/app-data.ts';
import { CATEGORIES } from './categories.ts';
import { dishAmounts } from './kitchen-engine/rules/amount.ts';
import type { Category, Meal, Unit } from './kitchen-engine/types.ts';

export type RecipeSummary = { id: string; name: string; category: Category; ingredientCount: number };

/** "1 ingredient", "9 ingredients" */
export const ingredientCountText = (count: number) => `${count} ${count === 1 ? 'ingredient' : 'ingredients'}`;

/** Every recipe, sorted by name. */
export function summaries(data: AppData): RecipeSummary[] {
	return Object.entries(data.recipes)
		.map(([id, r]) => ({ id, name: r.name, category: r.category, ingredientCount: Object.keys(r.per100g).length }))
		.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

/** The categories that have at least one recipe, in the usual order. */
export function categoriesInUse(data: AppData): Category[] {
	const used = new Set(Object.values(data.recipes).map((r) => r.category));
	return CATEGORIES.map((c) => c.id).filter((id) => used.has(id));
}

/** Recipes in a category, whose name or any ingredient contains the search text. */
export function filterRecipes(list: RecipeSummary[], data: AppData, filter: { query: string; category: Category | null }): RecipeSummary[] {
	const query = filter.query.trim().toLowerCase();
	return list.filter((summary) => {
		if (filter.category && summary.category !== filter.category) return false;
		if (!query) return true;
		if (summary.name.toLowerCase().includes(query)) return true;
		return Object.keys(data.recipes[summary.id].per100g).some((id) => data.ingredients[id]?.name.toLowerCase().includes(query));
	});
}

/** Groups a sorted list under its first letters. Names that do not start with a letter go under #. */
export function groupByLetter(list: RecipeSummary[]): { letter: string; recipes: RecipeSummary[] }[] {
	const groups: { letter: string; recipes: RecipeSummary[] }[] = [];
	for (const recipe of list) {
		const first = recipe.name.trim().charAt(0).toUpperCase();
		const letter = /[A-Z]/.test(first) ? first : '#';
		const last = groups[groups.length - 1];
		if (last?.letter === letter) last.recipes.push(recipe);
		else groups.push({ letter, recipes: [recipe] });
	}
	return groups;
}

export type ScaledLine = { id: string; name: string; amount: number; unit: Unit };

/** The ingredients of a recipe for a number of portions, in the order of the recipe. Uses the kitchen engine, so the numbers follow its rules. */
export function scaledIngredients(data: AppData, id: string, portions: number): ScaledLine[] {
	const meal: Meal = { type: 'dinner', for: 'everyone', appetite: false, dishes: [{ recipe: id }] };
	const event = { everyone: portions, organisers: 0, appetiteFactor: 1 };
	const amounts = dishAmounts({ recipe: id }, meal, event, data);
	return Object.entries(amounts).map(([ingredient, amount]) => ({ id: ingredient, name: data.ingredients[ingredient].name, amount, unit: data.ingredients[ingredient].unit }));
}
