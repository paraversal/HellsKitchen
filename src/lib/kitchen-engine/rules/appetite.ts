// R5. Appetite factor. See SPEC.md.
// A meal can switch the event's appetite factor on. It applies to the main dishes of that meal only.
import { SHARED_CATEGORY } from '../config.ts';
import type { Event, Meal, Recipe } from '../types.ts';

export function appetiteFactor(meal: Meal, recipe: Recipe, event: Event): number {
	return meal.appetite && recipe.category === SHARED_CATEGORY ? event.appetiteFactor : 1;
}
