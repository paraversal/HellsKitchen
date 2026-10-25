// What is saved on the device: the plans, and which one is open. Plans are in the format of docs/DATA.md.
import { z } from 'zod';
import { planSchema, type PlanFile } from '../data/schema.ts';
import { newPlan } from './plan.ts';

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

export type { PlanFile };
