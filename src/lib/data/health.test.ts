import { describe, expect, it } from 'vitest';
import { dataHealth } from './health.ts';
import type { DataSet } from './validate.ts';

const set: DataSet = {
	stores: { supermarket: 'Supermarket', market: 'Market', none: 'Not bought' },
	ingredients: {
		apple: { name: 'Apple', unit: 'g', store: 'supermarket', price: 2, pack: 1000 },
		flour: { name: 'Flour', unit: 'g', store: 'supermarket' },
		tea: { name: 'Tea', unit: 'pack', store: 'market' },
		water: { name: 'Water', unit: 'ml', store: 'none' },
		saffron: { name: 'Saffron', unit: 'g', store: 'market', price: 9000 }
	},
	recipes: {
		fine: { name: 'Fine', category: 'main', portion: 100, per100g: { apple: 10, flour: 5, water: 20 }, method: 'Cook.', needsReview: false },
		plain: { name: 'Plain', category: 'main', portion: 100, per100g: { apple: 10, tea: 1 }, needsReview: false },
		jam: { name: 'Jam', category: 'brunch', portion: 20, per100g: { apple: 100 }, noCooking: true, needsReview: false },
		wrong: { name: 'Wrong', category: 'main', portion: 100, per100g: { apple: 9000 }, needsReview: true, reviewNote: 'Too much.' }
	}
};

describe('data health', () => {
	const health = dataHealth(set, [
		{ severity: 'warning', code: 'no-price', file: 'x', message: 'm' },
		{ severity: 'note', code: 'no-pack', file: 'x', message: 'm' },
		{ severity: 'note', code: 'no-pack', file: 'x', message: 'm' }
	]);

	it('counts the recipes and lists the ones waiting for a second look, with the reason', () => {
		expect(health.recipes).toMatchObject({ total: 4, inApp: 3, noCooking: 1, needsReview: [{ id: 'wrong', name: 'Wrong', note: 'Too much.' }] });
	});

	it('lists the recipes without a method, leaving out the ones that wait for review and the ones that need no cooking', () => {
		expect(health.recipes.noMethod).toEqual([{ id: 'plain', name: 'Plain' }]);
	});

	it('lists what is bought but has no price, and never what is not bought', () => {
		expect(health.ingredients.noPrice.map((i) => i.id)).toEqual(['flour', 'tea']);
	});

	it('counts the things in grams or millilitres that have no pack size', () => {
		expect(health.ingredients.noPack).toBe(2); // flour and saffron; water is not bought, tea is counted in packs
	});

	it('lists the ingredients no recipe uses', () => {
		expect(health.ingredients.unused).toEqual([{ id: 'saffron', name: 'Saffron' }]);
	});

	it('counts the ingredients of each store, the busiest first', () => {
		expect(health.stores.map((s) => [s.id, s.ingredients])).toEqual([['supermarket', 2], ['market', 2], ['none', 1]]);
	});

	it('counts the warnings and notes of the checks', () => {
		expect(health.checks).toEqual({ warnings: 1, notes: 2 });
	});
});
