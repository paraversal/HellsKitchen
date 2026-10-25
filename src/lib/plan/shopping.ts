// From a plan to what the shopping screen shows: the kitchen engine does the calculating, this only arranges the result.
import type { AppData } from '../data/app-data.ts';
import { toPlan } from '../data/plan.ts';
import type { PlanFile } from '../data/schema.ts';
import { formatAmount } from '../format.ts';
import { calculate } from '../kitchen-engine/calculate.ts';
import type { Plan, Result, ShoppingItem } from '../kitchen-engine/types.ts';

/** A plan the engine can use, and the recipes in the plan that are no longer in the data. */
export function enginePlan(plan: PlanFile, data: AppData): { plan: Plan; missing: string[] } | undefined {
	const converted = toPlan(plan);
	if (!converted) return undefined;
	const missing = new Set<string>();
	for (const day of converted.days) {
		for (const meal of day.meals) {
			meal.dishes = meal.dishes.filter((dish) => {
				if (dish.recipe in data.recipes) return true;
				missing.add(dish.recipe);
				return false;
			});
		}
	}
	return { plan: converted, missing: [...missing] };
}

/** The result of the engine for a plan, or undefined when the plan cannot be read. */
export function calculatePlan(plan: PlanFile, data: AppData): { result: Result; missing: string[] } | undefined {
	const usable = enginePlan(plan, data);
	return usable && { result: calculate(usable.plan, data), missing: usable.missing };
}

const COUNT_WORDS = { pcs: ['pcs', 'pcs'], pack: ['pack', 'packs'], jar: ['jar', 'jars'] } as const;

/** What to buy, and what is needed: "2 × 5 kg" over "9.3 kg needed". Without a pack size there is only the exact need. */
export function buyText(item: ShoppingItem): { buy: string; need?: string } {
	const exact = formatAmount(item.need, item.unit);
	if (item.packs === undefined || item.packSize === undefined) return { buy: exact };
	if (item.unit === 'g' || item.unit === 'ml') {
		const size = formatAmount(item.packSize, item.unit);
		return { buy: item.packs === 1 ? size : `${item.packs} × ${size}`, need: `${exact} needed` };
	}
	const [one, many] = COUNT_WORDS[item.unit];
	const same = Math.abs(item.need - item.packs) < 1e-9;
	return { buy: `${item.packs} ${item.packs === 1 ? one : many}`, need: same ? undefined : `${exact} needed` };
}

/** Euros for people: "€4,200", and cents below €100. */
export function euro(amount: number): string {
	const digits = amount >= 100 ? 0 : 2;
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount);
}

export type ShoppingLine = { id: string; name: string; buy: string; need?: string; unpriced: boolean; checked: boolean };
export type StoreView = { id: string; name: string; lines: ShoppingLine[]; open: number; cost: number; unpriced: number };
export type ShoppingView = {
	stores: StoreView[];
	/** Items still to buy, in all stores. */
	open: number;
	cost: { total: number; coverage: number | null };
};

export function shoppingView(result: Result, checked: readonly string[]): ShoppingView {
	const done = new Set(checked);
	const stores = result.stores.map((store): StoreView => {
		const lines = store.items.map((item): ShoppingLine => ({
			id: item.ingredient,
			name: item.name,
			...buyText(item),
			unpriced: item.cost === undefined,
			checked: done.has(item.ingredient)
		}));
		return { id: store.store, name: store.name, lines, open: lines.filter((l) => !l.checked).length, cost: store.cost, unpriced: store.unpriced };
	});
	return { stores, open: stores.reduce((sum, s) => sum + s.open, 0), cost: { total: result.cost.total, coverage: result.cost.coverage } };
}
