// R11. Cost estimate. See SPEC.md.
// Price x the exact need. Ingredients without a price are counted, never guessed.
import { NO_STORE } from '../config.ts';
import type { CostEstimate, Data, Ingredient } from '../types.ts';

/** Cost of an exact need. Prices are per kg or per litre for g and ml, and per piece for counts. */
export function ingredientCost(need: number, ingredient: Ingredient): number | undefined {
	if (ingredient.price === undefined) return undefined;
	return (ingredient.unit === 'g' || ingredient.unit === 'ml' ? need / 1000 : need) * ingredient.price;
}

export function costEstimate(needs: Record<string, number>, data: Data): CostEstimate {
	let total = 0;
	let weight = 0;
	let pricedWeight = 0;
	const unpriced: string[] = [];
	for (const [id, need] of Object.entries(needs)) {
		const ingredient = data.ingredients[id];
		if (ingredient.store === NO_STORE || need <= 0) continue;
		const cost = ingredientCost(need, ingredient);
		const weighable = ingredient.unit === 'g' || ingredient.unit === 'ml'; // 1 ml counts as 1 g; pieces are left out of the weighing
		if (weighable) weight += need;
		if (cost === undefined) unpriced.push(id);
		else {
			total += cost;
			if (weighable) pricedWeight += need;
		}
	}
	return { total, coverage: weight > 0 ? pricedWeight / weight : null, unpriced: unpriced.sort() };
}
