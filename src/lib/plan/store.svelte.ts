// The plans on this device, kept in the browser's storage, and one rule above all: saved data is never overwritten
// unless it has been read successfully first. After a restart without a connection, a phone may report "nothing saved"
// when there is something. The app must not take that for an empty library and save a new one over it (see docs/DEPLOY.md).
import type { PlanFile } from '../data/schema.ts';
import { newLibrary, parseLibrary, type Library, type PlanRecord } from './library.ts';

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
		const plan = edit($state.snapshot(record.plan) as PlanFile);
		if (plan === undefined) return;
		this.library.plans[record.id] = { id: record.id, updatedAt: this.#clock().toISOString(), plan };
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
