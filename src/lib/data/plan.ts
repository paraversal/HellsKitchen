// Turns a plan file into the shape the kitchen engine works with: defaults filled in, portions as grams.
import type { Plan } from '../kitchen-engine/types.ts';
import { parseQuantity } from './quantity.ts';
import { planSchema } from './schema.ts';

/** Returns undefined when the plan is not valid. Run validatePlan first to learn what is wrong. */
export function toPlan(raw: unknown): Plan | undefined {
	const parsed = planSchema.safeParse(raw);
	if (!parsed.success) return undefined;
	const plan = parsed.data;
	const days: Plan['days'] = [];
	for (const day of plan.days) {
		const meals: Plan['days'][number]['meals'] = [];
		for (const meal of day.meals) {
			const dishes: Plan['days'][number]['meals'][number]['dishes'] = [];
			for (const dish of meal.dishes) {
				let portion: number | undefined;
				if (dish.portion !== undefined) {
					const q = parseQuantity(dish.portion);
					if (!q.ok || q.quantity.unit !== 'g') return undefined;
					portion = q.quantity.amount;
				}
				dishes.push({ recipe: dish.recipe, share: dish.share, portion });
			}
			meals.push({ type: meal.type, for: meal.for ?? 'everyone', appetite: meal.appetite ?? false, dishes });
		}
		days.push({ date: day.date, meals });
	}
	return { event: { everyone: plan.event.everyone, organisers: plan.event.organisers, appetiteFactor: plan.event.appetite_factor ?? 1 }, days };
}
