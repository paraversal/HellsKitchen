// Chains the rules together, in the order SPEC.md lists them: a plan and the data go in, a shopping list and a cost come out.
import { RULES_VERSION } from './config.ts';
import { costEstimate, ingredientCost } from './rules/cost.ts';
import { packCount } from './rules/packs.ts';
import { groupByStore } from './rules/stores.ts';
import { totalNeeds } from './rules/totals.ts';
import type { Data, Plan, Result, ShoppingItem, StoreList } from './types.ts';

export function calculate(plan: Plan, data: Data): Result {
	const needs = totalNeeds(plan, data); // R2 to R7

	const stores: StoreList[] = groupByStore(needs, data).map(({ store, ingredients }) => {
		// R9
		const items: ShoppingItem[] = ingredients.map((id) => {
			const ingredient = data.ingredients[id];
			const pack = packCount(needs[id], ingredient); // R10
			return {
				ingredient: id,
				name: ingredient.name,
				unit: ingredient.unit,
				need: needs[id],
				packs: pack?.packs,
				packSize: pack?.packSize,
				cost: ingredientCost(needs[id], ingredient) // R11
			};
		});
		return {
			store,
			name: data.stores[store],
			items,
			cost: items.reduce((sum, item) => sum + (item.cost ?? 0), 0),
			unpriced: items.filter((item) => item.cost === undefined).length
		};
	});

	return { rulesVersion: RULES_VERSION, needs, stores, cost: costEstimate(needs, data) };
}
