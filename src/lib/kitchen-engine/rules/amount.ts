// R6. Amount of one ingredient in one dish. See SPEC.md.
// per 100 g  x  (grams per person / 100)  x  people  x  share  x  appetite
import type { Data, Dish, Event, Meal } from '../types.ts';
import { appetiteFactor } from './appetite.ts';
import { peopleInMeal } from './people.ts';
import { dishPortion } from './portion.ts';
import { portionShare } from './share.ts';

/** How much of each ingredient one dish needs in one meal, in the ingredients' base units. Also useful for recipe sheets. */
export function dishAmounts(dish: Dish, meal: Meal, event: Event, data: Data): Record<string, number> {
	const recipe = data.recipes[dish.recipe];
	const portions =
		(dishPortion(dish, recipe) / 100) * peopleInMeal(meal, event) * portionShare(dish, meal, data.recipes) * appetiteFactor(meal, recipe, event);
	const amounts: Record<string, number> = {};
	for (const [ingredient, per100g] of Object.entries(recipe.per100g)) amounts[ingredient] = per100g * portions;
	return amounts;
}
