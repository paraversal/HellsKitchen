import { describe, expect, it, vi } from 'vitest';
import { planSchema } from '../data/schema.ts';
import { newLibrary } from './library.ts';
import { addMeal, newPlan, rename } from './plan.ts';
import { KEY, PlanStore, type KeyValue, type Mark } from './store.svelte.ts';

const clock = () => new Date('2027-07-09T10:00:00Z');

/** A storage in memory that can be told to fail. */
function memory(initial?: unknown) {
	const data = new Map<string, unknown>(initial === undefined ? [] : [[KEY, initial]]);
	const log = { sets: 0, failRead: false, failWrite: false };
	const storage: KeyValue = {
		async get(key) {
			if (log.failRead) throw new Error('storage is not available');
			return data.get(key);
		},
		async set(key, value) {
			log.sets++;
			if (log.failWrite) throw new Error('full');
			data.set(key, structuredClone(value));
		}
	};
	return { storage, data, log };
}

function mark(initial = false) {
	let value = initial;
	const m: Mark = { has: () => value, set: () => (value = true) };
	return { m, get value() { return value; } };
}

const saved = () => newLibrary('2027-07-09', clock().toISOString());

describe('the first start', () => {
	it('makes a plan, saves it, and remembers that this device has saved something', async () => {
		const { storage, data } = memory();
		const flag = mark();
		const store = new PlanStore(storage, flag.m, clock);
		await store.load();
		expect(store.status).toBe('ready');
		expect(store.plan?.days).toHaveLength(1);
		expect(planSchema.safeParse(store.plan).success).toBe(true);
		expect(data.has(KEY)).toBe(true);
		expect(flag.value).toBe(true);
	});
});

describe('reading what is saved', () => {
	it('opens the saved plan', async () => {
		const library = saved();
		library.plans['plan-1'].plan.name = 'Freshers';
		const store = new PlanStore(memory(library).storage, mark().m, clock);
		await store.load();
		expect(store.status).toBe('ready');
		expect(store.plan?.name).toBe('Freshers');
	});

	it('never saves over a library it could not read: the storage fails', async () => {
		const { storage, log } = memory(saved());
		log.failRead = true;
		const store = new PlanStore(storage, mark(true).m, clock);
		await store.load();
		expect(store.status).toBe('unreadable');
		expect(store.problem).toContain('could not be read');
		store.change((p) => rename(p, 'Overwritten'));
		await store.flush();
		expect(log.sets).toBe(0);
	});

	it('never saves over a library it could not find, when this device has saved before', async () => {
		const { storage, log } = memory(); // the phone says: nothing here
		const store = new PlanStore(storage, mark(true).m, clock);
		await store.load();
		expect(store.status).toBe('unreadable');
		expect(store.problem).toContain('was not found');
		await store.flush();
		expect(log.sets).toBe(0);
	});

	it('never saves over a library in a form it does not know', async () => {
		const { storage, log } = memory({ version: 2, current: 'x', plans: {} });
		const store = new PlanStore(storage, mark(true).m, clock);
		await store.load();
		expect(store.status).toBe('unreadable');
		await store.flush();
		expect(log.sets).toBe(0);
	});

	it('can try again, and opens the plan once the storage works', async () => {
		const { storage, log } = memory(saved());
		log.failRead = true;
		const store = new PlanStore(storage, mark(true).m, clock);
		await store.load();
		expect(store.status).toBe('unreadable');
		log.failRead = false;
		await store.load();
		expect(store.status).toBe('ready');
		expect(store.plan).toBeDefined();
	});

	it('can start over, on purpose', async () => {
		const { storage, data } = memory();
		const store = new PlanStore(storage, mark(true).m, clock);
		await store.load();
		await store.startOver();
		expect(store.status).toBe('ready');
		expect(data.has(KEY)).toBe(true);
	});
});

