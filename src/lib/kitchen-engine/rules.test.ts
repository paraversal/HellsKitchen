import { describe, expect, it } from 'vitest';
import { appetiteFactor } from './rules/appetite.ts';
import { dishAmounts } from './rules/amount.ts';
import { costEstimate, ingredientCost } from './rules/cost.ts';
import { packCount } from './rules/packs.ts';
import { peopleInMeal } from './rules/people.ts';
import { dishPortion } from './rules/portion.ts';
import { portionShare } from './rules/share.ts';
import { groupByStore } from './rules/stores.ts';
import { totalNeeds } from './rules/totals.ts';
import { displayAmount } from './rules/units.ts';
import { data, dish, event, meal, plan } from './fixtures.ts';

describe('R2: planned amount per person', () => {
	it('uses the recipe default', () => {
		expect(dishPortion(dish('punch'), data.recipes.punch)).toBe(250);
	});
	it('can be overridden for one dish in a meal', () => {
		expect(dishPortion(dish('punch', { portion: 100 }), data.recipes.punch)).toBe(100);
	});
});

describe('R3: the people in a meal', () => {
	it('is the headcount for a meal for everyone', () => {
		expect(peopleInMeal(meal([]), event)).toBe(200);
	});
	it('is the organiser count for a meal for organisers', () => {
		expect(peopleInMeal(meal([], { for: 'organisers' }), event)).toBe(32);
	});
});

describe('R4: portion share', () => {
	it('main dishes split the meal: two mains get a half each', () => {
		const m = meal([dish('spaghetti'), dish('sauce')]);
		expect(portionShare(dish('spaghetti'), m, data.recipes)).toBe(0.5);
	});
	it('a single main dish gets everyone', () => {
		expect(portionShare(dish('spaghetti'), meal([dish('spaghetti')]), data.recipes)).toBe(1);
	});
	it('three mains get a third each', () => {
		const m = meal([dish('spaghetti'), dish('sauce'), dish('spaghetti')]);
		expect(portionShare(dish('sauce'), m, data.recipes)).toBeCloseTo(1 / 3, 10);
	});
	it('other dishes get everyone, and do not count as mains', () => {
		const m = meal([dish('spaghetti'), dish('punch'), dish('bread')]);
		expect(portionShare(dish('punch'), m, data.recipes)).toBe(1);
		expect(portionShare(dish('spaghetti'), m, data.recipes)).toBe(1);
	});
	it('can be overridden', () => {
		const m = meal([dish('spaghetti', { share: 0.8 }), dish('sauce')]);
		expect(portionShare(m.dishes[0], m, data.recipes)).toBe(0.8);
	});
});

describe('R5: appetite factor', () => {
	it('applies to main dishes of a meal that switches it on', () => {
		expect(appetiteFactor(meal([], { appetite: true }), data.recipes.spaghetti, event)).toBe(1.3);
	});
	it('does not apply to other dishes, even when switched on', () => {
		expect(appetiteFactor(meal([], { appetite: true }), data.recipes.punch, event)).toBe(1);
	});
	it('does not apply when the meal does not switch it on', () => {
		expect(appetiteFactor(meal([]), data.recipes.spaghetti, event)).toBe(1);
	});
});

describe('R6: amount of one ingredient in one dish', () => {
	it('is per 100 g x grams per person / 100 x people x share x appetite', () => {
		const m = meal([dish('spaghetti'), dish('sauce')], { appetite: true });
		const amounts = dishAmounts(dish('spaghetti'), m, event, data);
		expect(amounts.pasta).toBeCloseTo(100 * 1.25 * 200 * 0.5 * 1.3, 6);
	});
	it('covers every ingredient of the recipe, also ones that are never bought', () => {
		const amounts = dishAmounts(dish('punch'), meal([dish('punch')]), event, data);
		expect(Object.keys(amounts).sort()).toEqual(['apple', 'apple-juice', 'lemon', 'water']);
		expect(amounts.water).toBeCloseTo(20 * 2.5 * 200, 6);
	});
});

describe('R7: total need per ingredient', () => {
	it('adds up dishes, meals and days', () => {
		const p = plan([meal([dish('punch')]), meal([dish('crumble')], { for: 'organisers' })]);
		p.days.push({ date: '2027-07-10', meals: [meal([dish('punch')])] });
		const needs = totalNeeds(p, data);
		expect(needs.apple).toBeCloseTo(10 * 2.5 * 200 * 2 + 52 * 1.5 * 32, 6);
		expect(needs.flour).toBeCloseTo(31 * 1.5 * 32, 6);
	});
});

