import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateData } from '../data/validate.ts';
import { calculate } from '../kitchen-engine/calculate.ts';
import type { Dish, Meal, Plan } from '../kitchen-engine/types.ts';
import { readDataFolder } from '../../../scripts/read-data.ts';
import golden from './excel-golden.json' with { type: 'json' };

// The engine against the old Excel, on the real recipes. The Excel's numbers come from excel-golden.json: what Excel
// itself calculated, written by the import script. They are the independent side of every comparison here.
const { raw } = readDataFolder(join(import.meta.dirname, '../../..'));
const { data } = validateData(raw);
const event = golden.event;

type Golden = (typeof golden.perPerson)[keyof typeof golden.perPerson];
const excel = golden.perPerson as Record<string, Golden>;

/** Excel's own amount per person for a dish, converted to the engine's base unit (g and ml instead of kg and L). */
const excelPerPerson = (recipe: string): Record<string, number> =>
	Object.fromEntries(
		Object.entries(excel[recipe].lines).map(([id, value]) => {
			const unit = data.ingredients[id].unit;
			return [id, (unit === 'g' || unit === 'ml' ? 1000 : 1) * value];
		})
	);

const planOf = (meals: Meal[]): Plan => ({ event, days: [{ date: '2027-07-09', meals }] });
const mealOf = (dishes: Dish[], extra: Partial<Meal> = {}): Meal => ({ type: 'dinner', for: 'everyone', appetite: false, dishes, ...extra });
const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1e-6 + 0.005 * Math.abs(expected));

describe('the data is the same as the Excel', () => {
	it('has every recipe the Excel got right', () => {
		for (const id of Object.keys(excel)) expect(data.recipes[id], id).toBeDefined();
	});
});

describe('R6 matches the Excel for every recipe the Excel got right', () => {
	for (const id of Object.keys(excel)) {
		it(`${id}: the engine needs what Excel calculates per person times everyone`, () => {
			// A dish that is not shared, in a meal for everyone: this is Excel's "full headcount" rule.
			const dishes: Dish[] = [{ recipe: id, share: 1 }];
			const result = calculate(planOf([mealOf(dishes)]), data);
			for (const [ingredient, perPerson] of Object.entries(excelPerPerson(id))) {
				near(result.needs[ingredient], perPerson * event.everyone);
			}
		});
	}
});

describe('R4 and R5 match the Excel for main dishes', () => {
	const mains = Object.keys(excel).filter((id) => excel[id].category === 'main');

	it('there are main dishes to compare', () => {
		expect(mains.length).toBeGreaterThanOrEqual(2);
	});

	for (const [index, id] of mains.entries()) {
		const other = mains[(index + 1) % mains.length];
		const both = (extra: Partial<Meal>) => calculate(planOf([mealOf([{ recipe: id }, { recipe: other }], extra)]), data);
		const expected = (factor: number) => {
			const total: Record<string, number> = {};
			for (const recipe of [id, other]) {
				for (const [ingredient, perPerson] of Object.entries(excelPerPerson(recipe))) total[ingredient] = (total[ingredient] ?? 0) + perPerson * factor;
			}
			return total;
		};

		it(`${id} with ${other}: two main dishes get half of everyone each, like Excel selection 1 (Saturday)`, () => {
			const result = both({});
			for (const [ingredient, amount] of Object.entries(expected(event.everyone * 0.5))) near(result.needs[ingredient], amount);
		});

		it(`${id} with ${other}: with the appetite switch on, the same times the factor, like Excel selection 2 (Friday)`, () => {
			const result = both({ appetite: true });
			for (const [ingredient, amount] of Object.entries(expected(event.everyone * 0.5 * event.appetiteFactor))) near(result.needs[ingredient], amount);
		});
	}
});

describe('Known difference 1, on the Excel workbook as it was saved', () => {
	it('with the same dishes selected, the engine buys twice what the old shopping formulas did, for every ingredient', () => {
		// The workbook has 13 brunch dishes selected with selection 1. Its shopping formulas halved them: that is the bug.
		const dishes: Dish[] = Object.keys(golden.state.selected).map((recipe) => ({ recipe }));
		expect(dishes.length).toBe(13);
		const result = calculate(planOf([mealOf(dishes)]), data);
		const needed = golden.state.needed as Record<string, number>;
		for (const [ingredient, excelNeed] of Object.entries(needed)) {
			const unit = data.ingredients[ingredient].unit;
			near(result.needs[ingredient], 2 * excelNeed * (unit === 'g' || unit === 'ml' ? 1000 : 1));
		}
		// ... and nothing else is needed by the engine that the Excel did not need.
		const engineIngredients = Object.keys(result.needs).filter((id) => result.needs[id] > 1e-9);
		expect(engineIngredients.sort()).toEqual(Object.keys(needed).sort());
	});
});
