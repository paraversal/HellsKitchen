// How healthy the data is: what is missing, what is waiting for a second look. Worked out when the data is built, and shown on the Meta screen.
import type { Issue } from './issues.ts';
import type { DataSet } from './validate.ts';

type Named = { id: string; name: string };

export type DataHealth = {
	recipes: {
		/** Every recipe in the data files. */
		total: number;
		/** The ones the app shows. The others wait for a second look and are left out. */
		inApp: number;
		needsReview: (Named & { note?: string })[];
		noMethod: Named[];
		/** Put out as they are, like jam. They need no method. */
		noCooking: number;
	};
	ingredients: {
		total: number;
		/** Bought somewhere, but nobody has said what it costs. */
		noPrice: Named[];
		/** Counted in grams or millilitres, with no usual pack size, so the list shows the exact need only. */
		noPack: number;
		/** In no recipe at all. */
		unused: Named[];
	};
	stores: { id: string; name: string; ingredients: number }[];
	/** What the checks said that did not stop anything, by kind. */
	checks: { warnings: number; notes: number };
};

const byName = (a: Named, b: Named) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });

export function dataHealth(set: DataSet, issues: Issue[]): DataHealth {
	const recipes = Object.entries(set.recipes);
	const used = new Set(recipes.flatMap(([, recipe]) => Object.keys(recipe.per100g)));
	const ingredients = Object.entries(set.ingredients);
	const named = (id: string, name: string): Named => ({ id, name });
	return {
		recipes: {
			total: recipes.length,
			inApp: recipes.filter(([, recipe]) => !recipe.needsReview).length,
			needsReview: recipes
				.filter(([, recipe]) => recipe.needsReview)
				.map(([id, recipe]) => ({ ...named(id, recipe.name), ...(recipe.reviewNote ? { note: recipe.reviewNote } : {}) }))
				.sort(byName),
			noCooking: recipes.filter(([, recipe]) => recipe.noCooking).length,
			noMethod: recipes.filter(([, recipe]) => !recipe.needsReview && !recipe.method && !recipe.noCooking).map(([id, recipe]) => named(id, recipe.name)).sort(byName)
		},
		ingredients: {
			total: ingredients.length,
			noPrice: ingredients.filter(([, i]) => i.store !== 'none' && i.price === undefined).map(([id, i]) => named(id, i.name)).sort(byName),
			noPack: ingredients.filter(([, i]) => (i.unit === 'g' || i.unit === 'ml') && i.store !== 'none' && i.pack === undefined).length,
			unused: ingredients.filter(([id]) => !used.has(id)).map(([id, i]) => named(id, i.name)).sort(byName)
		},
		stores: Object.entries(set.stores)
			.map(([id, name]) => ({ id, name, ingredients: ingredients.filter(([, i]) => i.store === id).length }))
			.sort((a, b) => b.ingredients - a.ingredients),
		checks: { warnings: issues.filter((i) => i.severity === 'warning').length, notes: issues.filter((i) => i.severity === 'note').length }
	};
}
