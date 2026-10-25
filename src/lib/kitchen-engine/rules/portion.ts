// R2. Planned amount per person. See SPEC.md.
// A recipe carries a default. A dish in a meal can override it.
import type { Dish, Recipe } from '../types.ts';

export function dishPortion(dish: Dish, recipe: Recipe): number {
	return dish.portion ?? recipe.portion;
}
