import { describe, expect, it } from 'vitest';
import type { AppData } from './data/app-data.ts';
import { categoriesInUse, filterRecipes, groupByLetter, ingredientCountText, scaledIngredients, summaries } from './recipes.ts';
import { formatAmount } from './format.ts';

const data: AppData = {
	version: 't',
	stores: { supermarket: 'Supermarket', none: 'Not bought' },
	ingredients: {
		apple: { name: 'Apple', unit: 'g', store: 'supermarket' },
		juice: { name: 'Orange juice', unit: 'ml', store: 'supermarket' },
		lemon: { name: 'Lemon', unit: 'pcs', store: 'supermarket' },
		pasta: { name: 'Pasta', unit: 'g', store: 'supermarket' }
	},
	recipes: {
		punch: { name: 'Punch', category: 'drink', portion: 250, per100g: { apple: 10, juice: 20, lemon: 0.011 } },
		spaghetti: { name: 'spaghetti', category: 'main', portion: 125, per100g: { pasta: 100 } },
		'2nd-bread': { name: '2nd bread', category: 'misc', portion: 250, per100g: { pasta: 100 } },
		apple: { name: 'Apple cake', category: 'brunch', portion: 100, per100g: { apple: 50 } }
	}
};

describe('recipe list', () => {
	it('is sorted by name, ignoring case, with the number of ingredients', () => {
		expect(summaries(data).map((s) => [s.name, s.ingredientCount])).toEqual([
			['2nd bread', 1],
			['Apple cake', 1],
			['Punch', 3],
			['spaghetti', 1]
		]);
	});

	it('lists the categories in use, in the usual order', () => {
		expect(categoriesInUse(data)).toEqual(['main', 'brunch', 'drink', 'misc']);
	});

	it('filters by category', () => {
		const list = filterRecipes(summaries(data), data, { query: '', category: 'drink' });
		expect(list.map((s) => s.id)).toEqual(['punch']);
	});

	it('searches the name and the ingredients, ignoring case', () => {
		const find = (query: string) => filterRecipes(summaries(data), data, { query, category: null }).map((s) => s.id);
		expect(find('PUNC')).toEqual(['punch']);
		expect(find('orange')).toEqual(['punch']);
		expect(find('apple')).toEqual(['apple', 'punch']);
		expect(find('  ')).toHaveLength(4);
		expect(find('nothing like this')).toEqual([]);
	});

	it('groups under first letters, and puts names that do not start with a letter under #', () => {
		expect(groupByLetter(summaries(data)).map((g) => [g.letter, g.recipes.length])).toEqual([
			['#', 1],
			['A', 1],
			['P', 1],
			['S', 1]
		]);
	});
});

describe('ingredientCountText', () => {
	it('says ingredient for one and ingredients for the rest', () => {
		expect(ingredientCountText(1)).toBe('1 ingredient');
		expect(ingredientCountText(9)).toBe('9 ingredients');
	});
});

describe('a recipe for a number of portions', () => {
	it('uses the kitchen engine: per 100 g x portion / 100 x portions', () => {
		const lines = scaledIngredients(data, 'punch', 10);
		expect(lines.map((l) => l.id)).toEqual(['apple', 'juice', 'lemon']);
		expect(lines[0].amount).toBeCloseTo(10 * 2.5 * 10, 8);
		expect(lines[1].amount).toBeCloseTo(20 * 2.5 * 10, 8);
		expect(lines[2].amount).toBeCloseTo(0.011 * 2.5 * 10, 8);
		expect(lines[0]).toMatchObject({ name: 'Apple', unit: 'g' });
	});

	it('a main dish alone is not halved', () => {
		expect(scaledIngredients(data, 'spaghetti', 200)[0].amount).toBeCloseTo(100 * 1.25 * 200, 6);
	});
});

describe('formatAmount', () => {
	it('shows amounts the way people read them', () => {
		expect(formatAmount(630, 'g')).toBe('630 g');
		expect(formatAmount(74600, 'g')).toBe('74.6 kg');
		expect(formatAmount(14400, 'ml')).toBe('14.4 L');
		expect(formatAmount(5.5, 'pcs')).toBe('5.5 pcs');
		expect(formatAmount(1500, 'pcs')).toBe('1,500 pcs');
		expect(formatAmount(0.0275, 'pack')).toBe('0.0275 pack');
	});
});

