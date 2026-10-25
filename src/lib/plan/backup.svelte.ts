// The reminder to keep a copy of the plan. The plan lives only on this device, so after a number of changes the app asks for a file.
import { forSharing } from './transfer.ts';
import type { PlanFile } from '../data/schema.ts';

const KEY = 'hk-edits-since-backup';
/** How many changes to a plan before the reminder shows. */
export const REMIND_AFTER = 15;

const read = (): number => {
	try {
		return Number(localStorage.getItem(KEY)) || 0;
	} catch {
		return 0;
	}
};

class Backup {
	edits = $state(0);

	get due(): boolean {
		return this.edits >= REMIND_AFTER;
	}

	/** Reads the count of earlier visits. Called once, when the app opens. */
	start(): void {
		this.edits = read();
	}

	/** Counts a change. Ticking things off in the shopping list is not one: it says nothing worth keeping a copy of. */
	changed(before?: PlanFile, after?: PlanFile): void {
		if (before && after && JSON.stringify(forSharing(before)) === JSON.stringify(forSharing(after))) return;
		this.#set(this.edits + 1);
	}

	/** A copy was kept, or the person said not now. The reminder comes back after as many changes again. */
	reset(): void {
		this.#set(0);
	}

	#set(count: number): void {
		this.edits = count;
		try {
			localStorage.setItem(KEY, String(count));
		} catch {
			// private windows can refuse this. The reminder then starts from zero on every visit.
		}
	}
}

export const backup = new Backup();
