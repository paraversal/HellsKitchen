import { describe, expect, it } from 'vitest';
import { addPlan, listPlans, newLibrary, nextId, removePlan, replacePlan, switchPlan } from './library.ts';
import { newPlan, rename } from './plan.ts';

const T1 = '2027-07-09T10:00:00.000Z';
const T2 = '2027-07-10T10:00:00.000Z';
const T3 = '2027-07-11T10:00:00.000Z';

describe('several plans', () => {
	it('adds a plan next to the others and opens it', () => {
		const { library, id } = addPlan(newLibrary('2027-07-09', T1), rename(newPlan('2027-08-01'), 'Second'), T2);
		expect(id).toBe('plan-2');
		expect(library.current).toBe('plan-2');
		expect(Object.keys(library.plans)).toEqual(['plan-1', 'plan-2']);
		expect(library.plans['plan-2'].updatedAt).toBe(T2);
	});

	it('does not reuse the id of a plan that is still there', () => {
		let library = newLibrary('2027-07-09', T1);
		library = addPlan(library, newPlan('2027-08-01'), T2).library; // plan-2
		library = addPlan(library, newPlan('2027-08-01'), T2).library; // plan-3
		library = removePlan(library, 'plan-2');
		expect(Object.keys(library.plans)).toEqual(['plan-1', 'plan-3']);
		expect(nextId(library)).toBe('plan-4');
	});

	it('does not change the library it was given', () => {
		const before = newLibrary('2027-07-09', T1);
		const copy = structuredClone(before);
		addPlan(before, newPlan('2027-08-01'), T2);
		replacePlan(before, 'plan-1', newPlan('2027-08-01'), T2);
		expect(before).toEqual(copy);
	});

	it('replaces a plan in its place and notes the time', () => {
		const library = replacePlan(newLibrary('2027-07-09', T1), 'plan-1', rename(newPlan('2027-08-01'), 'Other'), T2);
		expect(library.plans['plan-1'].plan.name).toBe('Other');
		expect(library.plans['plan-1'].updatedAt).toBe(T2);
		expect(library.current).toBe('plan-1');
	});

	it('ignores a plan that is not there', () => {
		const library = newLibrary('2027-07-09', T1);
		expect(replacePlan(library, 'plan-9', newPlan('2027-08-01'), T2)).toBe(library);
		expect(switchPlan(library, 'plan-9')).toBe(library);
		expect(removePlan(library, 'plan-9')).toBe(library);
	});

	it('switches to another plan', () => {
		const { library } = addPlan(newLibrary('2027-07-09', T1), newPlan('2027-08-01'), T2);
		expect(switchPlan(library, 'plan-1').current).toBe('plan-1');
	});

	it('never takes the last plan away', () => {
		const library = newLibrary('2027-07-09', T1);
		expect(removePlan(library, 'plan-1')).toBe(library);
	});

	it('opens the plan changed most recently when the open one is removed', () => {
		let library = newLibrary('2027-07-09', T1);
		library = addPlan(library, newPlan('2027-08-01'), T3).library; // plan-2, newest
		library = addPlan(library, newPlan('2027-08-01'), T2).library; // plan-3, open
		const after = removePlan(library, 'plan-3');
		expect(after.current).toBe('plan-2');
		expect(Object.keys(after.plans)).toEqual(['plan-1', 'plan-2']);
	});

	it('keeps the open plan when another one is removed', () => {
		let library = newLibrary('2027-07-09', T1);
		library = addPlan(library, newPlan('2027-08-01'), T2).library;
		expect(removePlan(library, 'plan-1').current).toBe('plan-2');
	});

	it('lists the plans, the one changed most recently first', () => {
		let library = newLibrary('2027-07-09', T1);
		library = addPlan(library, rename(newPlan('2027-08-01'), 'Newer'), T3).library;
		const list = listPlans(library);
		expect(list.map((p) => p.name)).toEqual(['Newer', 'New event']);
		expect(list[0]).toMatchObject({ id: 'plan-2', open: true, days: 1, meals: 0 });
		expect(list[1].open).toBe(false);
	});
});
