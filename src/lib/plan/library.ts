// What is saved on the device: the plans, and which one is open. Plans are in the format of docs/DATA.md.
import { z } from 'zod';
import { planSchema, type PlanFile } from '../data/schema.ts';
import { newPlan, planCounts } from './plan.ts';

const recordSchema = z.object({ id: z.string(), updatedAt: z.string(), plan: planSchema });

export const librarySchema = z.object({
	/** The version of this way of saving. A version this code does not know is never overwritten. */
	version: z.literal(1),
	current: z.string(),
	plans: z.record(z.string(), recordSchema)
});

export type PlanRecord = z.infer<typeof recordSchema>;
export type Library = z.infer<typeof librarySchema>;

/** A library with one new plan, for the very first start. `today` is a date like 2027-07-09, `now` a time stamp. */
export function newLibrary(today: string, now: string, id = 'plan-1'): Library {
	return { version: 1, current: id, plans: { [id]: { id, updatedAt: now, plan: newPlan(today) } } };
}

/** The saved library, or undefined when it is not one this code understands. */
export function parseLibrary(value: unknown): Library | undefined {
	const parsed = librarySchema.safeParse(value);
	return parsed.success && parsed.data.plans[parsed.data.current] ? parsed.data : undefined;
}

// --- several plans -----------------------------------------------------------------------------------------------
// These work on a copy and give back a new library; the store decides when to keep it.

const withPlans = (library: Library, plans: Library['plans'], current = library.current): Library => ({ ...library, current, plans });

/** `plan-2`, or the next number that is free. */
export function nextId(library: Library): string {
	for (let n = Object.keys(library.plans).length + 1; ; n++) if (!library.plans[`plan-${n}`]) return `plan-${n}`;
}

/** Adds a plan next to the others and opens it. */
export function addPlan(library: Library, plan: PlanFile, now: string): { library: Library; id: string } {
	const id = nextId(library);
	return { library: withPlans(library, { ...library.plans, [id]: { id, updatedAt: now, plan } }, id), id };
}

/** Puts another plan in the place of one that is saved. The id stays, so it stays the open one if it was. */
export function replacePlan(library: Library, id: string, plan: PlanFile, now: string): Library {
	return library.plans[id] ? withPlans(library, { ...library.plans, [id]: { id, updatedAt: now, plan } }) : library;
}

export function switchPlan(library: Library, id: string): Library {
	return library.plans[id] ? { ...library, current: id } : library;
}

/** Takes a plan away. The last one stays: there is always a plan to open. If it was the open one, the one changed most recently opens. */
export function removePlan(library: Library, id: string): Library {
	if (!library.plans[id] || Object.keys(library.plans).length < 2) return library;
	const { [id]: _removed, ...rest } = library.plans;
	return withPlans(library, rest, id === library.current ? listPlans({ ...library, plans: rest })[0].id : library.current);
}

export type PlanSummary = { id: string; name: string; updatedAt: string; days: number; meals: number; open: boolean };

/** The saved plans, the one changed most recently first. */
export function listPlans(library: Library): PlanSummary[] {
	return Object.values(library.plans)
		.map(({ id, updatedAt, plan }) => ({
			id,
			name: plan.name,
			updatedAt,
			...planCounts(plan),
			open: id === library.current
		}))
		.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
}

export type { PlanFile };
