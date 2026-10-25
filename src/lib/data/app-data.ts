// The data the app ships with: one JSON file built from the YAML files (scripts/build-data.ts).
// Recipes marked needs-review are left out, so they never reach the app until they are fixed.
import type { Data, Ingredient, Recipe } from '../kitchen-engine/types.ts';
import type { DataSet } from './validate.ts';

export type AppRecipe = Recipe & { method?: string; source?: string };

export type AppData = {
	/** Changes whenever the data changes. */
	version: string;
	stores: Data['stores'];
	ingredients: Record<string, Ingredient>;
	recipes: Record<string, AppRecipe>;
};

export function toAppData(set: DataSet, version: string): AppData {
	const recipes: Record<string, AppRecipe> = {};
	for (const [id, recipe] of Object.entries(set.recipes)) {
		if (recipe.needsReview) continue;
		recipes[id] = {
			name: recipe.name,
			category: recipe.category,
			portion: recipe.portion,
			per100g: recipe.per100g,
			...(recipe.method ? { method: recipe.method } : {}),
			...(recipe.source ? { source: recipe.source } : {})
		};
	}
	return { version, stores: set.stores, ingredients: set.ingredients, recipes };
}
