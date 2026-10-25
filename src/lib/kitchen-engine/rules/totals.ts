// R7. Total need per ingredient. See SPEC.md.
// Add up the amounts of every dish in every meal of the plan.
import type { Data, Plan } from '../types.ts';
import { dishAmounts } from './amount.ts';

export function totalNeeds(plan: Plan, data: Data): Record<string, number> {
	const needs: Record<string, number> = {};
	for (const day of plan.days) {
		for (const meal of day.meals) {
			for (const dish of meal.dishes) {
				for (const [ingredient, amount] of Object.entries(dishAmounts(dish, meal, plan.event, data))) {
					needs[ingredient] = (needs[ingredient] ?? 0) + amount;
				}
			}
		}
	}
	return needs;
}
