import { describe, expect, it } from 'vitest';
import { toAppData } from './app-data.ts';
import type { DataSet } from './validate.ts';

const set: DataSet = {
	stores: { supermarket: 'Supermarket', none: 'Not bought' },
	ingredients: { apple: { name: 'Apple', unit: 'g', store: 'supermarket' } },
	recipes: {
		fine: { name: 'Fine', category: 'main', portion: 100, per100g: { apple: 10 }, method: 'Cook.', needsReview: false },
		wrong: { name: 'Wrong', category: 'main', portion: 100, per100g: { apple: 9000 }, needsReview: true, reviewNote: 'Too much.' }
	}
};

describe('toAppData', () => {
	it('leaves out recipes that need review', () => {
		expect(Object.keys(toAppData(set, 'v1').recipes)).toEqual(['fine']);
	});

	it('keeps what the app shows, and nothing about review', () => {
		expect(toAppData(set, 'v1').recipes.fine).toEqual({ name: 'Fine', category: 'main', portion: 100, per100g: { apple: 10 }, method: 'Cook.' });
	});

	it('keeps the flag of a recipe that needs no cooking', () => {
		const jam = { ...set.recipes.fine, noCooking: true };
		expect(toAppData({ ...set, recipes: { jam } }, 'v1').recipes.jam.noCooking).toBe(true);
		expect(toAppData(set, 'v1').recipes.fine.noCooking).toBeUndefined();
	});

	it('carries the version', () => {
		expect(toAppData(set, 'abc').version).toBe('abc');
	});
});