describe('R8: purchase units', () => {
	it('shows g and ml below 1000 as they are', () => {
		expect(displayAmount(630, 'g')).toEqual({ value: 630, unit: 'g' });
		expect(displayAmount(50, 'ml')).toEqual({ value: 50, unit: 'ml' });
	});
	it('shows kg and L from 1000 up, with three significant digits', () => {
		expect(displayAmount(74600, 'g')).toEqual({ value: 74.6, unit: 'kg' });
		expect(displayAmount(14400, 'ml')).toEqual({ value: 14.4, unit: 'L' });
		expect(displayAmount(9298.8, 'g')).toEqual({ value: 9.3, unit: 'kg' });
	});
	it('does not show 1000 g: 999.6 g is 1 kg', () => {
		expect(displayAmount(999.6, 'g')).toEqual({ value: 1, unit: 'kg' });
	});
	it('keeps pieces, packs and jars as counts', () => {
		expect(displayAmount(5.5, 'pcs')).toEqual({ value: 5.5, unit: 'pcs' });
		expect(displayAmount(2.123, 'pack')).toEqual({ value: 2.12, unit: 'pack' });
	});
});

describe('R9: grouping by store', () => {
	const needs = { pasta: 1000, apple: 500, flour: 200, water: 9000, tomato: 0 };
	it('groups by store, in the order of the stores file, sorted by name', () => {
		expect(groupByStore(needs, data)).toEqual([
			{ store: 'supermarket', ingredients: ['apple', 'flour'] },
			{ store: 'market', ingredients: ['pasta'] }
		]);
	});
	it('leaves out the store none and ingredients with nothing to buy', () => {
		const stores = groupByStore(needs, data).map((g) => g.store);
		expect(stores).not.toContain('none');
		expect(groupByStore(needs, data).flatMap((g) => g.ingredients)).not.toContain('tomato');
	});
	it('shows only stores with something to buy', () => {
		expect(groupByStore({ apple: 5 }, data)).toHaveLength(1);
	});
});

describe('R10: pack counts', () => {
	it('rounds up to whole packs', () => {
		expect(packCount(74600, { ...data.ingredients.apple, pack: 10000 })).toEqual({ packs: 8, packSize: 10000 });
	});
	it('an exact multiple is not rounded up again', () => {
		expect(packCount(10000, { ...data.ingredients.apple, pack: 5000 })?.packs).toBe(2);
		expect(packCount(3 * 0.1 * 1000, { ...data.ingredients.apple, pack: 100 })?.packs).toBe(3);
	});
	it('counts pieces, packs and jars in whole units', () => {
		expect(packCount(5.5, data.ingredients.lemon)).toEqual({ packs: 6, packSize: 1 });
		expect(packCount(0.2, data.ingredients.tea)).toEqual({ packs: 1, packSize: 1 });
	});
	it('has no pack count without a pack size', () => {
		expect(packCount(1000, data.ingredients.flour)).toBeUndefined();
	});
});

describe('R11: cost estimate', () => {
	it('costs the exact need: price per kg for g, per litre for ml, per piece for counts', () => {
		expect(ingredientCost(2500, data.ingredients.apple)).toBeCloseTo(7.5, 10);
		expect(ingredientCost(2500, data.ingredients['apple-juice'])).toBeCloseTo(5, 10);
		expect(ingredientCost(5.5, data.ingredients.lemon)).toBeCloseTo(2.75, 10);
		expect(ingredientCost(100, data.ingredients.flour)).toBeUndefined();
	});
	it('sums the priced ingredients and lists the unpriced ones', () => {
		const estimate = costEstimate({ apple: 1000, flour: 1000, water: 5000 }, data);
		expect(estimate.total).toBeCloseTo(3, 10);
		expect(estimate.unpriced).toEqual(['flour']);
	});
	it('coverage is the share of the food by weight that has a price, ignoring the store none and pieces', () => {
		const estimate = costEstimate({ apple: 3000, flour: 1000, water: 50000, lemon: 100 }, data);
		expect(estimate.coverage).toBeCloseTo(0.75, 10);
	});
	it('has no coverage when nothing weighable is bought', () => {
		expect(costEstimate({ lemon: 5 }, data).coverage).toBeNull();
	});
});
