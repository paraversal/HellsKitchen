import { describe, expect, it } from 'vitest';
import { calculate } from './calculate.ts';
import { RULES_VERSION } from './config.ts';
import { data, dish, meal, plan } from './fixtures.ts';

describe('calculate: from a plan to a shopping list', () => {
	const result = calculate(plan([meal([dish('spaghetti'), dish('sauce'), dish('punch')], { appetite: true }), meal([dish('crumble')], { for: 'organisers' })]), data);

	it('writes the rules version into the result', () => {
		expect(result.rulesVersion).toBe(RULES_VERSION);
	});

	it('groups items by store, with pack counts and costs', () => {
		expect(result.stores.map((s) => s.name)).toEqual(['Supermarket', 'Market']);
		const pasta = result.stores[1].items.find((i) => i.ingredient === 'pasta');
		expect(pasta?.need).toBeCloseTo(16250, 6);
		expect(pasta?.packs).toBe(4); // 16.25 kg in 5 kg packs
		expect(pasta?.cost).toBeCloseTo(16.25 * 1.5, 6);
	});

	it('sums the cost of a store and counts what has no price', () => {
		const supermarket = result.stores[0];
		expect(supermarket.unpriced).toBe(1); // flour has no price
		expect(supermarket.cost).toBeCloseTo(supermarket.items.reduce((sum, i) => sum + (i.cost ?? 0), 0), 10);
	});

	it('gives the plan a cost estimate with a coverage figure', () => {
		expect(result.cost.unpriced).toEqual(['flour']);
		expect(result.cost.coverage).toBeGreaterThan(0.9);
		expect(result.cost.coverage).toBeLessThan(1);
	});
});

// Each difference from the old Excel is listed in SPEC.md, and each has a test with its number in the title.
describe('Known differences from the Excel', () => {
	it('Known difference 1: a dish that is not a main dish is not halved', () => {
		const result = calculate(plan([meal([dish('bread')])]), data);
		expect(result.needs.flour).toBeCloseTo(100 * 2.5 * 200, 6); // the old shopping formulas gave half of this
	});

	it('Known difference 2: a dish does not depend on its position in the meal or the plan', () => {
		const a = calculate(plan([meal([dish('spaghetti'), dish('sauce'), dish('bread')]), meal([dish('punch')])]), data);
		const b = calculate(plan([meal([dish('punch')]), meal([dish('bread'), dish('sauce'), dish('spaghetti')])]), data);
		for (const id of Object.keys(a.needs)) expect(b.needs[id]).toBeCloseTo(a.needs[id], 6);
	});

	it('Known difference 3: the selection numbers 0 to 3 are replaced by who, share and appetite', () => {
		// Excel selection 3 (for the organisers): a meal for organisers. Selection 2 (Friday): a meal with the appetite switch on.
		const organisers = calculate(plan([meal([dish('crumble')], { for: 'organisers' })]), data);
		expect(organisers.needs.flour).toBeCloseTo(31 * 1.5 * 32, 6);
		const friday = calculate(plan([meal([dish('spaghetti'), dish('sauce')], { appetite: true })]), data);
		const normal = calculate(plan([meal([dish('spaghetti'), dish('sauce')])]), data);
		expect(friday.needs.pasta / normal.needs.pasta).toBeCloseTo(1.3, 10);
	});

	it('Known difference 4: the list shows whole packs next to the exact need', () => {
		const result = calculate(plan([meal([dish('spaghetti'), dish('sauce')])]), data);
		const pasta = result.stores.flatMap((s) => s.items).find((i) => i.ingredient === 'pasta');
		expect(pasta?.packs).toBe(Math.ceil(pasta!.need / 5000));
	});

	it('Known difference 6: water is not a shop: it counts in the need, but is not on the list or in the cost', () => {
		const result = calculate(plan([meal([dish('punch')])]), data);
		expect(result.needs.water).toBeGreaterThan(0);
		expect(result.stores.flatMap((s) => s.items).map((i) => i.ingredient)).not.toContain('water');
		expect(result.cost.unpriced).not.toContain('water');
	});
});
