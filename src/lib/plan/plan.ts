// Changing a plan: add a day, add a meal, put a dish in it ... Every function takes a plan and returns a new one, and never touches the old one.
// A plan is in the format of docs/DATA.md, so what is saved on the device is also what can be exported and shared.
import type { MealType, PlanFile } from '../data/schema.ts';
import { RULES_VERSION } from '../kitchen-engine/config.ts';

type Meal = PlanFile['days'][number]['meals'][number];
type Dish = Meal['dishes'][number];

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'coffee', 'dinner', 'snack'];

/** When a new meal of each kind usually is. */
export const DEFAULT_TIME: Record<MealType, string> = { breakfast: '09:00', lunch: '12:30', coffee: '16:00', dinner: '19:00', snack: '15:00' };

const copy = (plan: PlanFile): PlanFile => structuredClone(plan);

// --- dates ------------------------------------------------------------------------------------------

const utc = (date: string) => new Date(`${date}T00:00:00Z`);

/** A date a number of days later, as 2027-07-09. */
export function addDays(date: string, days: number): string {
	const d = utc(date);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

/** "Saturday" and "Jul 13" for 2027-07-10. Computed in UTC, so the time zone never moves a date. */
export function dayLabel(date: string): { name: string; date: string } {
	return {
		name: new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(utc(date)),
		date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(utc(date))
	};
}

// --- a new plan --------------------------------------------------------------------------------------

/** A plan with one empty day. `today` is a date like 2027-07-09. */
export function newPlan(today: string, name = 'New event'): PlanFile {
	return {
		format: 1,
		rules_version: RULES_VERSION,
		name,
		event: { everyone: 100, organisers: 0, appetite_factor: 1 },
		days: [{ date: today, meals: [] }],
		shopping: { checked: [] }
	};
}

export function rename(plan: PlanFile, name: string): PlanFile {
	return { ...copy(plan), name };
}

export function setEvent(plan: PlanFile, patch: Partial<PlanFile['event']>): PlanFile {
	const next = copy(plan);
	next.event = { ...next.event, ...patch };
	return next;
}

// --- days ----------------------------------------------------------------------------------------------

/** Adds a day, by default the day after the last one. A date that is already in the plan is not added twice. Days stay in date order. */
export function addDay(plan: PlanFile, date?: string): PlanFile {
	const next = copy(plan);
	const wanted = date ?? addDays(next.days[next.days.length - 1].date, 1);
	if (next.days.some((d) => d.date === wanted)) return plan;
	next.days.push({ date: wanted, meals: [] });
	next.days.sort((a, b) => a.date.localeCompare(b.date));
	return next;
}

export function dayIndex(plan: PlanFile, date: string): number {
	return plan.days.findIndex((d) => d.date === date);
}

/** Moves a day to another date. Refused when the date is already taken. */
export function setDayDate(plan: PlanFile, day: number, date: string): PlanFile {
	if (plan.days.some((d, i) => i !== day && d.date === date)) return plan;
	const next = copy(plan);
	next.days[day].date = date;
	next.days.sort((a, b) => a.date.localeCompare(b.date));
	return next;
}

/** Removes a day with its meals. A plan always keeps at least one day. */
export function removeDay(plan: PlanFile, day: number): PlanFile {
	if (plan.days.length <= 1) return plan;
	const next = copy(plan);
	next.days.splice(day, 1);
	return next;
}

// --- meals ---------------------------------------------------------------------------------------------

const timeOf = (meal: Meal) => meal.time ?? DEFAULT_TIME[meal.type];

/** Meals of a day in the order they happen. Meals at the same time keep the usual order of the kinds. */
function sortMeals(meals: Meal[]): void {
	meals.sort((a, b) => timeOf(a).localeCompare(timeOf(b)) || MEAL_ORDER.indexOf(a.type) - MEAL_ORDER.indexOf(b.type));
}

/** The first kind of meal that the day does not have yet. */
export function suggestMealType(plan: PlanFile, day: number): MealType {
	const used = new Set(plan.days[day].meals.map((m) => m.type));
	return MEAL_ORDER.find((type) => !used.has(type)) ?? 'dinner';
}

/** Adds an empty meal to a day. Returns the plan and where the meal ended up. */
/** A short name for a meal, unique enough within one plan. */
export const newMealId = (): string => Math.random().toString(36).slice(2, 8);

/** The plan, with an id on every meal. Plans made before meals had ids get them here. Returns the same plan when nothing was missing. */
export function withMealIds(plan: PlanFile): PlanFile {
	if (plan.days.every((day) => day.meals.every((meal) => meal.id))) return plan;
	const next = copy(plan);
	const used = new Set(next.days.flatMap((day) => day.meals.map((meal) => meal.id)));
	for (const day of next.days) {
		for (const meal of day.meals) {
			if (meal.id) continue;
			let id = newMealId();
			while (used.has(id)) id = newMealId();
			used.add(id);
			meal.id = id;
		}
	}
	return next;
}

export function addMeal(plan: PlanFile, day: number, type?: MealType): { plan: PlanFile; meal: number } {
	const next = copy(plan);
	const kind = type ?? suggestMealType(plan, day);
	const meal: Meal = { id: newMealId(), type: kind, time: DEFAULT_TIME[kind], dishes: [] };
	next.days[day].meals.push(meal);
	sortMeals(next.days[day].meals);
	return { plan: next, meal: next.days[day].meals.indexOf(meal) };
}

export type MealPatch = { type?: MealType; time?: string | null; for?: 'everyone' | 'organisers'; appetite?: boolean };

/** Changes a meal. `time: null` removes the time. Returns the plan and where the meal ended up, since the order may change. */
export function updateMeal(plan: PlanFile, day: number, meal: number, patch: MealPatch): { plan: PlanFile; meal: number } {
	const next = copy(plan);
	const target = next.days[day].meals[meal];
	if (patch.type !== undefined) target.type = patch.type;
	if (patch.time === null) delete target.time;
	else if (patch.time !== undefined) target.time = patch.time;
	if (patch.for !== undefined) {
		if (patch.for === 'everyone') delete target.for;
		else target.for = patch.for;
	}
	if (patch.appetite !== undefined) {
		if (patch.appetite) target.appetite = true;
		else delete target.appetite;
	}
	sortMeals(next.days[day].meals);
	return { plan: next, meal: next.days[day].meals.indexOf(target) };
}

export function removeMeal(plan: PlanFile, day: number, meal: number): PlanFile {
	const next = copy(plan);
	next.days[day].meals.splice(meal, 1);
	return next;
}

// --- dishes --------------------------------------------------------------------------------------------

/** Puts a recipe in a meal. A recipe is only in a meal once. */
export function addDish(plan: PlanFile, day: number, meal: number, recipe: string): PlanFile {
	if (plan.days[day].meals[meal].dishes.some((d) => d.recipe === recipe)) return plan;
	const next = copy(plan);
	next.days[day].meals[meal].dishes.push({ recipe });
	return next;
}

export function removeDish(plan: PlanFile, day: number, meal: number, recipe: string): PlanFile {
	const next = copy(plan);
	const dishes = next.days[day].meals[meal].dishes;
	next.days[day].meals[meal].dishes = dishes.filter((d) => d.recipe !== recipe);
	return next;
}

/** Changes what a dish does differently from the default. `undefined` takes the override away again. */
export function setDish(plan: PlanFile, day: number, meal: number, recipe: string, patch: { share?: number | undefined; portion?: number | undefined }): PlanFile {
	const next = copy(plan);
	const dish = next.days[day].meals[meal].dishes.find((d) => d.recipe === recipe);
	if (!dish) return plan;
	const set = (key: 'share' | 'portion', value: number | undefined) => {
		if (value === undefined) delete dish[key];
		else if (key === 'portion') dish.portion = `${value} g`;
		else dish.share = value;
	};
	if ('share' in patch) set('share', patch.share);
	if ('portion' in patch) set('portion', patch.portion);
	return next;
}

/** The grams of a portion override as a number, or undefined. */
export function portionOverride(dish: Dish): number | undefined {
	const match = /^(\d+(?:\.\d+)?)\s*g$/.exec(dish.portion ?? '');
	return match ? Number(match[1]) : undefined;
}

// --- the shopping list ---------------------------------------------------------------------------------

export function setChecked(plan: PlanFile, ingredient: string, checked: boolean): PlanFile {
	const next = copy(plan);
	const list = new Set(next.shopping?.checked ?? []);
	if (checked) list.add(ingredient);
	else list.delete(ingredient);
	next.shopping = { checked: [...list] };
	return next;
}

// --- looking at a plan ----------------------------------------------------------------------------------

/** Every meal of the plan with a name people recognise, for choosing where to put a recipe. */
export function listMeals(plan: PlanFile): { day: number; meal: number; label: string }[] {
	return plan.days.flatMap((day, d) => {
		const { name, date } = dayLabel(day.date);
		return day.meals.map((meal, m) => ({ day: d, meal: m, label: `${name} ${date}, ${meal.type}${meal.time ? ` ${meal.time}` : ''}` }));
	});
}

/** How many people a meal is for. */
export function peopleIn(plan: PlanFile, meal: Meal): number {
	return meal.for === 'organisers' ? plan.event.organisers : plan.event.everyone;
}

/** How big a plan is, for telling two plans apart: "3 days, 12 meals". */
export function planCounts(plan: PlanFile): { days: number; meals: number } {
	return { days: plan.days.length, meals: plan.days.reduce((total, day) => total + day.meals.length, 0) };
}
