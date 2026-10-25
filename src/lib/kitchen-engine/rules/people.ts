// R3. The people in a meal. See SPEC.md.
// A meal is for everyone or for the organisers, and always uses 100 % of that number.
import type { Event, Meal } from '../types.ts';

export function peopleInMeal(meal: Meal, event: Event): number {
	return meal.for === 'organisers' ? event.organisers : event.everyone;
}
