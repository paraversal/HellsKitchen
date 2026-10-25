// Recipe sheets for printing: one for every dish in the plan, scaled to the meal it is cooked for.
// The numbers come from the kitchen engine's rules (R2, R3, R4, R5, R6), the same ones the shopping list uses.
import type { AppData } from '../data/app-data.ts';
import type { PlanFile } from '../data/schema.ts';
import { dishAmounts } from '../kitchen-engine/rules/amount.ts';
import { appetiteFactor } from '../kitchen-engine/rules/appetite.ts';
import { peopleInMeal } from '../kitchen-engine/rules/people.ts';
import { dishPortion } from '../kitchen-engine/rules/portion.ts';
import { portionShare } from '../kitchen-engine/rules/share.ts';
import type { MealType } from '../kitchen-engine/types.ts';
import { formatAmount } from '../format.ts';
import { dayLabel } from './plan.ts';
import { enginePlan } from './shopping.ts';

export type SheetLine = { id: string; name: string; amount: string };

export type Sheet = {
	/** Unique in the plan: day, meal and dish. */
	key: string;
	recipe: string;
	name: string;
	day: { name: string; date: string };
	meal: MealType;
	time?: string;
	/** Who eats it: "200 people". */
	people: number;
	forOrganisers: boolean;
	/** The share of the people who get this dish, 0 to 1. */
	share: number;
	/** The appetite factor that applies to this dish, 1 when none does. */
	appetite: number;
	/** Grams of finished dish per person. */
	portion: number;
	/** Grams of finished dish to cook, all in all. */
	total: number;
	lines: SheetLine[];
	method?: string;
};

/** The sheets of a plan, in the order of the plan. Dishes whose recipe is no longer in the data are left out. */
export function recipeSheets(plan: PlanFile, data: AppData): Sheet[] {
	const usable = enginePlan(plan, data);
	if (!usable) return [];
	const { event } = usable.plan;
	const sheets: Sheet[] = [];
	usable.plan.days.forEach((day, d) => {
		day.meals.forEach((meal, m) => {
			meal.dishes.forEach((dish, k) => {
				const recipe = data.recipes[dish.recipe];
				const people = peopleInMeal(meal, event);
				const share = portionShare(dish, meal, data.recipes);
				const appetite = appetiteFactor(meal, recipe, event);
				const portion = dishPortion(dish, recipe);
				const amounts = dishAmounts(dish, meal, event, data);
				sheets.push({
					key: `${d}-${m}-${k}`,
					recipe: dish.recipe,
					name: recipe.name,
					day: dayLabel(day.date),
					meal: meal.type,
					time: plan.days[d].meals[m].time,
					people,
					forOrganisers: meal.for === 'organisers',
					share,
					appetite,
					portion,
					total: portion * people * share * appetite,
					lines: Object.entries(amounts).map(([id, amount]) => ({ id, name: data.ingredients[id].name, amount: formatAmount(amount, data.ingredients[id].unit) })),
					method: data.recipes[dish.recipe].method
				});
			});
		});
	});
	return sheets;
}

/** What a sheet says about how much to cook, as short facts: "200 people", "half of them" ... in the order they are read. */
export function sheetFacts(sheet: Sheet): string[] {
	const facts = [`${sheet.people} ${sheet.people === 1 ? 'person' : 'people'}${sheet.forOrganisers ? ' (organisers)' : ''}`];
	if (sheet.share !== 1) facts.push(`${Math.round(sheet.share * 100)} % of them`);
	if (sheet.appetite !== 1) facts.push(`hungry meal, × ${sheet.appetite}`);
	facts.push(`${formatAmount(sheet.portion, 'g')} each`);
	facts.push(`${formatAmount(sheet.total, 'g')} in all`);
	return facts;
}
