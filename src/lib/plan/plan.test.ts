import { describe, expect, it } from 'vitest';
import { planSchema } from '../data/schema.ts';
import { RULES_VERSION } from '../kitchen-engine/config.ts';
import {
	addDay,
	addDays,
	addDish,
	addMeal,
	dayLabel,
	dayIndex,
	listMeals,
	newPlan,
	peopleIn,
	portionOverride,
	removeDay,
	removeDish,
	removeMeal,
	rename,
	setChecked,
	setDayDate,
	setDish,
	setEvent,
	suggestMealType,
	updateMeal
} from './plan.ts';

const start = '2027-07-09';

describe('dates', () => {
	it('adds days, across a month end and a leap day', () => {
		expect(addDays('2027-07-31', 1)).toBe('2027-08-01');
		expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
		expect(addDays('2027-07-09', -9)).toBe('2027-06-30');
	});

	it('names a day and its date, whatever the time zone', () => {
		expect(dayLabel('2027-07-10')).toEqual({ name: 'Saturday', date: 'Jul 10' });
		expect(dayLabel('2027-12-31')).toEqual({ name: 'Friday', date: 'Dec 31' });
	});
});

describe('a new plan', () => {
	it('is a valid plan with one empty day, in the format of the plan files', () => {
		const plan = newPlan(start);
		expect(planSchema.safeParse(plan).success).toBe(true);
		expect(plan.rules_version).toBe(RULES_VERSION);
		expect(plan.days).toEqual([{ date: start, meals: [] }]);
	});

	it('can be renamed and its event numbers changed, without touching the old plan', () => {
		const plan = newPlan(start);
		const next = setEvent(rename(plan, 'Freshers'), { everyone: 200, organisers: 32, appetite_factor: 1.3 });
		expect(next.name).toBe('Freshers');
		expect(next.event).toEqual({ everyone: 200, organisers: 32, appetite_factor: 1.3 });
		expect(plan.name).toBe('New event');
		expect(plan.event.everyone).toBe(100);
	});
});

describe('days', () => {
	it('adds the day after the last one by default', () => {
		const plan = addDay(addDay(newPlan(start)));
		expect(plan.days.map((d) => d.date)).toEqual(['2027-07-09', '2027-07-10', '2027-07-11']);
	});

	it('keeps days in date order, and never adds the same date twice', () => {
		let plan = addDay(newPlan(start), '2027-07-05');
		expect(plan.days.map((d) => d.date)).toEqual(['2027-07-05', '2027-07-09']);
		expect(addDay(plan, '2027-07-05')).toBe(plan);
		expect(dayIndex(plan, '2027-07-09')).toBe(1);
		plan = setDayDate(plan, 0, '2027-07-20');
		expect(plan.days.map((d) => d.date)).toEqual(['2027-07-09', '2027-07-20']);
		expect(setDayDate(plan, 0, '2027-07-20')).toBe(plan);
	});

	it('removes a day, but never the last one', () => {
		const plan = addDay(newPlan(start));
		expect(removeDay(plan, 0).days.map((d) => d.date)).toEqual(['2027-07-10']);
		const single = newPlan(start);
		expect(removeDay(single, 0)).toBe(single);
	});
});

