// R9. Grouping by store. See SPEC.md.
// Each ingredient has exactly one store. Things that are never bought (the store none) are left out, and so are empty stores.
import { NO_STORE } from '../config.ts';
import type { Data } from '../types.ts';

/** The ingredients to buy, grouped by store, in the order of the stores file. Ingredients are sorted by name. */
export function groupByStore(needs: Record<string, number>, data: Data): { store: string; ingredients: string[] }[] {
	const groups: { store: string; ingredients: string[] }[] = [];
	for (const store of Object.keys(data.stores)) {
		if (store === NO_STORE) continue;
		const ingredients = Object.keys(needs)
			.filter((id) => data.ingredients[id].store === store && needs[id] > 0)
			.sort((a, b) => data.ingredients[a].name.localeCompare(data.ingredients[b].name));
		if (ingredients.length) groups.push({ store, ingredients });
	}
	return groups;
}
