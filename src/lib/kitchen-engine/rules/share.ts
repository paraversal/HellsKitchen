// R4. Portion share. See SPEC.md.
// The share of a meal's people who get a dish. Main dishes split the meal between them. Everything else gets everyone.
import { SHARED_CATEGORY } from '../config.ts';
import type { Dish, Meal, Recipe } from '../types.ts';

export function portionShare(dish: Dish, meal: Meal, recipes: Record<string, Recipe>): number {
	if (dish.share !== undefined) return dish.share;
	if (recipes[dish.recipe].category !== SHARED_CATEGORY) return 1;
	const mains = meal.dishes.filter((d) => recipes[d.recipe].category === SHARED_CATEGORY).length;
	return 1 / mains;
}