describe('changing and saving', () => {
	it('does nothing before the saved plans have been read', () => {
		const { storage, log } = memory(saved());
		const store = new PlanStore(storage, mark().m, clock);
		store.change((p) => rename(p, 'Too early'));
		expect(store.plan).toBeUndefined();
		expect(log.sets).toBe(0);
	});

	it('saves a change a moment later, as plain data that is still a valid library', async () => {
		vi.useFakeTimers();
		try {
			const { storage, data, log } = memory(saved());
			const store = new PlanStore(storage, mark().m, clock);
			await store.load();
			store.change((p) => rename(addMeal(p, 0, 'lunch').plan, 'Freshers'));
			expect(store.plan?.name).toBe('Freshers');
			expect(log.sets).toBe(0);
			await vi.advanceTimersByTimeAsync(500);
			expect(log.sets).toBe(1);
			const stored = data.get(KEY) as { plans: Record<string, { plan: { name: string; days: { meals: unknown[] }[] }; updatedAt: string }> };
			expect(stored.plans['plan-1'].plan.name).toBe('Freshers');
			expect(stored.plans['plan-1'].plan.days[0].meals).toHaveLength(1);
			expect(stored.plans['plan-1'].updatedAt).toBe(clock().toISOString());
		} finally {
			vi.useRealTimers();
		}
	});

	it('saves at once on flush, and a burst of changes is one save', async () => {
		const { storage, log } = memory(saved());
		const store = new PlanStore(storage, mark().m, clock);
		await store.load();
		store.change((p) => rename(p, 'A'));
		store.change((p) => rename(p, 'B'));
		await store.flush();
		expect(log.sets).toBe(1);
	});

	it('keeps the changes and says so when saving fails', async () => {
		const { storage, log } = memory(saved());
		const store = new PlanStore(storage, mark().m, clock);
		await store.load();
		log.failWrite = true;
		store.change((p) => rename(p, 'Kept'));
		await store.flush();
		expect(store.saveProblem).toContain('could not be saved');
		expect(store.plan?.name).toBe('Kept');
		log.failWrite = false;
		await store.flush();
		expect(store.saveProblem).toBeUndefined();
	});
});

describe('several plans', () => {
	it('adds a plan from outside, opens it, and saves both', async () => {
		const { storage, data } = memory(saved());
		const store = new PlanStore(storage, mark().m, clock);
		await store.load();
		const id = store.addPlan(rename(newPlan('2027-08-01'), 'From a friend'));
		await store.flush();
		expect(id).toBe('plan-2');
		expect(store.plan?.name).toBe('From a friend');
		expect(Object.keys((data.get(KEY) as { plans: object }).plans)).toEqual(['plan-1', 'plan-2']);
	});

	it('replaces the open plan', async () => {
		const store = new PlanStore(memory(saved()).storage, mark().m, clock);
		await store.load();
		store.replaceOpen(rename(newPlan('2027-08-01'), 'Replaced'));
		expect(store.plan?.name).toBe('Replaced');
		expect(store.library?.current).toBe('plan-1');
	});

	it('starts an empty plan, switches back and deletes it', async () => {
		const store = new PlanStore(memory(saved()).storage, mark().m, clock);
		await store.load();
		store.startPlan();
		expect(store.library?.current).toBe('plan-2');
		store.switchTo('plan-1');
		expect(store.library?.current).toBe('plan-1');
		store.deletePlan('plan-2');
		expect(Object.keys(store.library?.plans ?? {})).toEqual(['plan-1']);
		store.deletePlan('plan-1');
		expect(Object.keys(store.library?.plans ?? {})).toEqual(['plan-1']);
	});

	it('tells the reminder about changes', async () => {
		const store = new PlanStore(memory(saved()).storage, mark().m, clock);
		await store.load();
		let changes = 0;
		store.onchange = () => changes++;
		store.change((p) => rename(p, 'A'));
		store.addPlan(newPlan('2027-08-01'));
		store.replaceOpen(newPlan('2027-08-01'));
		store.switchTo('plan-1');
		expect(changes).toBe(3);
	});

	it('does nothing to plans before the saved ones have been read, and never saves over unreadable ones', async () => {
		const { storage, log } = memory(saved());
		log.failRead = true;
		const store = new PlanStore(storage, mark(true).m, clock);
		await store.load();
		expect(store.addPlan(newPlan('2027-08-01'))).toBeUndefined();
		store.replaceOpen(newPlan('2027-08-01'));
		store.startPlan();
		store.deletePlan('plan-1');
		await store.flush();
		expect(log.sets).toBe(0);
	});
});
