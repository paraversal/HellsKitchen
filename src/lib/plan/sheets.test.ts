import { describe, expect, it } from 'vitest';
import type { AppData } from '../data/app-data.ts';
import { addDish, addMeal, newPlan, setEvent, updateMeal, setDish } from './plan.ts';
import { recipeSheets, sheetFacts } from './sheets.ts';
import { calculatePlan } from './shopping.ts';

const data: AppData = {
	version: 't',
	stores: { supermarket: 'Supermarket', none: 'Not bought' },
	ingredients: {
		lentils: { name: 'Lentils', unit: 'g', store: 'supermarket', price: 3 },
		onion: { name: 'Onion', unit: 'pcs', store: 'supermarket', price: 0.3 },
		water: { name: 'Water', unit: 'ml', store: 'none' }
	},
	recipes: {
		soup: { name: 'Lentil soup', category: 'main', portion: 400, per100g: { lentils: 10, onion: 0.1, water: 80 }, method: 'Cook it.\nEat it.' },
		bread: { name: 'Bread', category: 'main', portion: 100, per100g: { lentils: 1 } },
		tea: { name: 'Tea', category: 'drink', portion: 200, per100g: { water: 100 } }
	}
};

function plan() {
	let p = setEvent(newPlan('2027-07-09'), { everyone: 200, organisers: 20, appetite_factor: 1.5 });
	p = addMeal(p, 0, 'lunch').plan;
	p = addDish(p, 0, 0, 'soup');
	p = addDish(p, 0, 0, 'bread');
	p = addDish(p, 0, 0, 'tea');
	return p;
}

describe('recipe sheets', () => {
	it('has one sheet for every dish, in the order of the plan', () => {
		const sheets = recipeSheets(plan(), data);
		expect(sheets.map((s) => s.name)).toEqual(['Lentil soup', 'Bread', 'Tea']);
		expect(new Set(sheets.map((s) => s.key)).size).toBe(3);
	});

	it('scales to the people of the meal and the share of the dish (two mains split the meal)', () => {
		const [soup, , tea] = recipeSheets(plan(), data);
		expect(soup).toMatchObject({ people: 200, share: 0.5, appetite: 1, portion: 400, total: 40_000 });
		expect(soup.lines).toEqual([
			{ id: 'lentils', name: 'Lentils', amount: '4 kg' },
			{ id: 'onion', name: 'Onion', amount: '40 pcs' },
			{ id: 'water', name: 'Water', amount: '32 L' }
		]);
		expect(tea).toMatchObject({ share: 1, total: 40_000 });
	});

	it('uses the appetite factor of the meal for main dishes only', () => {
		const p = updateMeal(plan(), 0, 0, { appetite: true }).plan;
		const [soup, , tea] = recipeSheets(p, data);
		expect(soup.appetite).toBe(1.5);
		expect(soup.total).toBe(60_000);
		expect(tea.appetite).toBe(1);
	});

	it('uses the organisers for a meal that is for them, and the overrides of a dish', () => {
		let p = updateMeal(plan(), 0, 0, { for: 'organisers' }).plan;
		p = setDish(p, 0, 0, 'soup', { share: 1, portion: 300 });
		const [soup] = recipeSheets(p, data);
		expect(soup).toMatchObject({ people: 20, forOrganisers: true, share: 1, portion: 300, total: 6000 });
	});

	it('adds up to what the shopping list needs', () => {
		const sheets = recipeSheets(plan(), data);
		const { result } = calculatePlan(plan(), data)!;
		const lentils = result.stores.flatMap((s) => s.items).find((i) => i.ingredient === 'lentils')!;
		const fromSheets = sheets.flatMap((s) => s.lines.filter((l) => l.id === 'lentils'));
		expect(fromSheets.map((l) => l.amount)).toEqual(['4 kg', '100 g']);
		expect(lentils.need).toBe(4100);
	});

	it('carries the method, and the day and time', () => {
		const p = updateMeal(plan(), 0, 0, { time: '12:30' }).plan;
		const [soup, bread] = recipeSheets(p, data);
		expect(soup.method).toBe('Cook it.\nEat it.');
		expect(bread.method).toBeUndefined();
		expect(soup).toMatchObject({ meal: 'lunch', time: '12:30', day: { name: 'Friday', date: 'Jul 9' } });
	});

	it('leaves out a dish whose recipe is no longer there, and gives nothing for a broken plan', () => {
		const p = addDish(plan(), 0, 0, 'gone');
		expect(recipeSheets(p, data)).toHaveLength(3);
		expect(recipeSheets({ ...p, days: 'nope' } as never, data)).toEqual([]);
	});

	it('says in short facts how much to cook', () => {
		const [soup, , tea] = recipeSheets(updateMeal(plan(), 0, 0, { appetite: true }).plan, data);
		expect(sheetFacts(soup)).toEqual(['200 people', '50 % of them', 'hungry meal, × 1.5', '400 g each', '60 kg in all']);
		expect(sheetFacts(tea)).toEqual(['200 people', '200 g each', '40 kg in all']);
		const [organisers] = recipeSheets(updateMeal(plan(), 0, 0, { for: 'organisers' }).plan, data);
		expect(sheetFacts(organisers)[0]).toBe('20 people (organisers)');
	});
});
