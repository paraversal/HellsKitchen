import { describe, expect, it } from 'vitest';
import { toPlan } from './plan.ts';

const raw = () => ({
	format: 1,
	rules_version: 0,
	name: 'Test',
	event: { everyone: 100, organisers: 10 },
	days: [{ date: '2027-07-09', meals: [{ type: 'dinner', dishes: [{ recipe: 'dal' }, { recipe: 'rice', share: 0.5, portion: '1 kg' }] }] }]
});

describe('toPlan', () => {
	it('fills in the defaults: a meal for everyone, no appetite switch, appetite factor 1', () => {
		const plan = toPlan(raw());
		expect(plan?.event).toEqual({ everyone: 100, organisers: 10, appetiteFactor: 1 });
		expect(plan?.days[0].meals[0]).toMatchObject({ for: 'everyone', appetite: false });
	});

	it('reads a portion override as grams', () => {
		expect(toPlan(raw())?.days[0].meals[0].dishes[1]).toEqual({ recipe: 'rice', share: 0.5, portion: 1000 });
	});

	it('returns nothing for a plan that is not valid', () => {
		const bad = raw();
		bad.event.everyone = -5;
		expect(toPlan(bad)).toBeUndefined();
	});
});