describe('meals', () => {
	it('suggests the first kind of meal the day does not have yet', () => {
		let plan = newPlan(start);
		expect(suggestMealType(plan, 0)).toBe('breakfast');
		plan = addMeal(plan, 0).plan;
		expect(suggestMealType(plan, 0)).toBe('lunch');
		plan = addMeal(plan, 0, 'dinner').plan;
		expect(suggestMealType(plan, 0)).toBe('lunch');
		plan = addMeal(plan, 0, 'lunch').plan;
		expect(suggestMealType(plan, 0)).toBe('coffee');
	});

	it('adds an empty meal with the usual time, and keeps the meals of a day in time order', () => {
		let plan = newPlan(start);
		plan = addMeal(plan, 0, 'dinner').plan;
		const result = addMeal(plan, 0, 'breakfast');
		expect(result.plan.days[0].meals.map((m) => [m.type, m.time])).toEqual([
			['breakfast', '09:00'],
			['dinner', '19:00']
		]);
		expect(result.meal).toBe(0);
		expect(result.plan.days[0].meals[0].dishes).toEqual([]);
	});

	it('updates a meal and follows it when the order changes', () => {
		let plan = addMeal(addMeal(newPlan(start), 0, 'breakfast').plan, 0, 'dinner').plan;
		const moved = updateMeal(plan, 0, 0, { time: '20:30' });
		expect(moved.meal).toBe(1);
		expect(moved.plan.days[0].meals.map((m) => m.type)).toEqual(['dinner', 'breakfast']);
		plan = moved.plan;
	});

	it('stores only what differs from the default', () => {
		let plan = addMeal(newPlan(start), 0, 'lunch').plan;
		plan = updateMeal(plan, 0, 0, { for: 'organisers', appetite: true }).plan;
		expect(plan.days[0].meals[0]).toMatchObject({ for: 'organisers', appetite: true });
		plan = updateMeal(plan, 0, 0, { for: 'everyone', appetite: false, time: null }).plan;
		expect(plan.days[0].meals[0]).toEqual({ type: 'lunch', dishes: [] });
		expect(planSchema.safeParse(plan).success).toBe(true);
	});

	it('removes a meal', () => {
		const plan = addMeal(newPlan(start), 0).plan;
		expect(removeMeal(plan, 0, 0).days[0].meals).toEqual([]);
	});

	it('says how many people a meal is for', () => {
		const plan = setEvent(newPlan(start), { everyone: 200, organisers: 32 });
		expect(peopleIn(plan, { type: 'dinner', dishes: [] })).toBe(200);
		expect(peopleIn(plan, { type: 'snack', for: 'organisers', dishes: [] })).toBe(32);
	});
});

describe('dishes', () => {
	const withMeal = () => addMeal(newPlan(start), 0, 'lunch').plan;

	it('puts a recipe in a meal once', () => {
		let plan = addDish(withMeal(), 0, 0, 'lentil-dal');
		expect(addDish(plan, 0, 0, 'lentil-dal')).toBe(plan);
		plan = addDish(plan, 0, 0, 'basmati-rice');
		expect(plan.days[0].meals[0].dishes.map((d) => d.recipe)).toEqual(['lentil-dal', 'basmati-rice']);
	});

	it('removes a dish', () => {
		const plan = addDish(addDish(withMeal(), 0, 0, 'a'), 0, 0, 'b');
		expect(removeDish(plan, 0, 0, 'a').days[0].meals[0].dishes).toEqual([{ recipe: 'b' }]);
	});

	it('sets and takes away a portion and a share', () => {
		let plan = addDish(withMeal(), 0, 0, 'hummus');
		plan = setDish(plan, 0, 0, 'hummus', { portion: 70, share: 0.5 });
		expect(plan.days[0].meals[0].dishes[0]).toEqual({ recipe: 'hummus', portion: '70 g', share: 0.5 });
		expect(portionOverride(plan.days[0].meals[0].dishes[0])).toBe(70);
		plan = setDish(plan, 0, 0, 'hummus', { portion: undefined });
		expect(plan.days[0].meals[0].dishes[0]).toEqual({ recipe: 'hummus', share: 0.5 });
		expect(portionOverride(plan.days[0].meals[0].dishes[0])).toBeUndefined();
		expect(planSchema.safeParse(plan).success).toBe(true);
	});
});

describe('the shopping list ticks', () => {
	it('ticks an ingredient and unticks it again', () => {
		let plan = setChecked(newPlan(start), 'salt', true);
		expect(plan.shopping?.checked).toEqual(['salt']);
		plan = setChecked(setChecked(plan, 'salt', true), 'oil', true);
		expect(plan.shopping?.checked).toEqual(['salt', 'oil']);
		expect(setChecked(plan, 'salt', false).shopping?.checked).toEqual(['oil']);
	});
});

describe('listing the meals', () => {
	it('names every meal by day, kind and time', () => {
		let plan = addDay(newPlan(start));
		plan = addMeal(plan, 0, 'dinner').plan;
		plan = addMeal(plan, 1, 'breakfast').plan;
		expect(listMeals(plan).map((m) => m.label)).toEqual(['Friday Jul 9, dinner 19:00', 'Saturday Jul 10, breakfast 09:00']);
	});
});
