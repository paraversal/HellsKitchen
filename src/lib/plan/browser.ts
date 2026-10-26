// The plan store of the browser: IndexedDB for the plans, and a mark in localStorage that this device has saved before.
import { get, set } from 'idb-keyval';
import { PlanStore, type Mark } from './store.svelte.ts';

const MARK = 'hk-has-saved-plans';

const mark: Mark = {
	has() {
		try {
			return localStorage.getItem(MARK) === '1';
		} catch {
			return false;
		}
	},
	set() {
		try {
			localStorage.setItem(MARK, '1');
		} catch {
			// private windows can refuse this. The plans are still saved.
		}
	}
};

export const planStore = new PlanStore({ get, set }, mark);

/**
 * Asks the browser to keep the saved plans for good. Without it, a browser may clear the data of a site that has not been opened for a while
 * (Safari does this for sites that are not on the home screen). Browsers decide by themselves whether to say yes; asking costs nothing.
 */
export async function askToKeep(): Promise<void> {
	try {
		if (navigator.storage && !(await navigator.storage.persisted())) await navigator.storage.persist();
	} catch {
		// an older browser without this: nothing to do
	}
}
