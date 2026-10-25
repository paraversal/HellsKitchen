import { describe, expect, it } from 'vitest';
import type { AppData } from '../data/app-data.ts';
import type { ShoppingItem } from '../kitchen-engine/types.ts';
import { addDish, addMeal, newPlan, setEvent } from './plan.ts';
import { buyText, calculatePlan, enginePlan, euro, shoppingView } from './shopping.ts';

const data: AppData = {
	version: 't',
	stores: { supermarket: 'Supermarket', market: 'Market', none: 'Not bought' },
	ingredients: {
		flour: { name: 'Flour', unit: 'g', store: 'supermarket', price: 1, pack: 5000 },
		salt: { name: 'Salt', unit: 'g', store: 'supermarket' },
		tea: { name: 'Tea', unit: 'pack', store: 'market', price: 3 },
		water: { name: 'Water', unit: 'ml', store: 'none' }
	},
	recipes: {
		bread: { name: 'Bread', category: 'misc', portion: 250, per100g: { flour: 60, salt: 1, water: 40 } },
		teatime: { name: 'Tea time', category: 'misc', portion: 200, per100g: { tea: 0.1 } }
	}
};

const item = (extra: Partial<ShoppingItem>): ShoppingItem => ({ ingredient: 'x', name: 'X', unit: 'g', need: 9298.8, ...extra });

describe('buyText', () => {
	it('shows only the exact need when there is no pack size', () => {
		expect(buyText(item({}))).toEqual({ buy: '9.3 kg' });
	});

	it('shows packs over the exact need', () => {
		expect(buyText(item({ packs: 2, packSize: 5000 }))).toEqual({ buy: '2 × 5 kg', need: '9.3 kg needed' });
		expect(buyText(item({ packs: 1, packSize: 10000, need: 9000 }))).toEqual({ buy: '10 kg', need: '9 kg needed' });
		expect(buyText(item({ unit: 'ml', packs: 36, packSize: 400, need: 14400 }))).toEqual({ buy: '36 × 400 ml', need: '14.4 L needed' });
	});

	it('counts pieces, packs and jars in whole units', () => {
		expect(buyText(item({ unit: 'pcs', need: 5.5, packs: 6, packSize: 1 }))).toEqual({ buy: '6 pcs', need: '5.5 pcs needed' });
		expect(buyText(item({ unit: 'pack', need: 1, packs: 1, packSize: 1 }))).toEqual({ buy: '1 pack', need: undefined });
		expect(buyText(item({ unit: 'jar', need: 2.4, packs: 3, packSize: 1 }))).toEqual({ buy: '3 jars', need: '2.4 jar needed' });
	});
});

describe('euro', () => {
	it('shows whole euros from 100 up and cents below', () => {
		expect(euro(4200)).toBe('€4,200');
		expect(euro(99.5)).toBe('€99.50');
		expect(euro(0)).toBe('€0.00');
	});
});

describe('the shopping view of a plan', () => {
	const plan = () => {
		let p = setEvent(newPlan('2027-07-09'), { everyone: 100 });
		p = addMeal(p, 0, 'lunch').plan;
		p = addDish(p, 0, 0, 'bread');
		p = addDish(p, 0, 0, 'teatime');
		return p;
	};

	it('groups by store and counts what is left to buy', () => {
		const { result } = calculatePlan(plan(), data)!;
		const view = shoppingView(result, ['flour']);
		expect(view.stores.map((s) => s.name)).toEqual(['Supermarket', 'Market']);
		const supermarket = view.stores[0];
		expect(supermarket.lines.map((l) => [l.name, l.checked])).toEqual([['Flour', true], ['Salt', false]]);
		expect(supermarket.open).toBe(1);
		expect(view.open).toBe(2);
	});

	it('lists what has no price, and sums the cost of the rest', () => {
		const { result } = calculatePlan(plan(), data)!;
		const view = shoppingView(result, []);
		const salt = view.stores[0].lines.find((l) => l.id === 'salt');
		expect(salt?.unpriced).toBe(true);
		expect(view.stores[0].unpriced).toBe(1);
		expect(view.cost.total).toBeGreaterThan(0);
		expect(view.cost.coverage).toBeGreaterThan(0.9);
		expect(view.cost.coverage).toBeLessThan(1);
	});

	it('leaves water out of the list', () => {
		const { result } = calculatePlan(plan(), data)!;
		expect(shoppingView(result, []).stores.flatMap((s) => s.lines.map((l) => l.id))).not.toContain('water');
	});

	it('leaves out recipes that are no longer in the data, and says which', () => {
		const p = addDish(plan(), 0, 0, 'gone');
		const usable = enginePlan(p, data)!;
		expect(usable.missing).toEqual(['gone']);
		expect(calculatePlan(p, data)?.result.needs.flour).toBeGreaterThan(0);
	});

	it('an empty plan has an empty list', () => {
		const { result } = calculatePlan(newPlan('2027-07-09'), data)!;
		expect(shoppingView(result, [])).toEqual({ stores: [], open: 0, cost: { total: 0, coverage: null } });
	});
});
