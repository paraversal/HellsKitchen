// The plans on this device, kept in the browser's storage, and one rule above all: saved data is never overwritten
// unless it has been read successfully first. After a restart without a connection, a phone may report "nothing saved"
// when there is something. The app must not take that for an empty library and save a new one over it (see docs/DEPLOY.md).
import type { PlanFile } from '../data/schema.ts';
import { addPlan, newLibrary, parseLibrary, removePlan, replacePlan, switchPlan, type Library, type PlanRecord } from './library.ts';
import { newPlan } from './plan.ts';

export const KEY = 'hk:library';

/** What the store needs from the browser's storage. idb-keyval has these two functions. */
export type KeyValue = { get(key: string): Promise<unknown>; set(key: string, value: unknown): Promise<void> };

/** A mark, kept somewhere else than the library, that this device has saved something before. */
export type Mark = { has(): boolean; set(): void };

export type Status = 'loading' | 'ready' | 'unreadable';

const SAVE_AFTER_MS = 400;

export class PlanStore {
	status = $state<Status>('loading');
	/** Why the saved plans could not be used, in words for people. */
	problem = $state<string | undefined>();
	/** Set when saving failed. The changes are still here, but only in this window. */
	saveProblem = $state<string | undefined>();
	library = $state<Library | undefined>();
	/** Called after every change to a plan, for the reminder to keep a copy. A change that is not an edit of one plan has no plans to hand over. */
	onchange: ((before?: PlanFile, after?: PlanFile) => void) | undefined;

	#storage: KeyValue;
	#mark: Mark;
	#clock: () => Date;
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(storage: KeyValue, mark: Mark, clock: () => Date = () => new Date()) {
		this.#storage = storage;
		this.#mark = mark;
		this.#clock = clock;
	}

	get record(): PlanRecord | undefined {
		return this.library?.plans[this.library.current];
	}

	get plan(): PlanFile | undefined {
		return this.record?.plan;
	}

	/** Reads what is saved. Safe to call again, for example for a "try again" button. */
	async load(): Promise<void> {
		this.status = 'loading';
		this.problem = undefined;
		let stored: unknown;
		try {
			stored = await this.#storage.get(KEY);
		} catch {
			return this.#unreadable('The saved plans could not be read from this device.');
		}
		if (stored === undefined) {
			// Nothing there. That is only believable if this device never saved anything.
			if (this.#mark.has()) {
				return this.#unreadable('Your saved plan was not found. After a restart without a connection, a phone can take a while to open its storage. Try again once you are online.');
			}
			this.library = this.#fresh();
			this.status = 'ready';
			await this.#save();
			return;
		}
		const library = parseLibrary(stored);
		if (!library) return this.#unreadable('The saved plans are in a form this version of the app does not understand. They have not been changed.');
		this.library = library;
		this.status = 'ready';
		this.#mark.set();
	}

	/** Starts a new library, on purpose, replacing what could not be read. Only after the person has been warned. */
	async startOver(): Promise<void> {
		this.library = this.#fresh();
		this.problem = undefined;
		this.status = 'ready';
		await this.#save();
	}

	/** Changes the open plan, and saves it a moment later. Does nothing until the saved plans have been read. */
	change(edit: (plan: PlanFile) => PlanFile): void {
		const record = this.record;
		if (this.status !== 'ready' || !this.library || !record) return;
		const before = $state.snapshot(record.plan) as PlanFile;
		const plan = edit(structuredClone(before));
		if (plan === undefined) return;
		this.library.plans[record.id] = { id: record.id, updatedAt: this.#clock().toISOString(), plan };
		this.#saveSoon();
		this.onchange?.(before, plan);
	}

	/** Adds a plan that came from outside, opens it, and says which place it has. */
	addPlan(plan: PlanFile): string | undefined {
		let id: string | undefined;
		this.#update((library) => {
			const added = addPlan(library, plan, this.#clock().toISOString());
			id = added.id;
			return added.library;
		});
		this.onchange?.();
		return id;
	}

	/** Puts a plan that came from outside in the place of the open one. */
	replaceOpen(plan: PlanFile): void {
		this.#update((library) => replacePlan(library, library.current, plan, this.#clock().toISOString()));
		this.onchange?.();
	}

	/** Starts an empty plan next to the others and opens it. */
	startPlan(): void {
		const now = this.#clock();
		this.addPlan(newPlan(now.toLocaleDateString('en-CA')));
	}

	switchTo(id: string): void {
		this.#update((library) => switchPlan(library, id));
	}

	deletePlan(id: string): void {
		this.#update((library) => removePlan(library, id));
	}

	#update(edit: (library: Library) => Library): void {
		if (this.status !== 'ready' || !this.library) return;
		this.library = edit($state.snapshot(this.library) as Library);
		this.#saveSoon();
	}

	#saveSoon(): void {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => void this.flush(), SAVE_AFTER_MS);
	}

	/** Saves now. Called when the page is being hidden, so that nothing is lost. */
	async flush(): Promise<void> {
		clearTimeout(this.#timer);
		if (this.status === 'ready') await this.#save();
	}

	#fresh(): Library {
		const now = this.#clock();
		const today = now.toLocaleDateString('en-CA'); // 2027-07-09, in the local time zone
		return newLibrary(today, now.toISOString());
	}

	#unreadable(problem: string): void {
		this.status = 'unreadable';
		this.problem = problem;
		this.library = undefined;
	}

	async #save(): Promise<void> {
		if (!this.library) return;
		try {
			await this.#storage.set(KEY, $state.snapshot(this.library));
			this.#mark.set();
			this.saveProblem = undefined;
		} catch {
			this.saveProblem = 'Your changes could not be saved on this device. They are only in this window for now.';
		}
	}
}
